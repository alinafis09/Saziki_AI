// src/libraries/saki.js
// Saki Points System - العملة الجديدة للبوت
// @author Saziki Bot Team
// Version: 1.0.0

// ==================== CONFIGURATION ====================
const SAKI_CONFIG = {
    // الحدود الافتراضية
    defaultSaki: 100, // كل مستخدم جديد يحصل على 100 ساكي
    premiumBonus: 50, // المستخدمين المميزين يحصلون على 50 إضافية
    vipBonus: 100, // VIP يحصلون على 100 إضافية
    
    // الحد الأقصى للتخزين
    maxSaki: 9999999,
    
    // وقت تجديد الساكي اليومي (بالملي ثانية)
    resetTime: 24 * 60 * 60 * 1000, // 24 ساعة
    
    // مكافآت يومية
    dailyReward: {
        normal: 20,
        premium: 40,
        vip: 80
    },
    
    // أسعار العمليات
    commandCost: {
        default: 1,
        premium: 0, // بريميوم مجاني
        vip: 0, // VIP مجاني
        special: {
            download: 2,
            ai: 3,
            game: 1,
            tools: 1,
            sticker: 2,
            convert: 1
        }
    },
    
    // مكافآت المستويات
    levelRewards: {
        5: 50,
        10: 100,
        25: 250,
        50: 500,
        100: 1000,
        250: 2500,
        500: 5000,
        1000: 10000
    }
};

// ==================== CORE FUNCTIONS ====================

/**
 * الحصول على الساكي الأقصى للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @returns {number} - الساكي الأقصى
 */
export function getMaxSaki(user) {
    if (!user) return SAKI_CONFIG.maxSaki;
    return SAKI_CONFIG.maxSaki;
}

/**
 * الحصول على الساكي الحالي للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @returns {number} - الساكي الحالي
 */
export function getCurrentSaki(user) {
    return user?.saki || 0;
}

/**
 * التحقق من توفر الساكي
 * @param {Object} user - بيانات المستخدم
 * @param {number} amount - الكمية المطلوبة
 * @returns {boolean} - هل يتوفر ساكي كافٍ
 */
export function hasEnoughSaki(user, amount = 1) {
    if (!user) return false;
    
    // المستخدمين المميزين لا يستهلكون ساكي
    if (user.vipTime > Date.now() || user.premiumTime > Date.now()) {
        return true;
    }
    
    return (user.saki || 0) >= amount;
}

/**
 * استهلاك الساكي
 * @param {Object} user - بيانات المستخدم
 * @param {number} amount - الكمية المراد استهلاكها
 * @param {string} commandType - نوع الأمر
 * @returns {Object} - نتيجة الاستهلاك
 */
export function consumeSaki(user, amount = 1, commandType = 'default') {
    if (!user) {
        return {
            success: false,
            message: 'User not found',
            remaining: 0
        };
    }
    
    // المستخدمين المميزين لا يستهلكون ساكي
    if (user.vipTime > Date.now()) {
        return {
            success: true,
            message: 'VIP users have unlimited Saki',
            remaining: Infinity,
            consumed: 0,
            isVip: true
        };
    }
    
    if (user.premiumTime > Date.now()) {
        return {
            success: true,
            message: 'Premium users have unlimited Saki',
            remaining: Infinity,
            consumed: 0,
            isPremium: true
        };
    }
    
    // تحديد تكلفة الأمر حسب النوع
    let cost = amount;
    if (commandType !== 'default') {
        cost = SAKI_CONFIG.commandCost.special[commandType] || amount;
    }
    
    const currentSaki = user.saki || 0;
    
    if (currentSaki < cost) {
        return {
            success: false,
            message: `Insufficient Saki. Need ${cost}, have ${currentSaki}`,
            remaining: currentSaki,
            needed: cost - currentSaki
        };
    }
    
    user.saki = currentSaki - cost;
    
    return {
        success: true,
        message: `Consumed ${cost} Saki`,
        remaining: user.saki,
        consumed: cost
    };
}

/**
 * إضافة ساكي للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {number} amount - الكمية المراد إضافتها
 * @param {string} reason - سبب الإضافة
 * @returns {Object} - نتيجة الإضافة
 */
export function addSaki(user, amount = 1, reason = 'manual') {
    if (!user) {
        return {
            success: false,
            message: 'User not found',
            newSaki: 0
        };
    }
    
    const oldSaki = user.saki || 0;
    const maxSaki = getMaxSaki(user);
    
    // لا يمكن تجاوز الحد الأقصى
    const newSaki = Math.min(oldSaki + amount, maxSaki);
    user.saki = newSaki;
    
    const added = newSaki - oldSaki;
    
    return {
        success: true,
        message: `Added ${added} Saki`,
        oldSaki,
        newSaki,
        added,
        reason,
        isFull: newSaki >= maxSaki
    };
}

/**
 * إعادة تعيين الساكي اليومي
 * @param {Object} user - بيانات المستخدم
 * @returns {Object} - نتيجة إعادة التعيين
 */
export function resetDailySaki(user) {
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        };
    }
    
    const oldSaki = user.saki || 0;
    user.saki = SAKI_CONFIG.defaultSaki;
    user.lastReset = Date.now();
    
    return {
        success: true,
        message: 'Daily Saki reset',
        oldSaki,
        newSaki: SAKI_CONFIG.defaultSaki,
        gained: SAKI_CONFIG.defaultSaki - oldSaki
    };
}

/**
 * الحصول على المكافأة اليومية
 * @param {Object} user - بيانات المستخدم
 * @returns {Object} - نتيجة المكافأة
 */
export function claimDailySaki(user) {
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        };
    }
    
    const now = Date.now();
    const lastClaim = user.lastDailySaki || 0;
    
    // التحقق من إمكانية المطالبة
    if (now - lastClaim < SAKI_CONFIG.resetTime) {
        const remaining = SAKI_CONFIG.resetTime - (now - lastClaim);
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        
        return {
            success: false,
            message: `Daily reward already claimed. Next claim in ${hours}h ${minutes}m`,
            remaining
        };
    }
    
    // تحديد مبلغ المكافأة حسب نوع المستخدم
    let rewardAmount = SAKI_CONFIG.dailyReward.normal;
    if (user.vipTime > now) {
        rewardAmount = SAKI_CONFIG.dailyReward.vip;
    } else if (user.premiumTime > now) {
        rewardAmount = SAKI_CONFIG.dailyReward.premium;
    }
    
    // إضافة المكافأة
    const result = addSaki(user, rewardAmount, 'daily_reward');
    user.lastDailySaki = now;
    
    return {
        success: true,
        message: `Daily reward claimed: +${rewardAmount} Saki`,
        ...result
    };
}

/**
 * مكافأة رفع المستوى
 * @param {Object} user - بيانات المستخدم
 * @param {number} newLevel - المستوى الجديد
 * @returns {Object} - نتيجة المكافأة
 */
export function rewardLevelUp(user, newLevel) {
    if (!user) return null;
    
    const reward = SAKI_CONFIG.levelRewards[newLevel];
    if (!reward) return null;
    
    return addSaki(user, reward, `level_up_${newLevel}`);
}

/**
 * حساب تكلفة أمر معين
 * @param {string} commandType - نوع الأمر
 * @param {Object} user - بيانات المستخدم
 * @returns {number} - التكلفة
 */
export function getCommandCost(commandType = 'default', user = null) {
    if (user) {
        if (user.vipTime > Date.now() || user.premiumTime > Date.now()) {
            return 0;
        }
    }
    
    return SAKI_CONFIG.commandCost.special[commandType] || SAKI_CONFIG.commandCost.default;
}

/**
 * الحصول على إحصائيات الساكي للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @returns {Object} - إحصائيات الساكي
 */
export function getSakiStats(user) {
    if (!user) return null;
    
    const current = user.saki || 0;
    const max = getMaxSaki(user);
    const percent = (current / max) * 100;
    
    // إنشاء شريط التقدم
    const barLength = 15;
    const filled = Math.floor((percent / 100) * barLength);
    const empty = barLength - filled;
    const progressBar = '💰'.repeat(filled) + '💸'.repeat(empty);
    
    // حساب وقت المكافأة اليومية
    const lastDaily = user.lastDailySaki || 0;
    const nextDaily = lastDaily + SAKI_CONFIG.resetTime;
    const timeUntilDaily = Math.max(0, nextDaily - Date.now());
    const dailyHours = Math.floor(timeUntilDaily / (60 * 60 * 1000));
    const dailyMinutes = Math.floor((timeUntilDaily % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
        current,
        max,
        percent: percent.toFixed(1),
        progressBar,
        remaining: max - current,
        
        daily: {
            last: lastDaily,
            next: nextDaily,
            timeUntil: timeUntilDaily,
            hours: dailyHours,
            minutes: dailyMinutes,
            formatted: `${dailyHours}h ${dailyMinutes}m`,
            canClaim: timeUntilDaily <= 0
        },
        
        isPremium: user.premiumTime > Date.now(),
        isVip: user.vipTime > Date.now()
    };
}

/**
 * تنسيق معلومات الساكي كنص
 * @param {Object} user - بيانات المستخدم
 * @returns {string} - نص منسق
 */
export function formatSakiInfo(user) {
    const stats = getSakiStats(user);
    if (!stats) return 'No Saki data available';
    
    let info = `╭━━━❰💰 *SAKI SYSTEM* 💰❱━━━╮\n`;
    info += `┃\n`;
    info += `┃ 📊 *Balance:* ${stats.current.toLocaleString()} / ${stats.max.toLocaleString()} SAKI\n`;
    info += `┃ 📈 *Progress:* ${stats.progressBar}\n`;
    info += `┃ 🎯 *${stats.percent}% Complete*\n`;
    info += `┃\n`;
    
    if (stats.isVip) {
        info += `┃ 👑 *VIP Status:* Free commands\n`;
    } else if (stats.isPremium) {
        info += `┃ 💎 *Premium Status:* Free commands\n`;
    } else {
        info += `┃ 💰 *Command Cost:* 1 SAKI per command\n`;
    }
    
    info += `┃ 🎁 *Daily Reward:* ${stats.daily.canClaim ? 'Available now!' : `in ${stats.daily.formatted}`}\n`;
    info += `┃\n`;
    info += `╰━━━━━━━━━━━━━━━━╯`;
    
    return info;
}

// ==================== EXPORTS ====================
export default {
    SAKI_CONFIG,
    getMaxSaki,
    getCurrentSaki,
    hasEnoughSaki,
    consumeSaki,
    addSaki,
    resetDailySaki,
    claimDailySaki,
    rewardLevelUp,
    getCommandCost,
    getSakiStats,
    formatSakiInfo
};