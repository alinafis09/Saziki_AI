// plugins/economy.js
// Complete Economy & RPG Leveling System for Saziki Bot
// Local JSON database - No external APIs required
// @author Saziki Bot Team
// Version: 2.0.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ==================== CONFIGURATION ====================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../database/economy.json');

// Ensure database directory exists
const DB_DIR = path.join(__dirname, '../database');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {} }, null, 2));
}

// ==================== DATABASE HANDLER ====================
class EconomyDB {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw);
        } catch (error) {
            console.error('Error loading economy database:', error);
            return { users: {} };
        }
    }

    save() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving economy database:', error);
        }
    }

    getUser(userId) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                xp: 0,
                level: 1,
                coins: 100, // Starting coins
                bank: 0,
                lastDaily: 0,
                lastMessage: 0,
                totalMessages: 0,
                joinedAt: Date.now()
            };
            this.save();
        }
        return this.data.users[userId];
    }

    updateUser(userId, updates) {
        const user = this.getUser(userId);
        Object.assign(user, updates);
        this.save();
        return user;
    }

    getTopUsers(limit = 10, sortBy = 'xp') {
        const users = Object.entries(this.data.users)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b[sortBy] - a[sortBy])
            .slice(0, limit);
        return users;
    }

    getGroupTop(groupId, participants, limit = 10) {
        // Get only users that are in this group
        const groupUsers = participants
            .map(p => p.id)
            .filter(id => this.data.users[id]);
        
        return groupUsers
            .map(id => ({ id, ...this.data.users[id] }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
    }
}

// Initialize database
const db = new EconomyDB();

// ==================== HELPER FUNCTIONS ====================
function calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getXpForLevel(level) {
    return (level - 1) * (level - 1) * 100;
}

function getXpProgress(xp) {
    const level = calculateLevel(xp);
    const currentLevelXp = getXpForLevel(level);
    const nextLevelXp = getXpForLevel(level + 1);
    const xpNeeded = nextLevelXp - currentLevelXp;
    const xpProgress = xp - currentLevelXp;
    return { level, currentLevelXp, nextLevelXp, xpNeeded, xpProgress };
}

function generateProgressBar(current, total, size = 10) {
    const percentage = Math.min(100, (current / total) * 100);
    const filled = Math.floor((percentage / 100) * size);
    const empty = size - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function msToTime(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'less than a minute';
}

// ==================== MAIN HANDLER ====================
let handler = async (m, { conn, usedPrefix, command, args, participants }) => {
    // Ensure user exists
    const user = db.getUser(m.sender);
    const isGroup = m.isGroup;

    // ========== BALANCE / WALLET COMMAND ==========
    if (command === 'balance' || command === 'bal' || command === 'wallet') {
        const target = m.mentionedJid[0] || m.sender;
        const targetUser = db.getUser(target);
        
        if (!targetUser) {
            return m.reply('❌ User not found in database.');
        }

        const name = target === m.sender ? 'Your' : `@${target.split('@')[0]}'s`;
        const progress = getXpProgress(targetUser.xp);
        const progressBar = generateProgressBar(progress.xpProgress, progress.xpNeeded, 15);

        const card = 
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `         💳 *BALANCE CARD* 💳\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 *User:* ${name}\n\n` +
            `📊 *Level Information*\n` +
            `├─ Level: ${targetUser.level}\n` +
            `├─ Total XP: ${formatNumber(targetUser.xp)}\n` +
            `├─ ${progressBar}\n` +
            `└─ ${formatNumber(progress.xpProgress)} / ${formatNumber(progress.xpNeeded)} XP\n\n` +
            `💰 *Financial Status*\n` +
            `├─ Wallet: $${formatNumber(targetUser.coins)}\n` +
            `├─ Bank: $${formatNumber(targetUser.bank)}\n` +
            `└─ Net Worth: $${formatNumber(targetUser.coins + targetUser.bank)}\n\n` +
            `📈 *Statistics*\n` +
            `├─ Messages: ${formatNumber(targetUser.totalMessages)}\n` +
            `└─ Member since: ${new Date(targetUser.joinedAt).toLocaleDateString()}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        await conn.sendMessage(m.chat, { 
            text: card,
            mentions: target === m.sender ? [] : [target]
        }, { quoted: m });
    }

    // ========== DAILY COMMAND ==========
    else if (command === 'daily') {
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - user.lastDaily < cooldown) {
            const remaining = cooldown - (now - user.lastDaily);
            return m.reply(
                `⏰ *Daily Reward Already Claimed*\n\n` +
                `Come back in *${msToTime(remaining)}*\n\n` +
                `_Be patient, good things come to those who wait!_`
            );
        }

        // Random reward between 100-500
        const reward = Math.floor(Math.random() * 401) + 100;
        const bonus = user.level * 10; // Level bonus
        const totalReward = reward + bonus;

        user.coins += totalReward;
        user.lastDaily = now;
        db.save();

        await m.reply(
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `         🎁 *DAILY REWARD* 🎁\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `💰 *Base Reward:* $${formatNumber(reward)}\n` +
            `✨ *Level Bonus:* $${formatNumber(bonus)}\n` +
            `💵 *Total:* $${formatNumber(totalReward)}\n\n` +
            `💳 *New Balance:* $${formatNumber(user.coins)}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `_Come back tomorrow for more!_`
        );
    }

    // ========== LEADERBOARD ==========
    else if (command === 'leaderboard' || command === 'lb' || command === 'top') {
        const limit = parseInt(args[0]) || 10;
        const sortBy = args[1] === 'xp' ? 'xp' : 'coins';
        
        let topUsers;
        if (isGroup) {
            topUsers = db.getGroupTop(m.chat, participants, limit);
        } else {
            topUsers = db.getTopUsers(limit, sortBy);
        }

        if (topUsers.length === 0) {
            return m.reply('❌ No users found in database.');
        }

        let leaderboard = 
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `         🏆 *LEADERBOARD* 🏆\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `*${isGroup ? 'Group' : 'Global'} Rankings*\n` +
            `*Sorting by:* ${sortBy === 'xp' ? '✨ Experience' : '💰 Coins'}\n\n`;

        for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const name = await conn.getName(user.id) || user.id.split('@')[0];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            leaderboard += `${medal} *${name}*\n`;
            
            if (sortBy === 'xp') {
                leaderboard += `   ├─ Level: ${user.level}\n`;
                leaderboard += `   └─ XP: ${formatNumber(user.xp)}\n\n`;
            } else {
                leaderboard += `   └─ 💰 $${formatNumber(user.coins)}\n\n`;
            }
        }

        leaderboard += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        await conn.sendMessage(m.chat, { text: leaderboard }, { quoted: m });
    }

    // ========== RANK COMMAND ==========
    else if (command === 'rank' || command === 'level') {
        const target = m.mentionedJid[0] || m.sender;
        const targetUser = db.getUser(target);
        
        const progress = getXpProgress(targetUser.xp);
        const progressBar = generateProgressBar(progress.xpProgress, progress.xpNeeded, 20);
        const percentage = ((progress.xpProgress / progress.xpNeeded) * 100).toFixed(1);

        const name = target === m.sender ? 'Your' : `@${target.split('@')[0]}'s`;
        const rankCard = 
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `              ⭐ *RANK CARD* ⭐\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 *${name} Rank*\n\n` +
            `📊 *Level:* ${targetUser.level}\n` +
            `✨ *Total XP:* ${formatNumber(targetUser.xp)}\n\n` +
            `📈 *Progress to Level ${targetUser.level + 1}*\n` +
            `[${progressBar}] ${percentage}%\n` +
            `├─ ${formatNumber(progress.xpProgress)} / ${formatNumber(progress.xpNeeded)} XP\n` +
            `└─ ${formatNumber(progress.xpNeeded - progress.xpProgress)} XP needed\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        await conn.sendMessage(m.chat, { 
            text: rankCard,
            mentions: target === m.sender ? [] : [target]
        }, { quoted: m });
    }

    // ========== TRANSFER COMMAND ==========
    else if (command === 'pay' || command === 'transfer') {
        if (args.length < 2) {
            return m.reply(
                `❌ *Invalid Format*\n\n` +
                `Usage: ${usedPrefix}pay @user amount\n` +
                `Example: ${usedPrefix}pay @user 1000`
            );
        }

        const target = m.mentionedJid[0];
        if (!target) {
            return m.reply('❌ Please tag the user you want to pay.');
        }

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Please enter a valid positive amount.');
        }

        if (target === m.sender) {
            return m.reply('❌ You cannot pay yourself.');
        }

        if (user.coins < amount) {
            return m.reply(
                `❌ *Insufficient Funds*\n\n` +
                `Your balance: $${formatNumber(user.coins)}\n` +
                `Amount needed: $${formatNumber(amount)}`
            );
        }

        // Get or create target user
        const targetUser = db.getUser(target);

        // Process transaction
        user.coins -= amount;
        targetUser.coins += amount;
        db.save();

        const senderName = await conn.getName(m.sender);
        const targetName = await conn.getName(target);

        await conn.sendMessage(m.chat, {
            text: 
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `         💸 *TRANSFER SUCCESSFUL* 💸\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `💵 *Amount:* $${formatNumber(amount)}\n` +
                `👤 *From:* ${senderName}\n` +
                `👥 *To:* @${target.split('@')[0]}\n\n` +
                `💳 *Your New Balance:* $${formatNumber(user.coins)}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            mentions: [target]
        }, { quoted: m });
    }
};

// ==================== XP HANDLER (AUTOMATIC REWARDS) ====================
handler.before = async (m, { conn }) => {
    // Ignore bot messages and non-group messages (optional)
    if (m.isBaileys || !m.text || m.fromMe) return;
    if (!m.isGroup) return; // Only give XP in groups

    // Get user
    const user = db.getUser(m.sender);
    
    // Prevent spam (cooldown between messages)
    const now = Date.now();
    if (now - user.lastMessage < 2000) return; // 2 second cooldown
    
    // Award XP and coins
    const xpGain = Math.floor(Math.random() * 11) + 10; // 10-20 XP
    const coinGain = 5; // 5 coins per message
    
    user.xp += xpGain;
    user.coins += coinGain;
    user.totalMessages += 1;
    user.lastMessage = now;
    
    // Check for level up
    const oldLevel = user.level;
    const newLevel = calculateLevel(user.xp);
    
    if (newLevel > oldLevel) {
        user.level = newLevel;
        
        // Level up bonus
        const levelBonus = newLevel * 50;
        user.coins += levelBonus;
        
        await conn.sendMessage(m.chat, {
            text: 
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `         🎉 *LEVEL UP!* 🎉\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `✨ *You reached level ${newLevel}!*\n` +
                `💰 *Bonus:* $${formatNumber(levelBonus)}\n\n` +
                `💳 *New Balance:* $${formatNumber(user.coins)}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`
        }, { quoted: m });
    }
    
    // Save periodically (every 10 messages or after level up)
    if (user.totalMessages % 10 === 0 || newLevel > oldLevel) {
        db.save();
    }
};

// ==================== COMMAND CONFIGURATION ====================
handler.help = ['balance', 'daily', 'leaderboard', 'rank', 'pay'];
handler.tags = ['economy', 'rpg'];
handler.command = /^(balance|bal|wallet|daily|leaderboard|lb|top|rank|level|pay|transfer)$/i;
handler.saki = false;

export default handler;;