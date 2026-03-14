// plugins/groupguard.js
// 𝗚𝗿𝗼𝘂𝗽 𝗚𝘂𝗮𝗿𝗱 𝗦𝘆𝘀𝘁𝗲𝗺 - 𝗔𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝗴𝗿𝗼𝘂𝗽 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻
// @author Saziki Bot Team
// Version: 1.0.0

// ==================== 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

// 𝗚𝗹𝗼𝗯𝗮𝗹 𝘀𝘁𝗼𝗿𝗮𝗴𝗲 𝗳𝗼𝗿 𝗴𝗿𝗼𝘂𝗽 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀
if (!global.groupGuard) {
    global.groupGuard = {
        settings: {}, // 𝗚𝗿𝗼𝘂𝗽 𝘀𝗽𝗲𝗰𝗶𝗳𝗶𝗰 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀
        warnedUsers: {}, // 𝗪𝗮𝗿𝗻𝗲𝗱 𝘂𝘀𝗲𝗿𝘀
        messageCount: {}, // 𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗰𝗼𝘂𝗻𝘁 𝗳𝗼𝗿 𝗮𝗻𝘁𝗶-𝘀𝗽𝗮𝗺
        callHistory: {}, // 𝗖𝗮𝗹𝗹 𝗵𝗶𝘀𝘁𝗼𝗿𝘆
        bannedWords: [], // 𝗕𝗮𝗻𝗻𝗲𝗱 𝘄𝗼𝗿𝗱𝘀 𝗹𝗶𝘀𝘁
        groupSchedule: {} // 𝗦𝗰𝗵𝗲𝗱𝘂𝗹𝗲𝗱 𝗴𝗿𝗼𝘂𝗽 𝗮𝗰𝘁𝗶𝗼𝗻𝘀
    }
}

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
 * 𝗚𝗲𝘁 𝗴𝗿𝗼𝘂𝗽 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀
 */
function getGroupSettings(groupId) {
    if (!global.groupGuard.settings[groupId]) {
        global.groupGuard.settings[groupId] = {
            antiCall: true,
            antiSpam: true,
            antiToxic: true,
            spamThreshold: 5, // 𝗠𝗮𝘅 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝗽𝗲𝗿 𝗺𝗶𝗻𝘂𝘁𝗲
            spamTimeWindow: 60000, // 𝟭 𝗺𝗶𝗻𝘂𝘁𝗲
            autoKick: true,
            warnLimit: 3, // 𝗪𝗮𝗿𝗻 𝗯𝗲𝗳𝗼𝗿𝗲 𝗸𝗶𝗰𝗸
            banWords: [],
            schedule: {
                enabled: false,
                closeTime: null,
                openTime: null
            }
        }
    }
    return global.groupGuard.settings[groupId]
}

/**
 * 𝗖𝗵𝗲𝗰𝗸 𝗳𝗼𝗿 𝘁𝗼𝘅𝗶𝗰 𝘄𝗼𝗿𝗱𝘀
 */
function containsToxicWords(text, bannedWords) {
    if (!text || bannedWords.length === 0) return false
    const lowerText = text.toLowerCase()
    return bannedWords.some(word => lowerText.includes(word.toLowerCase()))
}

/**
 * 𝗠𝗮𝗻𝗮𝗴𝗲 𝘂𝘀𝗲𝗿 𝘄𝗮𝗿𝗻𝘀
 */
async function warnUser(conn, groupId, userId, reason) {
    if (!global.groupGuard.warnedUsers[groupId]) {
        global.groupGuard.warnedUsers[groupId] = {}
    }
    if (!global.groupGuard.warnedUsers[groupId][userId]) {
        global.groupGuard.warnedUsers[groupId][userId] = {
            count: 0,
            reasons: []
        }
    }
    
    const userWarns = global.groupGuard.warnedUsers[groupId][userId]
    userWarns.count++
    userWarns.reasons.push({
        reason,
        time: new Date().toISOString()
    })
    
    const settings = getGroupSettings(groupId)
    
    // 𝗦𝗲𝗻𝗱 𝘄𝗮𝗿𝗻𝗶𝗻𝗴 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
    await conn.sendMessage(groupId, {
        text: `╭━━━❰⚠️ *𝗪𝗔𝗥𝗡𝗜𝗡𝗚* ⚠️❱━━━╮
┃
┃ 👤 *𝗨𝘀𝗲𝗿:* @${userId.split('@')[0]}
┃ 📊 *𝗪𝗮𝗿𝗻:* ${userWarns.count}/${settings.warnLimit}
┃ 📝 *𝗥𝗲𝗮𝘀𝗼𝗻:* ${reason}
┃
╰━━━━━━━━━━━━━━━━╯`,
        mentions: [userId]
    })
    
    // 𝗔𝘂𝘁𝗼 𝗸𝗶𝗰𝗸 𝗶𝗳 𝗿𝗲𝗮𝗰𝗵𝗲𝗱 𝗹𝗶𝗺𝗶𝘁
    if (settings.autoKick && userWarns.count >= settings.warnLimit) {
        await conn.groupParticipantsUpdate(groupId, [userId], 'remove')
        
        await conn.sendMessage(groupId, {
            text: `╭━━━❰👢 *𝗨𝗦𝗘𝗥 𝗥𝗘𝗠𝗢𝗩𝗘𝗗* 👢❱━━━╮
┃
┃ 👤 *𝗨𝘀𝗲𝗿:* @${userId.split('@')[0]}
┃ 📊 *𝗥𝗲𝗮𝘀𝗼𝗻:* Maximum warnings reached (${settings.warnLimit})
┃
╰━━━━━━━━━━━━━━━━╯`,
            mentions: [userId]
        })
        
        // 𝗥𝗲𝘀𝗲𝘁 𝘄𝗮𝗿𝗻𝘀
        delete global.groupGuard.warnedUsers[groupId][userId]
    }
    
    return userWarns.count
}

/**
 * 𝗔𝗻𝘁𝗶-𝘀𝗽𝗮𝗺 𝗰𝗵𝗲𝗰𝗸
 */
function checkSpam(groupId, userId) {
    const settings = getGroupSettings(groupId)
    if (!settings.antiSpam) return false
    
    if (!global.groupGuard.messageCount[groupId]) {
        global.groupGuard.messageCount[groupId] = {}
    }
    if (!global.groupGuard.messageCount[groupId][userId]) {
        global.groupGuard.messageCount[groupId][userId] = {
            count: 0,
            firstMessageTime: Date.now()
        }
    }
    
    const userData = global.groupGuard.messageCount[groupId][userId]
    const now = Date.now()
    
    // 𝗥𝗲𝘀𝗲𝘁 𝗰𝗼𝘂𝗻𝘁 𝗶𝗳 𝘁𝗶𝗺𝗲 𝘄𝗶𝗻𝗱𝗼𝘄 𝗽𝗮𝘀𝘀𝗲𝗱
    if (now - userData.firstMessageTime > settings.spamTimeWindow) {
        userData.count = 0
        userData.firstMessageTime = now
    }
    
    userData.count++
    
    return userData.count > settings.spamThreshold
}

// ==================== 𝗠𝗮𝗶𝗻 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 (𝗙𝗼𝗿 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗲𝘃𝗲𝗻𝘁𝘀) ====================

export async function handleMessage(conn, m) {
    try {
        if (!m.isGroup) return
        if (!m.sender || m.sender === conn.user.jid) return
        
        const groupId = m.chat
        const userId = m.sender
        const settings = getGroupSettings(groupId)
        
        // 𝗖𝗵𝗲𝗰𝗸 𝗳𝗼𝗿 𝘀𝗰𝗵𝗲𝗱𝘂𝗹𝗲𝗱 𝗴𝗿𝗼𝘂𝗽 𝗮𝗰𝘁𝗶𝗼𝗻𝘀
        if (settings.schedule.enabled) {
            const now = new Date()
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()
            
            // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗴𝗿𝗼𝘂𝗽 𝘀𝗵𝗼𝘂𝗹𝗱 𝗯𝗲 𝗰𝗹𝗼𝘀𝗲𝗱
            if (settings.schedule.closeTime) {
                const [closeHour, closeMinute] = settings.schedule.closeTime.split(':').map(Number)
                if (currentHour === closeHour && currentMinute === closeMinute) {
                    await conn.groupSettingUpdate(groupId, 'announcement')
                    await conn.sendMessage(groupId, {
                        text: `╭━━━❰🔒 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗟𝗢𝗦𝗘𝗗* 🔒❱━━━╮
┃
┃ *𝗚𝗿𝗼𝘂𝗽 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗰𝗹𝗼𝘀𝗲𝗱 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰𝗮𝗹𝗹𝘆*
┃ ⏰ *𝗦𝗰𝗵𝗲𝗱𝘂𝗹𝗲𝗱 𝘁𝗶𝗺𝗲:* ${settings.schedule.closeTime}
┃
╰━━━━━━━━━━━━━━━━╯`
                    })
                }
            }
            
            // 𝗖𝗵𝗲𝗰𝗸 𝗶𝗳 𝗴𝗿𝗼𝘂𝗽 𝘀𝗵𝗼𝘂𝗹𝗱 𝗯𝗲 𝗼𝗽𝗲𝗻𝗲𝗱
            if (settings.schedule.openTime) {
                const [openHour, openMinute] = settings.schedule.openTime.split(':').map(Number)
                if (currentHour === openHour && currentMinute === openMinute) {
                    await conn.groupSettingUpdate(groupId, 'not_announcement')
                    await conn.sendMessage(groupId, {
                        text: `╭━━━❰🔓 *𝗚𝗥𝗢𝗨𝗣 𝗢𝗣𝗘𝗡𝗘𝗗* 🔓❱━━━╮
┃
┃ *𝗚𝗿𝗼𝘂𝗽 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗼𝗽𝗲𝗻𝗲𝗱 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰𝗮𝗹𝗹𝘆*
┃ ⏰ *𝗦𝗰𝗵𝗲𝗱𝘂𝗹𝗲𝗱 𝘁𝗶𝗺𝗲:* ${settings.schedule.openTime}
┃
╰━━━━━━━━━━━━━━━━╯`
                    })
                }
            }
        }
        
        // 𝗔𝗻𝘁𝗶-𝗦𝗽𝗮𝗺 𝗰𝗵𝗲𝗰𝗸
        if (settings.antiSpam) {
            const isSpam = checkSpam(groupId, userId)
            if (isSpam) {
                await warnUser(conn, groupId, userId, '𝗦𝗽𝗮𝗺𝗺𝗶𝗻𝗴')
                return true
            }
        }
        
        // 𝗔𝗻𝘁𝗶-𝗧𝗼𝘅𝗶𝗰 𝗰𝗵𝗲𝗰𝗸
        if (settings.antiToxic && m.text) {
            const allBannedWords = [...settings.banWords, ...global.groupGuard.bannedWords]
            if (containsToxicWords(m.text, allBannedWords)) {
                await warnUser(conn, groupId, userId, '𝗧𝗼𝘅𝗶𝗰 𝗹𝗮𝗻𝗴𝘂𝗮𝗴𝗲')
                return true
            }
        }
        
    } catch (error) {
        console.error('❌ 𝗚𝗿𝗼𝘂𝗽𝗚𝘂𝗮𝗿𝗱 𝗘𝗿𝗿𝗼𝗿:', error)
    }
}

// ==================== 𝗖𝗮𝗹𝗹 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 ====================

export async function handleCall(conn, callUpdate) {
    try {
        for (const call of callUpdate) {
            if (call.isGroup) {
                const groupId = call.from
                const userId = call.from
                const settings = getGroupSettings(groupId)
                
                if (settings.antiCall) {
                    // 𝗧𝗿𝗮𝗰𝗸 𝗰𝗮𝗹𝗹 𝗵𝗶𝘀𝘁𝗼𝗿𝘆
                    if (!global.groupGuard.callHistory[groupId]) {
                        global.groupGuard.callHistory[groupId] = {}
                    }
                    if (!global.groupGuard.callHistory[groupId][userId]) {
                        global.groupGuard.callHistory[groupId][userId] = {
                            count: 0,
                            lastCall: null
                        }
                    }
                    
                    global.groupGuard.callHistory[groupId][userId].count++
                    global.groupGuard.callHistory[groupId][userId].lastCall = new Date().toISOString()
                    
                    // 𝗪𝗮𝗿𝗻 𝗮𝗻𝗱 𝗸𝗶𝗰𝗸
                    await warnUser(conn, groupId, userId, '𝗚𝗿𝗼𝘂𝗽 𝗰𝗮𝗹𝗹𝗶𝗻𝗴')
                }
            }
        }
    } catch (error) {
        console.error('❌ 𝗚𝗿𝗼𝘂𝗽𝗚𝘂𝗮𝗿𝗱 𝗖𝗮𝗹𝗹 𝗘𝗿𝗿𝗼𝗿:', error)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗛𝗮𝗻𝗱𝗹𝗲𝗿 (𝗙𝗼𝗿 𝗯𝗼𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀) ====================

let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isBotAdmin }) => {
    try {
        if (!m.isGroup) {
            return m.reply('❌ *𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗰𝗮𝗻 𝗼𝗻𝗹𝘆 𝗯𝗲 𝘂𝘀𝗲𝗱 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀*')
        }
        
        if (!isAdmin) {
            return m.reply('❌ *𝗢𝗻𝗹𝘆 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱*')
        }
        
        if (!isBotAdmin) {
            return m.reply('❌ *𝗜 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗯𝗲 𝗮𝗻 𝗮𝗱𝗺𝗶𝗻 𝘁𝗼 𝗽𝗲𝗿𝗳𝗼𝗿𝗺 𝘁𝗵𝗶𝘀 𝗮𝗰𝘁𝗶𝗼𝗻*')
        }
        
        const groupId = m.chat
        const settings = getGroupSettings(groupId)
        const args = text.split(' ')
        const subCommand = args[0]?.toLowerCase()
        
        // 𝗛𝗲𝗹𝗽 𝗺𝗲𝗻𝘂
        if (!text) {
            const status = `╭━━━❰🛡️ *𝗚𝗥𝗢𝗨𝗣 𝗚𝗨𝗔𝗥𝗗* 🛡️❱━━━╮
┃
┃ *𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗦𝗲𝘁𝘁𝗶𝗻𝗴𝘀:*
┃
┃ 📞 𝗔𝗻𝘁𝗶-𝗖𝗮𝗹𝗹: ${settings.antiCall ? '✅' : '❌'}
┃ 🚫 𝗔𝗻𝘁𝗶-𝗦𝗽𝗮𝗺: ${settings.antiSpam ? '✅' : '❌'}
┃ 🤬 𝗔𝗻𝘁𝗶-𝗧𝗼𝘅𝗶𝗰: ${settings.antiToxic ? '✅' : '❌'}
┃ 👢 𝗔𝘂𝘁𝗼-𝗞𝗶𝗰𝗸: ${settings.autoKick ? '✅' : '❌'}
┃ ⚠️ 𝗪𝗮𝗿𝗻 𝗟𝗶𝗺𝗶𝘁: ${settings.warnLimit}
┃ 📊 𝗦𝗽𝗮𝗺 𝗧𝗵𝗿𝗲𝘀𝗵𝗼𝗹𝗱: ${settings.spamThreshold}/min
┃
┃ *𝗦𝗰𝗵𝗲𝗱𝘂𝗹𝗲:*
┃ 🔒 𝗖𝗹𝗼𝘀𝗲 𝗧𝗶𝗺𝗲: ${settings.schedule.closeTime || '𝗡𝗼𝘁 𝘀𝗲𝘁'}
┃ 🔓 𝗢𝗽𝗲𝗻 𝗧𝗶𝗺𝗲: ${settings.schedule.openTime || '𝗡𝗼𝘁 𝘀𝗲𝘁'}
┃
┃ *𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:*
┃ • ${usedPrefix}gg anticall <on/off>
┃ • ${usedPrefix}gg antispam <on/off>
┃ • ${usedPrefix}gg antitoxic <on/off>
┃ • ${usedPrefix}gg autokick <on/off>
┃ • ${usedPrefix}gg warnlimit <number>
┃ • ${usedPrefix}gg spamthreshold <number>
┃ • ${usedPrefix}gg addban <word>
┃ • ${usedPrefix}gg removeban <word>
┃ • ${usedPrefix}gg banlist
┃ • ${usedPrefix}gg schedule <close:HH:MM> <open:HH:MM>
┃ • ${usedPrefix}gg clearwarns @user
┃ • ${usedPrefix}gg reset
┃
╰━━━━━━━━━━━━━━━━╯`
            
            return conn.sendMessage(m.chat, {
                text: status,
                contextInfo: {
                    externalAdReply: {
                        title: '🛡️ 𝗚𝗿𝗼𝘂𝗽 𝗚𝘂𝗮𝗿𝗱',
                        body: 'Protection System',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }
        
        // 𝗛𝗮𝗻𝗱𝗹𝗲 𝘀𝘂𝗯𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀
        switch (subCommand) {
            case 'anticall':
                if (args[1] === 'on') settings.antiCall = true
                else if (args[1] === 'off') settings.antiCall = false
                else return m.reply('❌ *𝗨𝘀𝗲:* on/off')
                m.reply(`✅ *𝗔𝗻𝘁𝗶-𝗖𝗮𝗹𝗹 ${settings.antiCall ? '𝗲𝗻𝗮𝗯𝗹𝗲𝗱' : '𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱'}*`)
                break
                
            case 'antispam':
                if (args[1] === 'on') settings.antiSpam = true
                else if (args[1] === 'off') settings.antiSpam = false
                else return m.reply('❌ *𝗨𝘀𝗲:* on/off')
                m.reply(`✅ *𝗔𝗻𝘁𝗶-𝗦𝗽𝗮𝗺 ${settings.antiSpam ? '𝗲𝗻𝗮𝗯𝗹𝗲𝗱' : '𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱'}*`)
                break
                
            case 'antitoxic':
                if (args[1] === 'on') settings.antiToxic = true
                else if (args[1] === 'off') settings.antiToxic = false
                else return m.reply('❌ *𝗨𝘀𝗲:* on/off')
                m.reply(`✅ *𝗔𝗻𝘁𝗶-𝗧𝗼𝘅𝗶𝗰 ${settings.antiToxic ? '𝗲𝗻𝗮𝗯𝗹𝗲𝗱' : '𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱'}*`)
                break
                
            case 'autokick':
                if (args[1] === 'on') settings.autoKick = true
                else if (args[1] === 'off') settings.autoKick = false
                else return m.reply('❌ *𝗨𝘀𝗲:* on/off')
                m.reply(`✅ *𝗔𝘂𝘁𝗼-𝗞𝗶𝗰𝗸 ${settings.autoKick ? '𝗲𝗻𝗮𝗯𝗹𝗲𝗱' : '𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱'}*`)
                break
                
            case 'warnlimit':
                const limit = parseInt(args[1])
                if (isNaN(limit) || limit < 1) return m.reply('❌ *𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿 > 0*')
                settings.warnLimit = limit
                m.reply(`✅ *𝗪𝗮𝗿𝗻 𝗹𝗶𝗺𝗶𝘁 𝘀𝗲𝘁 𝘁𝗼 ${limit}*`)
                break
                
            case 'spamthreshold':
                const threshold = parseInt(args[1])
                if (isNaN(threshold) || threshold < 1) return m.reply('❌ *𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿 > 0*')
                settings.spamThreshold = threshold
                m.reply(`✅ *𝗦𝗽𝗮𝗺 𝘁𝗵𝗿𝗲𝘀𝗵𝗼𝗹𝗱 𝘀𝗲𝘁 𝘁𝗼 ${threshold} 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀/𝗺𝗶𝗻*`)
                break
                
            case 'addban':
                const word = args.slice(1).join(' ')
                if (!word) return m.reply('❌ *𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘄𝗼𝗿𝗱 𝘁𝗼 𝗯𝗮𝗻*')
                settings.banWords.push(word)
                m.reply(`✅ *𝗕𝗮𝗻𝗻𝗲𝗱 𝘄𝗼𝗿𝗱 𝗮𝗱𝗱𝗲𝗱:* ${word}`)
                break
                
            case 'removeban':
                const removeWord = args.slice(1).join(' ')
                if (!removeWord) return m.reply('❌ *𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘄𝗼𝗿𝗱 𝘁𝗼 𝗿𝗲𝗺𝗼𝘃𝗲*')
                const index = settings.banWords.indexOf(removeWord)
                if (index > -1) {
                    settings.banWords.splice(index, 1)
                    m.reply(`✅ *𝗕𝗮𝗻𝗻𝗲𝗱 𝘄𝗼𝗿𝗱 𝗿𝗲𝗺𝗼𝘃𝗲𝗱:* ${removeWord}`)
                } else {
                    m.reply(`❌ *𝗪𝗼𝗿𝗱 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱:* ${removeWord}`)
                }
                break
                
            case 'banlist':
                const banList = settings.banWords.length > 0 
                    ? settings.banWords.map((w, i) => `${i+1}. ${w}`).join('\n┃ ')
                    : '┃ 𝗡𝗼 𝗯𝗮𝗻𝗻𝗲𝗱 𝘄𝗼𝗿𝗱𝘀'
                
                m.reply(`╭━━━❰📋 *𝗕𝗔𝗡𝗡𝗘𝗗 𝗪𝗢𝗥𝗗𝗦* 📋❱━━━╮
┃
${banList}
┃
╰━━━━━━━━━━━━━━━━╯`)
                break
                
            case 'schedule':
                const closeTime = args[1]
                const openTime = args[2]
                
                if (!closeTime || !openTime) {
                    return m.reply('❌ *𝗨𝘀𝗲:* schedule <close:HH:MM> <open:HH:MM>\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: schedule 22:00 06:00')
                }
                
                const closeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
                if (!closeRegex.test(closeTime) || !closeRegex.test(openTime)) {
                    return m.reply('❌ *𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝘁𝗶𝗺𝗲 𝗳𝗼𝗿𝗺𝗮𝘁. 𝗨𝘀𝗲 𝗛𝗛:𝗠𝗠 (𝗲.𝗴., 𝟮𝟮:𝟬𝟬)*')
                }
                
                settings.schedule.enabled = true
                settings.schedule.closeTime = closeTime
                settings.schedule.openTime = openTime
                
                m.reply(`✅ *𝗦𝗰𝗵𝗲𝗱𝘂𝗹𝗲 𝘀𝗲𝘁*\n🔒 𝗖𝗹𝗼𝘀𝗲: ${closeTime}\n🔓 𝗢𝗽𝗲𝗻: ${openTime}`)
                break
                
            case 'clearwarns':
                const mentioned = m.mentionedJid[0]
                if (!mentioned) return m.reply('❌ *𝗣𝗹𝗲𝗮𝘀𝗲 𝗺𝗲𝗻𝘁𝗶𝗼𝗻 𝗮 𝘂𝘀𝗲𝗿 𝘁𝗼 𝗰𝗹𝗲𝗮𝗿 𝘄𝗮𝗿𝗻𝘀*')
                
                if (global.groupGuard.warnedUsers[groupId]?.[mentioned]) {
                    delete global.groupGuard.warnedUsers[groupId][mentioned]
                    m.reply(`✅ *𝗪𝗮𝗿𝗻𝘀 𝗰𝗹𝗲𝗮𝗿𝗲𝗱 𝗳𝗼𝗿 @${mentioned.split('@')[0]}*`)
                } else {
                    m.reply(`❌ *𝗡𝗼 𝘄𝗮𝗿𝗻𝘀 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 𝘁𝗵𝗶𝘀 𝘂𝘀𝗲𝗿*`)
                }
                break
                
            case 'reset':
                global.groupGuard.settings[groupId] = null
                m.reply('✅ *𝗚𝗿𝗼𝘂𝗽 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀 𝗿𝗲𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗳𝗮𝘂𝗹𝘁*')
                break
                
            default:
                m.reply(`❌ *𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗰𝗼𝗺𝗺𝗮𝗻𝗱. 𝗨𝘀𝗲 ${usedPrefix}gg 𝗳𝗼𝗿 𝗵𝗲𝗹𝗽*`)
        }
        
    } catch (error) {
        console.error('❌ 𝗚𝗿𝗼𝘂𝗽𝗚𝘂𝗮𝗿𝗱 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗘𝗿𝗿𝗼𝗿:', error)
        m.reply(`❌ *𝗘𝗿𝗿𝗼𝗿:* ${error.message}`)
    }
}

// ==================== 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘁𝗶𝗼𝗻 ====================

handler.help = ['gg', 'groupguard']
handler.tags = ['group']
handler.command = /^(gg|groupguard)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.saki = 0

export default handler