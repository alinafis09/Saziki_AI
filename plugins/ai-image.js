// plugins/ai-image.js
// AI Image Generator for Saziki Bot - Enhanced Version
// @author Saziki Bot Team
// Version: 2.0.0

import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

// ==================== CONFIGURATION ====================
const TMP_DIR = './tmp/ai-images';

// Available resolutions for the image generation
const resolutions = {
  portrait: { width: 768, height: 1344, name: 'Portrait' },
  landscape: { width: 1344, height: 768, name: 'Landscape' },
  square: { width: 1024, height: 1024, name: 'Square' },
  ultra: { width: 1536, height: 1536, name: 'Ultra HD' },
  tall: { width: 832, height: 1344, name: 'Tall' },
  wide: { width: 1344, height: 832, name: 'Wide' },
};

// Loading animation symbols
const LOADING_SYMBOLS = ['▰', '▱'];
const PROGRESS_STAGES = [
  'Initializing AI engine...',
  'Processing your prompt...',
  'Generating masterpiece...',
  'Applying neural filters...',
  'Finalizing image...'
];

// Ensure temp directory exists
if (!existsSync(TMP_DIR)) {
  mkdirSync(TMP_DIR, { recursive: true });
}

// ==================== HELPER FUNCTIONS ====================

function generateFileName(extension = '.jpg') {
  return `${crypto.randomBytes(8).toString('hex')}${extension}`;
}

function generateProgressBar(percentage, length = 10) {
  const filled = Math.floor((percentage / 100) * length);
  const empty = length - filled;
  return '▰'.repeat(filled) + '▱'.repeat(empty);
}

/**
 * Generates images from a text prompt using the ZonerAI API.
 * @param {string} prompt The text prompt to generate an image from.
 * @param {string} resolutionKey The key for the desired resolution.
 * @param {number} [upscale=2] The upscale factor for the image.
 * @returns {Promise<Array<{buffer: Buffer, contentType: string, fileId: string}>>}
 */
async function Txt2IMG(prompt, resolutionKey, upscale = 2) {
  const selectedResolution = resolutions[resolutionKey] || resolutions.square;
  const { width, height } = selectedResolution;

  // Create 3 parallel requests to generate images
  const imagePromises = Array.from({ length: 3 }, (_, index) => {
    const form = new FormData();
    form.append('Prompt', prompt);
    form.append('Language', 'eng_Latn');
    form.append('Size', `${width}x${height}`);
    form.append('Upscale', upscale.toString());
    form.append('Batch_Index', index.toString());

    // Agent to ignore SSL certificate errors
    const agent = new https.Agent({ rejectUnauthorized: false });

    return axios.post(
      'https://api.zonerai.com/zoner-ai/txt2img',
      form,
      {
        httpsAgent: agent,
        headers: {
          ...form.getHeaders(),
          'Origin': 'https://zonerai.com',
          'Referer': 'https://zonerai.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    ).then(res => {
      const contentType = res.headers['content-type'] || 'image/jpeg';
      const fileId = res.headers['x-file-id'] || `saziki-ai-${Date.now()}-${index}`;
      const buffer = Buffer.from(res.data);
      return { buffer, contentType, fileId };
    });
  });

  try {
    return await Promise.all(imagePromises);
  } catch (error) {
    console.error('Saziki AI Image Generation Error:', error);
    throw new Error('Failed to generate images: ' + (error.response?.data?.toString() || error.message));
  }
}

// ==================== MAIN HANDLER ====================

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `🎨 *SAZIKI AI IMAGE GENERATOR*\n\n` +
      `*Usage:* ${usedPrefix + command} <prompt> | <resolution>\n\n` +
      `*Available Resolutions:*\n` +
      `• portrait - 768x1344\n` +
      `• landscape - 1344x768\n` +
      `• square - 1024x1024\n` +
      `• ultra - 1536x1536\n` +
      `• tall - 832x1344\n` +
      `• wide - 1344x832\n\n` +
      `*Examples:*\n` +
      `• ${usedPrefix + command} a majestic lion in a futuristic city | landscape\n` +
      `• ${usedPrefix + command} cyberpunk neon samurai | ultra\n\n` +
      `_Powered by Saziki AI_`
    );
  }

  // Parse prompt and resolution
  let [prompt, resolutionKey] = text.split('|').map(s => s.trim());
  resolutionKey = resolutionKey || 'square';

  if (!resolutions[resolutionKey]) {
    return m.reply(
      `❌ *Invalid Resolution*\n\n` +
      `Available resolutions:\n` +
      `• ${Object.keys(resolutions).join('\n• ')}`
    );
  }

  // ========== DYNAMIC LOADING ANIMATION ==========
  let stage = 0;
  let progress = 0;
  
  const selectedRes = resolutions[resolutionKey];
  const initialMessage = 
    `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
    `┃     🎨 SAZIKI AI IMAGE LAB     ┃\n` +
    `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
    `┃  Prompt: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}\n` +
    `┃  Resolution: ${selectedRes.name} (${selectedRes.width}x${selectedRes.height})\n` +
    `┃  ──────────────────────────────  ┃\n` +
    `┃  [${generateProgressBar(0)}] 0%\n` +
    `┃  Status: ⚡ Initializing...\n` +
    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
  
  const waitMsg = await m.reply(initialMessage);
  const progressKey = waitMsg.key;
  
  // Start animation loop - updates every 800ms
  const animationInterval = setInterval(async () => {
    // Update progress (0-100) with random increments
    if (progress < 100) {
      progress += Math.floor(Math.random() * 8) + 3; // Random increment 3-10
      if (progress > 100) progress = 100;
    }
    
    // Advance stage based on progress
    if (progress >= 20 && stage < 1) stage = 1;
    else if (progress >= 40 && stage < 2) stage = 2;
    else if (progress >= 60 && stage < 3) stage = 3;
    else if (progress >= 80 && stage < 4) stage = 4;
    
    const progressBar = generateProgressBar(progress);
    const stageText = PROGRESS_STAGES[stage];
    
    const animatedMessage = 
      `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
      `┃     🎨 SAZIKI AI IMAGE LAB     ┃\n` +
      `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
      `┃  Prompt: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}\n` +
      `┃  Resolution: ${selectedRes.name} (${selectedRes.width}x${selectedRes.height})\n` +
      `┃  ──────────────────────────────  ┃\n` +
      `┃  [${progressBar}] ${progress}%\n` +
      `┃  Status: ${stageText}\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    await conn.sendMessage(m.chat, {
      text: animatedMessage,
      edit: progressKey
    }).catch(() => {});
  }, 800);

  try {
    await conn.sendMessage(m.chat, {
      text: `*Wait a second*`,
      edit: progressKey
    });

    const images = await Txt2IMG(prompt, resolutionKey);

    if (!images || images.length === 0) {
      throw new Error('No images were generated');
    }

    // Stop animation
    clearInterval(animationInterval);
    
    // Update to 100%
    await conn.sendMessage(m.chat, {
      text: 
        `☘    🎨 SAZIKI AI IMAGE LAB     彡\n` +
        `[${generateProgressBar(100)}] 100%\n` +
        `✅ Generation Complete!\n` +
        `✨ Created 3 unique images\n` +,
      edit: progressKey
    });

    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 800));

    // Delete loading message
    await conn.sendMessage(m.chat, { delete: progressKey });

    // Send each generated image
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const imagePath = join(TMP_DIR, generateFileName('.jpg'));
      
      // Save temporarily
      writeFileSync(imagePath, img.buffer);
      
      await conn.sendMessage(m.chat, {
        image: { url: imagePath },
        caption: 
          `🎨 *SAZIKI AI GENERATION* 🎨\n\n` +
          `*Prompt:* ${prompt}\n` +
          `*Resolution:* ${selectedRes.name} (${selectedRes.width}x${selectedRes.height})\n` +
          `*Image:* ${i + 1}/${images.length}\n` +
          `*Style:* ZonerAI Neural Network\n\n` +
          `_Powered by Saziki Bot_`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: false,
          externalAdReply: {
            title: '🎨 Saziki AI Image Lab',
            body: `${selectedRes.name} • ${selectedRes.width}x${selectedRes.height}`,
            thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
            sourceUrl: 'https://whatsapp.com/channel/0029VaYourChannelID',
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });
      
      // Clean up temp file
      unlinkSync(imagePath);
      
      // Small delay between images
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

  } catch (error) {
    // Stop animation on error
    clearInterval(animationInterval);
    
    console.error('Saziki AI Error:', error);
    
    const errorMessage = 
      `● *error*`;

    await conn.sendMessage(m.chat, {
      text: errorMessage,
      edit: progressKey
    });

    setTimeout(async () => {
      await conn.sendMessage(m.chat, { delete: progressKey }).catch(() => {});
    }, 5000);
  }
};

handler.help = ['img', 'generate', 'imagine'];
handler.command = ['img', 'generate', 'imagine', 'zonerai-img'];
handler.tags = ['ai', 'tools'];
handler.saki = false;

export default handler;