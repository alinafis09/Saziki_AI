// plugins/group_recap.js
// Group Journalist Plugin for Saziki Bot
// Creates daily summaries of group conversations using Gemini AI
// @author Saziki Bot Team
// Version: 1.0.0

import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import axios from 'axios';
import moment from 'moment-timezone';

// ==================== CONFIGURATION ====================
const GEMINI_API_KEY = 'AIzaSyArE3fvGVHmfvqFank5c84rPGf7qJV6K8Q'; // Replace with your Gemini API key
const DATA_DIR = './data/recaps';
const MAX_MESSAGES = 500;
const AUTO_RECAP_TIME = '59 23 * * *'; // 23:59 every day
const TIMEZONE = 'Africa/Casablanca';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==================== DATA STORAGE CLASS ====================
class GroupJournal {
    constructor(groupId) {
        this.groupId = groupId;
        this.filePath = path.join(DATA_DIR, `${groupId}.json`);
        this.messages = this.loadMessages();
    }

    loadMessages() {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error(`Error loading messages for ${this.groupId}:`, error);
        }
        return [];
    }

    saveMessages() {
        try {
            // Keep only last MAX_MESSAGES * 2 messages to maintain context
            if (this.messages.length > MAX_MESSAGES * 2) {
                this.messages = this.messages.slice(-MAX_MESSAGES * 2);
            }
            fs.writeFileSync(this.filePath, JSON.stringify(this.messages, null, 2));
        } catch (error) {
            console.error(`Error saving messages for ${this.groupId}:`, error);
        }
    }

    addMessage(message) {
        const entry = {
            id: message.key.id,
            sender: message.pushName || message.participant || message.key.participant || message.key.remoteJid,
            senderNumber: message.key.participant?.split('@')[0] || message.sender?.split('@')[0] || 'unknown',
            text: message.text || message.message?.conversation || 
                  message.message?.extendedTextMessage?.text || '[Media Message]',
            timestamp: message.messageTimestamp || Date.now() / 1000,
            type: this.getMessageType(message)
        };

        // Avoid duplicates
        const exists = this.messages.some(m => m.id === entry.id);
        if (!exists) {
            this.messages.push(entry);
            this.saveMessages();
        }
    }

    getMessageType(message) {
        if (message.message?.imageMessage) return 'image';
        if (message.message?.videoMessage) return 'video';
        if (message.message?.audioMessage) return 'audio';
        if (message.message?.stickerMessage) return 'sticker';
        if (message.message?.documentMessage) return 'document';
        return 'text';
    }

    getRecentMessages(limit = MAX_MESSAGES) {
        return this.messages.slice(-limit);
    }

    clearOldMessages(days = 7) {
        const cutoff = Date.now() / 1000 - (days * 24 * 60 * 60);
        this.messages = this.messages.filter(m => m.timestamp > cutoff);
        this.saveMessages();
    }

    getStats() {
        const now = Date.now() / 1000;
        const today = now - (24 * 60 * 60);
        const todayMessages = this.messages.filter(m => m.timestamp > today);
        
        // Count messages per user
        const userStats = {};
        this.messages.forEach(m => {
            const sender = m.sender || 'unknown';
            userStats[sender] = (userStats[sender] || 0) + 1;
        });

        // Find most active user
        let mvp = { sender: 'unknown', count: 0 };
        Object.entries(userStats).forEach(([sender, count]) => {
            if (count > mvp.count) {
                mvp = { sender, count };
            }
        });

        return {
            totalMessages: this.messages.length,
            todayMessages: todayMessages.length,
            uniqueUsers: Object.keys(userStats).length,
            mvp: mvp.sender,
            mvpCount: mvp.count
        };
    }

    formatChatHistory(messages) {
        return messages.map(m => {
            const time = moment.unix(m.timestamp).tz(TIMEZONE).format('HH:mm');
            return `[${time}] ${m.sender || 'Unknown'}: ${m.text}`;
        }).join('\n');
    }
}

// ==================== GEMINI AI INTEGRATION ====================
class GeminiJournalist {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.model = 'gemini-1.5-flash';
    }

    async generateRecap(chatHistory, groupName, stats) {
        try {
            const systemInstruction = `You are Saziki Journalist, a witty AI that summarizes WhatsApp group chats.
Your task: Create a fun, engaging daily newspaper-style recap of the conversation.

Write in this exact format:

📰 SAZIKI DAILY GAZETTE
📅 Date: ${moment().tz(TIMEZONE).format('dddd, MMMM Do YYYY')}
👥 Group: ${groupName}

📝 *HIGHLIGHTS OF THE DAY*
• [First highlight - interesting topic or event]
• [Second highlight - funny moment or discussion]
• [Third highlight - important announcement or debate]
• [Fourth highlight - memorable quote or interaction]

🏆 *MVP OF THE DAY*
@[username] - [reason why they were most active/funny/interesting]

🎭 *GROUP MOOD*
[Emoji + 2-3 word description of the overall vibe]

📊 *STATS CORNER*
• Total messages: ${stats.todayMessages}
• Active members: ${stats.uniqueUsers}
• Top contributor: ${stats.mvpCount} messages

Style guidelines:
- Keep it FUNNY and ENGAGING
- Use emojis appropriately
- Be slightly sarcastic but friendly
- Highlight inside jokes if any
- Make it feel like a real newspaper
- Maximum 4 bullet points in highlights
- Total response under 1500 characters`;

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `${systemInstruction}\n\nHere is today's chat history:\n\n${chatHistory}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 1000,
                        topP: 0.95,
                        topK: 40
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                return response.data.candidates[0].content.parts[0].text.trim();
            } else {
                throw new Error('Invalid response from Gemini');
            }
        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            
            // Fallback recap if AI fails
            return this.generateFallbackRecap(groupName, stats);
        }
    }

    generateFallbackRecap(groupName, stats) {
        const moods = ['🤔 Philosophical', '😂 Chaotic', '😴 Sleepy', '🔥 Lit', '🎉 Celebratory', '🤓 Nerdy'];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        
        return `📰 SAZIKI DAILY GAZETTE
📅 Date: ${moment().tz(TIMEZONE).format('dddd, MMMM Do YYYY')}
👥 Group: ${groupName}

📝 *HIGHLIGHTS OF THE DAY*
• ${stats.todayMessages} messages were exchanged today
• ${stats.uniqueUsers} brave souls participated in the chaos
• Someone probably said something funny (we weren't paying attention)
• The bot is still learning to be a journalist

🏆 *MVP OF THE DAY*
@MVP - For typing the most messages (${stats.mvpCount} times!)

🎭 *GROUP MOOD*
${randomMood} - The vibe was interesting

📊 *STATS CORNER*
• Total messages: ${stats.todayMessages}
• Active members: ${stats.uniqueUsers}
• Top contributor: ${stats.mvpCount} messages

*Powered by Saziki AI (Fallback Mode)*`;
    }
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, command, text }) => {
    // Check if in a group
    if (!m.isGroup) {
        return m.reply('❌ This command can only be used in groups!');
    }

    // Initialize journal for this group
    const journal = new GroupJournal(m.chat);
    const journalist = new GeminiJournalist(GEMINI_API_KEY);

    // Handle manual recap command
    if (command === 'recap' || command === 'summary' || command === 'daily') {
        // Check if user wants specific number of messages
        let messageCount = MAX_MESSAGES;
        if (text && !isNaN(parseInt(text))) {
            messageCount = Math.min(parseInt(text), MAX_MESSAGES);
        }

        await m.reply('📝 *Generating daily recap...*\n\n_This may take a moment_');

        try {
            // Get recent messages
            const recentMessages = journal.getRecentMessages(messageCount);
            
            if (recentMessages.length === 0) {
                return m.reply('❌ No messages found to generate recap.');
            }

            // Get group metadata for name
            const groupMetadata = await conn.groupMetadata(m.chat);
            const groupName = groupMetadata.subject;

            // Format chat history
            const chatHistory = journal.formatChatHistory(recentMessages);
            
            // Get stats
            const stats = journal.getStats();

            // Generate recap
            const recap = await journalist.generateRecap(chatHistory, groupName, stats);

            // Send recap
            await conn.sendMessage(m.chat, {
                text: recap,
                contextInfo: {
                    externalAdReply: {
                        title: '📰 SAZIKI DAILY GAZETTE',
                        body: groupName,
                        thumbnailUrl: 'https://i.ibb.co/7N9LkqM/newspaper-icon.png',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error('Recap generation error:', error);
            await m.reply('❌ Failed to generate recap. Please try again later.');
        }
    }
};

// ==================== MESSAGE LISTENER ====================

// This will be called for every message
handler.before = async (m, { conn }) => {
    // Only process group messages
    if (!m.isGroup) return;
    
    // Ignore bot's own messages
    if (m.isBaileys || m.fromMe) return;
    
    try {
        // Initialize journal for this group
        const journal = new GroupJournal(m.chat);
        
        // Store the message
        journal.addMessage(m);
        
    } catch (error) {
        console.error('Error storing message:', error);
    }
};

// ==================== AUTO-RECAP SCHEDULER ====================

// Store active intervals
const recapIntervals = {};

// Function to schedule auto-recaps for a group
function scheduleAutoRecap(conn, groupId) {
    if (recapIntervals[groupId]) return; // Already scheduled
    
    console.log(`📰 Scheduling auto-recap for group: ${groupId}`);
    
    // Schedule daily recap at 23:59
    recapIntervals[groupId] = cron.schedule(AUTO_RECAP_TIME, async () => {
        try {
            console.log(`🕛 Running auto-recap for group: ${groupId}`);
            
            const journal = new GroupJournal(groupId);
            const journalist = new GeminiJournalist(GEMINI_API_KEY);
            
            // Get group metadata
            const groupMetadata = await conn.groupMetadata(groupId);
            const groupName = groupMetadata.subject;
            
            // Get today's messages
            const recentMessages = journal.getRecentMessages(MAX_MESSAGES);
            
            if (recentMessages.length === 0) {
                console.log(`No messages today for group: ${groupId}`);
                return;
            }
            
            // Format and generate recap
            const chatHistory = journal.formatChatHistory(recentMessages);
            const stats = journal.getStats();
            
            const recap = await journalist.generateRecap(chatHistory, groupName, stats);
            
            // Send recap to group
            await conn.sendMessage(groupId, {
                text: recap,
                contextInfo: {
                    externalAdReply: {
                        title: '📰 SAZIKI DAILY GAZETTE',
                        body: groupName,
                        thumbnailUrl: 'https://i.ibb.co/7N9LkqM/newspaper-icon.png',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
            
            // Clear old messages (keep last 7 days)
            journal.clearOldMessages(7);
            
            console.log(`✅ Auto-recap sent for group: ${groupId}`);
            
        } catch (error) {
            console.error(`Auto-recap error for group ${groupId}:`, error);
        }
    }, {
        timezone: TIMEZONE
    });
}

// Initialize auto-recaps for all groups when bot starts
handler.init = async (conn) => {
    console.log('📰 Initializing Group Journalist System...');
    
    // This would need to be integrated with your bot's main connection
    // You might need to get all group IDs from your database
    
    console.log('✅ Group Journalist System ready!');
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['recap', 'summary', 'daily'];
handler.tags = ['group', 'tools'];
handler.command = /^(recap|summary|daily)$/i;
handler.saki = true;
handler.group = true;

export default handler;;