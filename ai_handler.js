// ai_handler.js
// معالج الذكاء الاصطناعي - مع دعم كامل لتوليد الصور

import axios from 'axios';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = join(__dirname, 'tmp');

// ==================== CONFIGURATION ====================
// نموذج 1: Kimi-K2.5 (محادثة وتحليل صور)
const KIMI_API_KEY = "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";
const KIMI_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const KIMI_MODEL = "moonshotai/kimi-k2.5";

// نموذج 2: GPT-OSS-20B (سريع للمحادثة)
const GPT_OSS_API_KEY = "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";
const GPT_OSS_BASE_URL = "https://integrate.api.nvidia.com/v1";

// نموذج 3: Flux.2 (توليد الصور) - نسخة مصححة
const FLUX_API_KEY = "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";
const FLUX_URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b";

// Initialize OpenAI client for GPT-OSS
const openai = new OpenAI({
    apiKey: GPT_OSS_API_KEY,
    baseURL: GPT_OSS_BASE_URL,
});

// Ensure temp directory exists
if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR, { recursive: true });
}

// Rate limiting
const userCooldown = new Map();

// ==================== FUNCTIONS لاستقبال الصور ====================

/**
 * استخراج الصورة من أي مكان في الرسالة - نسخة شاملة جداً
 */
async function extractImageFromMessage(message) {
    try {
        let mediaMsg = null;
        
        console.log('🔍 Scanning message for images...');
        
        // الطريقة 1: صورة مباشرة في الرسالة (الأهم)
        if (message.imageMessage) {
            mediaMsg = message.imageMessage;
            console.log('✅ Found direct imageMessage');
        }
        // الطريقة 2: صورة داخل message
        else if (message.message?.imageMessage) {
            mediaMsg = message.message.imageMessage;
            console.log('✅ Found message.imageMessage');
        }
        // الطريقة 3: صورة في رسالة مقتبسة
        else if (message.quotedMessage?.imageMessage) {
            mediaMsg = message.quotedMessage.imageMessage;
            console.log('✅ Found quotedMessage.imageMessage');
        }
        // الطريقة 4: صورة في extendedTextMessage
        else if (message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMsg = message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            console.log('✅ Found extendedTextMessage.quotedMessage.imageMessage');
        }
        // الطريقة 5: view once
        else if (message.viewOnceMessage?.message?.imageMessage) {
            mediaMsg = message.viewOnceMessage.message.imageMessage;
            console.log('✅ Found viewOnceMessage');
        }
        // الطريقة 6: view once V2
        else if (message.viewOnceMessageV2?.message?.imageMessage) {
            mediaMsg = message.viewOnceMessageV2.message.imageMessage;
            console.log('✅ Found viewOnceMessageV2');
        }
        // الطريقة 7: البحث العميق في جميع الخصائص
        else {
            const deepSearch = (obj) => {
                if (!obj) return null;
                for (const key in obj) {
                    if (obj[key] && typeof obj[key] === 'object') {
                        if (obj[key].mimetype && obj[key].mimetype.startsWith('image/')) {
                            return obj[key];
                        }
                        if (obj[key].url && (obj[key].url.includes('jpg') || obj[key].url.includes('png') || obj[key].url.includes('jpeg'))) {
                            return obj[key];
                        }
                        const found = deepSearch(obj[key]);
                        if (found) return found;
                    }
                }
                return null;
            };
            mediaMsg = deepSearch(message);
            if (mediaMsg) console.log('✅ Found image via deep search');
        }
        
        if (!mediaMsg) {
            console.log('❌ No image found in message');
            return { success: false, error: 'No image found in message' };
        }

        console.log('📥 Downloading image...');
        
        const stream = await downloadContentFromMessage(mediaMsg, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        const mimeType = mediaMsg.mimetype || 'image/jpeg';
        console.log(`✅ Image downloaded successfully. Size: ${buffer.length} bytes, Type: ${mimeType}`);
        
        return { success: true, buffer, mimeType };
        
    } catch (error) {
        console.error('❌ Download error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * استخراج النص من الرسالة
 */
function extractTextFromMessage(message) {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    return null;
}

/**
 * Convert image to base64
 */
function bufferToBase64(buffer, mimeType) {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

// ==================== نماذج المحادثة ====================

/**
 * نموذج 1: Kimi-K2.5 (للمحادثة وتحليل الصور)
 */
async function generateKimiResponse(userMessage, imageBuffer = null, mimeType = null) {
    const messages = [
        { 
            role: "system", 
            content: "You are Saziki AI, a smart WhatsApp assistant. Respond naturally, be helpful, concise, and friendly. Keep responses under 500 characters. Use the appropriate language based on the user's message." 
        }
    ];
    
    if (imageBuffer && mimeType) {
        const imageUrl = bufferToBase64(imageBuffer, mimeType);
        messages.push({
            role: "user",
            content: [
                { type: "text", text: userMessage || "Please analyze this image and describe what you see in detail." },
                { type: "image_url", image_url: { url: imageUrl } }
            ]
        });
        console.log('🖼️ Sending image to Kimi model');
    } else {
        messages.push({ role: "user", content: userMessage });
        console.log('💬 Sending text to Kimi model');
    }
    
    const payload = {
        model: KIMI_MODEL,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
        chat_template_kwargs: { thinking: true }
    };
    
    const headers = {
        "Authorization": `Bearer ${KIMI_API_KEY}`,
        "Content-Type": "application/json"
    };
    
    const response = await axios.post(KIMI_URL, payload, { headers, timeout: 60000 });
    
    if (response.data?.choices?.[0]) {
        return response.data.choices[0].message.content;
    }
    return null;
}

/**
 * نموذج 2: GPT-OSS-20B (سريع للمحادثة فقط)
 */
async function generateGPTOssResponse(userMessage) {
    const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            { 
                role: "system", 
                content: "You are Saziki AI, a fast and efficient WhatsApp assistant. Be very concise. Keep responses under 300 characters. Respond naturally and helpfully." 
            },
            { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
        stream: false
    });
    
    return completion.choices[0]?.message?.content || null;
}

// ==================== نموذج توليد الصور (مصحح) ====================

/**
 * نموذج 3: Flux.2 (توليد صور من وصف نصي) - نسخة مصححة
 */
async function generateImage(prompt, width = 1024, height = 1024) {
    try {
        console.log(`🎨 Generating image with prompt: "${prompt}"`);
        
        // التنسيق الصحيح لـ API
        const payload = {
            prompt: prompt,
            width: width,
            height: height,
            num_inference_steps: 4,
            guidance_scale: 7,
            seed: Math.floor(Math.random() * 1000000)
        };
        
        const headers = {
            "Authorization": `Bearer ${FLUX_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
        
        console.log('📤 Sending request to Flux API...');
        
        const response = await axios.post(FLUX_URL, payload, { 
            headers, 
            timeout: 90000,
            responseType: 'json'
        });
        
        console.log('📥 Response status:', response.status);
        
        // التحقق من استجابة API
        if (response.status === 200 && response.data) {
            // محاولة استخراج الصورة من تنسيقات مختلفة
            let imageBase64 = null;
            
            if (response.data.image) {
                imageBase64 = response.data.image;
            } else if (response.data.images && response.data.images.length > 0) {
                imageBase64 = response.data.images[0];
            } else if (response.data.output && response.data.output.image) {
                imageBase64 = response.data.output.image;
            } else if (response.data.data && response.data.data.image) {
                imageBase64 = response.data.data.image;
            }
            
            if (imageBase64) {
                // إزالة البيانات الوصفية إذا وجدت
                if (imageBase64.includes(',')) {
                    imageBase64 = imageBase64.split(',')[1];
                }
                
                const imageBuffer = Buffer.from(imageBase64, 'base64');
                console.log(`✅ Image generated successfully! Size: ${imageBuffer.length} bytes`);
                return { success: true, buffer: imageBuffer };
            } else {
                console.log('❌ No image data in response:', Object.keys(response.data));
                return { success: false, error: 'No image data in response' };
            }
        } else {
            console.log('❌ API returned status:', response.status);
            return { success: false, error: `API returned status ${response.status}` };
        }
        
    } catch (error) {
        console.error('❌ Image generation error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        return { success: false, error: error.message };
    }
}

/**
 * اختيار أفضل نموذج حسب نوع الطلب
 */
async function generateResponse(userMessage, imageBuffer = null, mimeType = null) {
    // إذا كان هناك صورة، استخدم Kimi (يدعم الرؤية)
    if (imageBuffer && mimeType) {
        console.log('🖼️ Using Kimi model for image analysis');
        return await generateKimiResponse(userMessage, imageBuffer, mimeType);
    }
    
    // للرسائل القصيرة، استخدم GPT-OSS (أسرع)
    if (userMessage && userMessage.length < 100) {
        console.log('⚡ Using GPT-OSS model for fast response');
        const fastResponse = await generateGPTOssResponse(userMessage);
        if (fastResponse) return fastResponse;
    }
    
    // للرسائل الطويلة أو إذا فشل GPT-OSS، استخدم Kimi
    console.log('🤖 Using Kimi model for detailed response');
    return await generateKimiResponse(userMessage);
}

// ==================== معالجة أوامر توليد الصور ====================

/**
 * التحقق إذا كان الأمر يطلب توليد صورة
 */
function isImageGenerationCommand(text) {
    const commands = ['generate', 'draw', 'create', 'صورة', 'ارسم', 'ولد', 'generate image', 'make image', 'make', 'imagine'];
    const lowerText = text.toLowerCase();
    return commands.some(cmd => lowerText.startsWith(cmd)) || 
           (lowerText.includes('generate') && lowerText.includes('image')) ||
           (lowerText.includes('ارسم') && lowerText.includes('صورة'));
}

/**
 * استخراج النص المطلوب لتوليد الصورة
 */
function extractImagePrompt(text) {
    const commands = ['generate image', 'draw', 'create', 'صورة', 'ارسم', 'ولد', 'make', 'imagine'];
    let prompt = text;
    
    for (const cmd of commands) {
        if (text.toLowerCase().startsWith(cmd)) {
            prompt = text.slice(cmd.length).trim();
            break;
        }
    }
    
    prompt = prompt.replace(/^(generate|draw|create|صورة|ارسم|ولد|make|imagine)\s+/i, '');
    
    if (!prompt || prompt.length < 3) {
        return null;
    }
    
    return prompt;
}

// ==================== النموذج الرئيسي ====================

/**
 * Check rate limit
 */
function checkRateLimit(userId) {
    const lastMessage = userCooldown.get(userId);
    const cooldown = global.aiConfig?.cooldown || 3000;
    
    if (lastMessage && (Date.now() - lastMessage) < cooldown) {
        return false;
    }
    userCooldown.set(userId, Date.now());
    return true;
}

/**
 * Main AI handler - مع دعم كامل للصور وتوليد الصور
 */
export async function handleAIMessage(conn, message, sender, messageText, messageType) {
    // Skip if AI is disabled
    if (global.aiConfig && global.aiConfig.enabled === false) return false;
    
    // Skip if message is from bot itself
    if (message.key?.fromMe) return false;
    
    // Rate limiting
    if (!checkRateLimit(sender)) return false;
    
    // Typing indicator
    await conn.sendPresenceUpdate('composing', sender);
    
    try {
        let response = null;
        let imageBuffer = null;
        let imageMimeType = null;
        let imageFound = false;
        
        console.log('\n========== NEW MESSAGE ==========');
        console.log('Sender:', sender);
        console.log('Message text:', messageText || '(no text)');
        
        // محاولة استخراج الصورة
        const imageResult = await extractImageFromMessage(message);
        
        if (imageResult.success) {
            imageFound = true;
            imageBuffer = imageResult.buffer;
            imageMimeType = imageResult.mimeType;
            console.log('✅ Image successfully extracted!');
        }
        
        // ========== معالجة الصور ==========
        if (imageFound) {
            console.log('🖼️ Processing image...');
            const imageQuestion = messageText || "Please analyze this image and describe what you see in detail.";
            response = await generateKimiResponse(imageQuestion, imageBuffer, imageMimeType);
            
            if (response) {
                console.log('✅ Image analyzed successfully');
            } else {
                response = "I received an image but couldn't analyze it. Please try again with a clearer image.";
            }
        }
        // ========== معالجة أوامر توليد الصور ==========
        else if (messageText && isImageGenerationCommand(messageText)) {
            const prompt = extractImagePrompt(messageText);
            
            if (!prompt || prompt.length < 3) {
                response = "📝 *Image Generation*\n\nPlease describe what image you want me to generate.\n\n✨ Examples:\n• generate a beautiful sunset over mountains\n• draw a cute cat wearing a hat\n• create a futuristic city at night\n• ارسم منظر طبيعي جميل\n• imagine a lion in the jungle";
            } else {
                await conn.sendPresenceUpdate('composing', sender);
                await conn.sendMessage(sender, { text: "🎨 Generating your image... Please wait (20-40 seconds)" });
                
                const imageResult_gen = await generateImage(prompt);
                
                if (imageResult_gen.success && imageResult_gen.buffer) {
                    await conn.sendMessage(sender, {
                        image: imageResult_gen.buffer,
                        caption: `🖼️ *Generated Image*\n\n📝 *Prompt:* ${prompt}\n🤖 *Model:* Flux.2 (NVIDIA)\n🎨 *Resolution:* 1024x1024\n✨ *Quality:* High`
                    });
                    await conn.sendPresenceUpdate('paused', sender);
                    return true;
                } else {
                    response = `❌ *Failed to generate image*\n\nError: ${imageResult_gen.error}\n\n💡 Tips:\n• Try a different description\n• Make the prompt more detailed\n• Example: "a beautiful sunset over mountains with orange sky"`;
                }
            }
        }
        // ========== معالجة الرسائل النصية العادية ==========
        else if (messageText && messageText.trim().length > 0) {
            console.log('💬 Processing text message:', messageText.substring(0, 50));
            response = await generateResponse(messageText);
        }
        
        // Send response
        if (response) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.sendMessage(sender, { text: response });
            console.log('📤 Response sent successfully');
            await conn.sendPresenceUpdate('paused', sender);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ AI Error:', error.message);
        console.error('Stack:', error.stack);
        const errorResponse = "Sorry, I'm having trouble thinking right now. Please try again.";
        await conn.sendMessage(sender, { text: errorResponse });
        await conn.sendPresenceUpdate('paused', sender);
        return true;
    }
}

export default { handleAIMessage };