// plugins/welcome-canvas.js
// 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗖𝗮𝗻𝘃𝗮𝘀 - 𝗗𝘆𝗻𝗮𝗺𝗶𝗰 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗶𝗺𝗮𝗴𝗲 𝘀𝘆𝘀𝘁𝗲𝗺
// @author Saziki Bot Team
// Version: 2.0.0

import { createCanvas, loadImage } from 'canvas';
import path from 'path'; // ✅ أضف هذا السطر
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const CONFIG = {
    canvas: {
        width: 800,
        height: 400,
        avatarSize: 150,
        avatarX: 200,
        avatarY: 200,
        welcomeX: 450,
        welcomeY: 150,
        nameY: 220
    },
    colors: {
        avatarBorder: '#FFFFFF',
        avatarBorderWidth: 5,
        text: '#FFFFFF',
        shadow: 'rgba(0,0,0,0.5)',
        backgroundOverlay: 'rgba(0,0,0,0.3)'
    },
    fonts: {
        welcome: 'bold 48px "Arial"',
        name: 'bold 36px "Arial"',
        group: '24px "Arial"'
    },
    defaultAvatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    backgroundImage: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
    botThumbnail: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'
};

/**
 * 𝗦𝘁𝘆𝗹𝗶𝘇𝗲 𝘁𝗲𝘅𝘁 𝘄𝗶𝘁𝗵 𝗺𝗮𝘁𝗵𝗲𝗺𝗮𝘁𝗶𝗰𝗮𝗹 𝗯𝗼𝗹𝗱 𝘀𝘁𝘆𝗹𝗲
 */
function stylizeText(text) {
    if (!text) return ''
    const styled = text.split('').map(char => {
        if (char.match(/[a-zA-Z]/)) {
            const code = char.charCodeAt(0)
            if (code >= 65 && code <= 90) {
                return String.fromCodePoint(0x1D5D4 + (code - 65))
            } else if (code >= 97 && code <= 122) {
                return String.fromCodePoint(0x1D5EE + (code - 97))
            }
        }
        return char
    }).join('')
    return styled
}

/**
 * 𝗙𝗲𝘁𝗰𝗵 𝗶𝗺𝗮𝗴𝗲 𝗳𝗿𝗼𝗺 𝗨𝗥𝗟 𝗼𝗿 𝗿𝗲𝘁𝘂𝗿𝗻 𝗯𝘂𝗳𝗳𝗲𝗿
 */
async function getImageBuffer(url) {
    try {
        const response = await fetch(url);
        return Buffer.from(await response.arrayBuffer());
    } catch (error) {
        console.error('❌ Failed to fetch image:', error);
        return null;
    }
}

/**
 * 𝗖𝗿𝗲𝗮𝘁𝗲 𝗰𝗶𝗿𝗰𝘂𝗹𝗮𝗿 𝗮𝘃𝗮𝘁𝗮𝗿
 */
async function createCircularAvatar(avatarBuffer, size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    const avatar = await loadImage(avatarBuffer);
    ctx.drawImage(avatar, 0, 0, size, size);
    
    return canvas;
}

/**
 * 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗶𝗺𝗮𝗴𝗲
 */
async function generateWelcomeImage(userName, groupName, avatarUrl) {
    const canvas = createCanvas(CONFIG.canvas.width, CONFIG.canvas.height);
    const ctx = canvas.getContext('2d');
    
    try {
        const bgBuffer = await getImageBuffer(CONFIG.backgroundImage);
        if (bgBuffer) {
            const bgImage = await loadImage(bgBuffer);
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } catch {
        ctx.fillStyle = '#667eea';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.fillStyle = CONFIG.colors.backgroundOverlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    try {
        let avatarBuffer;
        if (avatarUrl) {
            avatarBuffer = await getImageBuffer(avatarUrl);
        }
        
        if (!avatarBuffer) {
            avatarBuffer = await getImageBuffer(CONFIG.defaultAvatar);
        }
        
        if (avatarBuffer) {
            const avatarCanvas = await createCircularAvatar(avatarBuffer, CONFIG.canvas.avatarSize);
            
            ctx.save();
            ctx.shadowColor = CONFIG.colors.shadow;
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 5;
            
            ctx.beginPath();
            ctx.arc(
                CONFIG.canvas.avatarX,
                CONFIG.canvas.avatarY,
                CONFIG.canvas.avatarSize/2 + CONFIG.colors.avatarBorderWidth,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = CONFIG.colors.avatarBorder;
            ctx.fill();
            
            ctx.drawImage(
                avatarCanvas,
                CONFIG.canvas.avatarX - CONFIG.canvas.avatarSize/2,
                CONFIG.canvas.avatarY - CONFIG.canvas.avatarSize/2,
                CONFIG.canvas.avatarSize,
                CONFIG.canvas.avatarSize
            );
            ctx.restore();
        }
    } catch (error) {
        console.error('❌ Error drawing avatar:', error);
    }
    
    ctx.shadowColor = CONFIG.colors.shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = CONFIG.colors.text;
    
    const styledWelcome = stylizeText('WELCOME');
    ctx.font = CONFIG.fonts.welcome;
    ctx.textAlign = 'left';
    ctx.fillText(styledWelcome, CONFIG.canvas.welcomeX, CONFIG.canvas.welcomeY);
    
    ctx.font = CONFIG.fonts.name;
    const displayName = userName.length > 20 ? userName.substring(0, 17) + '...' : userName;
    const styledName = stylizeText(displayName);
    ctx.fillText(styledName, CONFIG.canvas.welcomeX, CONFIG.canvas.nameY);
    
    ctx.font = CONFIG.fonts.group;
    ctx.fillStyle = '#E0E0E0';
    const displayGroup = groupName.length > 30 ? groupName.substring(0, 27) + '...' : groupName;
    const styledGroup = stylizeText(`to ${displayGroup}`);
    ctx.fillText(styledGroup, CONFIG.canvas.welcomeX, CONFIG.canvas.nameY + 40);
    
    return canvas.toBuffer();
}

/**
 * 𝗛𝗮𝗻𝗱𝗹𝗲 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗳𝗼𝗿 𝗻𝗲𝘄 𝗺𝗲𝗺𝗯𝗲𝗿𝘀
 */
export async function handleWelcome(conn, groupId, userId, action) {
    try {
        if (action !== 'add') return;
        
        const chat = global.db?.data?.chats?.[groupId];
        if (!chat?.welcome) return;
        
        const groupMetadata = await conn.groupMetadata(groupId);
        const groupName = groupMetadata.subject;
        
        let userName = '𝗡𝗲𝘄 𝗠𝗲𝗺𝗯𝗲𝗿';
        let avatarUrl = null;
        
        try {
            const contact = await conn.contact(userId);
            userName = contact?.name || contact?.short || '𝗡𝗲𝘄 𝗠𝗲𝗺𝗯𝗲𝗿';
        } catch {}
        
        try {
            avatarUrl = await conn.profilePictureUrl(userId, 'image');
        } catch {
            avatarUrl = null;
        }
        
        const imageBuffer = await generateWelcomeImage(userName, groupName, avatarUrl);
        
        const styledGroup = stylizeText(groupName);
        const styledUser = stylizeText(userName);
        
        await conn.sendMessage(groupId, {
            image: imageBuffer,
            caption: `╭━━━❰👋 *𝗪𝗘𝗟𝗖𝗢𝗠𝗘* 👋❱━━━╮
┃
┃ ✨ *𝗛𝗲𝗹𝗹𝗼* @${userId.split('@')[0]}!
┃
┃ 📍 *${styledGroup}*
┃
┃ 👤 *${styledUser}*
┃
┃ ⚡ *𝗘𝗻𝗷𝗼𝘆 𝘆𝗼𝘂𝗿 𝘀𝘁𝗮𝘆!*
┃
╰━━━━━━━━━━━━━━━━╯`,
            mentions: [userId],
            contextInfo: {
                externalAdReply: {
                    title: '👋 𝗪𝗲𝗹𝗰𝗼𝗺𝗲',
                    body: styledGroup,
                    thumbnailUrl: CONFIG.botThumbnail,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        });
        
    } catch (error) {
        console.error('❌ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗖𝗮𝗻𝘃𝗮𝘀 𝗘𝗿𝗿𝗼𝗿:', error);
    }
}

/**
 * 𝗧𝗲𝘀𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗵𝗮𝗻𝗱𝗹𝗲𝗿
 */
let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!m.isGroup) return m.reply('❌ *𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗰𝗮𝗻 𝗼𝗻𝗹𝘆 𝗯𝗲 𝘂𝘀𝗲𝗱 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀*');
    
    const args = text.split(' ');
    const subCommand = args[0]?.toLowerCase();
    
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `╭━━━❰🎨 *𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗖𝗔𝗡𝗩𝗔𝗦* 🎨❱━━━╮
┃
┃ *📝 𝗨𝘀𝗮𝗴𝗲:*
┃ ${usedPrefix + command} test - 𝗧𝗲𝘀𝘁 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗶𝗺𝗮𝗴𝗲
┃ ${usedPrefix + command} set <on/off> - 𝗧𝘂𝗿𝗻 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗼𝗻/𝗼𝗳𝗳
┃
╰━━━━━━━━━━━━━━━━╯`,
            contextInfo: {
                externalAdReply: {
                    title: '🎨 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗖𝗮𝗻𝘃𝗮𝘀',
                    body: 'Test welcome image',
                    thumbnailUrl: CONFIG.botThumbnail,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    }
    
    if (subCommand === 'test') {
        const waitMsg = await m.reply('🎨 *𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗶𝗺𝗮𝗴𝗲...*');
        
        const userName = m.name || m.sender.split('@')[0];
        const groupMetadata = await conn.groupMetadata(m.chat);
        const groupName = groupMetadata.subject;
        
        let avatarUrl;
        try {
            avatarUrl = await conn.profilePictureUrl(m.sender, 'image');
        } catch {
            avatarUrl = null;
        }
        
        const imageBuffer = await generateWelcomeImage(userName, groupName, avatarUrl);
        
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        
        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `✅ *𝗧𝗲𝘀𝘁 𝗶𝗺𝗮𝗴𝗲 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!*`,
        }, { quoted: m });
    }
    
    else if (subCommand === 'set') {
        if (!args[1]) return m.reply('❌ *𝗨𝘀𝗲: on/off*');
        
        const chat = global.db.data.chats[m.chat];
        if (!chat) return m.reply('❌ *𝗚𝗿𝗼𝘂𝗽 𝗱𝗮𝘁𝗮 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱*');
        
        chat.welcome = args[1] === 'on';
        await m.reply(`✅ *𝗪𝗲𝗹𝗰𝗼𝗺𝗲 ${chat.welcome ? '𝗲𝗻𝗮𝗯𝗹𝗲𝗱' : '𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱'}*`);
    }
};

handler.help = ['welcomecanvas', 'welc'];
handler.tags = ['group'];
handler.command = /^(welcomecanvas|welc)$/i;
handler.group = true;
handler.admin = true;

export default handler;