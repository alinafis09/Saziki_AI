// plugins/link.js
// 𝗚𝗿𝗼𝘂𝗽 𝗟𝗶𝗻𝗸𝘀 - 𝗔𝗹𝗹 𝗼𝗳𝗳𝗶𝗰𝗶𝗮𝗹 𝗴𝗿𝗼𝘂𝗽 𝗹𝗶𝗻𝗸𝘀
// @author Saziki Bot Team
// Version: 1.0.0

import { groups } from '../lib/settings.js'

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

// ==================== 𝗛𝗲𝗹𝗽𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 ====================

/**
 * 𝗚𝗲𝘁 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗹𝗶𝗻𝗸𝘀 𝗳𝗿𝗼𝗺 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀
 */
function getAllGroupLinks() {
    const allGroups = groups.getAllGroups()
    return allGroups
}

/**
 * 𝗚𝗿𝗼𝘂𝗽 𝗹𝗶𝗻𝗸𝘀 𝗯𝘆 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆
 */
function getGroupsByCategory() {
    const allGroups = getAllGroupLinks()
    const categorized = {}
    
    allGroups.forEach(group => {
        if (!categorized[group.category]) {
            categorized[group.category] = []
        }
        categorized[group.category].push(group)
    })
    
    return categorized
}

/**
 * 𝗙𝗼𝗿𝗺𝗮𝘁 𝗴𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲 𝘄𝗶𝘁𝗵 𝗲𝗺𝗼𝗷𝗶
 */
function formatGroupName(group) {
    return `${group.emoji || '👥'} ${group.name}`
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        // 𝗚𝗲𝘁 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗹𝗶𝗻𝗸𝘀
        const allGroups = getAllGroupLinks()
        
        if (allGroups.length === 0) {
            return m.reply('❌ *𝗡𝗼 𝗴𝗿𝗼𝘂𝗽 𝗹𝗶𝗻𝗸𝘀 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲*')
        }

        // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝘂𝘀𝗲𝗿 𝗮𝘀𝗸𝗲𝗱 𝗳𝗼𝗿 𝘀𝗽𝗲𝗰𝗶𝗳𝗶𝗰 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆
        const category = text?.toLowerCase().trim()
        const categorized = getGroupsByCategory()

        if (category && categorized[category]) {
            // 𝗦𝗵𝗼𝘄 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆-𝘀𝗽𝗲𝗰𝗶𝗳𝗶𝗰 𝗴𝗿𝗼𝘂𝗽𝘀
            const categoryGroups = categorized[category]
            
            let message = `╭━━━❰📂 *${category.toUpperCase()} 𝗚𝗥𝗢𝗨𝗣𝗦* ❱━━━╮\n┃\n`
            
            categoryGroups.forEach((group, index) => {
                message += `┃ ${index + 1}. ${formatGroupName(group)}\n`
                message += `┃    📝 ${group.description}\n`
                message += `┃    🔗 ${group.link}\n┃\n`
            })
            
            message += `╰━━━━━━━━━━━━━━━━╯\n\n`
            message += `*📊 𝗧𝗼𝘁𝗮𝗹:* ${categoryGroups.length} 𝗴𝗿𝗼𝘂𝗽𝘀`
            
            await conn.sendMessage(m.chat, {
                text: message,
                contextInfo: {
                    externalAdReply: {
                        title: `📂 ${category.toUpperCase()} 𝗚𝗿𝗼𝘂𝗽𝘀`,
                        body: `${categoryGroups.length} groups available`,
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
            
            return
        }

        // 𝗦𝗵𝗼𝘄 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽𝘀 𝗼𝗿𝗴𝗮𝗻𝗶𝘇𝗲𝗱 𝗯𝘆 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆
        let message = `╭━━━❰👥 *𝗢𝗙𝗙𝗜𝗖𝗜𝗔𝗟 𝗚𝗥𝗢𝗨𝗣𝗦* 👥❱━━━╮\n┃\n`
        
        for (const [cat, groupsList] of Object.entries(categorized)) {
            message += `┃ 📂 *${cat.toUpperCase()}*\n┃\n`
            
            groupsList.forEach((group, index) => {
                message += `┃ ${index + 1}. ${formatGroupName(group)}\n`
                message += `┃    📝 ${group.description}\n`
                message += `┃    🔗 ${group.link}\n┃\n`
            })
        }
        
        message += `╰━━━━━━━━━━━━━━━━╯\n\n`
        message += `*📊 𝗧𝗼𝘁𝗮𝗹:* ${allGroups.length} 𝗴𝗿𝗼𝘂𝗽𝘀\n`
        message += `*📝 𝗨𝘀𝗮𝗴𝗲:* ${usedPrefix}link <category> 𝗳𝗼𝗿 𝘀𝗽𝗲𝗰𝗶𝗳𝗶𝗰 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆`

        // 𝗦𝗲𝗻𝗱 𝘁𝗵𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
        await conn.sendMessage(m.chat, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '👥 𝗢𝗳𝗳𝗶𝗰𝗶𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝘀',
                    body: `${allGroups.length} groups available`,
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m })

    } catch (error) {
        console.error('❌ 𝗟𝗶𝗻𝗸 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗘𝗿𝗿𝗼𝗿:', error)
        m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* ${error.message}`)
    }
}

// ==================== 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆 𝗟𝗶𝘀𝘁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 ====================

let categoriesHandler = async (m, { conn }) => {
    const categorized = getGroupsByCategory()
    const categories = Object.keys(categorized)
    
    let message = `╭━━━❰📋 *𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ❱━━━╮\n┃\n`
    
    categories.forEach(cat => {
        message += `┃ 📂 *${cat.toUpperCase()}* - ${categorized[cat].length} groups\n`
    })
    
    message += `┃\n╰━━━━━━━━━━━━━━━━╯\n\n`
    message += `*📝 𝗨𝘀𝗮𝗴𝗲:* .link <category>`
    
    await conn.sendMessage(m.chat, { text: message }, { quoted: m })
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['link', 'groups']
handler.tags = ['info']
handler.command = /^(link|groups|grouplink)$/i
handler.saki = 0

let categoriesCommand = {
    help: ['linkcats', 'groupcats'],
    tags: ['info'],
    command: /^(linkcats|groupcats)$/i,
    handler: categoriesHandler,
    saki: 0
}

export { handler, categoriesCommand }
export default handler