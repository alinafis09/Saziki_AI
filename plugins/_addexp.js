// plugins/addexp.js
// Add Experience Points to User (Owner Only)
// @author Saziki Bot Team
// Version: 1.0.0

import { findLevel } from '../src/libraries/levelling.js'

let handler = async (m, { conn, usedPrefix, command, text, isOwner }) => {
    // التحقق من أن المستخدم هو المالك
    if (!isOwner) {
        return m.reply('❌ This command can only be used by the bot owner.');
    }

    // التحقق من وجود النص
    if (!text) {
        return m.reply(
            `✨ *Add EXP Command*\n\n` +
            `*Usage:* ${usedPrefix + command} @user amount\n` +
            `*Usage:* ${usedPrefix + command} amount (for yourself)\n\n` +
            `*Examples:*\n` +
            `• ${usedPrefix}addexp @user 1000\n` +
            `• ${usedPrefix}addexp 5000\n` +
            `• ${usedPrefix}addexp @user -500 (remove exp)\n\n` +
            `*Note:* You can use negative numbers to remove exp.`
        );
    }

    try {
        // تحليل المدخلات
        let targetUser = m.sender;
        let amount = 0;
        
        // التحقق من وجود منشن
        const mention = text.match(/@(\d+)/);
        if (mention) {
            const mentionedJid = mention[0].replace('@', '') + '@s.whatsapp.net';
            if (global.db.data.users[mentionedJid]) {
                targetUser = mentionedJid;
            }
            // استخراج الرقم من النص بعد إزالة المنشن
            const numbers = text.replace(mention[0], '').trim().match(/-?\d+/);
            amount = numbers ? parseInt(numbers[0]) : 0;
        } else {
            // إذا كان الرقم فقط
            const numbers = text.match(/-?\d+/);
            amount = numbers ? parseInt(numbers[0]) : 0;
        }
        
        // التحقق من صحة الرقم
        if (isNaN(amount) || amount === 0) {
            return m.reply('❌ Please provide a valid number (positive or negative).');
        }
        
        // الحصول على بيانات المستخدم
        const user = global.db.data.users[targetUser];
        if (!user) {
            return m.reply('❌ User not found in database.');
        }
        
        // حفظ القيم القديمة
        const oldExp = user.exp || 0;
        const oldLevel = findLevel(oldExp);
        
        // إضافة أو إزالة النقاط
        user.exp = Math.max(0, (user.exp || 0) + amount);
        
        // حساب المستوى الجديد
        const newExp = user.exp;
        const newLevel = findLevel(newExp);
        
        // تنسيق الأرقام
        const formatNumber = (num) => {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };
        
        // إنشاء رسالة النتيجة
        const action = amount > 0 ? 'added' : 'removed';
        const absAmount = Math.abs(amount);
        
        let resultMessage = `╭━━━❰✨ *EXP UPDATED* ✨❱━━━╮\n`;
        resultMessage += `┃\n`;
        resultMessage += `┃ 👤 *User:* @${targetUser.split('@')[0]}\n`;
        resultMessage += `┃ 📊 *Action:* ${action} ${formatNumber(absAmount)} EXP\n`;
        resultMessage += `┃\n`;
        resultMessage += `┃ 📈 *EXP Changes:*\n`;
        resultMessage += `┃ • Before: ${formatNumber(oldExp)} EXP\n`;
        resultMessage += `┃ • After:  ${formatNumber(newExp)} EXP\n`;
        resultMessage += `┃ • Change: ${amount > 0 ? '+' : ''}${formatNumber(amount)} EXP\n`;
        resultMessage += `┃\n`;
        resultMessage += `┃ 📊 *Level Changes:*\n`;
        resultMessage += `┃ • Before: Level ${oldLevel}\n`;
        resultMessage += `┃ • After:  Level ${newLevel}\n`;
        resultMessage += `┃\n`;
        
        if (newLevel > oldLevel) {
            resultMessage += `┃ ⚡ *LEVEL UP!* +${newLevel - oldLevel} Levels\n`;
        } else if (newLevel < oldLevel) {
            resultMessage += `┃ ⚠️ *LEVEL DOWN!* ${oldLevel - newLevel} Levels\n`;
        }
        
        resultMessage += `╰━━━━━━━━━━━━━━━━╯`;
        
        // إرسال النتيجة
        await conn.sendMessage(m.chat, {
            text: resultMessage,
            mentions: [targetUser],
            contextInfo: {
                externalAdReply: {
                    title: `✨ EXP ${action === 'added' ? 'Added' : 'Removed'}`,
                    body: `${formatNumber(absAmount)} EXP • Level ${newLevel}`,
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: 'https://saziki.com',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
        
    } catch (error) {
        console.error('❌ Add EXP Error:', error);
        m.reply('❌ Error: ' + error.message);
    }
};

handler.help = ['addexp', 'removeexp', 'setexp'];
handler.tags = ['owner'];
handler.command = /^(addexp|removeexp|setexp)$/i;
handler.owner = true;
handler.rowner = true;

export default handler;