// main.js - مع Pairing Code بطريقة مضمونة
// Saziki Smart Bot - AI-Powered WhatsApp Bot

import './config.js';
import crypto from 'crypto';

// Fix for crypto
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
import Spinnies from 'spinnies';
import readline from 'readline';
import { handleAIMessage } from './ai_handler.js';

const spinnies = new Spinnies();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

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
    
    // ✅ نفس إعدادات الكود الناجح
    const connectionOptions = {
        pairingCode: true, // ✅ مهم جداً لتفعيل Pairing Code
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(message.interactiveResponse || message.buttonsMessage || message.templateMessage || message.listMessage);
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {}
                            },
                            ...message
                        }
                    }
                };
            }
            return message;
        },
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
        },
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        browser: ['Linux', 'Chrome', ''],
        version: [2, 3000, 1033105955], // ✅ نفس الإصدار المستخدم في الكود الناجح
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        markOnlineOnConnect: true
    };
    
    sock = makeWASocket(connectionOptions);
    
    // ==================== PAIRING CODE - نفس الطريقة الناجحة ====================
    if (!sock.authState.creds.registered) {
        console.log(chalk.yellow('\n🔐 Generating Pairing Code...\n'));
        
        spinnies.add('pairing', { 
            text: `Requesting code for: ${phoneNumber}`, 
            color: "blue"
        });
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                spinnies.succeed('pairing', { 
                    text: `Your Pairing Code is ready!`, 
                    successColor: "green"
                });
                
                console.log(chalk.green.bold(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🔐 YOUR PAIRING CODE IS READY                   ║
║                                                              ║
║                    ${chalk.yellow.bold(code)}                   
║                                                              ║
║   📱 Steps to connect:                                       ║
║   1. Open WhatsApp on your phone                            ║
║   2. Go to Settings > Linked Devices                        ║
║   3. Tap "Link a Device"                                    ║
║   4. Enter the code shown above                             ║
║                                                              ║
║   ⏱️  Code expires in 60 seconds                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`));
            } catch (error) {
                spinnies.fail('pairing', { 
                    text: `Failed to get pairing code: ${error.message}`, 
                    failColor: "red"
                });
                console.log(chalk.red('\n❌ Error getting pairing code.'));
                console.log(chalk.yellow('💡 Make sure your number is valid and has WhatsApp installed.\n'));
                process.exit(1);
            }
        }, 3000);
    }
    
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
            } else {
                console.log(chalk.red('❌ Max reconnection attempts reached.'));
            }
        }
    });
    
    // ==================== CREDENTIALS HANDLER ====================
    sock.ev.on('creds.update', saveCreds);
    
    // ==================== MESSAGE HANDLER ====================
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        
        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        const isFromMe = msg.key.fromMe;
        
        // Only respond to private messages
        if (isGroup) return;
        if (isFromMe) return;
        
        // Extract message text and type
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

startBot().catch(console.error);

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
