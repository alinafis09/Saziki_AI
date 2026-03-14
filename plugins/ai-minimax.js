// plugins/ai-minimax.js
// MiniMax AI Integration for Saziki Bot using OpenAI SDK
// @author Saziki Bot Team
// Version: 1.0.0

import OpenAI from 'openai';

// ==================== CONFIGURATION ====================
const NVIDIA_API_KEY = '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';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';
const MODEL = "minimaxai/minimax-m2.1";

// Initialize OpenAI client with NVIDIA base URL
const openai = new OpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: BASE_URL,
});

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Check if prompt is provided
    if (!text) {
        return m.reply(
            `🤖 *MiniMax AI Assistant*\n\n` +
            `*Usage:* ${usedPrefix}${command} <your question>\n\n` +
            `*Examples:*\n` +
            `• ${usedPrefix}minimax What is the capital of Morocco?\n` +
            `• ${usedPrefix}minimax Explain quantum computing\n\n` +
            `*Powered by NVIDIA API*`
        );
    }

    // Send initial processing message
    const waitMsg = await m.reply('🧠 *MiniMax AI is thinking...*');

    try {
        // Create completion with streaming
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful WhatsApp assistant. Be friendly, concise, and provide accurate information in English."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 4096,
            stream: true
        });

        // Collect response chunks
        let fullResponse = '';
        for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            
            // Optional: Update message periodically for long responses
            if (fullResponse.length % 100 === 0) {
                await conn.sendMessage(m.chat, {
                    text: `🧠 *Generating...*\n\n${fullResponse}...`,
                    edit: waitMsg.key
                }).catch(() => {});
            }
        }

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Send the final response
        await conn.sendMessage(m.chat, {
            text: `🤖 *MiniMax AI:*\n\n${fullResponse}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: '🧠 MiniMax AI Assistant',
                    body: 'Powered by NVIDIA',
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: 'https://www.nvidia.com',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('MiniMax AI Error:', error);
        
        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Send error message
        let errorMessage = '❌ *Error*\n\n';
        
        if (error.response) {
            errorMessage += `API Error (${error.response.status}): ${error.response.statusText || 'Unknown error'}`;
            
            if (error.response.status === 401) {
                errorMessage += '\n\n❌ *Invalid API Key*\nPlease check your NVIDIA API key.';
            } else if (error.response.status === 403) {
                errorMessage += '\n\n❌ *Access Forbidden*\nYour API key does not have permission to access this model.';
            } else if (error.response.status === 429) {
                errorMessage += '\n\n❌ *Rate Limit Exceeded*\nToo many requests. Please try again later.';
            }
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage += '❌ *Connection Failed*\nCould not connect to NVIDIA API.';
        } else {
            errorMessage += error.message || 'Failed to get response from AI';
        }

        await m.reply(errorMessage);
    }
};

// ==================== TEST COMMAND ====================

let testHandler = async (m, { conn }) => {
    const waitMsg = await m.reply('🧪 *Testing MiniMax AI connection...*');
    
    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "user", content: "Say 'Hello, I am working!' in exactly those words" }
            ],
            max_tokens: 20,
            temperature: 0.5
        });

        const response = completion.choices[0]?.message?.content || 'No response';
        
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        m.reply(`✅ *Test Successful*\n\nResponse: ${response}`);
        
    } catch (error) {
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        
        let errorMsg = '❌ *Test Failed*\n\n';
        if (error.response) {
            errorMsg += `Status: ${error.response.status}\n`;
            errorMsg += `Message: ${error.response.data?.error?.message || error.message}`;
        } else {
            errorMsg += error.message;
        }
        m.reply(errorMsg);
    }
};

// ==================== SIMPLE COMMAND (Non-streaming) ====================

let simpleHandler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return m.reply(
            `🤖 *MiniMax AI (Simple)*\n\n` +
            `*Usage:* ${usedPrefix}simplex <your question>`
        );
    }

    const waitMsg = await m.reply('🧠 *Processing...*');

    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: text }
            ],
            max_tokens: 1024,
            temperature: 0.7,
            stream: false // Non-streaming mode
        });

        const response = completion.choices[0]?.message?.content || 'No response';

        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        await conn.sendMessage(m.chat, {
            text: `🤖 *MiniMax AI:*\n\n${response}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: '🧠 MiniMax AI',
                    body: 'Powered by NVIDIA',
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: 'https://www.nvidia.com',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

    } catch (error) {
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        m.reply(`❌ Error: ${error.message}`);
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['minimax', 'max'];
handler.tags = ['ai'];
handler.command = /^(minimax|max)$/i;
handler.limit = true;

testHandler.help = ['aitest'];
testHandler.command = /^(aitest)$/i;
testHandler.tags = ['ai'];
testHandler.limit = false;

simpleHandler.help = ['simplex'];
simpleHandler.command = /^(simplex)$/i;
simpleHandler.tags = ['ai'];
simpleHandler.limit = true;

export { handler, testHandler, simpleHandler };
export default handler;