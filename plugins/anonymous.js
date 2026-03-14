// plugins/anonymous.js
// Anonymous Messaging System for Saziki Bot - Multi-Send Edition
// @author Saziki Bot Team
// Version: 2.0.0

// ==================== CONFIGURATION ====================
const MAX_BLAST_COUNT = 50;
const MIN_DELAY_SECONDS = 2;
const MAX_DELAY_SECONDS = 5;
const PROGRESS_BAR_LENGTH = 15;

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate random delay between min and max seconds
 * @returns {number} - Delay in milliseconds
 */
function getRandomDelay() {
    const min = MIN_DELAY_SECONDS * 1000;
    const max = MAX_DELAY_SECONDS * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate progress bar for multi-send
 * @param {number} current - Current count
 * @param {number} total - Total count
 * @returns {string} - Progress bar
 */
function getMultiProgressBar(current, total) {
    const percent = (current / total) * 100;
    const filled = Math.floor((percent / 100) * PROGRESS_BAR_LENGTH);
    const empty = PROGRESS_BAR_LENGTH - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `${filledBar}${emptyBar}`;
}

/**
 * Parse number with X placeholders
 * @param {string} input - Number with X's (e.g., 21266123XXXX)
 * @returns {Object} - Prefix and X count
 */
function parseNumberWithX(input) {
    // Remove any non-digit/X characters
    const clean = input.replace(/[^0-9X]/gi, '').toUpperCase();
    
    if (!clean.includes('X')) {
        return { prefix: clean, xCount: 0 };
    }
    
    const xIndex = clean.indexOf('X');
    const prefix = clean.substring(0, xIndex);
    const xCount = clean.length - xIndex;
    
    return { prefix, xCount };
}

/**
 * Generate random number from prefix with X placeholders
 * @param {string} prefix - Number prefix
 * @param {number} xCount - Number of X's to replace
 * @returns {string} - Complete random number
 */
function generateRandomNumber(prefix, xCount) {
    let number = prefix;
    for (let i = 0; i < xCount; i++) {
        number += Math.floor(Math.random() * 10);
    }
    return number;
}

/**
 * Generate unique random numbers
 * @param {string} prefix - Number prefix
 * @param {number} xCount - Number of X's
 * @param {number} count - How many numbers to generate
 * @returns {Array<string>} - Array of unique numbers
 */
function generateUniqueNumbers(prefix, xCount, count) {
    const numbers = new Set();
    
    // Calculate max possible combinations (10^xCount)
    const maxCombinations = Math.pow(10, xCount);
    
    if (count > maxCombinations) {
        throw new Error(`Cannot generate ${count} unique numbers. Maximum possible: ${maxCombinations}`);
    }
    
    while (numbers.size < count) {
        const number = generateRandomNumber(prefix, xCount);
        numbers.add(number);
    }
    
    return Array.from(numbers);
}

/**
 * Validate phone number format (international)
 * @param {string} number - Phone number to validate
 * @returns {boolean} - True if valid
 */
function validatePhoneNumber(number) {
    // Remove any non-digit characters
    const clean = number.replace(/\D/g, '');
    
    // Check international format: 212XXXXXXXXX (minimum 10 digits)
    const regex = /^\d{10,15}$/;
    return regex.test(clean);
}

/**
 * Format phone number to JID
 * @param {string} number - Phone number
 * @returns {string} - JID format
 */
function formatJID(number) {
    const clean = number.replace(/\D/g, '');
    return `${clean}@s.whatsapp.net`;
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Initialize anonymous session storage
    conn.anonymous = conn.anonymous || {};
    
    // ========== LEAVE ANONYMOUS ==========
    if (command === 'leaveanon') {
        const sessionId = m.sender;
        
        if (conn.anonymous[sessionId]) {
            const partner = conn.anonymous[sessionId];
            
            await conn.sendMessage(m.chat, {
                text: '👋 *You left the anonymous session*\n\n_Your partner has been notified._'
            }, { quoted: m });
            
            if (conn.anonymous[partner]) {
                await conn.sendMessage(partner, {
                    text: '👋 *Your anonymous partner has left the chat*\n\n_Use .anon to start a new session._'
                });
                delete conn.anonymous[partner];
            }
            
            delete conn.anonymous[sessionId];
        } else {
            await m.reply('❌ *No active anonymous session found*');
        }
        return;
    }
    
    // ========== HANDLE REPLIES ==========
    if (m.quoted && conn.anonymous[m.sender]) {
        const partner = conn.anonymous[m.sender];
        
        const quotedMsg = m.quoted;
        const isAnonymousReply = quotedMsg.text?.includes('*Anonymous Message*') || 
                                 quotedMsg.text?.includes('anonymous');
        
        if (isAnonymousReply && partner) {
            await m.reply('📨 *Forwarding your reply anonymously...*');
            
            let replyText = m.text || 'No text content';
            
            // Handle media replies
            if (m.quoted?.message) {
                const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'];
                for (const type of mediaTypes) {
                    if (m.quoted.message[type]) {
                        const mediaMsg = {
                            [type]: m.quoted.message[type],
                            caption: replyText
                        };
                        
                        await conn.sendMessage(partner, {
                            text: `📨 *Anonymous Reply:*\n\n_Someone replied to your anonymous message_`
                        });
                        
                        await conn.sendMessage(partner, mediaMsg);
                        return;
                    }
                }
            }
            
            // Text only reply
            await conn.sendMessage(partner, {
                text: `📨 *Anonymous Reply:*\n\n${replyText}\n\n_Reply to this message to respond anonymously_`
            });
            
            await m.reply('✅ *Your reply has been sent anonymously*');
            return;
        }
    }
    
    // ========== SEND ANONYMOUS MESSAGE (SINGLE OR MULTI) ==========
    if (command === 'anon') {
        // Check if user is already in a session
        if (conn.anonymous[m.sender]) {
            return m.reply(
                '⚠️ *You already have an active anonymous session*\n\n' +
                `Use *.leaveanon* to end your current session first.`
            );
        }
        
        // Parse input: .anon number | message | count
        let [targetNumber, ...rest] = text.split('|').map(v => v.trim());
        
        if (!targetNumber) {
            return m.reply(
                `📱 *Anonymous Messaging System*\n\n` +
                `*Single Send:*\n` +
                `• ${usedPrefix}anon 212600000000 | Hello\n\n` +
                `*Multi-Send with Random Numbers:*\n` +
                `• ${usedPrefix}anon 21266123XXXX | Hello | 10\n\n` +
                `*Format:*\n` +
                `• Use X for random digits\n` +
                `• Max ${MAX_BLAST_COUNT} messages at once`
            );
        }
        
        // Parse message and count
        let message = '';
        let count = 1;
        
        if (rest.length === 1) {
            message = rest[0];
        } else if (rest.length >= 2) {
            message = rest[0];
            count = parseInt(rest[1]);
            
            if (isNaN(count) || count < 1) {
                return m.reply('❌ *Invalid count*\n\nPlease specify a valid number (1-50)');
            }
            
            if (count > MAX_BLAST_COUNT) {
                return m.reply(`❌ *Count too high*\n\nMaximum allowed: ${MAX_BLAST_COUNT} messages`);
            }
        }
        
        if (!message) {
            return m.reply('❌ *No message provided*');
        }
        
        // Check for X placeholders
        const { prefix, xCount } = parseNumberWithX(targetNumber);
        
        // Validate based on mode
        if (xCount > 0) {
            if (count === 1) {
                // Single send with X should generate one random number
                count = 1;
            }
            
            if (!prefix || prefix.length < 6) {
                return m.reply('❌ *Invalid number format*\n\nPrefix must be at least 6 digits (e.g., 21266123XXXX)');
            }
        } else {
            // Normal single number validation
            if (!validatePhoneNumber(targetNumber)) {
                return m.reply(
                    '❌ *Invalid phone number format*\n\n' +
                    'Please use international format:\n' +
                    '• 212XXXXXXXXX\n' +
                    '• 21266123XXXX (for random generation)'
                );
            }
        }
        
        const waitMsg = await m.reply('⚡ *Initializing anonymous blast...*');
        
        try {
            let numbersToSend = [];
            
            if (xCount > 0) {
                // Generate random numbers
                await conn.sendMessage(m.chat, {
                    text: `🎲 *Generating ${count} random numbers...*\n\nTargeting prefix: \`${prefix}${'X'.repeat(xCount)}\``,
                    edit: waitMsg.key
                });
                
                numbersToSend = generateUniqueNumbers(prefix, xCount, count);
                
                // Show generated numbers
                const preview = numbersToSend.slice(0, 5).map(n => `• \`${n}\``).join('\n');
                const moreText = numbersToSend.length > 5 ? `\n• ... and ${numbersToSend.length - 5} more` : '';
                
                await conn.sendMessage(m.chat, {
                    text: `📋 *Generated Numbers:*\n${preview}${moreText}`,
                    edit: waitMsg.key
                });
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                numbersToSend = [targetNumber.replace(/\D/g, '')];
            }
            
            // Start sending
            const startTime = Date.now();
            let successCount = 0;
            let failCount = 0;
            
            for (let i = 0; i < numbersToSend.length; i++) {
                const currentNumber = numbersToSend[i];
                const currentJid = formatJID(currentNumber);
                
                // Update progress
                const progressBar = getMultiProgressBar(i, numbersToSend.length);
                const progressText = 
                    `📤 *Anonymous Blast in Progress*\n\n` +
                    `[${progressBar}] ${i}/${numbersToSend.length} completed\n\n` +
                    `• Current: \`${currentNumber}\`\n` +
                    `• Success: ${successCount}\n` +
                    `• Failed: ${failCount}\n\n` +
                    `_Sending..._`;
                
                await conn.sendMessage(m.chat, {
                    text: progressText,
                    edit: waitMsg.key
                });
                
                try {
                    // Check if recipient is on WhatsApp
                    const isOnWhatsApp = await conn.onWhatsApp(currentJid);
                    
                    if (!isOnWhatsApp || !isOnWhatsApp[0]?.exists) {
                        failCount++;
                        continue;
                    }
                    
                    // Send anonymous message
                    const anonymousMessage = 
                        `📱 *Anonymous Message*\n\n` +
                        `${message}\n\n` +
                        `_This message was sent anonymously._\n` +
                        `_Reply to this message to respond back._`;
                    
                    await conn.sendMessage(currentJid, {
                        text: anonymousMessage,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363403118420523@newsletter',
                                newsletterName: 'Saziki Anonymous',
                                serverMessageId: -1
                            }
                        }
                    });
                    
                    successCount++;
                    
                    // Create session only for single send
                    if (numbersToSend.length === 1) {
                        conn.anonymous[m.sender] = currentJid;
                        conn.anonymous[currentJid] = m.sender;
                    }
                    
                } catch (error) {
                    console.error(`Failed to send to ${currentNumber}:`, error);
                    failCount++;
                }
                
                // Random delay between sends (except for last message)
                if (i < numbersToSend.length - 1) {
                    const delay = getRandomDelay();
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            
            // Final report
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
            const finalProgressBar = getMultiProgressBar(numbersToSend.length, numbersToSend.length);
            
            let reportText = 
                `✅ *Anonymous Blast Completed*\n\n` +
                `[${finalProgressBar}] ${successCount}/${numbersToSend.length} delivered\n\n` +
                `• Total time: ${totalTime}s\n` +
                `• Successful: ${successCount}\n` +
                `• Failed: ${failCount}\n\n`;
            
            if (numbersToSend.length === 1 && successCount === 1) {
                reportText += `_Your identity remains hidden._\n_If they reply, you'll receive it here._`;
            } else {
                reportText += `_Multi-send completed. No sessions created for blast messages._`;
            }
            
            await conn.sendMessage(m.chat, {
                text: reportText,
                edit: waitMsg.key
            });
            
        } catch (error) {
            console.error('Anonymous blast error:', error);
            
            let errorMessage = '❌ *Failed to send anonymous messages*\n\n';
            
            if (error.message.includes('Maximum possible')) {
                errorMessage += error.message;
            } else {
                errorMessage += 'An unexpected error occurred. Please try again.';
            }
            
            await conn.sendMessage(m.chat, {
                text: errorMessage,
                edit: waitMsg.key
            });
        }
        return;
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['anon', 'leaveanon'];
handler.tags = ['tools', 'privacy'];
handler.command = /^(anon|leaveanon)$/i;
handler.saki = true;

export default handler;;