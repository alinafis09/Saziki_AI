import axios from 'axios';

// ==================== 𝘼𝙋𝙆 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍 ====================

/**
 * 𝘾𝙧𝙚𝙖𝙩𝙚 𝙬𝙖𝙞𝙩𝙞𝙣𝙜 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙬𝙞𝙩𝙝 𝙖𝙣𝙞𝙢𝙖𝙩𝙞𝙤𝙣
 */
async function createWaitingMessage(conn, chatId, text, steps = 5) {
    const messages = [];
    
    for (let i = 0; i <= 100; i += 100 / steps) {
        const progress = '█'.repeat(Math.floor(i / 10)) + '░'.repeat(10 - Math.floor(i / 10));
        messages.push(`*${text}*\n\n${progress} ${Math.floor(i)}%`);
    }

    const sentMsg = await conn.sendMessage(chatId, { text: messages[0] });
    
    for (let i = 1; i < messages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await conn.sendMessage(chatId, { text: messages[i], edit: sentMsg.key });
    }
    
    return sentMsg;
}

/**
 * 𝙁𝙤𝙧𝙢𝙖𝙩 𝙨𝙞𝙯𝙚 𝙛𝙧𝙤𝙢 𝙗𝙮𝙩𝙚𝙨
 */
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

// ==================== 𝙈𝘼𝙄𝙉 𝙃𝘼𝙉𝘿𝙇𝙀𝙍 ====================

let handler = async (m, { conn, text, command }) => {
    if (!text) {
        await conn.sendMessage(m.chat, {
            text: `*⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮𝗻 𝗮𝗽𝗽 𝗻𝗮𝗺𝗲 𝘁𝗼 𝘀𝗲𝗮𝗿𝗰𝗵*\n\n*📝 𝗨𝘀𝗮𝗴𝗲:* .${command} <app name>\n*📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲:* .${command} Instagram`,
            contextInfo: {
                externalAdReply: {
                    title: '📱 𝘼𝙋𝙆 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧',
                    body: 'Search and download APK files',
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
        return;
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
        
        const waitingMsg = await createWaitingMessage(conn, m.chat, "𝙎𝙚𝙖𝙧𝙘𝙝𝙞𝙣𝙜 𝙛𝙤𝙧 𝙖𝙥𝙥...", 4);

        const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}/limit=1`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
            await conn.sendMessage(m.chat, { delete: waitingMsg.key });
            await conn.sendMessage(m.chat, {
                text: `*❌ 𝗡𝗼 𝗔𝗣𝗞 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿* "${text}"`,
            }, { quoted: m });
            return;
        }

        const app = data.datalist.list[0];
        const size = formatSize(app.size);
        const updated = new Date(app.updated * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Update waiting message
        await conn.sendMessage(m.chat, {
            text: `*✅ 𝘼𝙥𝙥 𝙛𝙤𝙪𝙣𝙙!*\n\n*📱 𝙉𝙖𝙢𝙚:* ${app.name}\n*📦 𝙎𝙞𝙯𝙚:* ${size}\n*📅 𝙐𝙥𝙙𝙖𝙩𝙚𝙙:* ${updated}\n\n*⏳ 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙞𝙣𝙜...*`,
            edit: waitingMsg.key
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Prepare caption
        const caption = `*✅ 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙚!*\n\n` +
                       `*📱 𝙉𝙖𝙢𝙚:* ${app.name}\n` +
                       `*📦 𝙋𝙖𝙘𝙠𝙖𝙜𝙚:* ${app.package}\n` +
                       `*📅 𝙐𝙥𝙙𝙖𝙩𝙚𝙙:* ${updated}\n` +
                       `*📊 𝙎𝙞𝙯𝙚:* ${size}\n` +
                       `*⭐ 𝙍𝙖𝙩𝙞𝙣𝙜:* ${app.rating?.average || 'N/A'}/5`;

        // Send APK file
        await conn.sendMessage(m.chat, {
            document: { url: app.file.path_alt },
            fileName: `${app.name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: app.name,
                    body: `𝘼𝙋𝙆 • ${size}`,
                    mediaType: 1,
                    sourceUrl: app.file.path_alt,
                    thumbnailUrl: app.icon,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

        // Delete waiting message and update reactions
        await conn.sendMessage(m.chat, { delete: waitingMsg.key });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { 
            text: `*❌ 𝙀𝙧𝙧𝙤𝙧:* ${e.message}` 
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    }
};

// ==================== 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝙏𝙄𝙊𝙉 ====================

handler.help = ['apk2', 'apkdownload'];
handler.command = ['apk2', 'apkdownload'];
handler.tags = ['downloader'];
handler.premium = true;

export default handler;