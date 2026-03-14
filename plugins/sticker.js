// plugins/sticker.js
// 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗠𝗮𝗸𝗲𝗿 - 𝗖𝗿𝗲𝗮𝘁𝗲 𝘀𝘁𝗶𝗰𝗸𝗲𝗿𝘀 𝗳𝗿𝗼𝗺 𝗶𝗺𝗮𝗴𝗲𝘀/𝘃𝗶𝗱𝗲𝗼𝘀
// @author Saziki Bot Team
// Version: 1.1.0

import { sticker } from '../src/libraries/sticker.js'
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'
const TMP_DIR = join(tmpdir(), 'sticker_temp')

// 𝗘𝗻𝘀𝘂𝗿𝗲 𝘁𝗲𝗺𝗽 𝗱𝗶𝗿𝗲𝗰𝘁𝗼𝗿𝘆 𝗲𝘅𝗶𝘀𝘁𝘀
if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR, { recursive: true })
}

// ==================== 𝗛𝗲𝗹𝗽𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 ====================

/**
 * 𝗖𝗿𝗲𝗮𝘁𝗲 𝗽𝗿𝗼𝗴𝗿𝗲𝘀𝘀 𝗯𝗮𝗿
 */
function createProgressBar(percent) {
    const filled = Math.floor(percent / 10)
    const empty = 10 - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
}

/**
 * 𝗖𝗿𝗲𝗮𝘁𝗲 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 𝗮𝗻𝗶𝗺𝗮𝘁𝗶𝗼𝗻
 */
async function createWaitingMessage(conn, chatId, text, steps = 5) {
    const messages = []
    
    for (let i = 0; i <= 100; i += 100 / steps) {
        const progress = createProgressBar(i)
        messages.push(`*${text}*\n\n${progress} ${Math.floor(i)}%`)
    }

    const sentMsg = await conn.sendMessage(chatId, { text: messages[0] })
    
    for (let i = 1; i < messages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        await conn.sendMessage(chatId, { text: messages[i], edit: sentMsg.key })
    }
    
    return sentMsg
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘁𝗵𝗲𝗿𝗲'𝘀 𝗮 𝗾𝘂𝗼𝘁𝗲𝗱 𝗶𝗺𝗮𝗴𝗲/𝘃𝗶𝗱𝗲𝗼
        if (!m.quoted) {
            return conn.sendMessage(m.chat, {
                text: `*🎯 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗠𝗮𝗸𝗲𝗿*\n\n` +
                      `*📝 𝗨𝘀𝗮𝗴𝗲:*\n` +
                      `• Reply to an image/video with: ${usedPrefix + command}\n` +
                      `• Reply with custom pack: ${usedPrefix + command} PackName|Author\n\n` +
                      `*📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:*\n` +
                      `• ${usedPrefix}sticker\n` +
                      `• ${usedPrefix}s CutePack|MyBot\n\n` +
                      `*✨ 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:*\n` +
                      `• Images → Sticker\n` +
                      `• Videos → Animated Sticker\n` +
                      `• Custom Pack & Author`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎯 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗠𝗮𝗸𝗲𝗿',
                        body: 'Create stickers easily',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        // 𝗣𝗮𝗿𝘀𝗲 𝗽𝗮𝗰𝗸 𝗻𝗮𝗺𝗲 𝗮𝗻𝗱 𝗮𝘂𝘁𝗵𝗼𝗿
        let packName = 'Saziki Bot'
        let author = 'Saziki Team'
        
        if (text) {
            const [customPack, customAuthor] = text.split('|')
            if (customPack) packName = customPack.trim()
            if (customAuthor) author = customAuthor.trim()
        }

        const waitingMsg = await createWaitingMessage(conn, m.chat, "𝗖𝗿𝗲𝗮𝘁𝗶𝗻𝗴 𝘀𝘁𝗶𝗰𝗸𝗲𝗿...", 4)

        // 𝗚𝗲𝘁 𝘁𝗵𝗲 𝗺𝗲𝗱𝗶𝗮 𝗯𝘂𝗳𝗳𝗲𝗿
        const mime = m.quoted.mimetype || ''
        let mediaBuffer

        if (/image/.test(mime)) {
            mediaBuffer = await m.quoted.download()
        } else if (/video/.test(mime)) {
            mediaBuffer = await m.quoted.download()
        } else {
            await conn.sendMessage(m.chat, { delete: waitingMsg.key })
            return m.reply('❌ *𝗣𝗹𝗲𝗮𝘀𝗲 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗼𝗿 𝘃𝗶𝗱𝗲𝗼*')
        }

        // 𝗖𝗿𝗲𝗮𝘁𝗲 𝘀𝘁𝗶𝗰𝗸𝗲𝗿
        const stickerBuffer = await sticker(mediaBuffer, false, packName, author)

        if (!stickerBuffer) {
            throw new Error('Failed to create sticker')
        }

        // 𝗦𝗮𝘃𝗲 𝘁𝗲𝗺𝗽 𝗳𝗶𝗹𝗲
        const tempFile = join(TMP_DIR, `sticker_${Date.now()}.webp`)
        writeFileSync(tempFile, stickerBuffer)

        // 𝗦𝗲𝗻𝗱 𝘀𝘁𝗶𝗰𝗸𝗲𝗿
        await conn.sendMessage(m.chat, { 
            sticker: { url: tempFile },
            contextInfo: {
                externalAdReply: {
                    title: packName,
                    body: author,
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m })

        // 𝗖𝗹𝗲𝗮𝗻 𝘂𝗽
        unlinkSync(tempFile)
        await conn.sendMessage(m.chat, { delete: waitingMsg.key })

    } catch (error) {
        console.error('❌ 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗘𝗿𝗿𝗼𝗿:', error)
        
        if (error.code === 'ENOENT') {
            await m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* Temporary file not found. Please try again.`)
        } else {
            await m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* ${error.message}`)
        }
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['sticker', 's']
handler.tags = ['tools']
handler.command = /^(sticker|s|stiker)$/i
handler.saki = 0

export default handler