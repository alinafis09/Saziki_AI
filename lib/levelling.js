// lib/levelling.js
// Professional Leveling System for Saziki Bot
// @author Saziki Bot Team
// Version: 2.0.0

// ==================== LEVELING CONFIGURATION ====================
const CONFIG = {
    baseExp: 100,          // Experience required for level 1
    growthFactor: 1.5,     // Exponential growth factor
    maxLevel: 1000,        // Maximum level
    minExpGain: 10,        // Minimum experience per message
    maxExpGain: 50,        // Maximum experience per message
    cooldownTime: 30000,   // 30 seconds cooldown between exp gains
    premiumMultiplier: 1.5, // Premium users get 50% more exp
    vipMultiplier: 2.0,     // VIP users get 100% more exp
};

// ==================== REWARDS CONFIGURATION ====================
const REWARDS = {
    // Random rewards for leveling up
    levelUpRewards: [
        { type: 'limit', amount: 5, chance: 30, message: ' +5 Limits' },
        { type: 'limit', amount: 10, chance: 20, message: ' +10 Limits' },
        { type: 'limit', amount: 15, chance: 10, message: ' +15 Limits' },
        { type: 'money', amount: 1000, chance: 25, message: ' +1,000 Coins' },
        { type: 'money', amount: 2500, chance: 15, message: ' +2,500 Coins' },
        { type: 'money', amount: 5000, chance: 5, message: ' +5,000 Coins' },
        { type: 'exp', amount: 100, chance: 20, message: ' +100 Bonus EXP' },
        { type: 'exp', amount: 250, chance: 10, message: ' +250 Bonus EXP' },
        { type: 'premium', days: 1, chance: 2, message: ' 1 Day Premium' },
        { type: 'premium', days: 3, chance: 1, message: ' 3 Days Premium' },
        { type: 'special', name: 'Mystery Box', chance: 5, message: ' Mystery Box' },
    ],
    
    // Special rewards for milestone levels
    milestoneRewards: {
        5: { message: ' *Beginner Achievement*', rewards: ['limit+10', 'money+500'] },
        10: { message: ' *Rookie Achievement*', rewards: ['limit+20', 'money+1000'] },
        25: { message: ' *Advanced Achievement*', rewards: ['limit+50', 'money+2500', 'exp+500'] },
        50: { message: ' *Expert Achievement*', rewards: ['limit+100', 'money+5000', 'premium+1'] },
        100: { message: ' *Master Achievement*', rewards: ['limit+200', 'money+10000', 'premium+3'] },
        250: { message: ' *Legend Achievement*', rewards: ['limit+500', 'money+25000', 'vip+7'] },
        500: { message: ' *Mythic Achievement*', rewards: ['limit+1000', 'money+50000', 'vip+30'] },
        1000: { message: ' *Immortal Achievement*', rewards: ['limit+5000', 'money+100000', 'vip+90'] },
    },
};

// ==================== RANKS & ROLES ====================
const RANKS = [
    { level: 0, emoji: '', name: 'Beginner', color: '#00FF00' },
    { level: 5, emoji: '', name: 'Novice', color: '#0000FF' },
    { level: 10, emoji: '', name: 'Apprentice', color: '#800080' },
    { level: 20, emoji: '', name: 'Warrior', color: '#FFFF00' },
    { level: 30, emoji: '', name: 'Knight', color: '#FF0000' },
    { level: 40, emoji: '', name: 'Champion', color: '#FF00FF' },
    { level: 50, emoji: '', name: 'Hero', color: '#FFD700' },
    { level: 60, emoji: '', name: 'Legend', color: '#00FF00' },
    { level: 70, emoji: '', name: 'Mythic', color: '#4B0082' },
    { level: 80, emoji: '', name: 'Divine', color: '#FFFFFF' },
    { level: 90, emoji: '', name: 'Immortal', color: '#000000' },
    { level: 100, emoji: '', name: 'God', color: '#FFD700' },
];

// ==================== CORE FUNCTIONS ====================

/**
 * Calculate experience required for a specific level
 * @param {number} level - Target level
 * @returns {number} - Experience required
 */
export function getExpRequired(level) {
    if (level <= 0) return 0;
    if (level > CONFIG.maxLevel) return Infinity;
    
    // Formula: baseExp * (growthFactor ^ (level - 1))
    return Math.floor(CONFIG.baseExp * Math.pow(CONFIG.growthFactor, level - 1));
}

/**
 * Calculate current level from experience points
 * @param {number} exp - Total experience points
 * @returns {number} - Current level
 */
export function getLevel(exp) {
    if (exp <= 0) return 0;
    
    let level = 1;
    while (level <= CONFIG.maxLevel) {
        if (exp < getExpRequired(level)) {
            return level - 1;
        }
        level++;
    }
    return CONFIG.maxLevel;
}

/**
 * Get level range information
 * @param {number} level - Current level
 * @returns {Object} - Level range info
 */
export function xpRange(level) {
    if (level < 0) level = 0;
    if (level >= CONFIG.maxLevel) {
        return {
            min: getExpRequired(CONFIG.maxLevel),
            max: Infinity,
            xp: Infinity,
        };
    }
    
    const min = getExpRequired(level);
    const max = getExpRequired(level + 1);
    
    return {
        min,
        max,
        xp: max - min,
    };
}

/**
 * Calculate experience needed for next level
 * @param {number} level - Current level
 * @param {number} exp - Current experience
 * @returns {number} - Experience needed
 */
export function expNeeded(level, exp) {
    const { max } = xpRange(level);
    if (max === Infinity) return 0;
    return max - exp;
}

/**
 * Calculate level progress percentage
 * @param {number} level - Current level
 * @param {number} exp - Current experience
 * @returns {number} - Progress percentage
 */
export function levelProgress(level, exp) {
    const { min, max } = xpRange(level);
    if (max === Infinity) return 100;
    
    const currentExp = exp - min;
    const requiredExp = max - min;
    
    if (requiredExp <= 0) return 100;
    return Math.floor((currentExp / requiredExp) * 100);
}

/**
 * Get rank information based on level
 * @param {number} level - Current level
 * @returns {Object} - Rank info
 */
export function getRank(level) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (level >= RANKS[i].level) {
            return RANKS[i];
        }
    }
    return RANKS[0];
}

/**
 * Get role title based on level
 * @param {number} level - Current level
 * @returns {string} - Role title with emoji
 */
export function getRole(level) {
    const rank = getRank(level);
    return `${rank.emoji} ${rank.name}`;
}

/**
 * Get experience multiplier based on user status
 * @param {boolean} isPremium - Is user premium
 * @param {boolean} isVip - Is user VIP
 * @returns {number} - Experience multiplier
 */
export function getExpMultiplier(isPremium = false, isVip = false) {
    let multiplier = 1.0;
    
    if (isVip) multiplier *= CONFIG.vipMultiplier;
    else if (isPremium) multiplier *= CONFIG.premiumMultiplier;
    
    return multiplier;
}

/**
 * Generate random experience gain
 * @param {number} multiplier - Experience multiplier
 * @returns {number} - Random experience amount
 */
export function getRandomExp(multiplier = 1.0) {
    const base = Math.floor(Math.random() * (CONFIG.maxExpGain - CONFIG.minExpGain + 1)) + CONFIG.minExpGain;
    return Math.floor(base * multiplier);
}

/**
 * Format level progress bar
 * @param {number} level - Current level
 * @param {number} exp - Current experience
 * @param {number} length - Progress bar length
 * @returns {string} - Formatted progress bar
 */
export function getProgressBar(level, exp, length = 10) {
    const progress = levelProgress(level, exp);
    const filled = Math.floor((progress / 100) * length);
    const empty = length - filled;
    
    const filledBar = ''.repeat(filled);
    const emptyBar = ''.repeat(empty);
    
    return `${filledBar}${emptyBar} ${progress}%`;
}

/**
 * Generate random level up reward
 * @returns {Object} - Reward object
 */
function generateRandomReward() {
    const totalChance = REWARDS.levelUpRewards.reduce((sum, r) => sum + r.chance, 0);
    const random = Math.random() * totalChance;
    
    let cumulative = 0;
    for (const reward of REWARDS.levelUpRewards) {
        cumulative += reward.chance;
        if (random <= cumulative) {
            return { ...reward }; // Clone reward
        }
    }
    
    return REWARDS.levelUpRewards[0];
}

/**
 * Get milestone reward for level
 * @param {number} level - Level reached
 * @returns {Object|null} - Milestone reward or null
 */
export function getMilestoneReward(level) {
    return REWARDS.milestoneRewards[level] || null;
}

/**
 * Apply reward to user
 * @param {Object} user - User object
 * @param {Object} reward - Reward object
 * @returns {Object} - Updated user and reward message
 */
export function applyReward(user, reward) {
    const userData = user;
    let rewardMessage = '';
    
    switch (reward.type) {
        case 'limit':
            userData.limit = (userData.limit || 0) + reward.amount;
            rewardMessage = reward.message;
            break;
            
        case 'money':
            userData.money = (userData.money || 0) + reward.amount;
            rewardMessage = reward.message;
            break;
            
        case 'exp':
            userData.exp = (userData.exp || 0) + reward.amount;
            rewardMessage = reward.message;
            break;
            
        case 'premium':
            const days = reward.days || 1;
            const ms = days * 24 * 60 * 60 * 1000;
            userData.premiumTime = Math.max(userData.premiumTime || 0, Date.now() + ms);
            rewardMessage = reward.message;
            break;
            
        case 'special':
            userData.specialItems = userData.specialItems || [];
            userData.specialItems.push({
                name: reward.name,
                obtained: Date.now(),
            });
            rewardMessage = reward.message;
            break;
    }
    
    return { user: userData, rewardMessage };
}

/**
 * Add experience to user with level up detection
 * @param {Object} user - User object from database
 * @param {number} amount - Experience to add
 * @param {Object} options - Options
 * @returns {Promise<Object>} - Result with level up info
 */
export async function addExp(user, amount, options = {}) {
    const {
        conn = null,
        m = null,
        isPremium = false,
        isVip = false,
    } = options;
    
    const oldLevel = user.level || 0;
    const oldRank = getRole(oldLevel);
    
    // Apply multiplier
    const multiplier = getExpMultiplier(isPremium, isVip);
    const finalAmount = Math.floor(amount * multiplier);
    
    // Add experience
    user.exp = (user.exp || 0) + finalAmount;
    
    // Recalculate level
    const newLevel = getLevel(user.exp);
    user.level = newLevel;
    
    const leveledUp = newLevel > oldLevel;
    const result = {
        user,
        leveledUp,
        oldLevel,
        newLevel,
        expAdded: finalAmount,
        multiplier,
        rewards: [],
        rewardMessages: [],
    };
    
    // Handle level up
    if (leveledUp && conn && m) {
        // Generate random reward
        const randomReward = generateRandomReward();
        const { user: updatedUser, rewardMessage } = applyReward(user, randomReward);
        
        result.user = updatedUser;
        result.rewards.push(randomReward);
        result.rewardMessages.push(rewardMessage);
        
        // Check for milestone reward
        const milestoneReward = getMilestoneReward(newLevel);
        if (milestoneReward) {
            // Parse milestone rewards
            for (const rewardStr of milestoneReward.rewards) {
                const [type, value] = rewardStr.split('+');
                const amount = parseInt(value);
                
                if (type === 'limit') {
                    updatedUser.limit = (updatedUser.limit || 0) + amount;
                    result.rewardMessages.push(` +${amount} Limits (Milestone)`);
                } else if (type === 'money') {
                    updatedUser.money = (updatedUser.money || 0) + amount;
                    result.rewardMessages.push(` +${amount} Coins (Milestone)`);
                } else if (type === 'exp') {
                    updatedUser.exp = (updatedUser.exp || 0) + amount;
                    result.rewardMessages.push(` +${amount} EXP (Milestone)`);
                } else if (type === 'premium') {
                    const days = amount;
                    const ms = days * 24 * 60 * 60 * 1000;
                    updatedUser.premiumTime = Math.max(updatedUser.premiumTime || 0, Date.now() + ms);
                    result.rewardMessages.push(` +${days} Day Premium (Milestone)`);
                } else if (type === 'vip') {
                    const days = amount;
                    const ms = days * 24 * 60 * 60 * 1000;
                    updatedUser.vipTime = Math.max(updatedUser.vipTime || 0, Date.now() + ms);
                    result.rewardMessages.push(` +${days} Days VIP (Milestone)`);
                }
            }
            
            result.rewards.push({ type: 'milestone', level: newLevel });
        }
        
        // Send level up notification
        const newRank = getRole(newLevel);
        const progressBar = getProgressBar(newLevel, user.exp);
        const { xp: xpNeeded } = xpRange(newLevel);
        
        let levelUpMessage = ` *LEVEL UP!* \n`;
        levelUpMessage += `\n`;
        levelUpMessage += `  *User:* @${m.sender.split('@')[0]}\n`;
        levelUpMessage += `  *Level:* ${oldLevel}  ${newLevel}\n`;
        levelUpMessage += ` ${oldRank}  ${newRank}\n`;
        levelUpMessage += `\n`;
        levelUpMessage += `  *Progress:*\n`;
        levelUpMessage += ` ${progressBar}\n`;
        levelUpMessage += `  *EXP:* ${user.exp}/${xpNeeded === Infinity ? 'MAX' : user.exp + xpNeeded}\n`;
        levelUpMessage += `\n`;
        
        if (result.rewardMessages.length > 0) {
            levelUpMessage += `  *Rewards Received:*\n`;
            result.rewardMessages.forEach(msg => {
                levelUpMessage += ` • ${msg}\n`;
            });
            levelUpMessage += `\n`;
        }
        
        levelUpMessage += `\n`;
        levelUpMessage += `\n *Keep up the great work!*`;
        
        await conn.sendMessage(m.chat, {
            text: levelUpMessage,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: ' LEVEL UP!',
                    body: `Congratulations! You reached level ${newLevel}`,
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    }
    
    return result;
}

/**
 * Get user leveling statistics
 * @param {Object} user - User object
 * @returns {Object} - Leveling statistics
 */
export function getLevelStats(user) {
    const level = user.level || 0;
    const exp = user.exp || 0;
    const rank = getRank(level);
    const role = getRole(level);
    const progress = levelProgress(level, exp);
    const progressBar = getProgressBar(level, exp);
    const { min, max, xp } = xpRange(level);
    const expNeededForNext = expNeeded(level, exp);
    
    return {
        level,
        exp,
        rank,
        role,
        progress,
        progressBar,
        currentLevelExp: min,
        nextLevelExp: max,
        expNeeded: expNeededForNext,
        xpRange: xp,
        isMaxLevel: level >= CONFIG.maxLevel,
    };
}

/**
 * Check if user can gain experience (cooldown)
 * @param {Object} user - User object
 * @returns {boolean} - True if can gain exp
 */
export function canGainExp(user) {
    const lastExp = user.lastExp || 0;
    const now = Date.now();
    return (now - lastExp) >= CONFIG.cooldownTime;
}

/**
 * Update last exp gain time
 * @param {Object} user - User object
 */
export function updateLastExp(user) {
    user.lastExp = Date.now();
}

// ==================== EXPORTS ====================
export default {
    CONFIG,
    REWARDS,
    RANKS,
    getExpRequired,
    getLevel,
    xpRange,
    expNeeded,
    levelProgress,
    getRank,
    getRole,
    getExpMultiplier,
    getRandomExp,
    getProgressBar,
    getMilestoneReward,
    applyReward,
    addExp,
    getLevelStats,
    canGainExp,
    updateLastExp,
};