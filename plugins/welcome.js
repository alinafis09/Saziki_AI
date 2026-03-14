// plugins/welcome.js
// 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗖𝗮𝗿𝗱 - 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗰𝘂𝘀𝘁𝗼𝗺 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗶𝗺𝗮𝗴𝗲𝘀 𝗳𝗼𝗿 𝗻𝗲𝘄 𝗺𝗲𝗺𝗯𝗲𝗿𝘀
// @author Saziki Bot Team
// Version: 1.0.0

import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// استيراد المكتبة بشكل صحيح
import renderWelcome from '../src/libraries/welcome.js'

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'
const ASSETS_PATH = path.join(process.cwd(), 'src', 'assets', 'images', 'backgrounds')

// ==================== 𝗛𝗲𝗹𝗽𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 ====================

/**
 * 𝗦𝘁𝘆𝗹𝗶𝘇𝗲 𝘁𝗲𝘅𝘁
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
 * 𝗚𝗲𝘁 𝗿𝗮𝗻𝗱𝗼𝗺 𝗯𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱 𝗶𝗺𝗮𝗴𝗲
 */
function getRandomBackground() {
    const backgrounds = [
        path.join(ASSETS_PATH, 'bakground-1.jpeg'),
        path.join(ASSETS_PATH, 'bakground-2.jpeg'),
        path.join(ASSETS_PATH, 'bakground-3.jpeg')
    ]
    const randomIndex = Math.floor(Math.random() * backgrounds.length)
    return backgrounds[randomIndex]
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text, isAdmin }) => {
    try {
        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗶𝘁'𝘀 𝗮 𝗴𝗿𝗼𝘂𝗽
        if (!m.isGroup) {
            return m.reply('❌ *𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗰𝗮𝗻 𝗼𝗻𝗹𝘆 𝗯𝗲 𝘂𝘀𝗲𝗱 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗮𝗱𝗺𝗶𝗻
        if (!isAdmin) {
            return m.reply('❌ *𝗢𝗻𝗹𝘆 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱*')
        }

        // 𝗣𝗮𝗿𝘀𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱
        const args = text ? text.split(' ') : []
        const subCommand = args[0]?.toLowerCase()

        // 𝗛𝗲𝗹𝗽 𝗺𝗲𝗻𝘂
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `╭━━━❰🎨 *𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗖𝗔𝗥𝗗* 🎨❱━━━╮
┃
┃ *📝 𝗨𝘀𝗮𝗴𝗲:*
┃ ${usedPrefix + command} test - 𝗧𝗲𝘀𝘁 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗰𝗮𝗿𝗱
┃ ${usedPrefix + command} set <on/off> - 𝗧𝘂𝗿𝗻 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗼𝗻/𝗼𝗳𝗳
┃ ${usedPrefix + command} bg <number> - 𝗖𝗵𝗮𝗻𝗴𝗲 𝗯𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱
┃ ${usedPrefix + command} text <message> - 𝗖𝘂𝘀𝘁𝗼𝗺 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗲𝘅𝘁
┃
┃ *📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:*
┃ • ${usedPrefix}welcome test
┃ • ${usedPrefix}welcome set on
┃ • ${usedPrefix}welcome text 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗼𝘂𝗿 𝗴𝗿𝗼𝘂𝗽!
┃
╰━━━━━━━━━━━━━━━━╯`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎨 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗖𝗮𝗿𝗱',
                        body: 'Custom welcome images',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        // 𝗛𝗮𝗻𝗱𝗹𝗲 𝘀𝘂𝗯𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀
        if (subCommand === 'test') {
            // 𝗚𝗲𝘁 𝗴𝗿𝗼𝘂𝗽 𝗶𝗻𝗳𝗼
            const groupMetadata = await conn.groupMetadata(m.chat)
            const groupName = groupMetadata.subject
            
            // 𝗚𝗲𝘁 𝘂𝘀𝗲𝗿 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 𝗽𝗶𝗰𝘁𝘂𝗿𝗲
            let pp
            try {
                pp = await conn.profilePictureUrl(m.sender, 'image')
            } catch {
                pp = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
            }

            // 𝗦𝗲𝗻𝗱 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
            const waitMsg = await m.reply('⏰️ *𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗰𝗮𝗿𝗱...*')

            // 𝗚𝗲𝘁 𝗰𝘂𝘀𝘁𝗼𝗺 𝗯𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱 𝗼𝗿 𝘂𝘀𝗲 𝗿𝗮𝗻𝗱𝗼𝗺
            let background
            try {
                background = args[1] ? readFileSync(path.join(ASSETS_PATH, `bakground-${args[1]}.jpeg`)) : readFileSync(getRandomBackground())
            } catch {
                background = readFileSync(getRandomBackground())
            }

            // 𝗚𝗲𝘁 𝗰𝘂𝘀𝘁𝗼𝗺 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗲𝘅𝘁
            const welcomeText = args.slice(1).join(' ') || '𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽!'
            const styledText = stylizeText(welcomeText)
            const styledName = stylizeText(m.name || m.sender.split('@')[0])
            const styledGroup = stylizeText(groupName)

            // 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝗶𝗺𝗮𝗴𝗲
            const imageBuffer = await renderWelcome({
                wid: m.sender.split('@')[0],
                pp: pp,
                name: styledName,
                title: styledGroup,
                text: styledText,
                background: `data:image/jpeg;base64,${background.toString('base64')}`
            })

            // 𝗗𝗲𝗹𝗲𝘁𝗲 𝘄𝗮𝗶𝘁𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
            await conn.sendMessage(m.chat, { delete: waitMsg.key })

            // 𝗦𝗲𝗻𝗱 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲
            await conn.sendMessage(m.chat, {
                image: imageBuffer,
                caption: `╭━━━❰🎨 *𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗖𝗮𝗿𝗱* 🎨❱━━━╮
┃
┃ ✅ *𝗧𝗲𝘀𝘁 𝗰𝗮𝗿𝗱 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!*
┃
┃ 👤 *𝗨𝘀𝗲𝗿:* @${m.sender.split('@')[0]}
┃ 👥 *𝗚𝗿𝗼𝘂𝗽:* ${groupName}
┃ 📝 *𝗧𝗲𝘅𝘁:* ${welcomeText}
┃
╰━━━━━━━━━━━━━━━━╯`,
                mentions: [m.sender],
                contextInfo: {
                    externalAdReply: {
                        title: '🎨 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗖𝗮𝗿𝗱',
                        body: 'Test card generated',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        else if (subCommand === 'set') {
            if (!args[1]) return m.reply('❌ *𝗨𝘀𝗲: on/off*')
            
            const chat = global.db.data.chats[m.chat]
            if (!chat) return m.reply('❌ *𝗚𝗿𝗼𝘂𝗽 𝗱𝗮𝘁𝗮 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱*')
            
            chat.welcome = args[1] === 'on'
            
            await m.reply(`✅ *𝗪𝗲𝗹𝗰𝗼𝗺𝗲 ${chat.welcome ? '𝗲𝗻𝗮𝗯𝗹𝗲𝗱' : '𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱'}*`)
        }

        else {
            m.reply(`❌ *𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗰𝗼𝗺𝗺𝗮𝗻𝗱. 𝗨𝘀𝗲 ${usedPrefix}welcome 𝗳𝗼𝗿 𝗵𝗲𝗹𝗽*`)
        }

    } catch (error) {
        console.error('❌ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗘𝗿𝗿𝗼𝗿:', error)
        m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* ${error.message}`)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['welcome', 'wel']
handler.tags = ['group']
handler.command = /^(welcome|wel)$/i
handler.group = true
handler.admin = true
handler.saki = 0

export default handler