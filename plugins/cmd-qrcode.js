// plugins/qr.js
// QR Code Generator using QRtag.net
// @author Saziki Bot Team
// Version: 1.0.0

import fetch from 'node-fetch';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// ==================== CONFIGURATION ====================
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate QR code using QRtag.net
 * @param {string} text - Text or URL to encode
 * @param {Object} options - QR options
 * @returns {Promise<Buffer>} - QR code image buffer
 */
async function generateQR(text, options = {}) {
    const {
        size = 300,
        format = 'png',
        transparent = false
    } = options;

    // Clean the text (remove http:// or https:// for cleaner QR)
    const cleanText = text.replace(/^https?:\/\//, '');
    
    // Build the URL according to QRtag.net format
    // Format: https://qrtag.net/api/qr[optional_transparent]_[size].[format]?url=[encoded_url]
    const transparentPart = transparent ? '_transparent' : '';
    const url = `https://qrtag.net/api/qr${transparentPart}_${size}.${format}?url=${encodeURIComponent(cleanText)}`;
    
    console.log(`📡 Fetching QR from: ${url}`);
    
    const response = await fetch(url, {
        timeout: 10000
    });

    if (!response.ok) {
        throw new Error(`QR API Error: ${response.status}`);
    }

    const buffer = await response.buffer();
    return buffer;
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Check if text is provided
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `📱 *QR Code Generator*\n\n` +
                  `*Usage:* ${usedPrefix + command} <text or url>\n\n` +
                  `*Examples:*\n` +
                  `• ${usedPrefix}qr https://github.com\n` +
                  `• ${usedPrefix}qr Hello World\n` +
                  `• ${usedPrefix}qr 100 500 (size 100x100)\n\n` +
                  `*Options:*\n` +
                  `• You can specify size: .qr 500 text\n` +
                  `• Default size: 300x300\n\n` +
                  `*Powered by QRtag.net*`,
            contextInfo: {
                externalAdReply: {
                    title: '📱 QR Code Generator',
                    body: 'Create QR codes instantly',
                    thumbnailUrl: BOT_THUMBNAIL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    }

    // Parse size if provided
    let size = 300;
    let qrText = text;
    
    const sizeMatch = text.match(/^(\d+)\s+(.+)$/);
    if (sizeMatch) {
        size = parseInt(sizeMatch[1]);
        qrText = sizeMatch[2];
        // Limit size to reasonable values
        size = Math.min(Math.max(size, 100), 1000);
    }

    const waitMsg = await m.reply(`📱 *Generating QR code...*\nSize: ${size}x${size}`);

    try {
        // Generate QR code
        const qrBuffer = await generateQR(qrText, { size });

        // Save temp file (optional, for debugging)
        const tempFile = join(tmpdir(), `qr_${Date.now()}.png`);
        writeFileSync(tempFile, qrBuffer);

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Send QR code image
        await conn.sendMessage(m.chat, {
            image: qrBuffer,
            caption: `📱 *QR Code Generated*\n\n📝 *Content:* ${qrText}\n📏 *Size:* ${size}x${size}\n\n🔗 Scan to access`,
            contextInfo: {
                externalAdReply: {
                    title: '📱 QR Code',
                    body: `Size: ${size}x${size}`,
                    thumbnailUrl: BOT_THUMBNAIL,
                    sourceUrl: qrText.startsWith('http') ? qrText : undefined,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

        // Clean up temp file
        try { unlinkSync(tempFile); } catch (e) {}

    } catch (error) {
        console.error('❌ QR Error:', error);

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

        // Send error message
        let errorMessage = '❌ *Error*\n\n';
        
        if (error.message.includes('404')) {
            errorMessage += 'QR API endpoint not found. Please check the URL format.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Invalid input. The text might be too long.';
        } else {
            errorMessage += error.message || 'Failed to generate QR code.';
        }

        await m.reply(errorMessage);
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['qr', 'qrcode'];
handler.tags = ['tools'];
handler.command = /^(qr|qrcode)$/i;
handler.saki = 1; // Consumes 1 SAKI

export default handler;