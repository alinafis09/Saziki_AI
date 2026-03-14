// plugins/fireworks-ai.js
// Image Generation with Fireworks AI (Flux Kontext Pro)
// @author Saziki Bot Team
// Version: 1.0.0

import fetch from "node-fetch";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// ==================== CONFIGURATION ====================
const API_KEY = "fw_272RAy5Fq78kNR7xs6BbDv";
const BASE_URL = "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-kontext-pro";
const RESULT_URL = `${BASE_URL}/get_result`;
const MAX_ATTEMPTS = 60;
const POLL_INTERVAL = 60000; // 1 second

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
  // Check if prompt is provided
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🎨 *Fireworks AI Image Generator*\n\n` +
            `*Usage:* ${usedPrefix + command} <image description>\n\n` +
            `*Examples:*\n` +
            `• ${usedPrefix}create A beautiful sunset over the ocean\n` +
            `• ${usedPrefix}create A futuristic city with flying cars\n` +
            `• ${usedPrefix}create A cute cat wearing a wizard hat\n\n` +
            `*Powered by Flux Kontext Pro*`,
      contextInfo: {
        externalAdReply: {
          title: '🎨 Fireworks AI',
          body: 'Flux Kontext Pro Image Generator',
          thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });
  }

  // Send initial processing message
  const waitMsg = await conn.sendMessage(m.chat, {
    text: `🎨 *Generating image...*\n\n📝 *Prompt:* ${text}\n⏱️ This may take a few moments.`,
  });

  try {
    // Step 1: Submit generation request
    await conn.sendMessage(m.chat, {
      text: `🔄 *Submitting request to Fireworks AI...*\n\n📝 *Prompt:* ${text}`,
      edit: waitMsg.key,
    });

    const submitResponse = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: text
      }),
    });

    const submitResult = await submitResponse.json();
    const requestId = submitResult.request_id;

    if (!requestId) {
      throw new Error("No request ID returned from API");
    }

    console.log("📋 Fireworks AI - Request ID:", requestId);

    // Update status
    await conn.sendMessage(m.chat, {
      text: `🔄 *Generating image...*\n\n📝 *Prompt:* ${text}\n🆔 *Request ID:* ${requestId.substring(0, 8)}...\n⏱️ Please wait...`,
      edit: waitMsg.key,
    });

    // Step 2: Poll for results
    let imageBuffer = null;
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      
      // Poll for result
      const pollResponse = await fetch(RESULT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ id: requestId })
      });

      const pollResult = await pollResponse.json();
      console.log(`📊 Status: ${pollResult.status}, Attempt ${attempts}/${MAX_ATTEMPTS}`);

      // Update status every 10 attempts
      if (attempts % 10 === 0) {
        await conn.sendMessage(m.chat, {
          text: `🔄 *Generating image...*\n\n📝 *Prompt:* ${text}\n⏱️ Status: ${pollResult.status}\n⚡ Attempt ${attempts}/${MAX_ATTEMPTS}`,
          edit: waitMsg.key,
        }).catch(() => {});
      }

      // Check if generation is complete
      if (['Ready', 'Complete', 'Finished', 'SUCCESS'].includes(pollResult.status)) {
        const imageData = pollResult.result?.sample || pollResult.result?.image || pollResult.image;
        
        if (!imageData) {
          throw new Error("No image data in response");
        }

        // Handle image data (URL or base64)
        if (typeof imageData === 'string' && imageData.startsWith('http')) {
          // Download from URL
          const imageResponse = await fetch(imageData);
          imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        } else if (typeof imageData === 'string') {
          // Base64 data
          imageBuffer = Buffer.from(imageData, 'base64');
        } else if (Buffer.isBuffer(imageData)) {
          imageBuffer = imageData;
        } else {
          throw new Error("Unknown image format");
        }

        break;
      }

      // Check for failure
      if (['Failed', 'Error', 'FAILED', 'ERROR'].includes(pollResult.status)) {
        throw new Error(`Generation failed: ${pollResult.details || pollResult.error || 'Unknown error'}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    if (!imageBuffer) {
      throw new Error("Generation timed out after " + MAX_ATTEMPTS + " attempts");
    }

    // Save to temp file
    const tempFile = join(tmpdir(), `fireworks_${Date.now()}.jpg`);
    writeFileSync(tempFile, imageBuffer);

    // Delete waiting message
    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    // Send the generated image
    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `🎨 *Image Generated*\n\n📝 *Prompt:* ${text}\n\n⚡ *Powered by Fireworks AI Flux Kontext Pro*`,
      contextInfo: {
        externalAdReply: {
          title: '🎨 Fireworks AI',
          body: 'Flux Kontext Pro',
          thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
          sourceUrl: 'https://fireworks.ai',
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });

    // Clean up temp file
    try { unlinkSync(tempFile); } catch (e) {}

  } catch (error) {
    console.error('❌ Fireworks AI Error:', error);

    // Delete waiting message
    await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

    // Send error message
    let errorMessage = '❌ *Error*\n\n';
    
    if (error.message.includes('401') || error.message.includes('API key')) {
      errorMessage += `🔑 *Invalid API Key*\n\nPlease check your Fireworks AI API key.`;
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      errorMessage += `⏱️ *Rate Limit Exceeded*\n\nToo many requests. Please try again later.`;
    } else if (error.message.includes('timed out')) {
      errorMessage += `⏱️ *Generation Timeout*\n\nThe image generation took too long. Please try again with a simpler prompt.`;
    } else {
      errorMessage += error.message || 'Failed to generate image.';
    }

    await conn.sendMessage(m.chat, { text: errorMessage }, { quoted: m });
  }
};

// ==================== TEST COMMAND ====================

let testHandler = async (m, { conn }) => {
  const waitMsg = await m.reply('🧪 *Testing Fireworks AI connection...*');

  try {
    const testResponse = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: "A simple test image"
      }),
    });

    const testResult = await testResponse.json();
    
    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    if (testResult.request_id) {
      await conn.sendMessage(m.chat, {
        text: `✅ *Fireworks AI Test Successful*\n\nRequest ID: ${testResult.request_id}`,
      }, { quoted: m });
    } else {
      throw new Error("No request ID received");
    }

  } catch (error) {
    await conn.sendMessage(m.chat, { delete: waitMsg.key });
    await m.reply(`❌ Test Failed: ${error.message}`);
  }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['create', 'generate', 'draw'];
handler.tags = ['ai', 'tools'];
handler.command = /^(create|generate|draw)$/i;
handler.saki = true;

testHandler.help = ['firetest'];
testHandler.command = /^(firetest)$/i;
testHandler.tags = ['ai'];
testHandler.limit = false;

export { handler, testHandler };
export default handler;;