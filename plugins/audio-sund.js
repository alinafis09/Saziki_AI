// plugins/sund.js
// Sund Audio Player - تشغيل المقاطع الصوتية المخزنة
// @author Saziki Bot Team
// Version: 1.0.0

import { promises as fs } from 'fs'
import { join } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ==================== CONFIGURATION ====================
const SUND_FOLDER = join(process.cwd(), 'media/sund')
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

// ==================== HELPER FUNCTIONS ====================

/**
 * Get list of available sund files
 * @returns {Promise<string[]>} - Array of available sund numbers
 */
async function getAvailableSund() {
    try {
        const files = await fs.readdir(SUND_FOLDER)
        // Filter only mp3 files and extract numbers
        const sundFiles = files
            .filter(file => file.startsWith('sund') && file.endsWith('.mp3'))
            .map(file => {
                const match = file.match(/sund(\d+)\.mp3/)
                return match ? match[1] : null
            })
            .filter(num => num !== null)
            .sort((a, b) => parseInt(a) - parseInt(b))
        
        return sundFiles
    } catch (error) {
        console.error('❌ Error reading sund folder:', error)
        return []
    }
}

/**
 * Get sund file path by number
 * @param {string|number} number - Sund number
 * @returns {string|null} - File path or null if not found
 */
function getSundPath(number) {
    return join(SUND_FOLDER, `sund${number}.mp3`)
}

/**
 * Check if sund file exists
 * @param {string|number} number - Sund number
 * @returns {Promise<boolean>} - True if exists
 */
async function sundExists(number) {
    try {
        const filePath = getSundPath(number)
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        // If no text provided, show list of available sunds
        if (!text) {
            const available = await getAvailableSund()
            
            if (available.length === 0) {
                return m.reply('❌ No sund files found in media/sund folder.')
            }
            
            // Create list of available sunds
            const sundList = available.map(num => `┃ • ${usedPrefix}sund ${num}`).join('\n')
            
            const helpMessage = `╭━━━❰🔊 *SUND AUDIO PLAYER* ❱━━━╮
┃
┃ 🎵 *Available Sund Files:*
┃
${sundList}
┃
┃ 📝 *Usage:* ${usedPrefix}sund <number>
┃ *Example:* ${usedPrefix}sund 1
┃
┃ 📊 *Total:* ${available.length} audio files
╰━━━━━━━━━━━━━━━━╯`

            return conn.sendMessage(m.chat, {
                text: helpMessage,
                contextInfo: {
                    externalAdReply: {
                        title: '🔊 Sund Player',
                        body: `${available.length} audio files available`,
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m })
        }

        // Check if the input is a number
        const sundNumber = text.trim()
        if (!/^\d+$/.test(sundNumber)) {
            return m.reply(`❌ Please provide a valid number.\nExample: ${usedPrefix}sund 1`)
        }

        // Check if sund file exists
        const exists = await sundExists(sundNumber)
        if (!exists) {
            // Get available sunds for suggestion
            const available = await getAvailableSund()
            const suggestion = available.length > 0 
                ? `\n\nAvailable sunds: ${available.slice(0, 10).join(', ')}${available.length > 10 ? '...' : ''}`
                : ''
            
            return m.reply(`❌ Sund file *sund${sundNumber}.mp3* not found.${suggestion}`)
        }

        // Get file path
        const audioPath = getSundPath(sundNumber)

        // Send waiting message
        const waitMsg = await m.reply(`🔊 *Playing sund ${sundNumber}...*`)

        // Send audio file
        await conn.sendMessage(m.chat, {
            audio: await fs.readFile(audioPath),
            mimetype: 'audio/mpeg',
            ptt: false, // Set to true if you want as voice note
        }, { quoted: m })

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key })

    } catch (error) {
        console.error('❌ Sund Error:', error)
        m.reply('❌ Error playing sund file.')
    }
}

// ==================== LIST COMMAND ====================

let listHandler = async (m, { conn, usedPrefix }) => {
    try {
        const available = await getAvailableSund()
        
        if (available.length === 0) {
            return m.reply('❌ No sund files found in media/sund folder.')
        }

        // Create paginated list
        const itemsPerPage = 20
        let message = `╭━━━❰🔊 *SUND LIST* 🔊❱━━━╮\n┃\n`
        
        // Group in rows of 5 for better display
        for (let i = 0; i < available.length; i += 5) {
            const row = available.slice(i, i + 5)
            message += `┃ ${row.map(num => `sund${num}`).join(' • ')}\n`
        }
        
        message += `┃\n┃ 📊 *Total:* ${available.length} audio files\n`
        message += `┃ 🎵 *Usage:* ${usedPrefix}sund <number>\n`
        message += `╰━━━━━━━━━━━━━━━━╯`

        await conn.sendMessage(m.chat, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '🔊 Sund List',
                    body: `${available.length} audio files available`,
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m })

    } catch (error) {
        console.error('❌ Sund List Error:', error)
        m.reply('❌ Error loading sund list.')
    }
}

// ==================== RANDOM COMMAND ====================

let randomHandler = async (m, { conn }) => {
    try {
        const available = await getAvailableSund()
        
        if (available.length === 0) {
            return m.reply('❌ No sund files found.')
        }

        // Pick random sund
        const randomIndex = Math.floor(Math.random() * available.length)
        const randomSund = available[randomIndex]

        const waitMsg = await m.reply(`🔊 *Playing random sund ${randomSund}...*`)

        const audioPath = getSundPath(randomSund)
        
        await conn.sendMessage(m.chat, {
            audio: await fs.readFile(audioPath),
            mimetype: 'audio/mpeg',
            ptt: false,
        }, { quoted: m })

        await conn.sendMessage(m.chat, { delete: waitMsg.key })

    } catch (error) {
        console.error('❌ Random Sund Error:', error)
        m.reply('❌ Error playing random sund.')
    }
}

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['sund', 'صوت'];
handler.tags = ['fun', 'audio'];
handler.command = /^(sund|صوت)$/i;
handler.saki = 0; // Consumes 1 SAKI per play

let listCommand = {
    help: ['sundlist', 'صوتيات'],
    tags: ['fun', 'audio'],
    command: /^(sundlist|صوتيات)$/i,
    handler: listHandler,
    saki: 0 // Free command
};

let randomCommand = {
    help: ['sundrandom', 'صوتعشوائي'],
    tags: ['fun', 'audio'],
    command: /^(sundrandom|صوتعشوائي)$/i,
    handler: randomHandler,
    saki: 0 // Consumes 1 SAKI
};

export { handler, listCommand, randomCommand };
export default handler;