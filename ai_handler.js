// ai_handler.js
// معالج الذكاء الاصطناعي - مع توزيع ذكي للنماذج + Enhanced AI

import axios from 'axios';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import OpenAI from 'openai';

// ==================== NEW: Import Enhanced AI ====================
import { enhancedChat, simpleEnhancedChat } from './respected.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = join(__dirname, 'tmp');

// ==================== CONFIGURATION ====================

// نموذج 1: Kimi-K2.5 (محادثة عامة وتحليل صور - الأفضل للمحادثة)
const KIMI_API_KEY = "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";
const KIMI_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const KIMI_MODEL = "moonshotai/kimi-k2.5";

// نموذج 2: GPT-OSS-20B (سريع للمحادثة العامة)
const GPT_OSS_API_KEY = "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";
const GPT_OSS_BASE_URL = "https://integrate.api.nvidia.com/v1";

// نموذج 3: Phi-4-mini (متخصص في البرمجة والأكواد فقط)
const PHI_API_KEY = "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";
const PHI_MODEL = "microsoft/phi-4-mini-instruct";

// نموذج 4: Flux.2 (توليد الصور)
const FLUX_API_KEY = "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";
const FLUX_URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b";

// Initialize OpenAI clients
const openai_gpt = new OpenAI({
    apiKey: GPT_OSS_API_KEY,
    baseURL: GPT_OSS_BASE_URL,
});

const openai_phi = new OpenAI({
    apiKey: PHI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Ensure temp directory exists
if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR, { recursive: true });
}

// Rate limiting
const userCooldown = new Map();

// ==================== إيموجيز للتنسيق ====================
const EMOJIS = {
    robot: '🤖',
    thinking: '💭',
    success: '✅',
    error: '❌',
    image: '🖼️',
    exam: '📝',
    question: '❓',
    answer: '💡',
    star: '⭐',
    fire: '🔥',
    rocket: '🚀',
    brain: '🧠',
    magic: '✨',
    bulb: '💡',
    book: '📚',
    pen: '✍️',
    check: '☑️',
    warning: '⚠️',
    clock: '⏰',
    target: '🎯',
    trophy: '🏆',
    medal: '🥇',
    heart: '❤️',
    cool: '😎',
    wow: '🤩',
    clap: '👏',
    thumbsup: '👍',
    sparkles: '✨',
    rainbow: '🌈',
    sun: '☀️',
    moon: '🌙',
    cloud: '☁️',
    phone: '📱',
    laptop: '💻',
    code: '💻',
    bug: '🐛',
    gear: '⚙️',
    tools: '🛠️',
    package: '📦',
    download: '📥',
    upload: '📤',
    link: '🔗',
    lock: '🔒',
    unlock: '🔓',
    key: '🔑',
    globe: '🌍',
    home: '🏠',
    search: '🔍',
    menu: '📋',
    note: '📝',
    calendar: '📅',
    chart: '📊',
    money: '💰',
    shopping: '🛒',
    gift: '🎁',
    party: '🎉',
    confetti: '🎊',
    balloon: '🎈',
    crown: '👑',
    gem: '💎',
    diamond: '💠',
    circle: '⭕',
    cross: '❌',
    arrow: '➡️',
    back: '⬅️',
    up: '⬆️',
    down: '⬇️',
    weather: '🌤️',
    news: '📰',
    calculator: '🧮',
    translate: '🌐',
    wiki: '📖'
};

// ==================== كشف نوع السؤال ====================

/**
 * التحقق إذا كان السؤال متعلق بالبرمجة
 */
function isCodeQuestion(messageText) {
    if (!messageText) return false;
    
    const codeKeywords = [
        'code', 'program', 'function', 'class', 'python', 'javascript', 'java', 'c++', 'c#',
        'html', 'css', 'react', 'vue', 'angular', 'node', 'express', 'django', 'flask',
        'api', 'database', 'sql', 'mongodb', 'mysql', 'postgresql', 'algorithm', 'data structure',
        'bug', 'error', 'debug', 'compile', 'runtime', 'syntax', 'loop', 'array', 'object',
        'string', 'integer', 'boolean', 'variable', 'constant', 'method', 'property',
        'برمجة', 'كود', 'دالة', 'كلاس', 'مصفوفة', 'حلقة', 'شرط', 'متغير', 'ثابت',
        'خوارزمية', 'قاعدة بيانات', 'تصحيح', 'خطأ', 'تطبيق', 'موقع', 'سكربت',
        'write a program', 'create a function', 'how to code', 'programming'
    ];
    
    const lowerText = messageText.toLowerCase();
    return codeKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * التحقق إذا كان السؤال امتحان أو مسألة
 */
function isExamQuestion(messageText) {
    if (!messageText) return false;
    
    const examKeywords = [
        'exam', 'test', 'quiz', 'question', 'answer', 'solve', 'امتحان', 'اختبار', 
        'سؤال', 'جواب', 'حل', 'تمرين', 'مسألة', 'معادلة', 'equation', 'problem',
        'calculate', 'find', 'prove', 'what is', 'how many', 'explain', 'define',
        'أوجد', 'احسب', 'ما هو', 'عرف', 'اشرح', 'حل المعادلة', 'أثبت', 'استنتج',
        'math', 'physics', 'chemistry', 'biology', 'رياضيات', 'فيزياء', 'كيمياء'
    ];
    
    const lowerText = messageText.toLowerCase();
    return examKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * ==================== NEW: التحقق إذا كان السؤال يحتاج Enhanced AI ====================
 */
function needsEnhancedAI(messageText) {
    if (!messageText) return false;
    
    const enhancedKeywords = [
        // Weather
        'weather', 'طقس', 'temperature', 'حرارة', 'forecast', 'توقعات',
        'rain', 'مطر', 'sunny', 'مشمس', 'climate', 'مناخ',
        
        // News
        'news', 'أخبار', 'latest', 'آخر', 'today', 'اليوم',
        'happening', 'يحدث', 'breaking', 'عاجل',
        
        // Search/Information
        'search', 'ابحث', 'find', 'أجد', 'information about', 'معلومات عن',
        'tell me about', 'أخبرني عن', 'who is', 'من هو', 'what is', 'ما هو',
        
        // Wikipedia
        'wikipedia', 'ويكيبيديا', 'encyclopedia', 'موسوعة',
        
        // Translation
        'translate', 'ترجم', 'in english', 'بالإنجليزية', 'in arabic', 'بالعربية',
        'in french', 'بالفرنسية', 'in spanish', 'بالإسبانية',
        
        // Time/Date
        'what time', 'كم الساعة', 'what date', 'ما التاريخ',
        'current time', 'الوقت الحالي', 'today date', 'تاريخ اليوم',
        
        // Calculation
        'calculate', 'احسب', 'what is', 'كم يساوي', 'plus', 'زائد',
        'minus', 'ناقص', 'times', 'ضرب', 'divided by', 'مقسوم على'
    ];
    
    const lowerText = messageText.toLowerCase();
    return enhancedKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// ==================== FUNCTIONS لاستقبال الصور ====================

async function extractImageFromMessage(message) {
    try {
        let mediaMsg = null;
        
        if (message.imageMessage) {
            mediaMsg = message.imageMessage;
        } else if (message.message?.imageMessage) {
            mediaMsg = message.message.imageMessage;
        } else if (message.quotedMessage?.imageMessage) {
            mediaMsg = message.quotedMessage.imageMessage;
        } else if (message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMsg = message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        } else if (message.viewOnceMessage?.message?.imageMessage) {
            mediaMsg = message.viewOnceMessage.message.imageMessage;
        } else if (message.viewOnceMessageV2?.message?.imageMessage) {
            mediaMsg = message.viewOnceMessageV2.message.imageMessage;
        } else {
            const deepSearch = (obj) => {
                if (!obj) return null;
                for (const key in obj) {
                    if (obj[key] && typeof obj[key] === 'object') {
                        if (obj[key].mimetype && obj[key].mimetype.startsWith('image/')) {
                            return obj[key];
                        }
                        const found = deepSearch(obj[key]);
                        if (found) return found;
                    }
                }
                return null;
            };
            mediaMsg = deepSearch(message);
        }
        
        if (!mediaMsg) {
            return { success: false, error: 'No image found' };
        }

        const stream = await downloadContentFromMessage(mediaMsg, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        const mimeType = mediaMsg.mimetype || 'image/jpeg';
        return { success: true, buffer, mimeType };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function bufferToBase64(buffer, mimeType) {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

// ==================== نماذج المحادثة ====================

/**
 * نموذج Kimi - للمحادثة العامة وتحليل الصور
 */
async function generateKimiResponse(userMessage, imageBuffer = null, mimeType = null, isExam = false) {
    const systemPrompt = isExam ? 
        `You are an expert exam solver. Answer DIRECTLY without explanations. Be concise.` :
        `You are Saziki AI, a friendly WhatsApp assistant. Be warm, engaging, and detailed. Use emojis naturally. Give comprehensive answers with examples.`;
    
    const messages = [{ role: "system", content: systemPrompt }];
    
    if (imageBuffer && mimeType) {
        const imageUrl = bufferToBase64(imageBuffer, mimeType);
        messages.push({
            role: "user",
            content: [
                { type: "text", text: userMessage || "Analyze this image in detail" },
                { type: "image_url", image_url: { url: imageUrl } }
            ]
        });
    } else {
        messages.push({ role: "user", content: userMessage });
    }
    
    const payload = {
        model: KIMI_MODEL,
        messages: messages,
        max_tokens: isExam ? 300 : 2000,
        temperature: isExam ? 0.1 : 0.8,
        top_p: 0.9,
        stream: false
    };
    
    const headers = {
        "Authorization": `Bearer ${KIMI_API_KEY}`,
        "Content-Type": "application/json"
    };
    
    try {
        const response = await axios.post(KIMI_URL, payload, { headers, timeout: 60000 });
        if (response.data?.choices?.[0]) {
            return response.data.choices[0].message.content;
        }
    } catch (error) {
        console.error('Kimi error:', error.message);
    }
    return null;
}

/**
 * نموذج GPT-OSS - للمحادثة العامة السريعة
 */
async function generateGPTOssResponse(userMessage) {
    try {
        const completion = await openai_gpt.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { 
                    role: "system", 
                    content: `You are Saziki AI, a helpful WhatsApp assistant. Be detailed and engaging. Use emojis. Give comprehensive answers.` 
                },
                { role: "user", content: userMessage }
            ],
            temperature: 0.8,
            top_p: 0.9,
            max_tokens: 1500,
            stream: false
        });
        
        return completion.choices[0]?.message?.content || null;
    } catch (error) {
        console.error('GPT-OSS error:', error.message);
        return null;
    }
}

/**
 * نموذج Phi-4-mini - متخصص في البرمجة والأكواد فقط
 */
async function generatePhiResponse(userMessage) {
    try {
        console.log(`${EMOJIS.code} Using Phi-4-mini for CODE generation`);
        
        const completion = await openai_phi.chat.completions.create({
            model: PHI_MODEL,
            messages: [
                { 
                    role: "system", 
                    content: `You are an expert programmer. Write clean, efficient, well-commented code. Explain the code briefly then provide it. Format code in proper blocks. Be precise and professional.` 
                },
                { role: "user", content: userMessage }
            ],
            temperature: 0.1,
            top_p: 0.7,
            max_tokens: 2000,
            stream: true
        });
        
        let fullResponse = '';
        for await (const chunk of completion) {
            fullResponse += chunk.choices[0]?.delta?.content || '';
        }
        
        return fullResponse || null;
    } catch (error) {
        console.error('Phi error:', error.message);
        return null;
    }
}

// ==================== NEW: Enhanced AI Response ====================

/**
 * استخدام الذكاء الاصطناعي المعزز للأسئلة المعقدة
 */
async function generateEnhancedResponse(userMessage) {
    try {
        console.log(`${EMOJIS.rocket} Using ENHANCED AI with tools`);
        
        const result = await simpleEnhancedChat(userMessage);
        
        if (result.success && result.response) {
            // إضافة إشارة إلى استخدام الأدوات إذا تم استخدامها
            if (result.usedTools) {
                return `${EMOJIS.search} *Enhanced Response* (with real-time data)\n\n${result.response}`;
            }
            return result.response;
        }
        
        return null;
    } catch (error) {
        console.error('Enhanced AI error:', error.message);
        return null;
    }
}

/**
 * اختيار النموذج المناسب حسب نوع السؤال
 */
async function generateResponse(userMessage, imageBuffer = null, mimeType = null) {
    // إذا كان هناك صورة، استخدم Kimi دائماً
    if (imageBuffer && mimeType) {
        console.log(`${EMOJIS.image} Using Kimi for image analysis`);
        return await generateKimiResponse(userMessage, imageBuffer, mimeType, false);
    }
    
    // ==================== NEW: Check for Enhanced AI first ====================
    if (needsEnhancedAI(userMessage)) {
        console.log(`${EMOJIS.rocket} Complex query detected - Trying Enhanced AI first`);
        const enhancedResponse = await generateEnhancedResponse(userMessage);
        if (enhancedResponse) return enhancedResponse;
        console.log(`${EMOJIS.warning} Enhanced AI failed, falling back to standard models`);
    }
    
    // التحقق من نوع السؤال
    const isCode = isCodeQuestion(userMessage);
    const isExam = isExamQuestion(userMessage);
    
    if (isCode) {
        console.log(`${EMOJIS.code} Code question detected - Using Phi-4-mini`);
        const phiResponse = await generatePhiResponse(userMessage);
        if (phiResponse) return phiResponse;
    }
    
    if (isExam) {
        console.log(`${EMOJIS.exam} Exam question detected - Using Kimi (concise mode)`);
        const kimiResponse = await generateKimiResponse(userMessage, null, null, true);
        if (kimiResponse) return kimiResponse;
    }
    
    // للمحادثة العامة - استخدم GPT-OSS أولاً (أسرع)
    console.log(`${EMOJIS.robot} General chat - Using GPT-OSS`);
    const gptResponse = await generateGPTOssResponse(userMessage);
    if (gptResponse) return gptResponse;
    
    // إذا فشل GPT-OSS، استخدم Kimi
    console.log(`${EMOJIS.robot} Falling back to Kimi`);
    return await generateKimiResponse(userMessage, null, null, false);
}

// ==================== نموذج توليد الصور ====================

async function generateImage(prompt, width = 1024, height = 1024) {
    try {
        console.log(`${EMOJIS.magic} Generating image: "${prompt}"`);
        
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
        
        const response = await axios.post(FLUX_URL, payload, { 
            headers, 
            timeout: 90000,
            responseType: 'json'
        });
        
        if (response.status === 200 && response.data) {
            let imageBase64 = response.data.image || response.data.images?.[0] || response.data.output?.image;
            
            if (imageBase64) {
                if (imageBase64.includes(',')) {
                    imageBase64 = imageBase64.split(',')[1];
                }
                return { success: true, buffer: Buffer.from(imageBase64, 'base64') };
            }
        }
        
        return { success: false, error: 'No image data' };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ==================== تنسيق الردود ====================

function formatResponse(response, isCode = false) {
    if (!response) return null;
    
    // إضافة إيموجيز إذا لم تكن موجودة
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    
    if (!emojiRegex.test(response) && !isCode) {
        response = `${EMOJIS.sparkles} ${response} ${EMOJIS.sparkles}`;
    }
    
    return response;
}

// ==================== معالجة أوامر توليد الصور ====================

function isImageGenerationCommand(text) {
    const commands = ['generate', 'draw', 'create', 'صورة', 'ارسم', 'ولد', 'make', 'imagine', 'تخيل'];
    const lowerText = text.toLowerCase();
    return commands.some(cmd => lowerText.startsWith(cmd));
}

function extractImagePrompt(text) {
    const commands = ['generate', 'draw', 'create', 'صورة', 'ارسم', 'ولد', 'make', 'imagine', 'تخيل'];
    let prompt = text;
    
    for (const cmd of commands) {
        if (text.toLowerCase().startsWith(cmd)) {
            prompt = text.slice(cmd.length).trim();
            break;
        }
    }
    
    return prompt || null;
}

// ==================== النموذج الرئيسي ====================

function checkRateLimit(userId) {
    const lastMessage = userCooldown.get(userId);
    const cooldown = global.aiConfig?.cooldown || 3000;
    
    if (lastMessage && (Date.now() - lastMessage) < cooldown) {
        return false;
    }
    userCooldown.set(userId, Date.now());
    return true;
}

export async function handleAIMessage(conn, message, sender, messageText, messageType) {
    if (global.aiConfig && global.aiConfig.enabled === false) return false;
    if (message.key?.fromMe) return false;
    if (!checkRateLimit(sender)) return false;
    
    await conn.sendPresenceUpdate('composing', sender);
    
    try {
        let response = null;
        let imageBuffer = null;
        let imageMimeType = null;
        let imageFound = false;
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`${EMOJIS.phone} Message from: ${sender}`);
        console.log(`${EMOJIS.note} Text: ${messageText || '(no text)'}`);
        
        // استخراج الصورة
        const imageResult = await extractImageFromMessage(message);
        
        if (imageResult.success) {
            imageFound = true;
            imageBuffer = imageResult.buffer;
            imageMimeType = imageResult.mimeType;
            console.log(`${EMOJIS.success} Image extracted!`);
        }
        
        // ========== معالجة الصور ==========
        if (imageFound) {
            const imageQuestion = messageText || "Please analyze this image in detail";
            response = await generateKimiResponse(imageQuestion, imageBuffer, imageMimeType, false);
            response = formatResponse(response, false);
        }
        // ========== معالجة أوامر توليد الصور ==========
        else if (messageText && isImageGenerationCommand(messageText)) {
            const prompt = extractImagePrompt(messageText);
            
            if (!prompt || prompt.length < 3) {
                response = `${EMOJIS.magic} *Image Generation*\n\n` +
                    `${EMOJIS.target} Please describe the image you want.\n\n` +
                    `${EMOJIS.star} *Examples:*\n` +
                    `• generate a beautiful sunset\n` +
                    `• draw a cute cat\n` +
                    `• create a futuristic city`;
            } else {
                await conn.sendMessage(sender, { 
                    text: `${EMOJIS.magic} ${EMOJIS.thinking} Generating your image...\n\n${EMOJIS.clock} 20-40 seconds...` 
                });
                
                const imageResult_gen = await generateImage(prompt);
                
                if (imageResult_gen.success && imageResult_gen.buffer) {
                    await conn.sendMessage(sender, {
                        image: imageResult_gen.buffer,
                        caption: `${EMOJIS.image} *Generated!*\n\n${EMOJIS.note} Prompt: ${prompt}\n${EMOJIS.heart} Enjoy! ${EMOJIS.sparkles}`
                    });
                    await conn.sendPresenceUpdate('paused', sender);
                    return true;
                } else {
                    response = `${EMOJIS.error} Failed to generate image.\n${EMOJIS.warning} Try a different description.`;
                }
            }
        }
        // ========== معالجة الرسائل النصية ==========
        else if (messageText && messageText.trim().length > 0) {
            const isCode = isCodeQuestion(messageText);
            response = await generateResponse(messageText);
            response = formatResponse(response, isCode);
        }
        
        // إرسال الرد
        if (response) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (response.length > 4000) {
                const parts = response.match(/[\s\S]{1,4000}/g) || [];
                for (let i = 0; i < parts.length; i++) {
                    await conn.sendMessage(sender, { text: parts[i] });
                    if (i < parts.length - 1) await new Promise(r => setTimeout(r, 500));
                }
            } else {
                await conn.sendMessage(sender, { text: response });
            }
            
            console.log(`${EMOJIS.success} Response sent (${response.length} chars)`);
            await conn.sendPresenceUpdate('paused', sender);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error(`${EMOJIS.error} Error:`, error.message);
        
        await conn.sendMessage(sender, { 
            text: `${EMOJIS.error} Oops! Something went wrong...\n${EMOJIS.clock} Please try again.` 
        });
        await conn.sendPresenceUpdate('paused', sender);
        return true;
    }
}

// ==================== NEW: Export Enhanced AI for external use ====================
export { enhancedChat, simpleEnhancedChat };

export default { handleAIMessage, enhancedChat, simpleEnhancedChat };
