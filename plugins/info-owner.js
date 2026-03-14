// plugins/owner.js
// Owner Information with Audio and Social Links
// @author Saziki Bot Team
// Version: 2.0.0

import { promises as fs } from 'fs'
import { join } from 'path'

// ==================== CONFIGURATION ====================
const AUDIO_PATH = join(process.cwd(), 'media/audio/Owner.mp3')
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

// Import settings from settings.js
import { 
    owner as ownerConfig, 
    bot as botConfig,
    social,
    groups,
    channels,
    getMainOwner 
} from '../lib/settings.js'

// ==================== HELPER FUNCTIONS ====================

/**
 * Format all social links from settings.js
 */
function formatSocialLinks() {
    const socials = social.getAllFormatted()
    return Object.values(socials).join('\n')
}

/**
 * Format all group links from settings.js
 */
function formatGroupLinks() {
    return groups.getAllGroupsFormatted()
}

/**
 * Format all channel links from settings.js
 */
function formatChannelLinks() {
    return channels.getAllChannelsFormatted()
}

// ==================== MAIN HANDLER ====================

const handler = async (m, { conn, usedPrefix }) => {
    try {
        // Get owner information from settings.js
        const mainOwner = getMainOwner()
        const ownerNumber = mainOwner.number.split('@')[0]
        const ownerName = mainOwner.name || ownerConfig.creatorName || 'Owner'
        const ownerInstagram = ownerConfig.instagram || social.instagram?.url || 'https://www.instagram.com/mareyo.edits'
        const ownerWhatsapp = ownerConfig.whatsapp || social.whatsapp?.personal || `https://wa.me/${ownerNumber}`
        
        // Available document types
        const doc = [
            'pdf', 
            'zip', 
            'vnd.openxmlformats-officedocument.presentationml.presentation', 
            'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
            'vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        const document = doc[Math.floor(Math.random() * doc.length)]
        
        // Load audio file
        let audioBuffer = null
        try {
            audioBuffer = await fs.readFile(AUDIO_PATH)
            console.log('✅ Owner audio loaded successfully')
        } catch (audioError) {
            console.log('❌ Could not load owner audio:', audioError.message)
        }

        // Create owner information text using settings.js links
        const text = `╭━━━❰👑 *OWNER INFORMATION* 👑❱━━━╮
┃
┃ 👤 *Name:* ${ownerName}
┃ 📱 *Number:* wa.me/${ownerNumber}
┃
┃ 🌐 *Social Media*
┃ ${formatSocialLinks()}
┃
┃ 👥 *Official Groups*
┃ ${formatGroupLinks()}
┃
┃ 📢 *Official Channels*
┃ ${formatChannelLinks()}
┃
┃ 💬 *Contact:* ${ownerWhatsapp}
┃ 📸 *Instagram:* ${ownerInstagram}
┃
┃ ⚡ *Bot Info*
┃ • Name: ${botConfig.name || 'Saziki Bot'}
┃ • Version: ${botConfig.version || '2.0.0'}
┃ • Prefix: ${usedPrefix}
┃
╰━━━━━━━━━━━━━━━━╯

> 𝓟𝓸𝔀𝓮𝓻𝓮𝓭 𝓫𝔂 𝓢𝓪𝔃𝓲𝓴𝓲 𝓣𝓮𝓪𝓶`

        // Send audio first if available
        if (audioBuffer) {
            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: m })
        }

        // Create button message with document
        const buttonMessage = {
            document: { url: ownerInstagram },
            mimetype: `application/${document}`,
            fileName: `👑 ${ownerName} - Owner Info`,
            fileLength: 99999999999999,
            pageCount: 200,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    mediaUrl: '',
                    mediaType: 2,
                    previewType: 'pdf',
                    title: `☛ ${botConfig.name || 'SAZIKI BOT'} || BY ${ownerName} ☯`,
                    body: "➽ Owner Information",
                    thumbnail: BOT_THUMBNAIL,
                    sourceUrl: ownerInstagram
                }
            },
            caption: text,
            footer: botConfig.name || 'Saziki Bot',
            headerType: 6
        }

        // Send the message
        await conn.sendMessage(m.chat, buttonMessage, { quoted: m })

    } catch (error) {
        console.error('❌ Owner Command Error:', error)
        
        // Fallback simple message
        const mainOwner = getMainOwner()
        const ownerNumber = mainOwner.number.split('@')[0]
        
        await conn.sendMessage(m.chat, {
            text: `👑 *Owner*\n\nwa.me/${ownerNumber}\n\n_Error loading full owner information_`
        }, { quoted: m })
    }
}

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['owner', 'creator', 'المطور']
handler.tags = ['info']
handler.command = /^(owner|creator|creador|propietario|المطور)$/i
handler.saki = 0

export default handler