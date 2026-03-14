// plugins/level.js
// Level Command - Check your level progress
// @author Saziki Bot Team
// Version: 2.0.0

import { xpRange, findLevel, canLevelUp } from '../src/libraries/levelling.js';

let handler = async (m, { conn, usedPrefix, command, isPrems }) => {
    try {
        // التحقق من وجود قاعدة البيانات
        if (!global.db?.data?.users) {
            return m.reply('❌ Database not initialized.');
        }

        // الحصول على بيانات المستخدم
        const user = global.db.data.users[m.sender];
        
        if (!user) {
            // إذا لم يكن المستخدم موجوداً، أنشئ بيانات افتراضية
            global.db.data.users[m.sender] = {
                exp: 0,
                level: 0,
                limit: 20,
                money: 0,
                premiumTime: 0,
                registered: false,
                name: m.name || m.sender.split('@')[0],
                lastCommandTime: 0,
                commandCount: 0
            };
            
            return m.reply('✅ Profile created! Use .level again to see your stats.');
        }

        // الحصول على معلومات المستوى
        const level = user.level || 0;
        const exp = user.exp || 0;
        
        // حساب نطاق المستوى
        let requiredExp;
        try {
            requiredExp = xpRange(level);
        } catch (e) {
            console.error('❌ xpRange error:', e);
            requiredExp = { min: 0, max: 1000, xp: 1000 };
        }
        
        // حساب التقدم
        const currentExp = Math.max(0, exp - requiredExp.min);
        const totalRequired = requiredExp.xp || 1;
        const progressPercent = Math.min(100, Math.floor((currentExp / totalRequired) * 100));
        
        // إنشاء شريط التقدم
        const progressBarLength = 15;
        const filledBars = Math.floor((progressPercent / 100) * progressBarLength);
        const emptyBars = progressBarLength - filledBars;
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
        
        // التحقق من إمكانية رفع المستوى
        let canLevel = false;
        let nextLevel = level + 1;
        try {
            canLevel = canLevelUp(level, exp);
            if (canLevel) {
                nextLevel = findLevel(exp);
            }
        } catch (e) {
            console.error('❌ canLevelUp error:', e);
        }
        
        // تنسيق الأرقام
        const formatNumber = (num) => {
            if (isNaN(num) || num === undefined) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        // إنشاء رسالة المستوى
        const levelMessage = `╭━━━❰✨ *LEVEL SYSTEM* ✨❱━━━╮
┃
┃ 👤 *User:* @${m.sender.split('@')[0]}
┃
┃ 📊 *Current Level:* ${level}
┃ ⚡ *Total EXP:* ${formatNumber(exp)}
┃
┃ 📈 *Progress to Level ${level + 1}:*
┃ ${progressBar}
┃ 🎯 *${progressPercent}% Complete*
┃
┃ 💫 *Experience Details:*
┃ • Current: ${formatNumber(exp)} EXP
┃ • Level ${level} Min: ${formatNumber(requiredExp.min)} EXP
┃ • Level ${level + 1} Max: ${formatNumber(requiredExp.max)} EXP
┃ • Needed: ${formatNumber(Math.max(0, requiredExp.max - exp))} EXP
┃
┃ ${canLevel ? '⚡ *READY TO LEVEL UP!* Keep using commands!' : '📌 Keep using commands to reach next level!'}
┃
╰━━━━━━━━━━━━━━━━╯

💡 *Tips:* 
• Each command gives random EXP (10-50)
• Premium users get 50% more EXP
• Use ${usedPrefix}profile to see full stats`;

        // إرسال معلومات المستوى
        await conn.sendMessage(m.chat, {
            text: levelMessage,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: `✨ Level ${level} • ${progressPercent}% Complete`,
                    body: `${formatNumber(exp)} / ${formatNumber(requiredExp.max)} EXP`,
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: 'https://saziki.com',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

    } catch (error) {
        console.error('❌ Level Command Error:', error);
        
        // رسالة خطأ مفصلة
        let errorMessage = '❌ Error\n\n';
        errorMessage += `• ${error.message || 'Unknown error'}\n\n`;
        errorMessage += '💡 Try using the bot a few times to create your profile.';
        
        m.reply(errorMessage);
    }
};

// أمر لإنشاء ملف المستخدم إذا لم يكن موجوداً
let createHandler = async (m, { conn }) => {
    if (!global.db?.data?.users) {
        return m.reply('❌ Database not initialized.');
    }
    
    global.db.data.users[m.sender] = {
        exp: 0,
        level: 0,
        limit: 20,
        money: 0,
        premiumTime: 0,
        registered: false,
        name: m.name || m.sender.split('@')[0],
        lastCommandTime: 0,
        commandCount: 0
    };
    
    m.reply('✅ Profile created successfully! Use .level to see your stats.');
};

handler.help = ['level', 'lvl', 'rank'];
handler.tags = ['info', 'rpg'];
handler.command = /^(level|lvl|rank)$/i;

let createCommand = {
    help: ['createprofile'],
    tags: ['info'],
    command: /^(createprofile)$/i,
    handler: createHandler
};

export { handler, createCommand };
export default handler;