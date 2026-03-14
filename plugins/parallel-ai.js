// plugins/parallel-deep.js
// Parallel AI Deep Research - Single Message Version
// @author Saziki Bot Team
// Version: 2.0.0

import OpenAI from 'openai';

// ==================== CONFIGURATION ====================
const API_KEY = 'HoBnKUzcMC5GsNSTqAX7FWJ1SHQHnySdV0PhrxHe';
const BASE_URL = 'https://api.parallel.ai';
const MODEL = 'speed';
const MAX_TOKENS = 16384;
const TIMEOUT = 300;

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🔬 *Parallel AI Deep Research*\n\n` +
            `*Usage:* ${usedPrefix + command} <research topic or question>\n\n` +
            `*Examples:*\n` +
            `• ${usedPrefix}deep History of the internet\n` +
            `• ${usedPrefix}deep Quantum computing explained\n\n` +
            `*Powered by Parallel AI Deep Research*`,
      contextInfo: {
        externalAdReply: {
          title: '🔬 Parallel AI Deep Research',
          body: 'Long Context & Extended Responses',
          thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });
  }

  const waitMsg = await conn.sendMessage(m.chat, {
    text: `🔬 *Parallel AI Deep Research*\n\n📝 *Topic:* ${text}\n⏱️ Conducting deep research...`,
  });

  try {
    const client = new OpenAI({
      apiKey: API_KEY,
      baseURL: BASE_URL,
    });

    await conn.sendMessage(m.chat, {
      text: `🔬 *Deep Research in Progress*\n\n📝 *Topic:* ${text}\n🔍 Analyzing sources...`,
      edit: waitMsg.key,
    });

    const systemPrompt = `You are Parallel AI Deep Research, an advanced research assistant specialized in producing comprehensive, well-structured, and academically rigorous responses. 

Provide comprehensive, detailed responses suitable for academic research, professional analysis, or deep personal study.`;

    const userMessage = `Please conduct deep research on the following topic. Provide a comprehensive, well-structured response:

${text}`;

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      top_p: 0.95,
    });

    const result = response.choices[0]?.message?.content || "No research results available.";

    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    // Send as single message
    await conn.sendMessage(m.chat, {
      text: `🔬 *Parallel AI Deep Research*\n\n${result}`,
      contextInfo: {
        externalAdReply: {
          title: '🔬 Parallel AI Deep Research',
          body: 'Research Complete',
          thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
          sourceUrl: 'https://parallel.ai',
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });

  } catch (error) {
    console.error('❌ Parallel AI Deep Research Error:', error);

    await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

    let errorMessage = '❌ *Error*\n\n';
    
    if (error.response?.data) {
      const apiError = error.response.data;
      errorMessage += `*API Error:* ${apiError.error?.message || 'Unknown error'}`;
    } else if (error.message.includes('timeout')) {
      errorMessage += `⏱️ *Research Timeout*\n\nThe deep research took too long.`;
    } else {
      errorMessage += error.message || 'Failed to conduct deep research.';
    }

    await conn.sendMessage(m.chat, { text: errorMessage }, { quoted: m });
  }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['deep', 'research', 'study'];
handler.tags = ['ai', 'tools'];
handler.command = /^(deep|research|study|بحث)$/i;
handler.saki = true;

export default handler;