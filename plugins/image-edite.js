// plugins/rey.js
// 𝗥𝗲𝘆 𝗔𝗜 𝗜𝗺𝗮𝗴𝗲 𝗘𝗱𝗶𝘁𝗼𝗿 - 𝗘𝗱𝗶𝘁 𝗶𝗺𝗮𝗴𝗲𝘀 𝘂𝘀𝗶𝗻𝗴 𝗔𝗜
// @author Saziki Bot Team
// Version: 4.0.0

import fetch from 'node-fetch';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const NVIDIA_API_KEY = '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';
const INVOKE_URL = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-kontext-dev';
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';
const TMP_DIR = './tmp/rey-ai';

if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR, { recursive: true });
}

// ==================== 𝗛𝗲𝗹𝗽𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 ====================

function stylizeText(text) {
    if (!text) return '';
    const styled = text.split('').map(char => {
        if (char.match(/[a-zA-Z]/)) {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) {
                return String.fromCodePoint(0x1D5D4 + (code - 65));
            } else if (code >= 97 && code <= 122) {
                return String.fromCodePoint(0x1D5EE + (code - 97));
            }
        }
        return char;
    }).join('');
    return styled;
}

function createProgressBar(percent) {
    const filled = Math.floor(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * نسخة محسنة لتحميل الصورة - مثل كود duty
 */
async function downloadImage(message) {
    try {
        let mediaMsg = null;
        
        console.log('🔍 البحث عن الصورة...');
        console.log('نوع الرسالة:', typeof message);
        
        // الطريقة 1: صورة مباشرة
        if (message.imageMessage) {
            mediaMsg = message.imageMessage;
            console.log('✅ صورة مباشرة');
        }
        // الطريقة 2: رسالة مقتبسة
        else if (message.message?.imageMessage) {
            mediaMsg = message.message.imageMessage;
            console.log('✅ صورة في message');
        }
        // الطريقة 3: quoted message
        else if (message.quotedMessage?.imageMessage) {
            mediaMsg = message.quotedMessage.imageMessage;
            console.log('✅ صورة مقتبسة');
        }
        // الطريقة 4: extended text
        else if (message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMsg = message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            console.log('✅ صورة في extendedText');
        }
        // الطريقة 5: view once
        else if (message.viewOnceMessage?.message?.imageMessage) {
            mediaMsg = message.viewOnceMessage.message.imageMessage;
            console.log('✅ صورة view once');
        }
        
        if (!mediaMsg) {
            console.log('❌ لم يتم العثور على صورة');
            throw new Error('لم يتم العثور على صورة');
        }

        console.log('📥 جاري تحميل الصورة...');
        const stream = await downloadContentFromMessage(mediaMsg, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        const mimeType = mediaMsg.mimetype || 'image/jpeg';
        console.log('✅ تم التحميل:', buffer.length, 'بايت');
        
        return { buffer, mimeType };
        
    } catch (error) {
        console.error('❌ خطأ في التحميل:', error.message);
        throw new Error('فشل تحميل الصورة');
    }
}

function bufferToBase64(buffer, mimeType) {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

/**
 * اختبار الاتصال بـ API
 */
async function testAPIConnection() {
    try {
        const testPayload = {
            "prompt": "test",
            "image": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "aspect_ratio": "match_input_image",
            "steps": 1,
            "cfg_scale": 1,
            "seed": 0
        };
        
        const response = await fetch(INVOKE_URL, {
            method: "POST",
            body: JSON.stringify(testPayload),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                "Accept": "application/json"
            },
            timeout: 5000
        });
        
        return response.status === 200;
    } catch {
        return false;
    }
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        // التحقق من وجود صورة
        if (!m.quoted) {
            return conn.sendMessage(m.chat, {
                text: `╭━━━❰✨ *𝗥𝗘𝗬 𝗔𝗜* ✨❱━━━╮
┃
┃ *📝 𝗞𝗲𝗳𝗶𝗳𝗲 𝗮𝗹𝗶𝘀𝘁𝗶𝗸𝗵𝗱𝗮𝗺:*
┃ • رد على صورة مع وصف التعديل
┃
┃ *📌 𝗔𝗺𝘁𝗵𝗹𝗮:*
┃ • رد على صورة: .rey حولها لكرتون
┃
┃ *✨ 𝗔𝗹𝗺𝘇𝗮𝘆𝗮:*
┃ • تعديل الصور بالذكاء الاصطناعي
┃
╰━━━━━━━━━━━━━━━━╯`,
                contextInfo: {
                    externalAdReply: {
                        title: '✨ 𝗥𝗲𝘆 𝗔𝗜',
                        body: 'تعديل الصور بالذكاء الاصطناعي',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m });
        }
        
        if (!text) {
            return m.reply('❌ *الرجاء كتابة وصف التعديل*\n\nمثال: .rey حولها لكرتون');
        }
        
        // اختبار الاتصال أولاً
        const isConnected = await testAPIConnection();
        if (!isConnected) {
            return m.reply('⚠️ *خدمة التعديل غير متاحة حالياً*\nالرجاء المحاولة لاحقاً');
        }
        
        const styledPrompt = stylizeText(text.length > 30 ? text.substring(0, 27) + '...' : text);
        const waitMsg = await m.reply(`✨ *جاري المعالجة...*\n\n📝 *الوصف:* ${styledPrompt}\n\n${createProgressBar(0)} 0%`);
        
        try {
            await conn.sendMessage(m.chat, {
                text: `📥 *جاري تحميل الصورة...*\n\n${createProgressBar(20)} 20%`,
                edit: waitMsg.key
            });
            
            // استخدام الكائن الصحيح للتحميل
            const { buffer, mimeType } = await downloadImage(m.quoted);
            
            // حفظ الصورة مؤقتاً
            const tempFile = join(TMP_DIR, `rey_${Date.now()}.jpg`);
            writeFileSync(tempFile, buffer);
            
            await conn.sendMessage(m.chat, {
                text: `⚙️ *جاري المعالجة...*\n\n${createProgressBar(40)} 40%`,
                edit: waitMsg.key
            });
            
            const imageBase64 = bufferToBase64(buffer, mimeType);
            
            const payload = {
                "prompt": text,
                "image": imageBase64,
                "aspect_ratio": "match_input_image",
                "steps": 30,
                "cfg_scale": 3.5,
                "seed": Math.floor(Math.random() * 1000000)
            };
            
            const response = await fetch(INVOKE_URL, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                    "Accept": "application/json"
                },
                timeout: 60000
            });
            
            if (response.status !== 200) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const responseBody = await response.json();
            let editedBuffer = null;
            
            if (responseBody.image) {
                const base64Data = responseBody.image.replace(/^data:image\/\w+;base64,/, '');
                editedBuffer = Buffer.from(base64Data, 'base64');
            } else if (responseBody.images && responseBody.images[0]) {
                const base64Data = responseBody.images[0].replace(/^data:image\/\w+;base64,/, '');
                editedBuffer = Buffer.from(base64Data, 'base64');
            } else {
                throw new Error('لم يتم استلام نتيجة');
            }
            
            await conn.sendMessage(m.chat, {
                text: `✨ *تمت المعالجة...*\n\n${createProgressBar(100)} 100%`,
                edit: waitMsg.key
            });
            
            await conn.sendMessage(m.chat, { delete: waitMsg.key });
            
            // حذف الملف المؤقت
            try { unlinkSync(tempFile); } catch (e) {}
            
            await conn.sendMessage(m.chat, {
                image: editedBuffer,
                caption: `✅ *تم التعديل بنجاح!*\n\n📝 *الوصف:* ${styledPrompt}`,
                contextInfo: {
                    externalAdReply: {
                        title: '✨ 𝗥𝗲𝘆 𝗔𝗜',
                        body: 'تم التعديل بنجاح',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m });
            
        } catch (error) {
            console.error('❌ خطأ:', error);
            
            await conn.sendMessage(m.chat, { delete: waitMsg.key });
            
            let errorMsg = '❌ *فشل التعديل*\n\n';
            
            if (error.message.includes('401')) {
                errorMsg += 'مشكلة في مفتاح API';
            } else if (error.message.includes('429')) {
                errorMsg += 'تم تجاوز الحد المسموح من الطلبات';
            } else if (error.message.includes('timeout')) {
                errorMsg += 'انتهت مهلة الطلب';
            } else if (error.message.includes('لم يتم العثور على صورة')) {
                errorMsg += 'لم يتم العثور على صورة في الرد';
            } else {
                errorMsg += 'الرجاء المحاولة مرة أخرى';
            }
            
            await m.reply(errorMsg);
        }
        
    } catch (error) {
        console.error('❌ خطأ رئيسي:', error);
        m.reply('❌ *حدث خطأ غير متوقع*');
    }
};

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴 ====================

handler.help = ['rey'];
handler.tags = ['ai'];
handler.command = /^(rey)$/i;
handler.saki = 3;

export default handler;