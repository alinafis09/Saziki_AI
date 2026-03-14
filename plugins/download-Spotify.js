// plugins/spotify.js
// Simple Spotify Downloader
// @author Saziki Bot Team
// Version: 1.0.0

import fetch from 'node-fetch';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const token = 'BQD08W8HLOpVP7oG4nwfCZoQfJE5isW-Xo5gV0yWvivx7kjO_HxdH4JUZLE7wU5-tmkBPX2EEausvwWg8RTY_pfHTa4pYF9Vkv8wgUZDQ4r9_0shGzPp8paPeeBdQDdwZa8CtLnlzj7g8B15kV3_xWJjvkLTDsKPOeFu3eh3JGuJhwZBSYym_Q36emMw8fBAwLbnOP8V7mDnPfVSnPk94UgiRPp-nFckCDXv22T142_dEOTpxR5KV1S7Xz8nHiGRikOQ6-vP7_aZ6m43WqP0AEFl7t5MFx80Bb6zXSEL5cJSzc66zS7Hde_UW-lgikxtfF9R';

function createProgressBar(percent) {
    const filled = Math.floor(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        method,
        body: JSON.stringify(body)
    });
    return await res.json();
}

async function searchTracks(query) {
    const data = await fetchWebApi(`v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, 'GET');
    return data.tracks?.items[0] || null;
}

async function downloadPreview(url, onProgress) {
    const response = await fetch(url);
    const total = parseInt(response.headers.get('content-length'), 10);
    let downloaded = 0;
    const chunks = [];

    return new Promise((resolve, reject) => {
        response.body.on('data', (chunk) => {
            chunks.push(chunk);
            downloaded += chunk.length;
            if (total) {
                const percent = Math.floor((downloaded / total) * 100);
                onProgress(percent);
            }
        });
        response.body.on('end', () => resolve(Buffer.concat(chunks)));
        response.body.on('error', reject);
    });
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('🎵 *Usage:* .spotify <song name>');

    const waitMsg = await m.reply(`🔍 Searching: "${text}"`);

    try {
        const track = await searchTracks(text);
        if (!track) throw new Error('No results');

        if (!track.preview_url) throw new Error('No preview available');

        let progressMsg = await m.reply(`📥 Wait a moment: [${createProgressBar(0)}]0%`);

        const audioBuffer = await downloadPreview(track.preview_url, async (percent) => {
            if (percent % 10 === 0 || percent === 100) {
                await conn.sendMessage(m.chat, {
                    text: `📥 Wait a moment: [${createProgressBar(percent)}]${percent}%`,
                    edit: progressMsg.key
                });
            }
        });

        const tempFile = join(tmpdir(), `spotify_${Date.now()}.mp3`);
        writeFileSync(tempFile, audioBuffer);

        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        await conn.sendMessage(m.chat, { delete: progressMsg.key });

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${track.name}.mp3`,
            caption: `🎵 *${track.name}*\n👤 ${track.artists.map(a => a.name).join(', ')}`
        }, { quoted: m });

        unlinkSync(tempFile);

    } catch (error) {
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        m.reply(`❌ ${error.message}`);
    }
};

handler.help = ['spotify'];
handler.tags = ['download'];
handler.command = /^(spotify|sp)$/i;
handler.saki = 0;

export default handler;