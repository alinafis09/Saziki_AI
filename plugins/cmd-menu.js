// plugins/menu.js
// Custom Menu with Manual Commands - Fixed Display Issue

import { promises as fs } from 'fs'
import { join } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'
import { xpRange, findLevel } from '../src/libraries/levelling.js'
import { getMaxSaki, getSakiStats } from '../src/libraries/saki.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Menu categories with emojis and descriptions
const menuCategories = {
  main: {
    emoji: '🏠',
    name: 'Main Menu',
    description: 'Main navigation menu'
  },
  ai: {
    emoji: '🤖',
    name: '𝗔𝗿𝘁𝗶𝗳𝗶𝗰𝗶𝗮𝗹 𝗜𝗻𝘁𝗲𝗹𝗹𝗶𝗴𝗲𝗻𝗰𝗲',
    description: 'AI-powered commands'
  },
  download: {
    emoji: '📥',
    name: '𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿',
    description: 'Download from TikTok, Instagram, and more'
  },
  tools: {
    emoji: '🛠️',
    name: '𝗧𝗼𝗼𝗹𝘀',
    description: 'Utility tools'
  },
  group: {
    emoji: '👥',
    name: '𝗚𝗿𝗼𝘂𝗽 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁',
    description: 'Group administration commands'
  },
  owner: {
    emoji: '👑',
    name: '𝗢𝘄𝗻𝗲𝗿',
    description: 'Owner only commands'
  },
  premium: {
    emoji: '💎',
    name: '𝗣𝗿𝗲𝗺𝗶𝘂𝗺',
    description: 'Premium user commands'
  },
  game: {
    emoji: '🎮',
    name: '𝗚𝗮𝗺𝗲𝘀',
    description: 'Fun games and entertainment'
  },
  general: {
    emoji: '🌐',
    name: '𝗚𝗲𝗻𝗲𝗿𝗮𝗹',
    description: 'General bot commands'
  },
  sticker: {
    emoji: '🎨',
    name: '𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗠𝗮𝗸𝗲𝗿',
    description: 'Create and manage stickers'
  },
  converter: {
    emoji: '🔄',
    name: '𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗿',
    description: 'Convert media and files'
  },
  islamic: {
    emoji: '🕌',
    name: '𝗜𝘀𝗹𝗮𝗺𝗶𝗰',
    description: 'Islamic commands and tools'
  }
}

// ===== MANUAL COMMAND LISTS - EDIT THESE =====
const commands = {
  premium: [
     { cmd: 'apk2', desc: 'Download play store'}
  ],
  ai: [
    { cmd: 'ai', desc: 'Chat with AI' },
    { cmd: 'imag', desc: 'Generate image from text' },
    { cmd: 'duty', desc: 'Image and video analysis' },
    { cmd: 'code', desc: 'Designing programming codes' },
    { cmd: 'qwen', desc: 'chat ai Saziki' },
    { cmd: 'tr', desc: 'Translate text' }
  ],
  
  download: [
    { cmd: 'tiktok', desc: 'Download TikTok video' },
    { cmd: 'ig', desc: 'Download Instagram content' },
    { cmd: 'yts', desc: 'Download YouTube audio' },
    { cmd: 'ytv', desc: 'Download video from YouTube' }
  ],
  
  tools: [
    { cmd: 'wt', desc: 'Check weather' },
    { cmd: 'qrcode', desc: 'Generate QR code' },
    { cmd: 'currency', desc: 'Convert currency' }
  ],
  
  group: [
    { cmd: 'tagall', desc: 'Mention all members' },
    { cmd: 'link', desc: 'Get group link' },
    { cmd: 'setname', desc: 'Change group name' },
    { cmd: 'welcome', desc: 'Toggle welcome message' }
  ],
  
  owner: [
    { cmd: 'broadcast', desc: 'Broadcast message' },
    { cmd: 'restart', desc: 'Restart bot' },
    { cmd: 'shutdown', desc: 'Shutdown bot' },
    { cmd: 'eval', desc: 'Execute code' }
  ],
  
  sticker: [
    { cmd: 'sticker', desc: 'Image to sticker' },
    { cmd: 'textsticker', desc: 'Text to sticker' },
    { cmd: 'sgif', desc: 'Video to sticker' },
    { cmd: 'emojisticker', desc: 'Emoji to sticker' }
  ],
  
  converter: [
    { cmd: 'toimage', desc: 'Convert sticker to image' },
    { cmd: 'tomp3', desc: 'Convert video to audio' },
    { cmd: 'togif', desc: 'Convert video to GIF' }
  ],
  
  game: [
    { cmd: 'quiz', desc: 'Play quiz game' },
    { cmd: 'ttt', desc: 'Play tic tac toe' },
    { cmd: 'math', desc: 'Math challenge' }
  ],
  
  general: [
    { cmd: 'menu', desc: 'Show this menu' },
    { cmd: 'ping', desc: 'Check bot latency' },
    { cmd: 'info', desc: 'Bot information' },
    { cmd: 'owner', desc: 'Contact owner' },
    { cmd: 'uptime', desc: 'Bot uptime' }
  ]
}

// Menu-specific customizations
const menuCustomizations = {
  ai: {
    title: '𝗔𝗿𝘁𝗶𝗳𝗶𝗰𝗶𝗮𝗹 𝗜𝗻𝘁𝗲𝗹𝗹𝗶𝗴𝗲𝗻𝗰𝗲 🤖',
    emoji: '🤖',
    description: '𝗔𝗜-𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀'
  },
  download: {
    title: '𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿 📥',
    emoji: '📥',
    description: '𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗳𝗿𝗼𝗺 𝗧𝗶𝗸𝗧𝗼𝗸, 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺, 𝗮𝗻𝗱 𝗺𝗼𝗿𝗲'
  },
  tools: {
    title: '𝗧𝗼𝗼𝗹𝘀 🛠️',
    emoji: '🛠️',
    description: '𝗨𝘁𝗶𝗹𝗶𝘁𝘆 𝘁𝗼𝗼𝗹𝘀'
  },
  group: {
    title: '𝗚𝗿𝗼𝘂𝗽 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁 👥',
    emoji: '👥',
    description: '𝗚𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀'
  },
  owner: {
    title: '𝗢𝘄𝗻𝗲𝗿 👑',
    emoji: '👑',
    description: '𝗢𝘄𝗻𝗲𝗿 𝗼𝗻𝗹𝘆 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀'
  },
  sticker: {
    title: '𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗠𝗮𝗸𝗲𝗿 🎨',
    emoji: '🎨',
    description: '𝗖𝗿𝗲𝗮𝘁𝗲 𝗮𝗻𝗱 𝗺𝗮𝗻𝗮𝗴𝗲 𝘀𝘁𝗶𝗰𝗸𝗲𝗿𝘀'
  },
  game: {
    title: '𝗚𝗮𝗺𝗲𝘀 🎮',
    emoji: '🎮',
    description: '𝗙𝘂𝗻 𝗴𝗮𝗺𝗲𝘀 𝗮𝗻𝗱 𝗲𝗻𝘁𝗲𝗿𝘁𝗮𝗶𝗻𝗺𝗲𝗻𝘁'
  }
}

const totalCommands = Object.values(commands).reduce((acc, curr) => acc + curr.length, 0)

const handler = async (m, { conn, usedPrefix, isPrems, command, text }) => {
  try {
    const username = '@' + m.sender.split('@')[0]
    
    const d = new Date()
    const week = d.toLocaleDateString('en-US', { weekday: 'long' })
    const date = d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    
    const uptime = clockString(process.uptime() * 1000)
    
    const user = global.db?.data?.users?.[m.sender] || {}
    
    // ✅ التأكد من أن exp ليس سالباً
    const exp = Math.max(0, user.exp || 0)
    const level = exp === 0 ? 0 : findLevel(exp)
    const range = xpRange(level)
    
    // حساب معلومات SAKI الصحيحة
    const currentSaki = Math.max(0, user.saki || 0)
    const maxSaki = getMaxSaki(user)
    const sakiStats = getSakiStats(user)
    
    // تحديد حالة premium
    const isPremium = user.premiumTime > Date.now() || isPrems
    const isVip = user.vipTime > Date.now()
    
    let sakiDisplay = `${currentSaki} / ${maxSaki}`
    let premiumDisplay = '❌'
    
    if (isVip) {
      premiumDisplay = '👑 VIP'
      sakiDisplay = '∞ / ∞'
    } else if (isPremium) {
      premiumDisplay = '💎 PREMIUM'
      sakiDisplay = '∞ / ∞'
    } else {
      premiumDisplay = currentSaki > 0 ? '✅' : '❌'
    }

    // Get user's profile picture
    let userPP
    try {
      userPP = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      userPP = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }

    // استخدام global.imagen1 من config.js
    let menuImage = global.imagen1 || null
    let thumbnail = null
    let menuAudio = null

    try {
      thumbnail = (await fs.readFile(join(process.cwd(), 'media/icon.jpg'))).slice(0, 200000)
    } catch {}
    
    // قراءة المقطع الصوتي
    try {
      menuAudio = await fs.readFile(join(process.cwd(), 'media/audio/Menu.mp3'))
      console.log('✅ Audio file loaded successfully')
    } catch (audioError) {
      console.log('❌ Could not load audio file:', audioError.message)
    }

    // If specific category requested
    const category = text?.toLowerCase().trim()
    
    if (category && menuCategories[category]) {
      // Show specific category menu with custom formatting
      const cat = menuCategories[category]
      const cmdList = commands[category] || []
      const custom = menuCustomizations[category] || {
        title: `${cat.emoji} ${cat.name}`,
        emoji: cat.emoji,
        description: cat.description
      }
      
      if (cmdList.length === 0) {
        return m.reply(`❌ No commands found in category "${cat.name}"`)
      }

      // Create command list with custom formatting
      let cmdText = ''
      cmdList.forEach(cmd => {
        cmdText += `┃ ✦ *${usedPrefix}${cmd.cmd}*\n`
        cmdText += `┃   ↳ ${cmd.desc}\n`
      })

      const categoryMenu = `
╭━━━❰ ${custom.title} ❱━━━╮
${cmdText}╰━━━━━━━━━━━━━━━━╯
📝 *${custom.description}*
📊 *𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:* ${cmdList.length}
`.trim()

      // إرسال الصوت أولاً إذا كان موجوداً (فقط للقائمة الرئيسية)
      if (menuAudio && category === 'main') {
        await conn.sendMessage(m.chat, {
          audio: menuAudio,
          mimetype: 'audio/mpeg',
          ptt: false
        }, { quoted: m })
      }

      await conn.sendMessage(m.chat, {
        text: categoryMenu,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: custom.title,
            body: `${cmdList.length} commands available • ${time}`,
            thumbnail: thumbnail || menuImage,
            sourceUrl: "https://whatsapp.com",
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })
      
      return
    }

    // MAIN MENU
    const mainMenu = `
╭━━━❰ 👤 *𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢* ❱━━━╮
┃ 👋 𝗛𝗲𝗹𝗹𝗼, *${username}*
┃ 📆 ${week}, ${date}
┃ ⏰ ${time}
┃ ⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
┃ 📊 𝗟𝗲𝘃𝗲𝗹: ${level} (${exp} / ${range.max} 𝗫𝗣)
┃ 💰 𝗦𝗔𝗞𝗜: ${sakiDisplay}
┃ ⭐ 𝗣𝗿𝗲𝗺𝗶𝘂𝗺: ${premiumDisplay}
${sakiStats && !isVip && !isPremium ? `┃ ⏰ 𝗗𝗮𝗶𝗹𝘆: ${sakiStats.daily?.formatted || 'N/A'}` : ''}
╰━━━━━━━━━━━━━━━━╯

╭━━━❰💡 *𝗤𝘂𝗶𝗰𝗸 𝗔𝗰𝗰𝗲𝘀𝘀* ❱━━━╮
┃ ${usedPrefix}menu 𝗮𝗶     
┃ ${usedPrefix}menu 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 
┃ ${usedPrefix}menu 𝘁𝗼𝗼𝗹𝘀   
┃ ${usedPrefix}menu 𝗴𝗿𝗼𝘂𝗽   
┃ ${usedPrefix}menu 𝗼𝘄𝗻𝗲𝗿   
┃ ${usedPrefix}menu 𝘀𝘁𝗶𝗰𝗸𝗲𝗿     
┃ ${usedPrefix}menu 𝗴𝗮𝗺𝗲 
┃ ${usedPrefix}menu 𝗽𝗿𝗲𝗺𝗶𝘂𝗺
╰━━━━━━━━━━━━━━━━╯
`.trim()

    // إرسال الصوت أولاً إذا كان موجوداً (للقائمة الرئيسية فقط)
    if (menuAudio) {
      await conn.sendMessage(m.chat, {
        audio: menuAudio,
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })
    }

    // إرسال الصورة مع التنسيق المطلوب
    await conn.sendMessage(m.chat, {
      image: menuImage || { url: 'https://uploadnow.io/files/fCTmG3K' },
      caption: mainMenu,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: "𝗦𝗮𝘇𝗶𝗸𝗶 𝗕𝗼𝘁 🤖",
          body: "𝗦𝗮𝘇𝗶𝗸𝗶 𝗰𝗵𝗮𝗻𝗻𝗲𝗹 | 𝗮𝗵𝘀𝗮𝗻 𝗯𝗼𝘁 𝗳𝗶 𝗮𝗹𝗮𝗹𝗮𝗺",
          thumbnail: thumbnail || menuImage,
          sourceUrl: "https://whatsapp.com/channel/0029VbB8fdr4inolWgXQ8l2a",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Menu error: ' + e.message)
  }
}

handler.help = ['menu', 'help']
handler.tags = ['info']
handler.command = /^(menu|help|cmd)$/i

export default handler

function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}