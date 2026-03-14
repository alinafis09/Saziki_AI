/**
 * Saziki Bot - YouTube Audio Downloader Plugin
 * File: plugins/yta.js
 * Engine: SaveTube with AES-128-CBC decryption
 * Author: Saziki Development Team
 */

import crypto from "crypto"
import axios from "axios"

class SaveTube {
  constructor() {
    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
    this.m = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/
    this.is = axios.create({
      headers: {
        'content-type': 'application/json',
        'origin': 'https://yt.savetube.me',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    })
  }

  async decrypt(enc) {
    const buf = Buffer.from(enc, 'base64')
    const key = Buffer.from(this.ky, 'hex')
    const iv = buf.slice(0, 16)
    const data = buf.slice(16)

    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final()
    ])

    return JSON.parse(decrypted.toString())
  }

  async getCdn() {
    try {
      const res = await this.is.get("https://media.savetube.vip/api/random-cdn")
      return { status: true, data: res.data.cdn }
    } catch (error) {
      throw new Error("Failed to fetch CDN server")
    }
  }

  async download(url) {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error("Invalid YouTube URL")

    const cdn = await this.getCdn()
    
    // Fetch video information
    const info = await this.is.post(`https://${cdn.data}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    })

    const dec = await this.decrypt(info.data.data)

    // Download audio with 320kbps quality
    const dl = await this.is.post(`https://${cdn.data}/download`, {
      id,
      downloadType: 'audio',
      quality: '320',
      key: dec.key
    })

    return {
      title: dec.title,
      duration: this.formatDuration(dec.duration),
      thumb: dec.thumbnail,
      downloadUrl: dl.data.data.downloadUrl,
      videoId: id
    }
  }

  formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}

// Progress bar generator
function generateProgressBar(percentage) {
  const filled = Math.floor(percentage / 10)
  const empty = 10 - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

// Simulate random progress increments
function getRandomIncrement() {
  const increments = [15, 20, 12, 18, 22, 10, 25]
  return increments[Math.floor(Math.random() * increments.length)]
}

/* ================= MAIN HANDLER ================= */

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(
      `*Example:*\n.yta https://youtu.be/ARwT9XzijgM?is=sDu0kkIY2yQq8Y6F`
    )
  }

  const url = args[0]
  const st = new SaveTube()
  let progressMsg = null
  let currentProgress = 0

  try {
    // Initial validation message
    progressMsg = await conn.sendMessage(m.chat, {
      text: "*Loading*...📥"
    }, { quoted: m })

    // Simulate validation progress
    await new Promise(resolve => setTimeout(resolve, 1000))
    currentProgress = 10
    
    await conn.sendMessage(m.chat, {
      text: `🎧 *Wait a moment*...[${generateProgressBar(currentProgress)}] ${currentProgress}%`,
      edit: progressMsg.key
    })

    // Start actual download
    const downloadPromise = st.download(url)
    
    // Dynamic progress simulation
    while (currentProgress < 90) {
      const increment = getRandomIncrement()
      currentProgress = Math.min(currentProgress + increment, 90)
      
      await conn.sendMessage(m.chat, {
        text: `🎧 *Wait a moment*...[${generateProgressBar(currentProgress)}] ${currentProgress}%`,
        edit: progressMsg.key
      })
      
      // Random delay between 600-1000ms
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400))
    }

    // Wait for actual download to complete
    const result = await downloadPromise
    
    // Update to 100%
    await conn.sendMessage(m.chat, {
      text: "*Sending*...📤",
      edit: progressMsg.key
    })

    // Prepare caption with external ad reply
    const caption = `✨ *Audio Downloaded Successfully!*`

    // Send as document with external ad reply
    await conn.sendMessage(m.chat, {
      document: { url: result.downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${result.title.replace(/[^\w\s]/gi, '')}.mp3`,
      caption: caption,
      contextInfo: {
        externalAdReply: {
          title: result.title.substring(0, 50),
          body: "📱 𝐒𝐚𝐙𝐢𝐤𝐢 𝐁𝐨𝐭 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫",
          thumbnailUrl: result.thumb,
          sourceUrl: `https://youtu.be/${result.videoId}`,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // Delete progress message
    await conn.sendMessage(m.chat, {
      delete: progressMsg.key
    })

  } catch (error) {
    console.error("YTA Downloader Error:", error)
    
    // Update progress message with error
    if (progressMsg) {
      await conn.sendMessage(m.chat, {
        text: "❌ Error: Invalid URL or Service Timeout.",
        edit: progressMsg.key
      })
      
      // Delete error message after 5 seconds
      setTimeout(async () => {
        await conn.sendMessage(m.chat, {
          delete: progressMsg.key
        })
      }, 5000)
    } else {
      m.reply("❌ Error: Invalid URL or Service Timeout.")
    }
  }
}

handler.help = ['.yta <youtube_url>']
handler.command = /^(yta|ytaudio|youtubemp3)$/i
handler.tags = ['downloader']
handler.saki = true

export default handler