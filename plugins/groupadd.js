// plugins/add.js
// 𝗔𝗱𝗱 𝗨𝘀𝗲𝗿𝘀 - 𝗔𝗱𝗱 𝗺𝘂𝗹𝘁𝗶𝗽𝗹𝗲 𝘂𝘀𝗲𝗿𝘀 𝘁𝗼 𝗴𝗿𝗼𝘂𝗽 𝗯𝘆 𝗻𝘂𝗺𝗯𝗲𝗿𝘀
// @author Saziki Bot Team
// Version: 1.0.0

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'
const MAX_ADD = 10 // 𝗠𝗮𝘅𝗶𝗺𝘂𝗺 𝘂𝘀𝗲𝗿𝘀 𝘁𝗼 𝗮𝗱𝗱 𝗮𝘁 𝗼𝗻𝗰𝗲

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
 * 𝗘𝘅𝘁𝗿𝗮𝗰𝘁 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗳𝗿𝗼𝗺 𝘁𝗲𝘅𝘁
 */
function extractNumbers(text) {
    const numbers = text.match(/\d+/g)
    return numbers ? numbers.map(num => num.replace(/[^0-9]/g, '')) : []
}

/**
 * 𝗖𝗼𝗻𝘃𝗲𝗿𝘁 𝗻𝘂𝗺𝗯𝗲𝗿 𝘁𝗼 𝗝𝗜𝗗
 */
function numberToJid(number) {
    return `${number}@s.whatsapp.net`
}

/**
 * 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘂𝘀𝗲𝗿 𝗲𝘅𝗶𝘀𝘁𝘀 𝗼𝗻 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽
 */
async function checkUserExists(conn, number) {
    try {
        const result = await conn.onWhatsApp(numberToJid(number))
        return result && result[0] && result[0].exists
    } catch {
        return false
    }
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

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗯𝗼𝘁 𝗶𝘀 𝗮𝗱𝗺𝗶𝗻
        if (!isBotAdmin) {
            return m.reply('❌ *𝗜 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗯𝗲 𝗮𝗻 𝗮𝗱𝗺𝗶𝗻 𝘁𝗼 𝗮𝗱𝗱 𝗺𝗲𝗺𝗯𝗲𝗿𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗮𝗿𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝗱
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `╭━━━❰👥 *𝗔𝗗𝗗 𝗨𝗦𝗘𝗥𝗦* 👥❱━━━╮
┃
┃ *📝 𝗨𝘀𝗮𝗴𝗲:*
┃ ${usedPrefix + command} <numbers>
┃
┃ *📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:*
┃ • ${usedPrefix}add 212719558797
┃ • ${usedPrefix}add 212719558797 212612345678 212698765432
┃ • ${usedPrefix}add 212719558797,212612345678,212698765432
┃
┃ *✨ 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:*
┃ • Add up to ${MAX_ADD} users at once
┃ • Automatic validation
┃ • Shows success/failed list
┃
╰━━━━━━━━━━━━━━━━╯`,
                contextInfo: {
                    externalAdReply: {
                        title: '👥 𝗔𝗱𝗱 𝗨𝘀𝗲𝗿𝘀',
                        body: 'Add multiple users to group',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        // 𝗘𝘅𝘁𝗿𝗮𝗰𝘁 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗳𝗿𝗼𝗺 𝘁𝗲𝘅𝘁
        const numbers = extractNumbers(text)
        
        if (numbers.length === 0) {
            return m.reply('❌ *𝗡𝗼 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗳𝗼𝘂𝗻𝗱*')
        }

        if (numbers.length > MAX_ADD) {
            return m.reply(`❌ *𝗖𝗮𝗻 𝗼𝗻𝗹𝘆 𝗮𝗱𝗱 𝘂𝗽 𝘁𝗼 ${MAX_ADD} 𝘂𝘀𝗲𝗿𝘀 𝗮𝘁 𝗼𝗻𝗰𝗲*`)
        }

        // 𝗚𝗲𝘁 𝗰𝘂𝗿𝗿𝗲𝗻𝘁 𝗴𝗿𝗼𝘂𝗽 𝗺𝗲𝗺𝗯𝗲𝗿𝘀
        const groupMetadata = await conn.groupMetadata(m.chat)
        const currentMembers = groupMetadata.participants.map(p => p.id)

        // 𝗦𝗲𝗻𝗱 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        const waitMsg = await m.reply(`⏰️ *𝗔𝗱𝗱𝗶𝗻𝗴 ${numbers.length} 𝘂𝘀𝗲𝗿𝘀...*`)

        // 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 𝗲𝗮𝗰𝗵 𝗻𝘂𝗺𝗯𝗲𝗿
        const results = {
            success: [],
            failed: [],
            alreadyIn: []
        }

        for (const number of numbers) {
            const jid = numberToJid(number)
            
            // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽
            if (currentMembers.includes(jid)) {
                results.alreadyIn.push(number)
                continue
            }

            // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘂𝘀𝗲𝗿 𝗲𝘅𝗶𝘀𝘁𝘀
            const exists = await checkUserExists(conn, number)
            if (!exists) {
                results.failed.push(number)
                continue
            }

            try {
                await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
                results.success.push(number)
                // 𝗪𝗮𝗶𝘁 𝗮 𝗯𝗶𝘁 𝗯𝗲𝘁𝘄𝗲𝗲𝗻 𝗮𝗱𝗱𝘀 𝘁𝗼 𝗮𝘃𝗼𝗶𝗱 𝗿𝗮𝘁𝗲 𝗹𝗶𝗺𝗶𝘁𝘀
                await new Promise(resolve => setTimeout(resolve, 1000))
            } catch (error) {
                console.error(`Failed to add ${number}:`, error)
                results.failed.push(number)
            }
        }

        // 𝗗𝗲𝗹𝗲𝘁𝗲 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        await conn.sendMessage(m.chat, { delete: waitMsg.key })

        // 𝗖𝗿𝗲𝗮𝘁𝗲 𝗿𝗲𝘀𝘂𝗹𝘁 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        let resultMessage = `╭━━━❰📊 *𝗔𝗗𝗗 𝗥𝗘𝗦𝗨𝗟𝗧𝗦* 📊❱━━━╮\n┃\n`

        if (results.success.length > 0) {
            resultMessage += `┃ ✅ *𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗔𝗱𝗱𝗲𝗱:*\n`
            results.success.forEach(num => {
                resultMessage += `┃   • ${num}\n`
            })
            resultMessage += `┃\n`
        }

        if (results.alreadyIn.length > 0) {
            resultMessage += `┃ 👥 *𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗶𝗻 𝗚𝗿𝗼𝘂𝗽:*\n`
            results.alreadyIn.forEach(num => {
                resultMessage += `┃   • ${num}\n`
            })
            resultMessage += `┃\n`
        }

        if (results.failed.length > 0) {
            resultMessage += `┃ ❌ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗔𝗱𝗱:*\n`
            results.failed.forEach(num => {
                resultMessage += `┃   • ${num}\n`
            })
            resultMessage += `┃\n`
        }

        resultMessage += `┃ 📊 *𝗦𝘂𝗺𝗺𝗮𝗿𝘆:*\n`
        resultMessage += `┃ • ✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀: ${results.success.length}\n`
        resultMessage += `┃ • 👥 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗶𝗻: ${results.alreadyIn.length}\n`
        resultMessage += `┃ • ❌ 𝗙𝗮𝗶𝗹𝗲𝗱: ${results.failed.length}\n`
        resultMessage += `┃\n`
        resultMessage += `┃ 👮 *𝗔𝗱𝗱𝗲𝗱 𝗯𝘆:* @${m.sender.split('@')[0]}\n`
        resultMessage += `╰━━━━━━━━━━━━━━━━╯`

        // 𝗦𝗲𝗻𝗱 𝗿𝗲𝘀𝘂𝗹𝘁
        await conn.sendMessage(m.chat, {
            text: resultMessage,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: '📊 𝗔𝗱𝗱 𝗨𝘀𝗲𝗿𝘀 𝗥𝗲𝘀𝘂𝗹𝘁𝘀',
                    body: `${results.success.length} users added`,
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m })

    } catch (error) {
        console.error('❌ 𝗔𝗱𝗱 𝗘𝗿𝗿𝗼𝗿:', error)
        
        let errorMessage = '❌ *𝗘𝗿𝗿𝗼𝗿*\n\n'
        
        if (error.message.includes('not-authorized')) {
            errorMessage += '❌ *𝗜 𝗱𝗼𝗻\'𝘁 𝗵𝗮𝘃𝗲 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗮𝗱𝗱 𝗺𝗲𝗺𝗯𝗲𝗿𝘀*'
        } else if (error.message.includes('rate')) {
            errorMessage += '⏰️ *𝗥𝗮𝘁𝗲 𝗹𝗶𝗺𝗶𝘁 𝗲𝘅𝗰𝗲𝗲𝗱𝗲𝗱. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿*'
        } else {
            errorMessage += error.message || '𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗮𝗱𝗱 𝘂𝘀𝗲𝗿𝘀'
        }

        await m.reply(errorMessage)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['add', 'addusers']
handler.tags = ['group']
handler.command = /^(add|addusers)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.saki = 0

export default handler