// main.js - مع إصلاح كامل لـ Railway
// Saziki Smart Bot - AI-Powered WhatsApp Bot

// ==================== FIX FOR RAILWAY DEPLOYMENT ====================
import { File, Blob } from 'buffer';

// Fix File API for undici
if (!globalThis.File) {
    globalThis.File = File;
}
if (!globalThis.Blob) {
    globalThis.Blob = Blob;
}
if (!globalThis.FormData) {
    globalThis.FormData = class FormData {
        constructor() { 
            this.data = new Map(); 
        }
        append(key, value) { 
            this.data.set(key, value); 
        }
        get(key) { 
            return this.data.get(key); 
        }
        has(key) { 
            return this.data.has(key); 
        }
        delete(key) { 
            this.data.delete(key); 
        }
        forEach(callback) {
            this.data.forEach((value, key) => callback(value, key));
        }
    };
}

import './config.js';
import crypto from 'crypto';
import { webcrypto } from 'crypto';

// Fix for crypto in Node.js environment
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}
if (!globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues = (arr) => crypto.randomBytes(arr.length);
}
if (!globalThis.crypto.subtle) {
    globalThis.crypto.subtle = webcrypto.subtle;
}
if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => crypto.randomUUID();
}

// ==================== IMPORTS ====================
import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { handleAIMessage } from './ai_handler.js';

// ==================== SETUP ====================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(__dirname, global.authFile || 'SazikiSession');

// ==================== CONFIGURATION ====================
let phoneNumber = global.botnumber;
if (!phoneNumber) {
    console.error(chalk.red('❌ ERROR: No phone number configured in config.js'));
    console.error(chalk.yellow('Please set: global.botnumber = "212624052666"'));
    process.exit(1);
}

phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
console.log(chalk.cyan(`📱 Bot configured for number: ${phoneNumber}`));

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
    console.log(chalk.gray(`📁 Session directory created: ${SESSION_DIR}`));
}

let sock = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 10000;

// ==================== CREATE SOCKET ====================

async function startBot() {
    try {
        console.log(chalk.yellow('🔄 Initializing bot...'));
        
        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
        const { version } = await fetchLatestBaileysVersion();
        
        console.log(chalk.gray(`📦 Baileys version: ${version.join('.')}`));
        
        sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
            },
            printQRInTerminal: false,
            logger: P({ level: 'silent' }),
            browser: ['Saziki Bot', 'Chrome', '1.0.0'],
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 60000,
            generateHighQualityLinkPreview: false,
            markOnlineOnConnect: true,
            version,
            connectTimeoutMs: 60000,
            qrTimeout: 60000
        });
        
        // ==================== CONNECTION HANDLER WITH QR ====================
        sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
            // عرض QR Code عند توفره
            if (qr) {
                console.clear();
                console.log(chalk.yellow.bold('\n╔══════════════════════════════════════════════════════════════╗'));
                console.log(chalk.yellow.bold('║                    📱 SCAN QR CODE                           ║'));
                console.log(chalk.yellow.bold('╚══════════════════════════════════════════════════════════════╝\n'));
                
                // عرض QR Code في الـ Terminal
                qrcode.generate(qr, { small: true });
                
                console.log(chalk.cyan('\n📌 Instructions:'));
                console.log(chalk.white('  1. Open WhatsApp on your phone'));
                console.log(chalk.white('  2. Go to Settings > Linked Devices'));
                console.log(chalk.white('  3. Tap "Link a Device"'));
                console.log(chalk.white('  4. Scan the QR Code above'));
                console.log(chalk.gray('\n⏳ Waiting for scan... (This may take up to 60 seconds)\n'));
            }
            
            if (connection === 'open') {
                reconnectAttempts = 0;
                console.clear();
                console.log(chalk.green.bold('\n╔══════════════════════════════════════════════════════════════╗'));
                console.log(chalk.green.bold('║               ✅ BOT CONNECTED SUCCESSFULLY                  ║'));
                console.log(chalk.green.bold('╚══════════════════════════════════════════════════════════════╝\n'));
                console.log(chalk.cyan(`📱 Bot JID: ${sock.user.id}`));
                console.log(chalk.cyan(`📞 Number: ${sock.user.id.split(':')[0]}`));
                console.log(chalk.yellow('\n🤖 Bot is now online and ready!'));
                console.log(chalk.white('📝 Auto-reply to all private messages is active\n'));
                
                // إرسال إشعار للبوت بأنه يعمل
                try {
                    await sock.sendMessage(sock.user.id, { 
                        text: `✅ Bot Started Successfully!\n📱 ${phoneNumber}\n🕐 ${new Date().toLocaleString()}` 
                    });
                } catch (e) {}
            }
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log(chalk.yellow(`\n📡 Connection closed. Status: ${statusCode || 'unknown'}`));
                
                if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(chalk.yellow(`🔄 Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));
                    setTimeout(() => {
                        startBot().catch(err => {
                            console.error(chalk.red('Reconnection error:'), err.message);
                        });
                    }, RECONNECT_DELAY);
                } else if (statusCode === DisconnectReason.loggedOut) {
                    console.log(chalk.red('\n❌ Bot logged out.'));
                    console.log(chalk.yellow('💡 Solution: Delete the session folder and restart the bot'));
                    console.log(chalk.gray(`   Session folder: ${SESSION_DIR}`));
                } else {
                    console.log(chalk.red('\n❌ Max reconnection attempts reached.'));
                }
            }
        });
        
        // ==================== CREDENTIALS HANDLER ====================
        sock.ev.on('creds.update', saveCreds);
        
        // ==================== MESSAGE HANDLER ====================
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message) return;
                
                const sender = msg.key.remoteJid;
                const isGroup = sender.endsWith('@g.us');
                const isFromMe = msg.key.fromMe;
                
                // تجاهل المجموعات والرسائل من البوت نفسه
                if (isGroup) return;
                if (isFromMe) return;
                
                let messageText = null;
                let messageType = null;
                
                // استخراج النص من الرسالة
                if (msg.message.conversation) {
                    messageType = 'text';
                    messageText = msg.message.conversation;
                }
                else if (msg.message.extendedTextMessage?.text) {
                    messageType = 'text';
                    messageText = msg.message.extendedTextMessage.text;
                }
                else if (msg.message.imageMessage) {
                    messageType = 'image';
                    messageText = msg.message.imageMessage.caption || null;
                }
                else if (msg.message.videoMessage) {
                    messageType = 'video';
                    messageText = msg.message.videoMessage.caption || null;
                }
                else if (msg.message.documentMessage) {
                    messageType = 'document';
                    messageText = msg.message.documentMessage.caption || null;
                }
                
                // معالجة الرسائل النصية والصور فقط
                if (messageType === 'text' || messageType === 'image') {
                    const userNumber = sender.split('@')[0];
                    console.log(chalk.cyan(`\n📩 Message from: ${userNumber}`));
                    console.log(chalk.white(`   Type: ${messageType}`));
                    if (messageText) {
                        console.log(chalk.white(`   Text: ${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}`));
                    }
                    
                    // إظهار مؤشر الكتابة
                    await sock.sendPresenceUpdate('composing', sender);
                    
                    // معالجة الرسالة بالذكاء الاصطناعي
                    await handleAIMessage(sock, msg, sender, messageText, messageType);
                    
                    // إيقاف مؤشر الكتابة
                    await sock.sendPresenceUpdate('paused', sender);
                }
            } catch (error) {
                console.error(chalk.red('Message handler error:'), error.message);
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error(chalk.red('Bot startup error:'), error.message);
        console.error(chalk.gray(error.stack));
        
        // إعادة المحاولة بعد خطأ
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(chalk.yellow(`🔄 Retrying startup... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));
            setTimeout(() => {
                startBot().catch(err => {
                    console.error(chalk.red('Retry error:'), err.message);
                });
            }, RECONNECT_DELAY);
        }
    }
}

// ==================== START BOT ====================

console.clear();
console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║              🤖 𝗦𝗔𝗭𝗜𝗞𝗜 𝗦𝗠𝗔𝗥𝗧 𝗕𝗢𝗧                            ║
║              🧠 Powered by NVIDIA Kimi-K2.5 AI                    ║
║              📱 Auto-Reply | Vision AI | Multi-language           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`));

console.log(chalk.gray(`🚀 Starting bot on ${new Date().toLocaleString()}`));
console.log(chalk.gray(`📁 Session directory: ${SESSION_DIR}`));
console.log(chalk.gray(`🖥️ Platform: ${process.platform} | Node: ${process.version}`));
console.log(chalk.gray('⏳ Initializing connection...\n'));

startBot().catch(error => {
    console.error(chalk.red('\n❌ Fatal error:'), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
});

// ==================== GRACEFUL SHUTDOWN ====================
const shutdown = async (signal) => {
    console.log(chalk.yellow(`\n🛑 Received ${signal}. Shutting down gracefully...`));
    if (sock) {
        try {
            await sock.logout();
            sock.end();
            console.log(chalk.green('✅ Bot disconnected successfully'));
        } catch (error) {
            console.error(chalk.red('Error during shutdown:'), error.message);
        }
    }
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ==================== UNCAUGHT ERRORS ====================
process.on('uncaughtException', (error) => {
    console.error(chalk.red('❌ Uncaught Exception:'), error.message);
    console.error(chalk.gray(error.stack));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('❌ Unhandled Rejection:'), reason);
});

// ==================== KEEP ALIVE FOR RAILWAY ====================
// Railway يحتاج إلى HTTP server للـ health check
import http from 'http';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'online',
        bot: sock?.user?.id || 'not connected',
        timestamp: new Date().toISOString()
    }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(chalk.gray(`🌐 Health check server running on port ${PORT}`));
});

console.log(chalk.green('\n✨ Bot initialization complete!\n'));
