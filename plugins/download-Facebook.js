import axios from "axios";

// ==================== 𝙁𝘼𝘾𝙀𝘽𝙊𝙊𝙆 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍 ====================

/**
 * 𝙁𝙚𝙩𝙘𝙝 𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠 𝙫𝙞𝙙𝙚𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙡𝙞𝙣𝙠𝙨
 */
async function facebookDownloader(postUrl, cookie = "", userAgent = "") {
    if (!postUrl || !postUrl.trim()) throw new Error("> ⚠️ *𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠 𝙡𝙞𝙣𝙠*");
    if (!/(facebook.com|fb.watch)/.test(postUrl)) throw new Error("❌ *𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠 𝙐𝙍𝙇*");

    const headers = {
        "sec-fetch-user": "?1",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-site": "none",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "cache-control": "max-age=0",
        "authority": "www.facebook.com",
        "upgrade-insecure-requests": "1",
        "accept-language": "en-GB,en;q=0.9",
        "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
        "user-agent": userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "cookie": cookie || "",
    };

    try {
        const { data } = await axios.get(postUrl, { headers });
        const extractData = data.replace(/"/g, '"').replace(/&/g, "&");

        const sdUrl = match(extractData, /"browser_native_sd_url":"(.*?)"/, /sd_src\s*:\s*"([^"]*)"/)?.[1];
        const hdUrl = match(extractData, /"browser_native_hd_url":"(.*?)"/, /hd_src\s*:\s*"([^"]*)"/)?.[1];
        const title = match(extractData, /<meta\sname="description"\scontent="(.*?)"/)?.[1] || "";

        if (sdUrl) {
            return {
                url: postUrl,
                title: parseString(title),
                quality: {
                    sd: parseString(sdUrl),
                    hd: parseString(hdUrl || ""),
                },
            };
        } else {
            throw new Error("『❌ *𝘼𝙣 𝙚𝙧𝙧𝙤𝙧 𝙤𝙘𝙘𝙪𝙧𝙧𝙚𝙙*』");
        }
    } catch (error) {
        console.error("Error:", error);
        throw new Error("『❌ *𝘼𝙣 𝙚𝙧𝙧𝙤𝙧 𝙤𝙘𝙘𝙪𝙧𝙧𝙚𝙙*』");
    }
}

/**
 * 𝙋𝙖𝙧𝙨𝙚 𝙨𝙩𝙧𝙞𝙣𝙜 𝙩𝙤 𝙧𝙚𝙢𝙤𝙫𝙚 𝙚𝙨𝙘𝙖𝙥𝙚 𝙘𝙝𝙖𝙧𝙖𝙘𝙩𝙚𝙧𝙨
 */
function parseString(string) {
    try {
        return JSON.parse(`{"text": "${string}"}`).text;
    } catch (e) {
        return string;
    }
}

/**
 * 𝙈𝙖𝙩𝙘𝙝 𝙥𝙖𝙩𝙩𝙚𝙧𝙣𝙨 𝙞𝙣 𝙙𝙖𝙩𝙖
 */
function match(data, ...patterns) {
    for (const pattern of patterns) {
        const result = data.match(pattern);
        if (result) return result;
    }
    return null;
}

/**
 * 𝘾𝙧𝙚𝙖𝙩𝙚 𝙬𝙖𝙞𝙩𝙞𝙣𝙜 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙬𝙞𝙩𝙝 𝙖𝙣𝙞𝙢𝙖𝙩𝙞𝙤𝙣
 */
async function createWaitingMessage(conn, chatId, text, steps = 5) {
    const dots = ['⏳', '⌛', '⏳', '⌛'];
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

// ==================== 𝙈𝘼𝙄𝙉 𝙃𝘼𝙉𝘿𝙇𝙀𝙍 ====================

let handler = async (m, { args, conn }) => {
    if (!args[0]) throw "*⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗨𝗥𝗟*";

    const waitingMsg = await createWaitingMessage(conn, m.chat, "𝙁𝙚𝙩𝙘𝙝𝙞𝙣𝙜 𝙫𝙞𝙙𝙚𝙤 𝙙𝙖𝙩𝙖...", 5);

    try {
        let result = await facebookDownloader(args[0]);

        // Update waiting message
        await conn.sendMessage(m.chat, {
            text: `*✅ 𝙑𝙞𝙙𝙚𝙤 𝙛𝙤𝙪𝙣𝙙!*\n\n*📹 𝙏𝙞𝙩𝙡𝙚:* ${result.title}\n*🔗 𝙎𝙤𝙪𝙧𝙘𝙚:* ${result.url}`,
            edit: waitingMsg.key
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send HD quality if available, otherwise SD
        let videoUrl = result.quality.hd || result.quality.sd;
        let quality = result.quality.hd ? '𝙃𝘿' : '𝙎𝘿';

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `*✅ 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙚!*\n\n*📹 𝙏𝙞𝙩𝙡𝙚:* ${result.title}\n*📊 𝙌𝙪𝙖𝙡𝙞𝙩𝙮:* ${quality}\n*🔗 ${result.url}*`,
            mimetype: 'video/mp4',
            contextInfo: {
                externalAdReply: {
                    title: result.title.substring(0, 30),
                    body: `𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠 𝙑𝙞𝙙𝙚𝙤 • ${quality}`,
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: result.url,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitingMsg.key });

    } catch (error) {
        await conn.sendMessage(m.chat, { delete: waitingMsg.key });
        throw `❌ *𝙀𝙧𝙧𝙤𝙧:* ${error.message}`;
    }
};

// ==================== 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝙏𝙄𝙊𝙉 ====================

handler.help = ['fb', 'facebook'];
handler.tags = ['downloader'];
handler.command = /^(fb|facebook)$/i;
handler.saki = 0;

export default handler;