// plugins/cat.js
// Random Cat Images from TheCatAPI
// @author Saziki Bot Team
// Version: 1.0.0

import fetch from 'node-fetch';

// ==================== CONFIGURATION ====================
const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search';
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command }) => {
  // Send initial processing message
  const waitMsg = await m.reply('🐱 *Searching for a cute cat...*');

  try {
    // Fetch random cat image from API
    const response = await fetch(CAT_API_URL);
    const data = await response.json();

    // Check if we got valid data
    if (!data || !data[0] || !data[0].url) {
      throw new Error('Invalid response from cat API');
    }

    const catData = data[0];
    const catUrl = catData.url;
    const imageId = catData.id;

    console.log(`🐱 Found cat: ${imageId} (${catData.width}x${catData.height})`);

    // Delete waiting message
    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    // Send the cat image
    await conn.sendMessage(m.chat, {
      image: { url: catUrl },
      caption: `🐱 *Random Cat*\n\n🆔 ID: ${imageId}\n📏 Size: ${catData.width}x${catData.height}\n\n🔗 ${catUrl}`,
      contextInfo: {
        externalAdReply: {
          title: '🐱 Random Cat',
          body: 'Powered by TheCatAPI',
          thumbnailUrl: BOT_THUMBNAIL,
          sourceUrl: catUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });

  } catch (error) {
    console.error('❌ Cat API Error:', error);

    // Delete waiting message
    await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

    // Send error message
    let errorMessage = '❌ *Error*\n\n';
    errorMessage += 'Failed to fetch a cat image. Please try again later.';

    await m.reply(errorMessage);
  }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['cat', 'kitten', 'قط'];
handler.tags = ['fun', 'image'];
handler.command = /^(cat|kitten|قط)$/i;
handler.saki = 0; // Consumes 1 SAKI

export default handler;