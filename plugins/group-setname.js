// plugins/setname.js
// 𝗦𝗲𝘁 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲 - 𝗖𝗵𝗮𝗻𝗴𝗲 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲 𝗶𝗻 𝘁𝗵𝗲 𝗰𝘂𝗿𝗿𝗲𝗻𝘁 𝗴𝗿𝗼𝘂𝗽
// @author Saziki Bot Team
// Version: 2.0.0

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

// ==================== 𝗛𝗲𝗹𝗽𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 ====================

/**
 * 𝗙𝗼𝗿𝗺𝗮𝘁 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 𝘀𝘁𝘆𝗹𝗶𝘇𝗲𝗱 𝘁𝗲𝘅𝘁
 */
function stylizeText(text) {
    const styled = text.split('').map(char => {
        if (char.match(/[a-zA-Z]/)) {
            const code = char.charCodeAt(0)
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCodePoint(0x1D5D4 + (code - 65))
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCodePoint(0x1D5EE + (code - 97))
            }
        } else if (char.match(/[0-9]/)) {
            const numCode = char.charCodeAt(0)
            return String.fromCodePoint(0x1D7EC + (numCode - 48))
        }
        return char
    }).join('')
    return styled
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isBotAdmin, isOwner }) => {
    try {
        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗶𝘁'𝘀 𝗮 𝗴𝗿𝗼𝘂𝗽
        if (!m.isGroup) {
            return m.reply('❌ *𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗰𝗮𝗻 𝗼𝗻𝗹𝘆 𝗯𝗲 𝘂𝘀𝗲𝗱 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗼𝘄𝗻𝗲𝗿 𝗼𝗿 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻
        if (!isOwner && !isAdmin) {
            return m.reply('👑 *𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗶𝘀 𝗼𝗻𝗹𝘆 𝗳𝗼𝗿 𝗯𝗼𝘁 𝗼𝘄𝗻𝗲𝗿 𝗼𝗿 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗻𝗲𝘄 𝗻𝗮𝗺𝗲 𝗶𝘀 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝗱
        if (!text) {
            const currentGroup = await conn.groupMetadata(m.chat)
            return conn.sendMessage(m.chat, {
                text: `╭━━━❰👑 *𝗦𝗘𝗧 𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘* 👑❱━━━╮
┃
┃ *📝 𝗨𝘀𝗮𝗴𝗲:*
┃ ${usedPrefix + command} <new_group_name>
┃
┃ *📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:*
┃ • ${usedPrefix}setname 𝗠𝘆 𝗔𝘄𝗲𝘀𝗼𝗺𝗲 𝗚𝗿𝗼𝘂𝗽
┃ • ${usedPrefix}setname 𝗦𝗮𝘇𝗶𝗸𝗶 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆
┃
┃ *✨ 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲:*
┃ ${currentGroup.subject}
┃
╰━━━━━━━━━━━━━━━━╯`,
                contextInfo: {
                    externalAdReply: {
                        title: '👑 𝗦𝗲𝘁 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲',
                        body: 'Change current group name',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗯𝗼𝘁 𝗶𝘀 𝗮𝗱𝗺𝗶𝗻
        if (!isBotAdmin) {
            return m.reply('❌ *𝗜 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗯𝗲 𝗮𝗻 𝗮𝗱𝗺𝗶𝗻 𝘁𝗼 𝗰𝗵𝗮𝗻𝗴𝗲 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲*')
        }

        // 𝗚𝗲𝘁 𝗰𝘂𝗿𝗿𝗲𝗻𝘁 𝗴𝗿𝗼𝘂𝗽 𝗶𝗻𝗳𝗼
        const groupMetadata = await conn.groupMetadata(m.chat)
        const oldName = groupMetadata.subject

        // 𝗦𝘁𝘆𝗹𝗶𝘇𝗲 𝘁𝗵𝗲 𝗻𝗲𝘄 𝗻𝗮𝗺𝗲
        const styledName = stylizeText(text)

        // 𝗦𝗲𝗻𝗱 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        const waitMsg = await m.reply(`⏰️ *𝗖𝗵𝗮𝗻𝗴𝗶𝗻𝗴 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲...*`)

        // 𝗖𝗵𝗮𝗻𝗴𝗲 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲
        await conn.groupUpdateSubject(m.chat, styledName)

        // 𝗗𝗲𝗹𝗲𝘁𝗲 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        await conn.sendMessage(m.chat, { delete: waitMsg.key })

        // 𝗚𝗲𝘁 𝘂𝗽𝗱𝗮𝘁𝗲𝗱 𝗴𝗿𝗼𝘂𝗽 𝗶𝗻𝗳𝗼
        const updatedGroup = await conn.groupMetadata(m.chat)

        // 𝗦𝗲𝗻𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        const successMessage = `╭━━━❰✅ *𝗦𝗨𝗖𝗖𝗘𝗦𝗦* ✅❱━━━╮
┃
┃ *✨ 𝗚𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲 𝗰𝗵𝗮𝗻𝗴𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!*
┃
┃ 📌 *𝗢𝗹𝗱 𝗡𝗮𝗺𝗲:*
┃ ${oldName}
┃
┃ ✨ *𝗡𝗲𝘄 𝗡𝗮𝗺𝗲:*
┃ ${styledName}
┃
┃ 👤 *𝗖𝗵𝗮𝗻𝗴𝗲𝗱 𝗯𝘆:* @${m.sender.split('@')[0]}
┃ 👥 *𝗚𝗿𝗼𝘂𝗽:* ${updatedGroup.subject}
┃
╰━━━━━━━━━━━━━━━━╯`

        await conn.sendMessage(m.chat, {
            text: successMessage,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: '✅ 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲 𝗨𝗽𝗱𝗮𝘁𝗲𝗱',
                    body: styledName,
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m })

    } catch (error) {
        console.error('❌ 𝗦𝗲𝘁𝗡𝗮𝗺𝗲 𝗘𝗿𝗿𝗼𝗿:', error)
        
        let errorMessage = '❌ *𝗘𝗿𝗿𝗼𝗿*\n\n'
        
        if (error.message.includes('forbidden')) {
            errorMessage += '❌ *𝗜 𝗱𝗼𝗻\'𝘁 𝗵𝗮𝘃𝗲 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗰𝗵𝗮𝗻𝗴𝗲 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲*'
        } else if (error.message.includes('rate')) {
            errorMessage += '⏰️ *𝗥𝗮𝘁𝗲 𝗹𝗶𝗺𝗶𝘁 𝗲𝘅𝗰𝗲𝗲𝗱𝗲𝗱. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿*'
        } else {
            errorMessage += error.message || '𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗰𝗵𝗮𝗻𝗴𝗲 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲'
        }

        await m.reply(errorMessage)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['setname']
handler.tags = ['group']
handler.command = /^(setname)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.saki = 0

export default handler