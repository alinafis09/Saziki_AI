// main.js
// Saziki Smart Bot - AI-Powered WhatsApp Bot

import './config.js';
import crypto from 'crypto';

// Fix for crypto in Node.js environment
if (!globalThis.crypto) {
    globalThis.crypto = {
        getRandomValues: (arr) => crypto.randomBytes(arr.length),
        subtle: crypto.subtle,
        randomUUID: crypto.randomUUID
    };
}

import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { handleAIMessage } from './ai_handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(__dirname, global.authFile || 'SazikiSession');

// ==================== CONFIGURATION ====================
let phoneNumber = global.botnumber;
if (!phoneNumber) {
    console.error(chalk.red('❌ ERROR: No phone number configured in config.js'));
    console.error(chalk.yellow('Please set: global.botnumber = "212656551615"'));
    process.exit(1);
}

phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
console.log(chalk.cyan(`📱 Bot will use number: ${phoneNumber}`));

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
}

let sock = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 10000;

// ==================== CREATE SOCKET ====================

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    
    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
        },
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 60000,
        generateHighQualityLinkPreview: false,
        markOnlineOnConnect: true,
        version,
        syncFullHistory: false,
        mobile: true // ✅ مهم لتفعيل Pairing Code
    });
    
    // ==================== CONNECTION HANDLER ====================
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            reconnectAttempts = 0;
            console.log(chalk.green('\n✅ Smart Bot Connected Successfully!'));
            console.log(chalk.cyan(`📱 Bot JID: ${sock.user.id}`));
            console.log(chalk.yellow('\n🤖 Bot is now online and ready!'));
            console.log(chalk.white('📝 It will automatically respond to all private messages\n'));
        }
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(chalk.yellow(`🔄 Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));
                setTimeout(startBot, RECONNECT_DELAY);
            } else if (statusCode === DisconnectReason.loggedOut) {
                console.log(chalk.red('❌ Bot logged out. Please delete session folder and restart.'));
                process.exit(1);
            } else {
                console.log(chalk.red('❌ Max reconnection attempts reached.'));
                process.exit(1);
            }
        }
    });
    
    // ==================== CREDENTIALS HANDLER ====================
    sock.ev.on('creds.update', saveCreds);
    
    // ==================== PAIRING CODE - FIXED VERSION ====================
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                console.log(chalk.yellow('\n🔄 Requesting pairing code...'));
                
                // ✅ الطريقة الصحيحة لطلب Pairing Code
                const code = await sock.requestPairingCode(phoneNumber);
                
                // تنسيق الكود ليكون سهل القراءة
                const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                
                console.log(chalk.green.bold(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🔐 YOUR PAIRING CODE IS READY                   ║
║                                                              ║
║                    ${chalk.yellow.bold(formattedCode)}                   
║                                                              ║
║   📱 Steps to connect:                                       ║
║   1. Open WhatsApp on your phone                            ║
║   2. Go to Settings > Linked Devices                        ║
║   3. Tap "Link a Device"                                    ║
║   4. Enter this code manually                               ║
║                                                              ║
║   ⏱️  Code expires in 60 seconds                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`));
            } catch (error) {
                console.error(chalk.red('\n❌ Failed to get pairing code:'));
                console.error(chalk.red(`   Error: ${error.message}`));
                console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
                console.log(chalk.white('   1. Make sure the phone number format is correct'));
                console.log(chalk.white('   2. Delete the session folder and try again'));
                console.log(chalk.white('   3. Check if the bot number is registered on WhatsApp\n'));
                
                // إعادة المحاولة مرة واحدة فقط
                try {
                    console.log(chalk.yellow('🔄 Retrying once...'));
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const retryCode = await sock.requestPairingCode(phoneNumber);
                    const formattedRetryCode = retryCode?.match(/.{1,4}/g)?.join('-') || retryCode;
                    
                    console.log(chalk.green.bold(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🔐 YOUR PAIRING CODE IS READY                   ║
║                                                              ║
║                    ${chalk.yellow.bold(formattedRetryCode)}                   
║                                                              ║
║   📱 Enter this code in WhatsApp > Linked Devices           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`));
                } catch (retryError) {
                    console.error(chalk.red('❌ Pairing code failed. Please check your phone number and internet connection.'));
                    console.error(chalk.yellow('💡 Alternative: Use QR code by setting printQRInTerminal: true'));
                    process.exit(1);
                }
            }
        }, 2000);
    }
    
    // ==================== MESSAGE HANDLER ====================
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        
        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        const isFromMe = msg.key.fromMe;
        
        if (isGroup) return;
        if (isFromMe) return;
        
        let messageText = null;
        let messageType = null;
        
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
        
        if (messageType === 'text' || messageType === 'image') {
            console.log(chalk.cyan(`\n📩 Message from: ${sender.split('@')[0]}`));
            console.log(chalk.white(`   Type: ${messageType}`));
            if (messageText) console.log(chalk.white(`   Text: ${messageText.substring(0, 100)}`));
            
            await sock.sendPresenceUpdate('composing', sender);
            await handleAIMessage(sock, msg, sender, messageText, messageType);
        }
    });
    
    return sock;
}

// ==================== START BOT ====================

console.log(chalk.magenta(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🤖 𝗦𝗔𝗭𝗜𝗞𝗜 𝗦𝗠𝗔𝗥𝗧 𝗕𝗢𝗧
║   🧠 Powered by NVIDIA Kimi-K2.5 AI
║   📱 Zero-Command | Auto-Reply | Vision Capable
║                                                                   ║
║   📝 The bot will automatically respond to all private messages   ║
║   🖼️ Supports images and text                                    ║
║   🌐 Multi-language (Arabic, English, French, etc.)              ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`));

startBot().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n🛑 Shutting down...'));
    if (sock) {
        await sock.logout();
        sock.end();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log(chalk.yellow('\n🛑 Shutting down...'));
    if (sock) {
        await sock.logout();
        sock.end();
    }
    process.exit(0);
});
