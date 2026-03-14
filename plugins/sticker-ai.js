// plugins/s_ai.js
// 𝗔𝗜 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿 - 𝗪𝗼𝗿𝗸𝗶𝗻𝗴 𝘃𝗲𝗿𝘀𝗶𝗼𝗻
// @author Saziki Bot Team
// Version: 3.0.0

import axios from 'axios';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const STICKER_PACK = '𝗦𝗮𝘇𝗶𝗸𝗶 𝗔𝗜';
const STICKER_AUTHOR = '𝗕𝗼𝘁';
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// Alternative AI APIs (try different ones)
const AI_APIS = [
    'https://pollinations.ai/prompt/',  // Pollinations
    'https://image-gen.vercel.app/api/generate?prompt=', // Alternative 1
    'https://ai-image-generator3.p.rapidapi.com/generate', // RapidAPI (needs key)
];

// Using Pollinations as primary (free, no key needed)
const AI_API_URL = 'https://image.pollinations.ai/prompt/';

// ==================== 𝗛𝗲𝗹𝗽𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 ====================

/**
 * 𝗦𝘁𝘆𝗹𝗶𝘇𝗲 𝘁𝗲𝘅𝘁
 */
function stylizeText(text) {
    if (!text) return '';
    const styled = text.split('').map(char => {
        if (char.match(/[a-zA-Z]/)) {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) {
                return String.fromCodePoint(0x1D5D4 + (code - 65));
            } else if (code >= 97 && code <= 122) {
                return String.fromCodePoint(0x1D5EE + (code - 97));
            }
        }
        return char;
    }).join('');
    return styled;
}

/**
 * 𝗖𝗿𝗲𝗮𝘁𝗲 𝗽𝗿𝗼𝗴𝗿𝗲𝘀𝘀 𝗯𝗮𝗿
 */
function createProgressBar(percent) {
    const filled = Math.floor(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗔𝗜 𝗶𝗺𝗮𝗴𝗲 𝗳𝗿𝗼𝗺 𝘁𝗲𝘅𝘁 (𝗳𝗶𝘅𝗲𝗱 𝘃𝗲𝗿𝘀𝗶𝗼𝗻)
 */
async function generateAIImage(prompt) {
    try {
        console.log(`🎨 Generating AI image for: "${prompt}"`);
        
        // Try primary API
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `${AI_API_URL}${encodedPrompt}?width=512&height=512&nologo=true&model=flux`;
        
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            timeout: 45000,
            headers: {
                'Accept': 'image/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.status === 200 && response.data.length > 1000) {
            return Buffer.from(response.data);
        }
        
        throw new Error('Invalid image data');
        
    } catch (error) {
        console.error('❌ Primary API failed:', error.message);
        
        // Try backup API (pollinations with different parameters)
        try {
            console.log('🔄 Trying backup API...');
            const backupUrl = `https://pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
            
            const backupResponse = await axios({
                method: 'GET',
                url: backupUrl,
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            if (backupResponse.status === 200 && backupResponse.data.length > 1000) {
                return Buffer.from(backupResponse.data);
            }
        } catch (backupError) {
            console.error('❌ Backup API also failed');
        }
        
        // Final fallback - return a default image
        console.log('⚠️ Using fallback image');
        const fallbackUrl = 'https://via.placeholder.com/512x512.png?text=AI+Generated';
        const fallbackResponse = await axios({
            method: 'GET',
            url: fallbackUrl,
            responseType: 'arraybuffer'
        });
        
        return Buffer.from(fallbackResponse.data);
    }
}

/**
 * 𝗖𝗼𝗻𝘃𝗲𝗿𝘁 𝗶𝗺𝗮𝗴𝗲 𝘁𝗼 𝘀𝘁𝗶𝗰𝗸𝗲𝗿
 */
async function imageToSticker(imageBuffer, packName, authorName) {
    try {
        const sticker = new Sticker(imageBuffer, {
            pack: packName,
            author: authorName,
            type: StickerTypes.FULL,
            quality: 80,
            background: 'transparent'
        });
        
        return await sticker.toBuffer();
    } catch (error) {
        console.error('❌ Sticker conversion error:', error);
        throw error;
    }
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `╭━━━❰🎨 *𝗔𝗜 𝗦𝗧𝗜𝗖𝗞𝗘𝗥* 🎨❱━━━╮
┃
┃ *📝 𝗨𝘀𝗮𝗴𝗲:*
┃ ${usedPrefix + command} <𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻>
┃
┃ *📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:*
┃ • ${usedPrefix}s_ai 𝗮 𝗰𝘂𝘁𝗲 𝗰𝗮𝘁
┃ • ${usedPrefix}s_ai 𝗳𝘂𝘁𝘂𝗿𝗶𝘀𝘁𝗶𝗰 𝗰𝗶𝘁𝘆
┃
╰━━━━━━━━━━━━━━━━╯`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎨 𝗔𝗜 𝗦𝘁𝗶𝗰𝗸𝗲𝗿',
                        body: 'Generate stickers from text',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m });
        }

        // Simple waiting message
        const waitMsg = await m.reply(`🎨 *𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗔𝗜 𝘀𝘁𝗶𝗰𝗸𝗲𝗿...*\n\n📝 *${stylizeText(text.substring(0, 30))}*`);

        try {
            // Generate image
            const imageBuffer = await generateAIImage(text);
            
            // Convert to sticker
            const stickerBuffer = await imageToSticker(imageBuffer, STICKER_PACK, STICKER_AUTHOR);

            // Delete waiting message
            await conn.sendMessage(m.chat, { delete: waitMsg.key });

            // Send sticker
            await conn.sendMessage(m.chat, {
                sticker: stickerBuffer
            }, { quoted: m });

        } catch (error) {
            console.error('❌ Error:', error);
            
            await conn.sendMessage(m.chat, { delete: waitMsg.key });
            
            await m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿*\n\nFailed to generate image. Please try again later.`);
        }

    } catch (error) {
        console.error('❌ Handler Error:', error);
        m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* ${error.message}`);
    }
};

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴 ====================

handler.help = ['s_ai', 'sai'];
handler.tags = ['ai', 'sticker'];
handler.command = /^(s_ai|sai)$/i;
handler.saki = 0;

export default handler;