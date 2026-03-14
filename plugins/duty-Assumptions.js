import axios from 'axios';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ==================== CONFIGURATION ====================
const NVIDIA_API_KEY = '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';
const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2.5';
const TMP_DIR = './tmp/kimi-vision';

// Ensure temp directory exists
if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR, { recursive: true });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Download image from WhatsApp message - نسخة محسنة جداً
 */
async function downloadImage(message) {
    try {
        let mediaMsg = null;
        
        console.log('🔍 Message structure:', Object.keys(message));
        
        // الطريقة 1: صورة مباشرة
        if (message.imageMessage) {
            mediaMsg = message.imageMessage;
            console.log('✅ Found direct imageMessage');
        }
        // الطريقة 2: رسالة مقتبسة
        else if (message.message?.imageMessage) {
            mediaMsg = message.message.imageMessage;
            console.log('✅ Found message.imageMessage');
        }
        // الطريقة 3: quoted message
        else if (message.quotedMessage?.imageMessage) {
            mediaMsg = message.quotedMessage.imageMessage;
            console.log('✅ Found quotedMessage.imageMessage');
        }
        // الطريقة 4: extended text message
        else if (message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMsg = message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            console.log('✅ Found extendedTextMessage.quotedMessage.imageMessage');
        }
        // الطريقة 5: view once
        else if (message.viewOnceMessage?.message?.imageMessage) {
            mediaMsg = message.viewOnceMessage.message.imageMessage;
            console.log('✅ Found viewOnceMessage');
        }
        // الطريقة 6: view once في quoted
        else if (message.viewOnceMessageV2?.message?.imageMessage) {
            mediaMsg = message.viewOnceMessageV2.message.imageMessage;
            console.log('✅ Found viewOnceMessageV2');
        }
        
        if (!mediaMsg) {
            throw new Error('No image found in message');
        }

        console.log('📥 Downloading image...');
        console.log('Media message keys:', Object.keys(mediaMsg));
        
        const stream = await downloadContentFromMessage(mediaMsg, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        const mimeType = mediaMsg.mimetype || 'image/jpeg';
        console.log('✅ Image downloaded successfully. Size:', buffer.length, 'bytes');
        
        return { buffer, mimeType };
        
    } catch (error) {
        console.error('❌ Download error:', error.message);
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

/**
 * Convert buffer to base64 data URL
 */
function bufferToBase64(buffer, mimeType) {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Check if there's a question
    if (!text && !m.quoted && !m.message?.imageMessage) {
        return m.reply(
            `📚 *Saziki AI - Academic Tutor*\n\n` +
            `*Usage:*\n` +
            `• Send an image with your question\n` +
            `• Or reply to an image with .duty + your question\n\n` +
            `*Examples:*\n` +
            `• Send an image and type: .duy Solve this equation\n` +
            `• Reply to an image: .duty What is this?\n\n` +
            `*Powered by Saziki bot*`
        );
    }

    // Variables for image
    let hasImage = false;
    let imageBuffer = null;
    let imageMimeType = null;
    let question = text || 'Please analyze this image in detail and explain step by step.';

    console.log('='.repeat(50));
    console.log('🔍 Starting image search...');
    console.log('Command:', command);
    console.log('Text:', text);
    console.log('Has quoted:', !!m.quoted);
    console.log('Has imageMessage:', !!m.message?.imageMessage);

    // البحث عن الصورة في كل مكان ممكن
    try {
        // الحالة 1: هناك رسالة مقتبسة
        if (m.quoted) {
            console.log('📎 Checking quoted message');
            const quotedMsg = m.quoted;
            console.log('Quoted message keys:', Object.keys(quotedMsg));
            
            if (quotedMsg.message) {
                console.log('Quoted message.message keys:', Object.keys(quotedMsg.message));
            }
            
            const { buffer, mimeType } = await downloadImage(quotedMsg);
            imageBuffer = buffer;
            imageMimeType = mimeType;
            hasImage = true;
            console.log('✅ Image found in quoted message');
        }
        // الحالة 2: الرسالة نفسها تحتوي على صورة
        else if (m.message?.imageMessage) {
            console.log('📎 Checking main message for image');
            const { buffer, mimeType } = await downloadImage(m.message);
            imageBuffer = buffer;
            imageMimeType = mimeType;
            hasImage = true;
            console.log('✅ Image found in main message');
        }
        // الحالة 3: الرسالة نفسها (كاملة)
        else if (m.message) {
            console.log('📎 Checking full message');
            const { buffer, mimeType } = await downloadImage(m);
            imageBuffer = buffer;
            imageMimeType = mimeType;
            hasImage = true;
            console.log('✅ Image found in full message');
        }
    } catch (error) {
        console.log('❌ No image found:', error.message);
    }

    console.log('Final hasImage:', hasImage);
    console.log('='.repeat(50));

    // Save temp file if image found
    let tempFile = null;
    if (hasImage && imageBuffer) {
        tempFile = join(TMP_DIR, `kimi_${Date.now()}.jpg`);
        writeFileSync(tempFile, imageBuffer);
        console.log('💾 Temp file saved:', tempFile);
    }

    // Send initial processing message
    const waitMsg = await m.reply(
        hasImage ? 
        '🔍 Saziki is analyzing your image and thinking...' : 
        '💭 Saziki is thinking...'
    );

    try {
        // Prepare headers
        const headers = {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Accept": "text/event-stream",
            "Content-Type": "application/json"
        };

        // Prepare messages array
        const messages = [
            {
                role: "system",
                content: "You are Saziki-bot, a high-level academic tutor. Your mission is to analyze images of homework, solve mathematical and scientific problems step-by-step, and describe images in a professional way. Always show your thinking process and reasoning. Answer in the language used by the user (Arabic/English). Be detailed, accurate, and educational."
            }
        ];

        // Prepare user content
        if (hasImage && imageBuffer) {
            const imageUrl = bufferToBase64(imageBuffer, imageMimeType);
            console.log('🖼️ Image converted to base64. Length:', imageUrl.length);
            
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: question },
                    { type: "image_url", image_url: { url: imageUrl } }
                ]
            });
        } else {
            messages.push({ role: "user", content: question });
        }

        // Prepare payload
        const payload = {
            model: MODEL,
            messages: messages,
            max_tokens: 16384,
            temperature: 1.00,
            top_p: 1.00,
            stream: true,
            chat_template_kwargs: { thinking: true }
        };

        console.log('📤 Sending request to NVIDIA API...');
        console.log('Model:', MODEL);
        console.log('Has Image:', hasImage);

        // Make API request with streaming
        const response = await axios.post(INVOKE_URL, payload, {
            headers: headers,
            responseType: 'stream',
            timeout: 160000
        });

        // Collect response chunks
        let fullResponse = '';
        
        await new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                
                const lines = chunkStr.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || '';
                            if (content) {
                                fullResponse += content;
                            }
                        } catch (e) {}
                    }
                }
            });

            response.data.on('end', () => resolve());
            response.data.on('error', (err) => reject(err));
        });

        // Clean up temp file
        if (tempFile) {
            try {
                unlinkSync(tempFile);
                console.log('🧹 Temp file deleted');
            } catch (e) {}
        }

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Format response
        let formattedResponse = fullResponse.trim() || 'No response from AI';

        // Send the final response
        await conn.sendMessage(m.chat, {
            text: formattedResponse
        }, { quoted: m });

    } catch (error) {
        console.error('❌ Sazuki AI Error:', error);
        
        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Clean up temp file
        if (tempFile) {
            try {
                unlinkSync(tempFile);
            } catch (e) {}
        }

        // Send error message
        let errorMessage = 'Error: ' + (error.message || 'Failed to get response from AI');
        
        if (error.response) {
            errorMessage += `\nStatus: ${error.response.status}`;
        }
        
        await m.reply(errorMessage);
    }
};

// ==================== TEST COMMAND ====================

let testHandler = async (m, { conn }) => {
    const waitMsg = await m.reply('Testing connection...');
    
    try {
        const headers = {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Content-Type": "application/json"
        };

        const payload = {
            model: MODEL,
            messages: [
                { role: "user", content: "Say 'OK' if you are working" }
            ],
            max_tokens: 50,
            temperature: 0.5,
            stream: false
        };

        const response = await axios.post(INVOKE_URL, payload, { headers });
        
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        
        const result = response.data.choices[0]?.message?.content || 'No response';
        
        await conn.sendMessage(m.chat, {
            text: `✅ Test Successful\n\n${result}`
        }, { quoted: m });
        
    } catch (error) {
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        m.reply(`❌ Test Failed: ${error.message}`);
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['duty', 'حل'];
handler.tags = ['ai', 'tools'];
handler.command = /^(duty|حل)$/i;
handler.saki = true;

testHandler.help = ['dutytest'];
testHandler.command = /^(dutytest|testduty)$/i;
testHandler.tags = ['ai'];
testHandler.limit = false;

export { handler, testHandler };
export default handler;;