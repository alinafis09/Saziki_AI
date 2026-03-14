// plugins/ai-qwen.js
// Qwen AI Integration for Saziki Bot - CORRECTED VERSION
// @author Saziki Bot Team
// Version: 4.0.0

import axios from 'axios';

// ==================== CONFIGURATION ====================
const NVIDIA_API_KEY = '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';
const MODEL = 'qwen/qwen3.5-397b-a17b';
const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse streaming response from NVIDIA API
 * @param {Object} response - Axios response object
 * @returns {Promise<string>} - Complete response text
 */
async function parseStreamingResponse(response) {
    return new Promise((resolve, reject) => {
        let fullResponse = '';
        
        response.data.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            const lines = chunkStr.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            fullResponse += content;
                        }
                    } catch (e) {
                        // Ignore parsing errors
                    }
                }
            }
        });
        
        response.data.on('end', () => {
            resolve(fullResponse.trim() || 'I received your message but could not generate a response. Please try again.');
        });
        
        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Check if prompt is provided
    if (!text) {
        return m.reply(
            `🤖 *Qwen AI Assistant*\n\n` +
            `*Usage:* ${usedPrefix}${command} <your question>\n\n` +
            `*Examples:*\n` +
            `• ${usedPrefix}qwen What is the capital of Morocco?\n` +
            `• ${usedPrefix}qwen Explain quantum computing\n\n` +
            `*Powered by NVIDIA API*`
        );
    }

    // Send initial processing message
    const waitMsg = await m.reply('🧠 *Qwen AI is thinking...*');

    try {
        // Prepare the payload with streaming enabled
        const payload = {
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
            max_tokens: 1024,
            temperature: 0.60,
            top_p: 0.95,
            presence_penalty: 0,
            frequency_penalty: 0
        };

        console.log('Sending request to NVIDIA API with payload:', JSON.stringify(payload, null, 2));

        // IMPORTANT FIX: The API requires specific headers
        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Changed from text/event-stream
            },
            timeout: 30000 // 30 seconds timeout
        });

        console.log('API Response received:', response.status);

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Extract response text
        const aiResponse = response.data?.choices?.[0]?.message?.content || 'No response received';

        // Send the response
        await conn.sendMessage(m.chat, {
            text: `🤖 *Qwen AI:*\n\n${aiResponse}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: '🧠 Qwen AI Assistant',
                    body: 'Powered by NVIDIA',
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: 'https://www.nvidia.com',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Qwen AI Error Details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        
        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Send error message
        let errorMessage = '❌ *Error*\n\n';
        
        if (error.response) {
            if (error.response.status === 405) {
                errorMessage += '⚠️ *Method Not Allowed*\n\n';
                errorMessage += 'The API endpoint requires a different request method.\n\n';
                errorMessage += '**Possible solutions:**\n';
                errorMessage += '1. Try using `stream: false` in your request\n';
                errorMessage += '2. Check if the API endpoint URL is correct\n';
                errorMessage += '3. Visit: https://build.nvidia.com/ for correct API documentation\n\n';
                errorMessage += `Details: ${error.response.statusText || 'Method Not Allowed'}`;
            } else if (error.response.status === 401) {
                errorMessage += '❌ *Invalid API Key*\n\n';
                errorMessage += 'Your NVIDIA API key is invalid or expired.\n\n';
                errorMessage += 'Get a new key from: https://build.nvidia.com/';
            } else if (error.response.status === 403) {
                errorMessage += '❌ *Access Forbidden*\n\n';
                errorMessage += 'Your API key does not have permission to access this model.';
            } else if (error.response.status === 429) {
                errorMessage += '❌ *Rate Limit Exceeded*\n\n';
                errorMessage += 'Too many requests. Please try again later.';
            } else if (error.response.status === 500) {
                errorMessage += '❌ *Server Error*\n\n';
                errorMessage += 'NVIDIA API is experiencing issues. Please try again later.';
            } else {
                errorMessage += `API Error (${error.response.status}): ${error.response.statusText || 'Unknown error'}`;
            }
            
            // Add response data if available
            if (error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage += `\n\nDetails: ${error.response.data}`;
                } else if (typeof error.response.data === 'object') {
                    errorMessage += `\n\nDetails: ${JSON.stringify(error.response.data)}`;
                }
            }
            
        } else if (error.code === 'ECONNABORTED') {
            errorMessage += '❌ *Request Timeout*\n\n';
            errorMessage += 'The API took too long to respond. Please try again.';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            errorMessage += '❌ *Network Error*\n\n';
            errorMessage += 'Could not connect to NVIDIA API. Please check your internet connection.';
        } else {
            errorMessage += `❌ *Request Failed*\n\n${error.message || 'Unknown error'}`;
        }

        await m.reply(errorMessage);
    }
};

// ==================== TEST COMMAND (for debugging) ====================

let testHandler = async (m, { conn }) => {
    try {
        const testPayload = {
            model: MODEL,
            messages: [{ role: "user", content: "Say 'test' if you can hear me" }],
            max_tokens: 50,
            temperature: 0.5
        };
        
        const response = await axios.post(API_URL, testPayload, {
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        const result = response.data?.choices?.[0]?.message?.content || 'No response';
        m.reply(`✅ *API Test Successful*\n\nResponse: ${result}`);
        
    } catch (error) {
        let errorMsg = '❌ *API Test Failed*\n\n';
        if (error.response) {
            errorMsg += `Status: ${error.response.status}\n`;
            errorMsg += `Message: ${error.response.statusText}\n`;
            if (error.response.data) {
                errorMsg += `Details: ${JSON.stringify(error.response.data)}`;
            }
        } else {
            errorMsg += error.message;
        }
        m.reply(errorMsg);
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['qwen', 'aiqwen', 'qwentset'];
handler.tags = ['ai'];
handler.command = /^(qwen|aiqwen)$/i;
handler.saki = false;

// Test command
testHandler.help = ['qwentset'];
testHandler.command = /^(qwentset)$/i;
testHandler.tags = ['ai'];
testHandler.limit = false;

export { handler, testHandler };
export default handler;;