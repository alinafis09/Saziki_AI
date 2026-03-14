// plugins/tagall.js
// 𝗧𝗮𝗴 𝗔𝗹𝗹 𝗠𝗲𝗺𝗯𝗲𝗿𝘀 - 𝗠𝗲𝗻𝘁𝗶𝗼𝗻 𝗲𝘃𝗲𝗿𝘆𝗼𝗻𝗲 𝗶𝗻 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽
// @author Saziki Bot Team
// Version: 1.0.0

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
 * 𝗚𝗲𝘁 𝗴𝗿𝗼𝘂𝗽 𝗺𝗲𝗺𝗯𝗲𝗿𝘀
 */
async function getGroupMembers(conn, groupId) {
    const groupMetadata = await conn.groupMetadata(groupId)
    return groupMetadata.participants.map(p => p.id)
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isBotAdmin }) => {
    try {
        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗶𝘁'𝘀 𝗮 𝗴𝗿𝗼𝘂𝗽
        if (!m.isGroup) {
            return m.reply('❌ *𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗰𝗮𝗻 𝗼𝗻𝗹𝘆 𝗯𝗲 𝘂𝘀𝗲𝗱 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗮𝗱𝗺𝗶𝗻
        if (!isAdmin) {
            return m.reply('❌ *𝗢𝗻𝗹𝘆 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱*')
        }

        // 𝗚𝗲𝘁 𝗴𝗿𝗼𝘂𝗽 𝗺𝗲𝗺𝗯𝗲𝗿𝘀
        const members = await getGroupMembers(conn, m.chat)
        
        // 𝗚𝗲𝘁 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲
        const groupMetadata = await conn.groupMetadata(m.chat)
        const groupName = groupMetadata.subject

        // 𝗣𝗿𝗲𝗽𝗮𝗿𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        let message = text || '𝗛𝗲𝗹𝗹𝗼 𝗲𝘃𝗲𝗿𝘆𝗼𝗻𝗲!'
        let styledMessage = stylizeText(message)

        // 𝗖𝗿𝗲𝗮𝘁𝗲 𝗺𝗲𝗻𝘁𝗶𝗼𝗻𝘀 𝗹𝗶𝘀𝘁
        let mentions = []
        let mentionsText = ''
        
        for (let i = 0; i < members.length; i++) {
            const member = members[i]
            mentions.push(member)
            mentionsText += `@${member.split('@')[0]}\n`
        }

        // 𝗖𝗿𝗲𝗮𝘁𝗲 𝗳𝘂𝗹𝗹 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        const fullMessage = `╭━━━❰👥 *𝗚𝗥𝗢𝗨𝗣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡* 👥❱━━━╮
┃
┃ 👋 *${styledMessage}*
┃
┃ 📢 *𝗙𝗿𝗼𝗺:* @${m.sender.split('@')[0]}
┃ 👥 *𝗚𝗿𝗼𝘂𝗽:* ${groupName}
┃ 📊 *𝗧𝗼𝘁𝗮𝗹:* ${members.length} 𝗺𝗲𝗺𝗯𝗲𝗿𝘀
┃
┃ 👇 *𝗠𝗲𝗻𝘁𝗶𝗼𝗻𝘀:*
┃
${mentionsText}
╰━━━━━━━━━━━━━━━━╯`

        // 𝗦𝗲𝗻𝗱 𝘁𝗵𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        await conn.sendMessage(m.chat, {
            text: fullMessage,
            mentions: mentions,
            contextInfo: {
                externalAdReply: {
                    title: '👥 𝗧𝗮𝗴 𝗔𝗹𝗹',
                    body: `${members.length} members tagged`,
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m })

    } catch (error) {
        console.error('❌ 𝗧𝗮𝗴𝗔𝗹𝗹 𝗘𝗿𝗿𝗼𝗿:', error)
        m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* ${error.message}`)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['tagall']
handler.tags = ['group']
handler.command = /^(tagall)$/i
handler.group = true
handler.admin = false 
handler.saki = 0

export default handler