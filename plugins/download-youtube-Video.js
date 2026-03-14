/**
 * Saziki Bot - YouTube Video Downloader Plugin
 * File: plugins/ytv.js
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
      timeout: 60000
    })
    
    // Available video qualities
    this.qualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']
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
      throw new Error("Failed to connect to download server")
    }
  }

  async getVideoInfo(url) {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error("Invalid YouTube URL")

    const cdn = await this.getCdn()
    
    // Fetch video information
    const info = await this.is.post(`https://${cdn.data}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    })

    const dec = await this.decrypt(info.data.data)
    
    return {
      id,
      title: dec.title,
      duration: dec.duration,
      thumb: dec.thumbnail,
      description: dec.description?.substring(0, 200) || '',
      channel: dec.author?.name || 'Unknown Channel',
      qualities: dec.video_quality || []
    }
  }

  async downloadVideo(url, preferredQuality = '720p') {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error("Invalid YouTube URL")

    const cdn = await this.getCdn()
    
    // First get video info to get the correct key
    const info = await this.is.post(`https://${cdn.data}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    })

    const dec = await this.decrypt(info.data.data)
    
    // Determine best available quality
    let quality = preferredQuality
    if (!dec.video_quality?.includes(preferredQuality)) {
      // Find closest available quality
      const availableQualities = dec.video_quality || []
      if (availableQualities.length > 0) {
        quality = this.findBestQuality(availableQualities, preferredQuality)
      }
    }

    // Download video with selected quality
    const dl = await this.is.post(`https://${cdn.data}/download`, {
      id,
      downloadType: 'video',
      quality: quality.replace('p', ''),
      key: dec.key
    })

    return {
      title: dec.title,
      duration: this.formatDuration(dec.duration),
      thumb: dec.thumbnail,
      downloadUrl: dl.data.data.downloadUrl,
      videoId: id,
      quality: quality,
      channel: dec.author?.name || 'Unknown Channel'
    }
  }

  findBestQuality(available, preferred) {
    const preferredNum = parseInt(preferred)
    const availableNums = available.map(q => parseInt(q))
    
    // Find the closest quality not exceeding preferred if possible
    availableNums.sort((a, b) => a - b)
    
    let best = availableNums[0]
    for (const q of availableNums) {
      if (q <= preferredNum && q > best) {
        best = q
      }
    }
    
    return best + 'p'
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
  const increments = [12, 18, 15, 20, 10, 22, 16]
  return increments[Math.floor(Math.random() * increments.length)]
}

/* ================= MAIN HANDLER ================= */

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) {
    return m.reply(
      `*Example:*\n${usedPrefix}ytv https://youtu.be/ARwT9XzijgM?is=sDu0kkIY2yQq8Y6F`
    )
  }

  const url = args[0]
  const preferredQuality = args[1]?.toLowerCase() || '720p'
  
  // Validate quality
  const validQualities = ['144p', '240p', '360p', '480p', '720p', '1080p']
  if (!validQualities.includes(preferredQuality) && args[1]) {
    return m.reply(`⚠️ Invalid quality. Using 720p as default.\nAvailable: ${validQualities.join(', ')}`)
  }

  const st = new SaveTube()
  let progressMsg = null
  let currentProgress = 0

  try {
    // Initial validation message
    progressMsg = await conn.sendMessage(m.chat, {
      text: "⏳ Initializing Video Download..."
    }, { quoted: m })

    // Simulate validation progress
    await new Promise(resolve => setTimeout(resolve, 1200))
    currentProgress = 15
    
    await conn.sendMessage(m.chat, {
      text: `🎥 Processing Video: [${generateProgressBar(currentProgress)}] ${currentProgress}%`,
      edit: progressMsg.key
    })

    // Get video info first for metadata
    const videoInfo = await st.getVideoInfo(url)
    
    // Update progress
    currentProgress = 30
    await conn.sendMessage(m.chat, {
      text: `🎥 Processing Video: [${generateProgressBar(currentProgress)}] ${currentProgress}%`,
      edit: progressMsg.key
    })

    // Start actual download
    const downloadPromise = st.downloadVideo(url, preferredQuality)
    
    // Dynamic progress simulation while downloading
    while (currentProgress < 90) {
      const increment = getRandomIncrement()
      currentProgress = Math.min(currentProgress + increment, 90)
      
      await conn.sendMessage(m.chat, {
        text: `🎥 Processing Video: [${generateProgressBar(currentProgress)}] ${currentProgress}%`,
        edit: progressMsg.key
      })
      
      // Random delay between 800-1200ms for realistic simulation
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
    }

    // Wait for actual download to complete
    const result = await downloadPromise
    
    // Update to 100%
    await conn.sendMessage(m.chat, {
      text: "*Video Sent Successfully!* 📤",
      edit: progressMsg.key
    })

    // Prepare caption with metadata
    const caption = `🎬 *Video Downloaded!*\n\n`
    
    
    // Send as document with external ad reply
    await conn.sendMessage(m.chat, {
      document: { url: result.downloadUrl },
      mimetype: 'video/mp4',
      fileName: `${result.title.replace(/[^\w\s-]/gi, '')}.mp4`,
      caption: caption,
      contextInfo: {
        externalAdReply: {
          title: result.title.substring(0, 50),
          body: "SAZIKI DOWNLOADER",
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
    console.error("YTV Downloader Error:", error)
    
    // Update progress message with error
    if (progressMsg) {
      await conn.sendMessage(m.chat, {
        text: "❌ Error: Could not fetch video. Link might be restricted.",
        edit: progressMsg.key
      })
      
      // Delete error message after 7 seconds
      setTimeout(async () => {
        await conn.sendMessage(m.chat, {
          delete: progressMsg.key
        })
      }, 7000)
    } else {
      m.reply("❌ Error: Could not fetch video. Link might be restricted.")
    }
  }
}

handler.help = ['.ytv <youtube_url> [quality]']
handler.command = /^(ytv|ytvideo|ytmp4)$/i
handler.tags = ['downloader']
handler.saki = false

export default handler