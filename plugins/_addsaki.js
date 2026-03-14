// plugins/addsaki.js
// Add SAKI Points to User (Owner Only)
// @author Saziki Bot Team
// Version: 1.0.0

import { addSaki, getSakiStats, formatSakiInfo } from '../src/libraries/saki.js';
import fs from 'fs/promises';
import path from 'path';

// ==================== DATABASE FUNCTIONS ====================
const SAKI_DB_PATH = path.join(process.cwd(), 'database/saki.json');

async function readSakiDB() {
  try {
    const data = await fs.readFile(SAKI_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const initialData = { users: {}, transactions: [] };
      await fs.writeFile(SAKI_DB_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
}

async function writeSakiDB(data) {
  await fs.writeFile(SAKI_DB_PATH, JSON.stringify(data, null, 2));
}

async function logSakiTransaction(userId, adminId, amount, reason) {
  const db = await readSakiDB();
  
  db.transactions.push({
    id: `saki_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    adminId,
    amount,
    reason,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleString('ar-EG')
  });
  
  if (db.transactions.length > 1000) {
    db.transactions = db.transactions.slice(-1000);
  }
  
  await writeSakiDB(db);
}

async function updateUserSakiStats(userId, newSaki, oldSaki) {
  const db = await readSakiDB();
  
  if (!db.users[userId]) {
    db.users[userId] = {
      totalReceived: 0,
      lastUpdate: null,
      history: []
    };
  }
  
  const user = db.users[userId];
  user.totalReceived += (newSaki - oldSaki);
  user.lastUpdate = new Date().toISOString();
  
  user.history.push({
    timestamp: new Date().toISOString(),
    oldSaki,
    newSaki,
    change: newSaki - oldSaki
  });
  
  if (user.history.length > 50) {
    user.history = user.history.slice(-50);
  }
  
  await writeSakiDB(db);
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text, isOwner }) => {
  if (!isOwner) {
    return m.reply('👑 *Owner Only*\n\nThis command can only be used by the bot owner.');
  }

  if (!text) {
    return m.reply(
      `💰 *Add SAKI Command*\n\n` +
      `*Usage:* ${usedPrefix + command} <number> <amount> [reason]\n` +
      `*Usage:* ${usedPrefix + command} @user <amount> [reason]\n\n` +
      `*Examples:*\n` +
      `• ${usedPrefix}addsaki 212719558797 100 welcome bonus\n` +
      `• ${usedPrefix}addsaki @user 50 thank you\n` +
      `• ${usedPrefix}addsaki 201094319621 -30 remove\n\n` +
      `*Note:* You can use negative numbers to remove SAKI.`
    );
  }

  try {
    let targetNumber = '';
    let amount = 0;
    let reason = 'manual';
    
    const mention = text.match(/@(\d+)/);
    if (mention) {
      targetNumber = mention[1];
      const remainingText = text.replace(mention[0], '').trim();
      const numbers = remainingText.match(/-?\d+/);
      amount = numbers ? parseInt(numbers[0]) : 0;
      
      if (numbers) {
        reason = remainingText.replace(numbers[0], '').trim() || reason;
      } else {
        reason = remainingText || reason;
      }
    } else {
      const parts = text.trim().split(' ');
      
      const numberMatch = parts[0].match(/\d+/);
      if (!numberMatch) {
        return m.reply('❌ Please provide a valid phone number.');
      }
      targetNumber = numberMatch[0];
      
      const amountMatch = parts[1]?.match(/-?\d+/);
      amount = amountMatch ? parseInt(amountMatch[0]) : 0;
      
      if (parts.length > 2) {
        reason = parts.slice(2).join(' ');
      }
    }
    
    targetNumber = targetNumber.replace(/[^0-9]/g, '');
    
    if (!targetNumber || targetNumber.length < 10) {
      return m.reply('❌ Please provide a valid phone number (at least 10 digits).');
    }
    
    if (isNaN(amount) || amount === 0) {
      return m.reply('❌ Please provide a valid number (positive or negative).');
    }
    
    const targetJid = targetNumber + '@s.whatsapp.net';
    
    if (!global.db.data.users[targetJid]) {
      global.db.data.users[targetJid] = {
        exp: 0,
        level: 0,
        limit: 20,
        saki: 35,
        money: 0,
        premiumTime: 0,
        vipTime: 0,
        registered: false,
        name: targetNumber,
        lastCommandTime: 0,
        commandCount: 0,
        lastDailySaki: 0
      };
      console.log(`✅ Created new user: ${targetNumber}`);
    }
    
    const user = global.db.data.users[targetJid];
    const oldSaki = user.saki || 0;
    
    console.log(`💰 Before update: ${targetNumber} has ${oldSaki} SAKI`);
    
    user.saki = Math.max(0, (user.saki || 0) + amount);
    
    console.log(`💰 After update: ${targetNumber} now has ${user.saki} SAKI`);
    
    await updateUserSakiStats(targetJid, user.saki, oldSaki);
    await logSakiTransaction(targetJid, m.sender, amount, reason);
    
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    const action = amount > 0 ? 'added' : 'removed';
    const absAmount = Math.abs(amount);
    
    let resultMessage = `╭━━━❰💰 *SAKI UPDATED* 💰❱━━━╮\n`;
    resultMessage += `┃\n`;
    resultMessage += `┃ 👤 *User:* ${targetNumber}\n`;
    resultMessage += `┃ 📝 *Reason:* ${reason}\n`;
    resultMessage += `┃ 📊 *Action:* ${action} ${formatNumber(absAmount)} SAKI\n`;
    resultMessage += `┃\n`;
    resultMessage += `┃ 📈 *SAKI Changes:*\n`;
    resultMessage += `┃ • Before: ${formatNumber(oldSaki)}\n`;
    resultMessage += `┃ • After:  ${formatNumber(user.saki)}\n`;
    resultMessage += `┃ • Change: ${amount > 0 ? '+' : ''}${formatNumber(amount)}\n`;
    resultMessage += `┃\n`;
    resultMessage += `╰━━━━━━━━━━━━━━━━╯`;
    
    await conn.sendMessage(m.chat, {
      text: resultMessage,
      contextInfo: {
        externalAdReply: {
          title: `💰 SAKI ${action === 'added' ? 'Added' : 'Removed'}`,
          body: `${formatNumber(absAmount)} SAKI • ${reason}`,
          thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });
    
    try {
      let userName = user.name || targetNumber;
      
      let notificationMessage = '';
      if (amount > 0) {
        notificationMessage = `╭━━━❰💰 *SAKI ADDED* 💰❱━━━╮\n`;
        notificationMessage += `┃\n`;
        notificationMessage += `┃ 👋 Hello *@${targetNumber}*!\n`;
        notificationMessage += `┃\n`;
        notificationMessage += `┃ 🎉 You have received *${formatNumber(absAmount)}* SAKI points!\n`;
        notificationMessage += `┃ 📝 *Reason:* ${reason}\n`;
        notificationMessage += `┃\n`;
        notificationMessage += `┃ 💰 *Your new balance:* ${formatNumber(user.saki)} SAKI\n`;
        notificationMessage += `┃\n`;
        notificationMessage += `┃ 🙏 Thank you for using Saziki Bot!\n`;
        notificationMessage += `╰━━━━━━━━━━━━━━━━╯`;
      } else {
        notificationMessage = `╭━━━❰💰 *SAKI REMOVED* 💰❱━━━╮\n`;
        notificationMessage += `┃\n`;
        notificationMessage += `┃ 👋 Hello *@${targetNumber}*!\n`;
        notificationMessage += `┃\n`;
        notificationMessage += `┃ 📝 *${formatNumber(absAmount)}* SAKI points have been removed from your account.\n`;
        notificationMessage += `┃ 📝 *Reason:* ${reason}\n`;
        notificationMessage += `┃\n`;
        notificationMessage += `┃ 💰 *Your new balance:* ${formatNumber(user.saki)} SAKI\n`;
        notificationMessage += `╰━━━━━━━━━━━━━━━━╯`;
      }
      
      await conn.sendMessage(targetJid, {
        text: notificationMessage,
        mentions: [targetJid],
        contextInfo: {
          externalAdReply: {
            title: '💰 Saziki Bot',
            body: amount > 0 ? 'You received SAKI!' : 'SAKI removed',
            thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
      
      await m.reply(`✅ Notification sent to ${targetNumber}`);
      
    } catch (notifyError) {
      console.error('❌ Failed to send notification:', notifyError);
      await m.reply(`⚠️ SAKI added but failed to send notification: ${notifyError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Add SAKI Error:', error);
    m.reply('❌ Error: ' + error.message);
  }
};

// ==================== HISTORY COMMAND ====================

let historyHandler = async (m, { conn, usedPrefix, command, text, isOwner }) => {
  if (!isOwner) {
    return m.reply('👑 *Owner Only*\n\nThis command can only be used by the bot owner.');
  }
  
  try {
    const db = await readSakiDB();
    
    let targetNumber = '';
    const mention = text?.match(/@(\d+)/);
    
    if (mention) {
      targetNumber = mention[1];
    } else if (text) {
      targetNumber = text.replace(/[^0-9]/g, '');
    }
    
    let message = '╭━━━❰📊 *SAKI TRANSACTIONS* 📊❱━━━╮\n┃\n';
    
    if (targetNumber) {
      const targetJid = targetNumber + '@s.whatsapp.net';
      const userTransactions = db.transactions.filter(t => t.userId === targetJid).slice(-10);
      
      if (userTransactions.length === 0) {
        message += `┃ No transactions found for ${targetNumber}\n`;
      } else {
        message += `┃ 📱 *User:* ${targetNumber}\n`;
        message += `┃ 📊 *Last 10 transactions:*\n┃\n`;
        
        userTransactions.reverse().forEach((tx, i) => {
          const date = new Date(tx.timestamp).toLocaleString('ar-EG');
          message += `┃ ${i+1}. ${tx.amount > 0 ? '+' : ''}${tx.amount} SAKI\n`;
          message += `┃    📝 ${tx.reason}\n`;
          message += `┃    ⏰ ${date}\n┃\n`;
        });
      }
    } else {
      const recentTransactions = db.transactions.slice(-10).reverse();
      
      if (recentTransactions.length === 0) {
        message += `┃ No transactions found\n`;
      } else {
        message += `┃ 📊 *Last 10 transactions:*\n┃\n`;
        
        recentTransactions.forEach((tx, i) => {
          const userNumber = tx.userId.split('@')[0];
          const date = new Date(tx.timestamp).toLocaleString('ar-EG');
          message += `┃ ${i+1}. 👤 ${userNumber}\n`;
          message += `┃    ${tx.amount > 0 ? '+' : ''}${tx.amount} SAKI\n`;
          message += `┃    📝 ${tx.reason}\n`;
          message += `┃    ⏰ ${date}\n┃\n`;
        });
      }
    }
    
    message += `╰━━━━━━━━━━━━━━━━╯`;
    
    await m.reply(message);
    
  } catch (error) {
    console.error(error);
    m.reply('❌ Error: ' + error.message);
  }
};

// ==================== STATS COMMAND ====================

let statsHandler = async (m, { conn, usedPrefix, command, text, isOwner }) => {
  if (!isOwner) {
    return m.reply('👑 *Owner Only*\n\nThis command can only be used by the bot owner.');
  }
  
  try {
    const db = await readSakiDB();
    
    const totalTransactions = db.transactions.length;
    const totalSakiGiven = db.transactions.reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0);
    const totalSakiRemoved = db.transactions.reduce((sum, tx) => sum + (tx.amount < 0 ? -tx.amount : 0), 0);
    const uniqueUsers = new Set(db.transactions.map(tx => tx.userId)).size;
    
    const lastTransactions = db.transactions.slice(-5).reverse();
    
    let message = `╭━━━❰📈 *SAKI STATISTICS* 📈❱━━━╮\n`;
    message += `┃\n`;
    message += `┃ 📊 *Total Transactions:* ${totalTransactions}\n`;
    message += `┃ 👥 *Unique Users:* ${uniqueUsers}\n`;
    message += `┃ 📤 *SAKI Given:* ${totalSakiGiven.toLocaleString()}\n`;
    message += `┃ 📥 *SAKI Removed:* ${totalSakiRemoved.toLocaleString()}\n`;
    message += `┃ 💰 *Net:* ${(totalSakiGiven - totalSakiRemoved).toLocaleString()}\n`;
    message += `┃\n`;
    
    if (lastTransactions.length > 0) {
      message += `┃ ⏱️ *Recent Activity:*\n┃\n`;
      lastTransactions.forEach((tx, i) => {
        const userNumber = tx.userId.split('@')[0];
        message += `┃ ${i+1}. 👤 ${userNumber}\n`;
        message += `┃    ${tx.amount > 0 ? '+' : ''}${tx.amount} SAKI\n`;
        message += `┃    📝 ${tx.reason}\n┃\n`;
      });
    }
    
    message += `╰━━━━━━━━━━━━━━━━╯`;
    
    await m.reply(message);
    
  } catch (error) {
    console.error(error);
    m.reply('❌ Error: ' + error.message);
  }
};

// ==================== CHECK COMMAND ====================

let checkHandler = async (m, { conn, usedPrefix, command, text, isOwner }) => {
  if (!isOwner) {
    return m.reply('👑 *Owner Only*\n\nThis command can only be used by the bot owner.');
  }
  
  try {
    let targetNumber = '';
    const mention = text?.match(/@(\d+)/);
    
    if (mention) {
      targetNumber = mention[1];
    } else if (text) {
      targetNumber = text.replace(/[^0-9]/g, '');
    } else {
      targetNumber = m.sender.split('@')[0];
    }
    
    const targetJid = targetNumber + '@s.whatsapp.net';
    const user = global.db.data.users[targetJid];
    
    if (!user) {
      return m.reply(`❌ User ${targetNumber} not found in database.`);
    }
    
    const stats = await getSakiStats(user);
    
    let message = `╭━━━❰📋 *USER SAKI INFO* 📋❱━━━╮\n`;
    message += `┃\n`;
    message += `┃ 👤 *User:* ${targetNumber}\n`;
    message += `┃ 💰 *Current SAKI:* ${user.saki || 0}\n`;
    message += `┃ 📈 *Max Limit:* ${stats?.max?.toLocaleString() || '∞'}\n`;
    message += `┃\n`;
    message += `┃ ${stats?.progressBar || '💰'.repeat(15)}\n`;
    message += `┃ 🎯 *${stats?.percent || 0}% Complete*\n`;
    message += `┃\n`;
    message += `┃ 💎 *Premium:* ${user.premiumTime > Date.now() ? '✅' : '❌'}\n`;
    message += `┃ 👑 *VIP:* ${user.vipTime > Date.now() ? '✅' : '❌'}\n`;
    message += `┃ 🎁 *Daily:* ${stats?.daily?.canClaim ? 'Available' : `in ${stats?.daily?.formatted || 'N/A'}`}\n`;
    message += `╰━━━━━━━━━━━━━━━━╯`;
    
    await m.reply(message);
    
  } catch (error) {
    console.error(error);
    m.reply('❌ Error: ' + error.message);
  }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['addsaki', 'addsakis'];
handler.tags = ['owner'];
handler.command = /^(addsaki|addsakis)$/i;
handler.owner = true;
handler.rowner = true;

let historyCommand = {
  help: ['sakihistory', 'sakitx'],
  tags: ['owner'],
  command: /^(sakihistory|sakitx)$/i,
  handler: historyHandler,
  owner: true,
  rowner: true
};

let statsCommand = {
  help: ['sakistats', 'sakistat'],
  tags: ['owner'],
  command: /^(sakistats|sakistat)$/i,
  handler: statsHandler,
  owner: true,
  rowner: true
};

let checkCommand = {
  help: ['checksaki', 'usersaki'],
  tags: ['owner'],
  command: /^(checksaki|usersaki)$/i,
  handler: checkHandler,
  owner: true,
  rowner: true
};

export { handler, historyCommand, statsCommand, checkCommand };
export default handler;