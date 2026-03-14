// plugins/yts.js
// YouTube Search using yt-search library - Single Message Version
// @author Saziki Bot Team
// Version: 4.0.0

import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import fs from 'fs/promises';

// ==================== CONFIGURATION ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// ==================== HELPER FUNCTIONS ====================

/**
 * Format view count
 */
function formatViews(views) {
    if (views === undefined || views === null) return 'N/A';
    
    if (typeof views === 'string' && (views.includes('K') || views.includes('M') || views.includes('B'))) {
        return views;
    }
    
    let num = 0;
    if (typeof views === 'string') {
        const match = views.match(/[\d.]+/);
        num = match ? parseFloat(match[0]) : 0;
    } else if (typeof views === 'number') {
        num = views;
    } else {
        return 'N/A';
    }
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format duration
 */
function formatDuration(duration) {
    if (!duration) return 'N/A';
    if (typeof duration === 'string') return duration;
    if (duration.timestamp) return duration.timestamp;
    if (typeof duration === 'number') {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    return 'N/A';
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `🎥 *YouTube Search*\n\n` +
                  `*Usage:* ${usedPrefix + command} <search query>\n\n` +
                  `*Examples:*\n` +
                  `• ${usedPrefix}yts lofi music\n` +
                  `• ${usedPrefix}yts tutorial javascript\n\n` +
                  `*Features:*\n` +
                  `• 40 search results in one message\n` +
                  `• Title, duration, views, author\n` +
                  `• Direct video links\n\n` +
                  `*Powered by yt-search*`,
            contextInfo: {
                externalAdReply: {
                    title: '🎥 YouTube Search',
                    body: 'Search for videos',
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    }

    const searchQuery = text;
    const waitMsg = await m.reply(`🔍 *Searching YouTube for:* "${searchQuery}"\n\n⏱️ Please wait...`);

    try {
        const { search } = await import('yt-search');
        const results = await search(searchQuery);
        
        if (!results || !results.videos || results.videos.length === 0) {
            await conn.sendMessage(m.chat, { delete: waitMsg.key });
            return m.reply(`❌ No results found for "${searchQuery}". Try a different search term.`);
        }

        // Get 40 results
        const videos = results.videos.slice(0, 40);
        
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Build single message with all results
        let message = `🎥 *YouTube Search Results*\n`;
        message += `🔍 *Query:* ${searchQuery}\n`;
        message += `📊 *Found:* ${results.videos.length} videos (showing 40)\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        videos.forEach((video, index) => {
            const num = index + 1;
            const title = video.title || 'Unknown Title';
            const url = video.url || `https://youtube.com/watch?v=${video.videoId}`;
            const duration = formatDuration(video.duration);
            const views = formatViews(video.views);
            const author = video.author?.name || 'Unknown';
            const uploaded = video.ago || 'N/A';
            
            message += `${num}. *${title}*\n`;
            message += `   ⏱️ ${duration} | 👁️ ${views}\n`;
            message += `   👤 ${author} | 📅 ${uploaded}\n`;
            message += `   🔗 ${url}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🔗 *Search link:* https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

        // Send single message with thumbnail
        await conn.sendMessage(m.chat, {
            image: { url: videos[0]?.thumbnail || BOT_THUMBNAIL },
            caption: message,
            contextInfo: {
                externalAdReply: {
                    title: '🎥 YouTube Search',
                    body: `${videos.length} results found`,
                    thumbnailUrl: videos[0]?.thumbnail || BOT_THUMBNAIL,
                    sourceUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

    } catch (error) {
        console.error('❌ YouTube Search Error:', error);

        await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

        let errorMessage = '❌ *Error*\n\n';
        errorMessage += error.message || 'Failed to search YouTube.';
        
        if (error.message.includes('Cannot find package')) {
            errorMessage += '\n\n💡 *Missing package:*\nRun: npm install yt-search';
        } else {
            errorMessage += '\n\n💡 Try using different keywords';
        }

        await m.reply(errorMessage);
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['yts', 'ytsearch'];
handler.tags = ['download', 'search'];
handler.command = /^(yts|ytsearch)$/i;
handler.saki = 0;

export default handler;