// plugins/kick.js
// 𝗞𝗶𝗰𝗸 𝗨𝘀𝗲𝗿 - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘂𝘀𝗲𝗿𝘀 𝗳𝗿𝗼𝗺 𝗴𝗿𝗼𝘂𝗽 𝗯𝘆 𝗻𝘂𝗺𝗯𝗲𝗿 𝗼𝗿 𝗺𝗲𝗻𝘁𝗶𝗼𝗻
// @author Saziki Bot Team
// Version: 1.0.0

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

// ==================== 𝗛𝗲𝗹𝗽𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 ====================

/**
 * 𝗦𝘁𝘆𝗹𝗶𝘇𝗲 𝘁𝗲𝘅𝘁
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
        } else if (char.match(/[0-9]/)) {
            const numCode = char.charCodeAt(0)
            return String.fromCodePoint(0x1D7EC + (numCode - 48))
        }
        return char
    }).join('')
    return styled
}

/**
 * 𝗚𝗲𝘁 𝘂𝘀𝗲𝗿 𝗝𝗜𝗗 𝗳𝗿𝗼𝗺 𝗻𝘂𝗺𝗯𝗲𝗿 𝗼𝗿 𝗺𝗲𝗻𝘁𝗶𝗼𝗻
 */
function getUserJid(input, participants) {
    // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗶𝘁'𝘀 𝗮 𝗺𝗲𝗻𝘁𝗶𝗼𝗻
    const mentionMatch = input.match(/@(\d+)/)
    if (mentionMatch) {
        const number = mentionMatch[1]
        return `${number}@s.whatsapp.net`
    }
    
    // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗶𝘁'𝘀 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿
    const numberMatch = input.match(/\d+/)
    if (numberMatch) {
        const number = numberMatch[0].replace(/[^0-9]/g, '')
        return `${number}@s.whatsapp.net`
    }
    
    return null
}

/**
 * 𝗚𝗲𝘁 𝘂𝘀𝗲𝗿 𝗶𝗻𝗳𝗼 𝗯𝘆 𝗝𝗜𝗗
 */
function getUserInfo(jid, participants) {
    const participant = participants.find(p => p.id === jid)
    if (participant) {
        return {
            jid: participant.id,
            number: participant.id.split('@')[0],
            isAdmin: participant.admin ? true : false
        }
    }
    return null
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isBotAdmin, participants }) => {
    try {
        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗶𝘁'𝘀 𝗮 𝗴𝗿𝗼𝘂𝗽
        if (!m.isGroup) {
            return m.reply('❌ *𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗰𝗮𝗻 𝗼𝗻𝗹𝘆 𝗯𝗲 𝘂𝘀𝗲𝗱 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗮𝗱𝗺𝗶𝗻
        if (!isAdmin) {
            return m.reply('❌ *𝗢𝗻𝗹𝘆 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗯𝗼𝘁 𝗶𝘀 𝗮𝗱𝗺𝗶𝗻
        if (!isBotAdmin) {
            return m.reply('❌ *𝗜 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗯𝗲 𝗮𝗻 𝗮𝗱𝗺𝗶𝗻 𝘁𝗼 𝗸𝗶𝗰𝗸 𝗺𝗲𝗺𝗯𝗲𝗿𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗻𝘂𝗺𝗯𝗲𝗿 𝗶𝘀 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝗱
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `╭━━━❰👢 *𝗞𝗜𝗖𝗞 𝗨𝗦𝗘𝗥* 👢❱━━━╮
┃
┃ *📝 𝗨𝘀𝗮𝗴𝗲:*
┃ ${usedPrefix + command} <number> [reason]
┃ ${usedPrefix + command} @user [reason]
┃
┃ *📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:*
┃ • ${usedPrefix}kick 212719558797
┃ • ${usedPrefix}kick 212719558797 𝗦𝗽𝗮𝗺𝗺𝗶𝗻𝗴
┃ • ${usedPrefix}kick @user
┃
┃ *✨ 𝗡𝗼𝘁𝗲:*
┃ • 𝗬𝗼𝘂 𝗰𝗮𝗻 𝗮𝗱𝗱 𝗮 𝗿𝗲𝗮𝘀𝗼𝗻 𝗮𝗳𝘁𝗲𝗿 𝘁𝗵𝗲 𝗻𝘂𝗺𝗯𝗲𝗿
┃ • 𝗬𝗼𝘂 𝗰𝗮𝗻𝗻𝗼𝘁 𝗸𝗶𝗰𝗸 𝗮𝗱𝗺𝗶𝗻𝘀
┃
╰━━━━━━━━━━━━━━━━╯`,
                contextInfo: {
                    externalAdReply: {
                        title: '👢 𝗞𝗶𝗰𝗸 𝗨𝘀𝗲𝗿',
                        body: 'Remove users from group',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        // 𝗣𝗮𝗿𝘀𝗲 𝗻𝘂𝗺𝗯𝗲𝗿 𝗮𝗻𝗱 𝗿𝗲𝗮𝘀𝗼𝗻
        let [target, ...reasonParts] = text.split(' ')
        let reason = reasonParts.join(' ') || '𝗡𝗼 𝗿𝗲𝗮𝘀𝗼𝗻 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝗱'
        
        // 𝗚𝗲𝘁 𝘂𝘀𝗲𝗿 𝗝𝗜𝗗
        const targetJid = getUserJid(target, participants)
        
        if (!targetJid) {
            return m.reply('❌ *𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿 𝗼𝗿 𝗺𝗲𝗻𝘁𝗶𝗼𝗻*')
        }

        // 𝗚𝗲𝘁 𝘂𝘀𝗲𝗿 𝗶𝗻𝗳𝗼
        const userInfo = getUserInfo(targetJid, participants)
        
        if (!userInfo) {
            return m.reply('❌ *𝗨𝘀𝗲𝗿 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘁𝗮𝗿𝗴𝗲𝘁 𝗶𝘀 𝗮𝗱𝗺𝗶𝗻
        if (userInfo.isAdmin) {
            return m.reply('❌ *𝗖𝗮𝗻𝗻𝗼𝘁 𝗸𝗶𝗰𝗸 𝗮𝗱𝗺𝗶𝗻 𝗺𝗲𝗺𝗯𝗲𝗿𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘁𝗮𝗿𝗴𝗲𝘁 𝗶𝘀 𝘁𝗵𝗲 𝗯𝗼𝘁
        if (targetJid === conn.user.jid) {
            return m.reply('❌ *𝗜 𝗰𝗮𝗻𝗻𝗼𝘁 𝗸𝗶𝗰𝗸 𝗺𝘆𝘀𝗲𝗹𝗳*')
        }

        // 𝗦𝗲𝗻𝗱 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        const waitMsg = await m.reply(`⏰️ *𝗞𝗶𝗰𝗸𝗶𝗻𝗴 𝘂𝘀𝗲𝗿...*\n\n👤 *𝗨𝘀𝗲𝗿:* @${userInfo.number}\n📝 *𝗥𝗲𝗮𝘀𝗼𝗻:* ${reason}`)

        // 𝗞𝗶𝗰𝗸 𝘁𝗵𝗲 𝘂𝘀𝗲𝗿
        await conn.groupParticipantsUpdate(m.chat, [targetJid], 'remove')

        // 𝗗𝗲𝗹𝗲𝘁𝗲 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        await conn.sendMessage(m.chat, { delete: waitMsg.key })

        // 𝗦𝗲𝗻𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        const successMessage = `╭━━━❰✅ *𝗨𝗦𝗘𝗥 𝗞𝗜𝗖𝗞𝗘𝗗* ✅❱━━━╮
┃
┃ ✨ *𝗨𝘀𝗲𝗿 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽*
┃
┃ 👤 *𝗨𝘀𝗲𝗿:* @${userInfo.number}
┃ 👮 *𝗞𝗶𝗰𝗸𝗲𝗱 𝗯𝘆:* @${m.sender.split('@')[0]}
┃ 📝 *𝗥𝗲𝗮𝘀𝗼𝗻:* ${reason}
┃
╰━━━━━━━━━━━━━━━━╯`

        await conn.sendMessage(m.chat, {
            text: successMessage,
            mentions: [targetJid, m.sender],
            contextInfo: {
                externalAdReply: {
                    title: '✅ 𝗨𝘀𝗲𝗿 𝗞𝗶𝗰𝗸𝗲𝗱',
                    body: `${userInfo.number} removed`,
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m })

    } catch (error) {
        console.error('❌ 𝗞𝗶𝗰𝗸 𝗘𝗿𝗿𝗼𝗿:', error)
        
        let errorMessage = '❌ *𝗘𝗿𝗿𝗼𝗿*\n\n'
        
        if (error.message.includes('not-authorized')) {
            errorMessage += '❌ *𝗜 𝗱𝗼𝗻\'𝘁 𝗵𝗮𝘃𝗲 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗸𝗶𝗰𝗸 𝘁𝗵𝗶𝘀 𝘂𝘀𝗲𝗿*'
        } else if (error.message.includes('group')) {
            errorMessage += '❌ *𝗚𝗿𝗼𝘂𝗽 𝗲𝗿𝗿𝗼𝗿. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻*'
        } else {
            errorMessage += error.message || '𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗸𝗶𝗰𝗸 𝘂𝘀𝗲𝗿'
        }

        await m.reply(errorMessage)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['kick', 'ban']
handler.tags = ['group']
handler.command = /^(kick|ban)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.saki = 0

export default handler