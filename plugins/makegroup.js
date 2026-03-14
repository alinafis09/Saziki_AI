// plugins/makegroup.js
// 𝗠𝗮𝗸𝗲 𝗚𝗿𝗼𝘂𝗽 - 𝗖𝗿𝗲𝗮𝘁𝗲 𝗮 𝗻𝗲𝘄 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗴𝗿𝗼𝘂𝗽 𝘄𝗶𝘁𝗵 𝘂𝘀𝗲𝗿 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰𝗮𝗹𝗹𝘆 𝗮𝗱𝗱𝗲𝗱
// @author Saziki Bot Team
// Version: 4.0.0

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

/**
 * 𝗦𝘁𝘆𝗹𝗶𝘇𝗲 𝘁𝗲𝘅𝘁 𝘄𝗶𝘁𝗵 𝗺𝗮𝘁𝗵𝗲𝗺𝗮𝘁𝗶𝗰𝗮𝗹 𝗯𝗼𝗹𝗱 𝘀𝘁𝘆𝗹𝗲
 */
function stylizeText(text) {
    if (!text) return ''
    const styled = text.split('').map(char => {
        if (char.match(/[a-zA-Z]/)) {
            const code = char.charCodeAt(0)
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCodePoint(0x1D5D4 + (code - 65))
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCodePoint(0x1D5EE + (code - 97))
            }
        }
        return char
    }).join('')
    return styled
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲 𝗶𝘀 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝗱
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `╭━━━❰🏗️ *𝗠𝗔𝗞𝗘 𝗚𝗥𝗢𝗨𝗣* 🏗️❱━━━╮
┃
┃ *📝 𝗨𝘀𝗮𝗴𝗲:*
┃ ${usedPrefix + command} <𝗴𝗿𝗼𝘂𝗽_𝗻𝗮𝗺𝗲>
┃
┃ *📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:*
┃ • ${usedPrefix}mkgroup 𝗦𝗮𝘇𝗶𝗸𝗶 𝗙𝗮𝗺𝗶𝗹𝘆
┃ • ${usedPrefix}makegroup 𝗠𝘆 𝗔𝘄𝗲𝘀𝗼𝗺𝗲 𝗚𝗿𝗼𝘂𝗽
┃
┃ *✨ 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:*
┃ • 𝗔𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰𝗮𝗹𝗹𝘆 𝗮𝗱𝗱 𝘆𝗼𝘂 𝘁𝗼 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽
┃ • 𝗦𝗲𝗻𝗱𝘀 𝗶𝗻𝘃𝗶𝘁𝗲 𝗹𝗶𝗻𝗸 𝗮𝗳𝘁𝗲𝗿 𝗰𝗿𝗲𝗮𝘁𝗶𝗼𝗻
┃
╰━━━━━━━━━━━━━━━━╯`,
                contextInfo: {
                    externalAdReply: {
                        title: '🏗️ 𝗠𝗮𝗸𝗲 𝗚𝗿𝗼𝘂𝗽',
                        body: 'Create WhatsApp groups easily',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        // 𝗦𝘁𝘆𝗹𝗶𝘇𝗲 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲
        const groupName = stylizeText(text)

        // 𝗦𝗲𝗻𝗱 𝗶𝗻𝗶𝘁𝗶𝗮𝗹 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        const waitMsg = await m.reply(`🏗️ *𝗖𝗿𝗲𝗮𝘁𝗶𝗻𝗴 𝗴𝗿𝗼𝘂𝗽...*\n\n📝 *𝗡𝗮𝗺𝗲:* ${groupName}\n👤 *𝗔𝗱𝗱𝗶𝗻𝗴:* @${m.sender.split('@')[0]}`)

        try {
            // ✅ 𝗦𝘁𝗲𝗽 𝟭: 𝗖𝗿𝗲𝗮𝘁𝗲 𝗴𝗿𝗼𝘂𝗽 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗺𝗲𝗺𝗯𝗲𝗿𝘀
            const group = await conn.groupCreate(groupName, [])
            
            // 𝗚𝗲𝘁 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽 𝗜𝗗
            const groupId = group.id || group.gid
            
            if (!groupId) {
                throw new Error('𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗴𝗲𝘁 𝗴𝗿𝗼𝘂𝗽 𝗜𝗗')
            }

            // 𝗪𝗮𝗶𝘁 𝗮 𝗯𝗶𝘁 𝗳𝗼𝗿 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽 𝘁𝗼 𝗯𝗲 𝗿𝗲𝗮𝗱𝘆
            await new Promise(resolve => setTimeout(resolve, 2000))

            // ✅ 𝗦𝘁𝗲𝗽 𝟮: 𝗔𝗱𝗱 𝘁𝗵𝗲 𝘂𝘀𝗲𝗿 𝘁𝗼 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽
            try {
                await conn.groupParticipantsUpdate(groupId, [m.sender], 'add')
            } catch (addError) {
                console.log('𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗮𝗱𝗱 𝘂𝘀𝗲𝗿:', addError.message)
                // 𝗜𝗴𝗻𝗼𝗿𝗲 - 𝘂𝘀𝗲𝗿 𝗺𝗶𝗴𝗵𝘁 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗯𝗲 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽
            }

            // 𝗚𝗲𝘁 𝗴𝗿𝗼𝘂𝗽 𝗶𝗻𝘃𝗶𝘁𝗲 𝗹𝗶𝗻𝗸
            let inviteLink = '𝗡𝗼𝘁 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲'
            try {
                const inviteCode = await conn.groupInviteCode(groupId)
                inviteLink = `https://chat.whatsapp.com/${inviteCode}`
            } catch (e) {
                console.log('𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗴𝗲𝘁 𝗶𝗻𝘃𝗶𝘁𝗲 𝗹𝗶𝗻𝗸:', e.message)
            }

            // 𝗗𝗲𝗹𝗲𝘁𝗲 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
            await conn.sendMessage(m.chat, { delete: waitMsg.key })

            // 𝗦𝗲𝗻𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
            const successMessage = `╭━━━❰✅ *𝗚𝗥𝗢𝗨𝗣 𝗖𝗥𝗘𝗔𝗧𝗘𝗗* ✅❱━━━╮
┃
┃ ✨ *𝗚𝗿𝗼𝘂𝗽 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗰𝗿𝗲𝗮𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!*
┃
┃ 📌 *𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲:*
┃ ${groupName}
┃
┃ 👤 *𝗖𝗿𝗲𝗮𝘁𝗲𝗱 𝗯𝘆:* @${m.sender.split('@')[0]}
┃
┃ 🔗 *𝗜𝗻𝘃𝗶𝘁𝗲 𝗟𝗶𝗻𝗸:*
┃ ${inviteLink}
┃
┃ ✅ *𝗬𝗼𝘂 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗮𝗱𝗱𝗲𝗱 𝘁𝗼 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽!*
┃
╰━━━━━━━━━━━━━━━━╯`

            await conn.sendMessage(m.chat, {
                text: successMessage,
                mentions: [m.sender],
                contextInfo: {
                    externalAdReply: {
                        title: '✅ 𝗚𝗿𝗼𝘂𝗽 𝗖𝗿𝗲𝗮𝘁𝗲𝗱',
                        body: groupName,
                        thumbnailUrl: BOT_THUMBNAIL,
                        sourceUrl: inviteLink,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })

            // 𝗦𝗲𝗻𝗱 𝗮 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗶𝗻 𝘁𝗵𝗲 𝗻𝗲𝘄 𝗴𝗿𝗼𝘂𝗽
            try {
                await conn.sendMessage(groupId, {
                    text: `╭━━━❰👋 *𝗪𝗘𝗟𝗖𝗢𝗠𝗘* 👋❱━━━╮
┃
┃ ✨ *𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝘁𝗵𝗲 𝗻𝗲𝘄 𝗴𝗿𝗼𝘂𝗽!*
┃
┃ 📍 *${groupName}*
┃
┃ 👤 *𝗖𝗿𝗲𝗮𝘁𝗲𝗱 𝗯𝘆:* @${m.sender.split('@')[0]}
┃
┃ 👥 *𝗬𝗼𝘂 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗮𝗱𝗱𝗲𝗱 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰𝗮𝗹𝗹𝘆!*
┃
╰━━━━━━━━━━━━━━━━╯`,
                    mentions: [m.sender]
                })
            } catch (e) {
                console.log('𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝘀𝗲𝗻𝗱 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲:', e.message)
            }

        } catch (createError) {
            // 𝗛𝗮𝗻𝗱𝗹𝗲 𝗴𝗿𝗼𝘂𝗽 𝗰𝗿𝗲𝗮𝘁𝗶𝗼𝗻 𝗲𝗿𝗿𝗼𝗿𝘀
            console.error('❌ 𝗚𝗿𝗼𝘂𝗽 𝗰𝗿𝗲𝗮𝘁𝗶𝗼𝗻 𝗲𝗿𝗿𝗼𝗿:', createError)
            
            await conn.sendMessage(m.chat, { delete: waitMsg.key })

            let errorMessage = `╭━━━❰❌ *𝗘𝗥𝗥𝗢𝗥* ❌❱━━━╮
┃
┃ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗰𝗿𝗲𝗮𝘁𝗲 𝗴𝗿𝗼𝘂𝗽*
┃
┃ 📝 *𝗥𝗲𝗮𝘀𝗼𝗻:* `

            if (createError.message.includes('rate')) {
                errorMessage += `⏰️ 𝗥𝗮𝘁𝗲 𝗹𝗶𝗺𝗶𝘁 𝗲𝘅𝗰𝗲𝗲𝗱𝗲𝗱`
            } else if (createError.message.includes('limit')) {
                errorMessage += `📊 𝗚𝗿𝗼𝘂𝗽 𝗰𝗿𝗲𝗮𝘁𝗶𝗼𝗻 𝗹𝗶𝗺𝗶𝘁 𝗿𝗲𝗮𝗰𝗵𝗲𝗱`
            } else {
                errorMessage += createError.message || '𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗲𝗿𝗿𝗼𝗿'
            }

            errorMessage += `\n┃\n╰━━━━━━━━━━━━━━━━╯`

            await m.reply(errorMessage)
        }

    } catch (error) {
        console.error('❌ 𝗠𝗮𝗸𝗲𝗚𝗿𝗼𝘂𝗽 𝗘𝗿𝗿𝗼𝗿:', error)
        m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* ${error.message}`)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['mkgroup', 'makegroup']
handler.tags = ['group']
handler.command = /^(mkgroup|makegroup)$/i
handler.saki = 0

export default handler