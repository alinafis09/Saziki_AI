// plugins/anime.js
// Random Anime Images from NekosAPI v4
// @author Saziki Bot Team
// Version: 2.0.0

import fetch from 'node-fetch';

// ==================== CONFIGURATION ====================
const API_BASE_URL = 'https://api.nekosapi.com/v4';
const RANDOM_IMAGE_URL = `${API_BASE_URL}/images/random`;
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// Common tags for filtering (based on API response)
const COMMON_TAGS = [
    'girl', 'boy', 'blonde_hair', 'brown_hair', 'pink_hair', 'black_hair',
    'skirt', 'maid', 'bikini', 'wet', 'tree', 'flowers',
    'medium_breasts', 'large_breasts', 'exposed_girl_breasts', 'dick', 'pussy'
];

// Rating categories
const RATINGS = ['safe', 'suggestive', 'borderline', 'explicit'];

// ==================== HELPER FUNCTIONS ====================

/**
 * Fetch random anime images from NekosAPI
 * @param {number} limit - Number of images to fetch (1-10)
 * @param {string} rating - Filter by rating (safe/suggestive/borderline/explicit)
 * @param {string} tag - Filter by tag
 * @returns {Promise<Array>} - Array of image data
 */
async function fetchRandomImages(limit = 1, rating = null, tag = null) {
    let url = `${RANDOM_IMAGE_URL}?limit=${Math.min(limit, 10)}`;
    
    if (rating && RATINGS.includes(rating)) {
        url += `&rating=${rating}`;
    }
    
    if (tag) {
        url += `&tags=${encodeURIComponent(tag)}`;
    }
    
    console.log(`📡 Fetching from: ${url}`);
    
    const response = await fetch(url, {
        timeout: 10000,
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
}

/**
 * Format image info for display
 */
function formatImageInfo(imageData) {
    return {
        id: imageData.id,
        url: imageData.url,
        width: imageData.width,
        height: imageData.height,
        tags: imageData.tags || [],
        rating: imageData.rating || 'unknown',
        artist: imageData.artist_name || 'Unknown',
        source: imageData.source_url || 'N/A',
        color: imageData.color_dominant || null
    };
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Parse optional parameters
    let limit = 1;
    let rating = null;
    let tag = null;
    
    if (text) {
        const args = text.toLowerCase().split(' ');
        
        // Check for rating
        if (args.some(arg => RATINGS.includes(arg))) {
            rating = args.find(arg => RATINGS.includes(arg));
        }
        
        // Check for number (limit)
        const numArg = args.find(arg => /^\d+$/.test(arg));
        if (numArg) {
            limit = Math.min(parseInt(numArg), 5); // Max 5 images at once
        }
        
        // Remaining text as tag
        const remainingArgs = args.filter(arg => 
            !RATINGS.includes(arg) && !/^\d+$/.test(arg)
        );
        if (remainingArgs.length > 0) {
            tag = remainingArgs.join(' ');
        }
    }

    // Send initial processing message
    const waitMsg = await m.reply(
        `🎨 *Searching for anime images...*\n` +
        (rating ? `⭐ Rating: ${rating}\n` : '') +
        (tag ? `🏷️ Tag: ${tag}\n` : '') +
        (limit > 1 ? `📸 Count: ${limit}` : '')
    );

    try {
        // Fetch images
        const imagesData = await fetchRandomImages(limit, rating, tag);
        
        if (!imagesData || imagesData.length === 0) {
            throw new Error('No images found');
        }

        console.log(`✅ Found ${imagesData.length} anime images`);

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Send each image
        for (let i = 0; i < imagesData.length; i++) {
            const info = formatImageInfo(imagesData[i]);
            
            // Prepare caption
            const caption = `🎨 *Anime Image ${i+1}/${imagesData.length}*`;

            // Send the image
            await conn.sendMessage(m.chat, {
                image: { url: info.url },
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: '🔞 𝔸𝕟𝕚𝕞𝕖',
                        body: `𝐒𝐚𝐳𝐢𝐤𝐢 𝐀𝐧𝐢𝐦𝐞`,
                        thumbnailUrl: BOT_THUMBNAIL,
                        sourceUrl: `https://saziki-fate.com`,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m });

            // Small delay between multiple images
            if (i < imagesData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

    } catch (error) {
        console.error('❌ Anime API Error:', error);

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

        // Send error message
        let errorMessage = '❌ *Error*\n\n';
        
        if (error.message.includes('404')) {
            errorMessage += 'Anime API endpoint not found. The service might be temporarily unavailable.';
        } else if (error.message.includes('No images')) {
            errorMessage += 'No images found with the specified filters. Try different tags.';
        } else {
            errorMessage += 'Failed to fetch anime image. Please try again later.';
        }

        await m.reply(errorMessage);
    }
};

// ==================== TAGS COMMAND ====================

let tagsHandler = async (m, { conn, usedPrefix }) => {
    const tagsList = COMMON_TAGS.map(tag => `• ${tag}`).join('\n');
    const ratingsList = RATINGS.map(r => `• ${r}`).join('\n');
    
    await conn.sendMessage(m.chat, {
        text: `🎨 *NekosAPI Help*\n\n` +
              `*Common Tags:*\n${tagsList}\n\n` +
              `*Ratings:*\n${ratingsList}\n\n` +
              `*Usage:*\n` +
              `• ${usedPrefix}anime - Random image\n` +
              `• ${usedPrefix}anime 3 - Get 3 images\n` +
              `• ${usedPrefix}anime safe - Safe images only\n` +
              `• ${usedPrefix}anime girl - Images with girl tag\n` +
              `• ${usedPrefix}anime safe 2 girl - 2 safe girl images`,
        contextInfo: {
            externalAdReply: {
                title: '🎨 Anime Commands',
                body: 'How to use the anime command',
                thumbnailUrl: BOT_THUMBNAIL,
                mediaType: 1,
                renderLargerThumbnail: true,
            },
        },
    }, { quoted: m });
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['anime', 'nekos'];
handler.tags = ['fun', 'image'];
handler.command = /^(anime|nekos)$/i;
handler.saki = 3; // Consumes 1 SAKI per image

let tagsCommand = {
    help: ['animehelp', 'animetags'],
    tags: ['fun', 'image'],
    command: /^(animehelp|animetags)$/i,
    handler: tagsHandler,
    saki: 0 // Free command
};

export { handler, tagsCommand };
export default handler;