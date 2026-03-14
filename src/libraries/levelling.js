// src/libraries/levelling.js - مع إضافة رسالة تهاني تلقائية
export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * .75;

export function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) {
    throw new TypeError('level cannot be negative value');
  }
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(++level, growth) * multiplier);
  return {
    min,
    max,
    xp: max - min,
  };
}

export function findLevel(xp, multiplier = global.multiplier || 1) {
  if (xp === Infinity) {
    return Infinity;
  }
  if (isNaN(xp)) {
    return NaN;
  }
  if (xp <= 0) {
    return 0;  // ✅ المستوى 0 عندما xp <= 0
  }
  let level = 0;
  do {
    level++;
  }
  while (xpRange(level, multiplier).min <= xp);
  return --level;
}

export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
  if (level < 0) {
    return false;
  }
  if (xp === Infinity) {
    return true;
  }
  if (isNaN(xp)) {
    return false;
  }
  if (xp <= 0) {
    return false;
  }
  return level < findLevel(xp, multiplier);
}

/**
 * دالة لإرسال رسالة تهاني عند الوصول إلى مستوى جديد
 * @param {object} conn - كائن الاتصال
 * @param {string} chatId - معرف المحادثة
 * @param {string} userId - معرف المستخدم
 * @param {number} oldLevel - المستوى القديم
 * @param {number} newLevel - المستوى الجديد
 * @param {object} options - خيارات إضافية
 */
export async function sendLevelUpMessage(conn, chatId, userId, oldLevel, newLevel, options = {}) {
  try {
    // تجاهل إذا كان المستوى لم يتغير
    if (oldLevel >= newLevel) return;
    
    const userTag = '@' + userId.split('@')[0];
    const levelDiff = newLevel - oldLevel;
    
    // رسائل تهاني مختلفة حسب عدد المستويات
    let congratMessage = '';
    let titleEmoji = '';
    
    if (levelDiff === 1) {
      congratMessage = `✦ *LEVEL UP!* ✦`;
      titleEmoji = '⬆️';
    } else if (levelDiff < 5) {
      congratMessage = `✦ *MULTIPLE LEVELS UP!* ✦`;
      titleEmoji = '🚀';
    } else {
      congratMessage = `✦ *MASSIVE LEVEL UP!* ✦`;
      titleEmoji = '💫';
    }
    
    // حساب المكافآت حسب المستوى الجديد
    const rewards = [];
    
    // مكافآت عامة لكل مستوى
    if (newLevel % 5 === 0) {
      rewards.push('🎁 *Bonus:* +5 Limits');
      if (options.user) options.user.limit = (options.user.limit || 0) + 5;
    }
    if (newLevel % 10 === 0) {
      rewards.push('💰 *Bonus:* +1000 Coins');
      if (options.user) options.user.money = (options.user.money || 0) + 1000;
    }
    if (newLevel % 25 === 0) {
      rewards.push('💎 *Bonus:* +50 Limits & +5000 Coins');
      if (options.user) {
        options.user.limit = (options.user.limit || 0) + 50;
        options.user.money = (options.user.money || 0) + 5000;
      }
    }
    if (newLevel % 50 === 0) {
      rewards.push('👑 *Bonus:* +1 Day Premium');
      if (options.user) {
        const days = 1;
        const ms = days * 24 * 60 * 60 * 1000;
        options.user.premiumTime = Math.max(options.user.premiumTime || 0, Date.now() + ms);
      }
    }
    if (newLevel % 100 === 0) {
      rewards.push('🌟 *Bonus:* +7 Days Premium');
      if (options.user) {
        const days = 7;
        const ms = days * 24 * 60 * 60 * 1000;
        options.user.premiumTime = Math.max(options.user.premiumTime || 0, Date.now() + ms);
      }
    }
    
    // حساب تقدم المستوى الجديد
    const range = xpRange(newLevel);
    const nextRange = xpRange(newLevel + 1);
    const progress = ((options.user?.exp || 0) - range.min) / range.xp * 100;
    const progressBar = createProgressBar(progress);
    
    // إنشاء رسالة التهاني
    const levelUpMessage = `╭━━━❰✨ *LEVEL UP!* ✨❱━━━╮
┃
┃ 👏 *Congratulations!* ${userTag}
┃
┃ 📊 *Level:* ${oldLevel} → ${newLevel} ${levelDiff > 1 ? `(+${levelDiff})` : ''}
┃
┃ 📈 *Progress to Level ${newLevel + 1}:*
┃ ${progressBar}
┃ 🎯 *${progress.toFixed(1)}% Complete*
┃
┃ ⚡ *Current EXP:* ${options.user?.exp || 0} / ${range.max}
┃ 🔜 *Needed:* ${nextRange.max - (options.user?.exp || 0)} EXP
┃
${rewards.length > 0 ? `┃ 🎁 *Rewards:*\n┃ ${rewards.join('\n┃ ')}\n` : ''}┃
╰━━━━━━━━━━━━━━━━╯

💫 *Keep up the great work!*`;

    // إرسال الرسالة
    await conn.sendMessage(chatId, {
      text: levelUpMessage,
      mentions: [userId],
      contextInfo: {
        externalAdReply: {
          title: `${titleEmoji} Level ${newLevel} Reached!`,
          body: `Advanced from Level ${oldLevel}`,
          thumbnailUrl: options.thumbnailUrl || 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
          sourceUrl: options.sourceUrl || 'https://saziki.com',
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: options.quoted });
    
  } catch (error) {
    console.error('❌ Level up message error:', error);
  }
}

/**
 * دالة مساعدة لإنشاء شريط التقدم
 */
function createProgressBar(percent, length = 15) {
  const filled = Math.floor((percent / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * دالة للتحقق من رفع المستوى وإرسال رسالة تهاني
 * @param {object} conn - كائن الاتصال
 * @param {object} m - كائن الرسالة
 * @param {object} user - بيانات المستخدم
 * @param {number} oldLevel - المستوى القديم
 * @returns {Promise<boolean>} - هل تم رفع المستوى
 */
export async function checkLevelUp(conn, m, user, oldLevel) {
  if (!user || !m) return false;
  
  const newLevel = findLevel(user.exp || 0);
  
  if (newLevel > oldLevel) {
    await sendLevelUpMessage(conn, m.chat, m.sender, oldLevel, newLevel, {
      user,
      quoted: m,
      thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
    });
    return true;
  }
  
  return false;
}

export default {
  growth,
  xpRange,
  findLevel,
  canLevelUp,
  sendLevelUpMessage,
  checkLevelUp,
};