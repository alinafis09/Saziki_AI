// plugins/dog.js
// Random Dog Images from TheDogAPI
// @author Saziki Bot Team
// Version: 1.0.0

import fetch from 'node-fetch';

// ==================== CONFIGURATION ====================
const DOG_API_URL = 'https://api.thedogapi.com/v1/images/search';
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command }) => {
  // Send initial processing message
  const waitMsg = await m.reply('🐶 *Searching for a cute dog...*');

  try {
    // Fetch random dog image from API
    const response = await fetch(DOG_API_URL);
    const data = await response.json();

    // Check if we got valid data
    if (!data || !data[0] || !data[0].url) {
      throw new Error('Invalid response from dog API');
    }

    const dogData = data[0];
    const dogUrl = dogData.url;
    const imageId = dogData.id;

    console.log(`🐶 Found dog: ${imageId} (${dogData.width}x${dogData.height})`);

    // Delete waiting message
    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    // Send the dog image
    await conn.sendMessage(m.chat, {
      image: { url: dogUrl },
      caption: `🐶 *Random Dog*\n\n🆔 ID: ${imageId}\n📏 Size: ${dogData.width}x${dogData.height}\n\n🔗 ${dogUrl}`,
      contextInfo: {
        externalAdReply: {
          title: '🐶 Random Dog',
          body: 'Powered by TheDogAPI',
          thumbnailUrl: BOT_THUMBNAIL,
          sourceUrl: dogUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });

  } catch (error) {
    console.error('❌ Dog API Error:', error);

    // Delete waiting message
    await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

    // Send error message
    let errorMessage = '❌ *Error*\n\n';
    errorMessage += 'Failed to fetch a dog image. Please try again later.';

    await m.reply(errorMessage);
  }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['dog', 'puppy', 'كلب'];
handler.tags = ['fun', 'image'];
handler.command = /^(dog|puppy|كلب)$/i;
handler.saki = 0; // Consumes 1 SAKI

export default handler;