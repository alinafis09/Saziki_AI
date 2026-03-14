// plugins/gemini.js
// Professional Gemini AI Plugin for Saziki WhatsApp Bot
// @author Saziki Bot Team
// Version: 2.0.0

import fetch from 'node-fetch';

// ==================== CONFIGURATION ====================
const BOT_NAME = 'Saziki Bot';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// ==================== GEMINI CORE ====================
const gemini = {
    getNewCookie: async function () {
        try {
            const r = await fetch("https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                "body": "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
                "method": "POST"
            });
            
            console.log('✅ Successfully retrieved a new cookie.');
            const cookieHeader = r.headers.get('set-cookie');
            if (!cookieHeader) throw new Error('Could not find "set-cookie" header in the response.');
            return cookieHeader.split(';')[0];
        } catch (error) {
            console.error('❌ Failed to get cookie:', error.message);
            throw new Error('Unable to establish connection with Gemini. Please try again later.');
        }
    },

    ask: async function (prompt, previousId = null, retryCount = 0) {
        // Input validation
        if (typeof prompt !== "string" || !prompt?.trim()?.length) {
            throw new Error(`Invalid prompt provided. Please enter a valid question.`);
        }

        // Add system instruction to make AI aware of its identity
        const systemPrompt = `You are ${BOT_NAME}, a helpful WhatsApp assistant. 
You are friendly, concise, and provide accurate information. 
Respond in the same language the user uses.
Keep responses under 2000 characters when possible.
Format responses nicely for WhatsApp using *bold* for emphasis.
Current user query: ${prompt}`;

        let resumeArray = null;
        let cookie = null;

        // Parse previous session if exists
        if (previousId) {
            try {
                // Safe base64 decoding with error handling
                const decoded = Buffer.from(previousId, 'base64').toString('utf-8');
                const j = JSON.parse(decoded);
                resumeArray = j.newResumeArray;
                cookie = j.cookie;
                
                // Check if cookie is still valid (not expired)
                if (j.timestamp && (Date.now() - j.timestamp > SESSION_TIMEOUT)) {
                    console.log('Session expired, starting new conversation');
                    cookie = null;
                    resumeArray = null;
                }
            } catch (e) {
                console.error("Failed to parse previous session:", e.message);
                previousId = null; 
            }
        }
        
        const headers = {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "x-goog-ext-525001261-jspb": "[1,null,null,null,\"9ec249fc9ad08861\",null,null,null,[4]]",
            "cookie": cookie || await this.getNewCookie()
        };

        const b = [[systemPrompt], ["en-US"], resumeArray];
        const a = [null, JSON.stringify(b)];
        const obj = { "f.req": JSON.stringify(a) };
        const body = new URLSearchParams(obj);
        
        try {
            const response = await fetch(`https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c`, {
                headers,
                body,
                'method': 'post',
                timeout: 15000 // 15 second timeout
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No error details');
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText.substring(0, 100)}`);
            }
            
            const data = await response.text();
            const match = data.matchAll(/^\d+\n(.+?)\n/gm);
            
            // Robust parsing logic
            const chunks = Array.from(match, m => m[1]);
            let text, newResumeArray;
            let found = false;

            // Iterate through response chunks from the end to find the valid one
            for (const chunk of chunks.reverse()) {
                try {
                    const realArray = JSON.parse(chunk);
                    const parse1 = JSON.parse(realArray[0][2]);
                    
                    // Check if the expected data structure for the answer exists
                    if (parse1 && parse1[4] && parse1[4][0] && parse1[4][0][1] && typeof parse1[4][0][1][0] === 'string') {
                        newResumeArray = [...parse1[1], parse1[4][0][0]];
                        
                        // Get raw text and clean it for WhatsApp
                        let rawText = parse1[4][0][1][0];
                        
                        // Clean the response for WhatsApp
                        text = cleanWhatsAppText(rawText);
                        
                        found = true;
                        break;
                    }
                } catch (e) {
                    // Ignore chunks that don't parse correctly
                    continue;
                }
            }

            if (!found) {
                throw new Error("Could not parse the response from the API. The response structure may have changed.");
            }
            
            // Create session with timestamp for expiration
            const sessionData = {
                newResumeArray,
                cookie: headers.cookie,
                timestamp: Date.now()
            };
            
            const id = Buffer.from(JSON.stringify(sessionData)).toString('base64');
            return { text, id };
            
        } catch (error) {
            // Retry logic
            if (retryCount < MAX_RETRIES) {
                console.log(`Retry attempt ${retryCount + 1} for prompt: ${prompt.substring(0, 50)}...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return this.ask(prompt, previousId, retryCount + 1);
            }
            throw error;
        }
    }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Clean and format text for WhatsApp
 */
function cleanWhatsAppText(text) {
    if (!text) return '';
    
    let cleaned = text
        // Fix bold formatting (convert **text** to *text* for WhatsApp)
        .replace(/\*\*(.+?)\*\*/g, '*$1*')
        
        // Handle code blocks - convert to simple formatted text
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `\`\`\`${lang || ''}\n${code.trim()}\n\`\`\``;
        })
        
        // Handle inline code
        .replace(/`([^`]+)`/g, '`$1`')
        
        // Fix multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        
        // Remove any unsupported markdown
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)') // Convert links to text
        .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough
        .replace(/_(.+?)_/g, '$1'); // Remove italic (WhatsApp doesn't support it well)
    
    return cleaned.trim();
}

/**
 * Clean up old sessions
 */
function cleanupSessions() {
    const now = Date.now();
    for (const [user, sessionId] of Object.entries(geminiSessions)) {
        try {
            const decoded = Buffer.from(sessionId, 'base64').toString('utf-8');
            const session = JSON.parse(decoded);
            if (session.timestamp && (now - session.timestamp > SESSION_TIMEOUT)) {
                delete geminiSessions[user];
                console.log(`Cleaned up expired session for user: ${user}`);
            }
        } catch (e) {
            // If session can't be parsed, remove it
            delete geminiSessions[user];
        }
    }
}

// ==================== SESSION MANAGEMENT ====================

const geminiSessions = {};

// Run cleanup every 15 minutes
setInterval(cleanupSessions, 15 * 60 * 1000);

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Input validation
    if (!text) {
        await m.reply(
            `🤖 *SAZIKI-AI* \n\n` +
            `Please enter your question.\n\n` +
            `*Example:* ${usedPrefix + command} What is the capital of Morocco?\n` +
            `*Example:* ${usedPrefix + command} --reset (to clear conversation history)\n\n` +
            `_Powered by Google Gemini_`
        );
        return;
    }

    // Handle reset command
    if (text.toLowerCase() === '--reset' || text.toLowerCase() === 'reset') {
        delete geminiSessions[m.sender];
        await m.reply(
            `🤖 *SAZIKI-AI* \n\n` +
            `✅ Conversation history has been reset.\n\n` +
            `_Powered by Google Gemini_`
        );
        return;
    }
    
    try {
        // Send typing indicator
        await conn.sendPresenceUpdate('composing', m.chat);
        
        // Send thinking message
        const waitMsg = await m.reply('🤔 *SAZIKI-AI is thinking...*');
        
        // Get previous session if exists
        const previousId = geminiSessions[m.sender];
        
        // Get response from Gemini with retry logic
        const result = await gemini.ask(text, previousId);
        
        // Store session for context
        geminiSessions[m.sender] = result.id;
        
        // Format the final response with header and footer
        const formattedResponse = `🤖 *SAZIKI-AI* \n\n${result.text}\n\n_Powered by Google Gemini_`;
        
        // Send the response
        await conn.sendMessage(m.chat, {
            text: formattedResponse,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403118420523@newsletter',
                    newsletterName: BOT_NAME,
                    serverMessageId: -1
                }
            }
        }, { quoted: m });
        
        // Remove thinking message
        await conn.sendMessage(m.chat, {
            delete: waitMsg.key
        });

    } catch (e) {
        console.error('❌ Gemini Error:', e);
        
        // User-friendly error message
        let errorMessage = 'Sorry, an error occurred while processing your request.';
        
        if (e.message.includes('cookie') || e.message.includes('connection')) {
            errorMessage = 'Unable to connect to Gemini. Please try again later.';
        } else if (e.message.includes('timed out')) {
            errorMessage = 'Request timed out. Please try again.';
        } else if (e.message.includes('HTTP 429')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (e.message.includes('HTTP 403')) {
            errorMessage = 'Access denied. The service might be temporarily unavailable.';
        }
        
        await m.reply(
            `🤖 *SAZIKI-AI* \n\n` +
            `❌ ${errorMessage}\n\n` +
            `*Technical details:* ${e.message.substring(0, 100)}\n\n` +
            `_Powered by Google Gemini_`
        );
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['gemini', 'ai', 'ask'];
handler.tags = ['ai', 'saziki'];
handler.command = /^(gemini|ai|ask|سؤال)$/i;
handler.saki = false; // Set to false if you don't want limits

export default handler;