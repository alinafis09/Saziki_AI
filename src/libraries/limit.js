// src/libraries/limit.js
// Limit management system for Saziki Bot
// @author Saziki Bot Team
// Version: 1.0.0

// ==================== CONFIGURATION ====================
const LIMIT_CONFIG = {
    // الحدود الافتراضية
    defaultLimit: 20,
    premiumLimit: 50,
    vipLimit: 100,
    
    // الحد الأقصى للتخزين
    maxLimit: 999999,
    
    // وقت تجديد الحدود (بالملي ثانية)
    resetTime: 24 * 60 * 60 * 1000, // 24 ساعة
    
    // مكافآت يومية
    dailyReward: {
        normal: 5,
        premium: 10,
        vip: 20
    },
    
    // أسعار العمليات
    commandCost: {
        default: 1,
        premium: 0, // بريميوم مجاني
        vip: 0, // VIP مجاني
        special: {
            download: 2,
            ai: 2,
            game: 1,
            tools: 1
        }
    }
};

// ==================== CORE FUNCTIONS ====================

/**
 * الحصول على الحد الأقصى للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @returns {number} - الحد الأقصى
 */
export function getMaxLimit(user) {
    if (!user) return LIMIT_CONFIG.defaultLimit;
    
    if (user.vipTime > Date.now()) {
        return LIMIT_CONFIG.vipLimit;
    }
    if (user.premiumTime > Date.now()) {
        return LIMIT_CONFIG.premiumLimit;
    }
    return LIMIT_CONFIG.defaultLimit;
}

/**
 * الحصول على الحد الحالي للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @returns {number} - الحد الحالي
 */
export function getCurrentLimit(user) {
    return user?.limit || 0;
}

/**
 * التحقق من توفر الحدود
 * @param {Object} user - بيانات المستخدم
 * @param {number} amount - الكمية المطلوبة
 * @returns {boolean} - هل يتوفر حد كافٍ
 */
export function hasEnoughLimit(user, amount = 1) {
    if (!user) return false;
    
    // المستخدمين المميزين لا يستهلكون حدود
    if (user.vipTime > Date.now() || user.premiumTime > Date.now()) {
        return true;
    }
    
    return (user.limit || 0) >= amount;
}

/**
 * استهلاك الحدود
 * @param {Object} user - بيانات المستخدم
 * @param {number} amount - الكمية المراد استهلاكها
 * @param {string} commandType - نوع الأمر
 * @returns {Object} - نتيجة الاستهلاك
 */
export function consumeLimit(user, amount = 1, commandType = 'default') {
    if (!user) {
        return {
            success: false,
            message: 'User not found',
            remaining: 0
        };
    }
    
    // المستخدمين المميزين لا يستهلكون حدود
    if (user.vipTime > Date.now()) {
        return {
            success: true,
            message: 'VIP users have unlimited limits',
            remaining: Infinity,
            consumed: 0,
            isVip: true
        };
    }
    
    if (user.premiumTime > Date.now()) {
        return {
            success: true,
            message: 'Premium users have unlimited limits',
            remaining: Infinity,
            consumed: 0,
            isPremium: true
        };
    }
    
    // تحديد تكلفة الأمر حسب النوع
    let cost = amount;
    if (commandType !== 'default') {
        cost = LIMIT_CONFIG.commandCost.special[commandType] || amount;
    }
    
    const currentLimit = user.limit || 0;
    
    if (currentLimit < cost) {
        return {
            success: false,
            message: `Insufficient limits. Need ${cost}, have ${currentLimit}`,
            remaining: currentLimit,
            needed: cost - currentLimit
        };
    }
    
    user.limit = currentLimit - cost;
    
    return {
        success: true,
        message: `Consumed ${cost} limit(s)`,
        remaining: user.limit,
        consumed: cost
    };
}

/**
 * إضافة حدود للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {number} amount - الكمية المراد إضافتها
 * @param {string} reason - سبب الإضافة
 * @returns {Object} - نتيجة الإضافة
 */
export function addLimit(user, amount = 1, reason = 'manual') {
    if (!user) {
        return {
            success: false,
            message: 'User not found',
            newLimit: 0
        };
    }
    
    const oldLimit = user.limit || 0;
    const maxLimit = getMaxLimit(user);
    
    // لا يمكن تجاوز الحد الأقصى
    const newLimit = Math.min(oldLimit + amount, maxLimit);
    user.limit = newLimit;
    
    const added = newLimit - oldLimit;
    
    return {
        success: true,
        message: `Added ${added} limit(s)`,
        oldLimit,
        newLimit,
        added,
        reason,
        isFull: newLimit >= maxLimit
    };
}

/**
 * إعادة تعيين الحدود اليومية
 * @param {Object} user - بيانات المستخدم
 * @returns {Object} - نتيجة إعادة التعيين
 */
export function resetDailyLimit(user) {
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        };
    }
    
    const maxLimit = getMaxLimit(user);
    const oldLimit = user.limit || 0;
    
    user.limit = maxLimit;
    user.lastReset = Date.now();
    
    return {
        success: true,
        message: 'Daily limits reset',
        oldLimit,
        newLimit: maxLimit,
        gained: maxLimit - oldLimit
    };
}

/**
 * الحصول على المكافأة اليومية
 * @param {Object} user - بيانات المستخدم
 * @returns {Object} - نتيجة المكافأة
 */
export function claimDailyReward(user) {
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        };
    }
    
    const now = Date.now();
    const lastClaim = user.lastDaily || 0;
    
    // التحقق من إمكانية المطالبة
    if (now - lastClaim < LIMIT_CONFIG.resetTime) {
        const remaining = LIMIT_CONFIG.resetTime - (now - lastClaim);
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        
        return {
            success: false,
            message: `Daily reward already claimed. Next claim in ${hours}h ${minutes}m`,
            remaining
        };
    }
    
    // تحديد مبلغ المكافأة حسب نوع المستخدم
    let rewardAmount = LIMIT_CONFIG.dailyReward.normal;
    if (user.vipTime > now) {
        rewardAmount = LIMIT_CONFIG.dailyReward.vip;
    } else if (user.premiumTime > now) {
        rewardAmount = LIMIT_CONFIG.dailyReward.premium;
    }
    
    // إضافة المكافأة
    const result = addLimit(user, rewardAmount, 'daily_reward');
    user.lastDaily = now;
    
    return {
        success: true,
        message: `Daily reward claimed: +${rewardAmount} limits`,
        ...result
    };
}

/**
 * حساب تكلفة أمر معين
 * @param {string} commandType - نوع الأمر
 * @param {Object} user - بيانات المستخدم
 * @returns {number} - تكلفة الأمر
 */
export function getCommandCost(commandType = 'default', user = null) {
    if (user) {
        if (user.vipTime > Date.now() || user.premiumTime > Date.now()) {
            return 0;
        }
    }
    
    return LIMIT_CONFIG.commandCost.special[commandType] || LIMIT_CONFIG.commandCost.default;
}

/**
 * الحصول على إحصائيات الحدود للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @returns {Object} - إحصائيات الحدود
 */
export function getLimitStats(user) {
    if (!user) return null;
    
    const current = user.limit || 0;
    const max = getMaxLimit(user);
    const percent = (current / max) * 100;
    
    // إنشاء شريط التقدم
    const barLength = 15;
    const filled = Math.floor((percent / 100) * barLength);
    const empty = barLength - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
    
    // حساب وقت التجديد
    const lastReset = user.lastReset || 0;
    const nextReset = lastReset + LIMIT_CONFIG.resetTime;
    const timeUntilReset = Math.max(0, nextReset - Date.now());
    const resetHours = Math.floor(timeUntilReset / (60 * 60 * 1000));
    const resetMinutes = Math.floor((timeUntilReset % (60 * 60 * 1000)) / (60 * 1000));
    
    // حساب وقت المكافأة اليومية
    const lastDaily = user.lastDaily || 0;
    const nextDaily = lastDaily + LIMIT_CONFIG.resetTime;
    const timeUntilDaily = Math.max(0, nextDaily - Date.now());
    const dailyHours = Math.floor(timeUntilDaily / (60 * 60 * 1000));
    const dailyMinutes = Math.floor((timeUntilDaily % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
        current,
        max,
        percent: percent.toFixed(1),
        progressBar,
        remaining: max - current,
        
        reset: {
            next: nextReset,
            timeUntil: timeUntilReset,
            hours: resetHours,
            minutes: resetMinutes,
            formatted: `${resetHours}h ${resetMinutes}m`
        },
        
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
 * تنسيق معلومات الحدود كنص
 * @param {Object} user - بيانات المستخدم
 * @returns {string} - نص منسق
 */
export function formatLimitInfo(user) {
    const stats = getLimitStats(user);
    if (!stats) return 'No limit data available';
    
    let info = `╭━━━❰ 🎟️ *LIMIT SYSTEM* ❱━━━╮\n`;
    info += `┃\n`;
    info += `┃ 📊 *Current:* ${stats.current} / ${stats.max}\n`;
    info += `┃ 📈 *Usage:* ${stats.progressBar} ${stats.percent}%\n`;
    info += `┃ 🔜 *Remaining:* ${stats.remaining} limits\n`;
    info += `┃\n`;
    
    if (stats.isVip) {
        info += `┃ 👑 *VIP Status:* Unlimited limits\n`;
    } else if (stats.isPremium) {
        info += `┃ 💎 *Premium Status:* Unlimited limits\n`;
    } else {
        info += `┃ ⏰ *Reset in:* ${stats.reset.formatted}\n`;
    }
    
    info += `┃ 🎁 *Daily Reward:* ${stats.daily.canClaim ? 'Available now!' : `in ${stats.daily.formatted}`}\n`;
    info += `┃\n`;
    info += `╰━━━━━━━━━━━━━━━━╯`;
    
    return info;
}

// ==================== EXPORTS ====================
export default {
    LIMIT_CONFIG,
    getMaxLimit,
    getCurrentLimit,
    hasEnoughLimit,
    consumeLimit,
    addLimit,
    resetDailyLimit,
    claimDailyReward,
    getCommandCost,
    getLimitStats,
    formatLimitInfo
};