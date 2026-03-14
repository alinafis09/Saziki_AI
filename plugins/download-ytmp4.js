// plugins/ytmp4.js
// YouTube Video Downloader using yt-dlp-exec
// @author Saziki Bot Team
// Version: 1.1.0

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);

// ==================== CONFIGURATION ====================
const TMP_DIR = join(tmpdir(), 'ytmp4_downloads');
const MAX_FILE_SIZE = 64 * 1024 * 1024; // 64MB WhatsApp limit
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// Ensure temp directory exists
if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR, { recursive: true });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate YouTube URL - FIXED VERSION
 * Now accepts URLs with additional parameters
 */
function isValidYouTubeUrl(url) {
    // Remove any extra parameters after the video ID
    const cleanUrl = url.split('?')[0];
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?[\w-]+/;
    return pattern.test(cleanUrl);
}

/**
 * Extract video ID from URL - FIXED VERSION
 */
function extractVideoId(url) {
    // First try youtu.be format
    let match = url.match(/youtu\.be\/([\w-]+)/);
    if (match) return match[1];
    
    // Then try youtube.com format with any parameters
    match = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
    if (match) return match[1];
    
    return null;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create progress bar
 */
function createProgressBar(percent) {
    const filled = Math.floor(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Get video info using yt-dlp
 */
async function getVideoInfo(url) {
    try {
        const { stdout } = await execAsync(`yt-dlp --dump-json --no-playlist "${url}"`);
        return JSON.parse(stdout);
    } catch (error) {
        throw new Error(`Failed to get video info: ${error.message}`);
    }
}

/**
 * Check if yt-dlp is installed
 */
async function checkYtDlp() {
    try {
        await execAsync('yt-dlp --version');
        return true;
    } catch {
        return false;
    }
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `🎬 *YouTube Video Downloader*\n\n` +
                  `*Usage:* ${usedPrefix + command} <YouTube URL>\n\n` +
                  `*Examples:*\n` +
                  `• ${usedPrefix}ytmp4 https://youtu.be/dQw4w9WgXcQ\n` +
                  `• ${usedPrefix}ytmp4 https://youtu.be/LdyZsZCiwT4?is=RXo1TwBiL4FRCV9v\n` +
                  `• ${usedPrefix}ytmp4 https://www.youtube.com/watch?v=jmhcLhz7gGg&feature=share\n\n` +
                  `*Features:*\n` +
                  `• Best quality download (up to 1080p)\n` +
                  `• Automatic audio/video merging\n` +
                  `• WhatsApp file limit: 64MB\n\n` +
                  `*Powered by yt-dlp*`,
            contextInfo: {
                externalAdReply: {
                    title: '🎬 YouTube Downloader',
                    body: 'Download videos as MP4',
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    }

    const url = text.trim();

    // Validate URL - now works with extra parameters
    if (!isValidYouTubeUrl(url)) {
        return m.reply('❌ Invalid YouTube URL. Please provide a valid YouTube link.\n\nExample: https://youtu.be/LdyZsZCiwT4');
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
        return m.reply('❌ Could not extract video ID from URL.');
    }

    // Check if yt-dlp is installed
    const isYtDlpInstalled = await checkYtDlp();
    if (!isYtDlpInstalled) {
        return m.reply('❌ yt-dlp is not installed. Please run: npm install -g yt-dlp');
    }

    const waitMsg = await m.reply(`⏰️ *Processing request for:*\n${url}\n\n⏱️ Fetching video info...`);

    try {
        // Get video info
        const info = await getVideoInfo(url);
        
        const videoTitle = info.title || 'YouTube Video';
        const videoAuthor = info.uploader || 'Unknown';
        const videoDuration = info.duration || 0;
        const minutes = Math.floor(videoDuration / 60);
        const seconds = videoDuration % 60;
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const thumbnail = info.thumbnail || BOT_THUMBNAIL;

        // Estimate file size (rough estimate)
        const estimatedSize = info.filesize_approx || info.filesize || 0;
        if (estimatedSize > MAX_FILE_SIZE) {
            await conn.sendMessage(m.chat, { delete: waitMsg.key });
            return m.reply(`❌ *File Too Large*\n\nEstimated size: ${formatFileSize(estimatedSize)}\nWhatsApp limit: 64MB\n\nTry a lower quality video.`);
        }

        // Show video info
        await conn.sendMessage(m.chat, {
            text: `🎬 *Video Found*\n\n` +
                  `📹 *Title:* ${videoTitle}\n` +
                  `👤 *Author:* ${videoAuthor}\n` +
                  `⏱️ *Duration:* ${duration}\n` +
                  `📊 *Quality:* Best available\n` +
                  `📥 *Downloading...*`,
            edit: waitMsg.key
        });

        // Download video with best quality
        const outputPath = join(TMP_DIR, `${videoId}_${Date.now()}.mp4`);
        
        // Use yt-dlp to download best quality with audio/video merged
        const downloadProcess = execAsync(
            `yt-dlp -f "best[ext=mp4]" --merge-output-format mp4 -o "${outputPath}" "${url}"`
        );

        // Simple progress indicator
        let progressMsg = await m.reply(`⏰️ *Wait a moment: [${createProgressBar(0)}]0%*`);
        
        // Poll for file existence as simple progress indicator
        let checkCount = 0;
        const progressInterval = setInterval(async () => {
            checkCount++;
            if (existsSync(outputPath)) {
                const stats = await fs.promises.stat(outputPath);
                const percent = Math.min(95, Math.floor((stats.size / estimatedSize) * 100));
                
                if (percent % 10 === 0 || percent === 95) {
                    await conn.sendMessage(m.chat, {
                        text: `⏰️ *Wait a moment: [${createProgressBar(percent)}]${percent}%*`,
                        edit: progressMsg.key
                    }).catch(() => {});
                }
            }
        }, 2000);

        await downloadProcess;
        clearInterval(progressInterval);

        // Check file size
        const stats = await fs.promises.stat(outputPath);
        if (stats.size > MAX_FILE_SIZE) {
            unlinkSync(outputPath);
            await conn.sendMessage(m.chat, { delete: waitMsg.key });
            await conn.sendMessage(m.chat, { delete: progressMsg.key });
            return m.reply(`❌ *File Too Large*\n\nFinal size: ${formatFileSize(stats.size)}\nWhatsApp limit: 64MB`);
        }

        // Clean up waiting messages
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        await conn.sendMessage(m.chat, { delete: progressMsg.key });

        // Send video
        await conn.sendMessage(m.chat, {
            video: { url: outputPath },
            caption: `✅ *Download Complete!*\n\n` +
                    `📹 *${videoTitle}*\n` +
                    `👤 *${videoAuthor}*\n` +
                    `⏱️ *${duration}*\n` +
                    `📊 Size: ${formatFileSize(stats.size)}\n` +
                    `🔗 ${url}`,
            mimetype: 'video/mp4',
            contextInfo: {
                externalAdReply: {
                    title: videoTitle.substring(0, 30),
                    body: `By ${videoAuthor}`,
                    thumbnailUrl: thumbnail,
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

        // Clean up file
        unlinkSync(outputPath);

    } catch (error) {
        console.error('❌ YTMP4 Error:', error);
        
        await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

        let errorMessage = '❌ *Error*\n\n';
        
        if (error.message.includes('private')) {
            errorMessage += 'This video is private and cannot be downloaded.';
        } else if (error.message.includes('region')) {
            errorMessage += 'This video is region-restricted and unavailable.';
        } else if (error.message.includes('copyright')) {
            errorMessage += 'This video is unavailable due to copyright.';
        } else if (error.message.includes('yt-dlp')) {
            errorMessage += 'Download failed. Please check if yt-dlp is installed correctly.';
        } else {
            errorMessage += error.message || 'Failed to download video.';
        }

        await m.reply(errorMessage);
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['mp4', 'ytvideo'];
handler.tags = ['download'];
handler.command = /^(mp4|ytvideo)$/i;
handler.saki = 3;

export default handler;