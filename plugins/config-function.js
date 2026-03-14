// plugins/config.js
// Configuration Manager for Saziki Bot
// @author Saziki Bot Team
// Version: 1.0.0

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  
  // ========== HELP MENU ==========
  const helpMenu = `_*Configuration Options*_ 

━━━━━━━━━━━━━━━━━━━━━━
WELCOME | WELCOME
┇ Info: Enable/Disable welcome messages
┇ Usage: ${usedPrefix + command} welcome
┇ Note: Groups only
━━━━━━━━━━━━━━━━━━━━━━

PUBLIC | PUBLIC
┇ Info: Enable/Disable public mode
┇ Usage: ${usedPrefix + command} public
┇ Note: Bot owner only
━━━━━━━━━━━━━━━━━━━━━━

MODOHORNY | MODOHORNY
┇ Info: Enable/Disable horny mode
┇ Usage: ${usedPrefix + command} modohorny
━━━━━━━━━━━━━━━━━━━━━━

ANTILINK | ANTILINK
┇ Info: Enable/Disable anti-link
┇ Usage: ${usedPrefix + command} antilink
━━━━━━━━━━━━━━━━━━━━━━

ANTILINK 2 | ANTILINK 2
┇ Info: Enable/Disable anti-link v2
┇ Usage: ${usedPrefix + command} antilink2
━━━━━━━━━━━━━━━━━━━━━━

DETECT | DETECT
┇ Info: Enable/Disable message detection
┇ Usage: ${usedPrefix + command} detect
━━━━━━━━━━━━━━━━━━━━━━

DETECT 2 | DETECT 2
┇ Info: Enable/Disable message detection v2
┇ Usage: ${usedPrefix + command} detect2
━━━━━━━━━━━━━━━━━━━━━━

RESTRICT | RESTRICT
┇ Info: Enable/Disable restrictions
┇ Usage: ${usedPrefix + command} restrict
━━━━━━━━━━━━━━━━━━━━━━

AUTOREAD | AUTOREAD
┇ Info: Enable/Disable auto-read
┇ Usage: ${usedPrefix + command} autoread
━━━━━━━━━━━━━━━━━━━━━━

AUDIOS | AUDIOS
┇ Info: Enable/Disable audio features
┇ Usage: ${usedPrefix + command} audios
━━━━━━━━━━━━━━━━━━━━━━

AUTOSTICKER | AUTOSTICKER
┇ Info: Enable/Disable auto-sticker
┇ Usage: ${usedPrefix + command} autosticker
━━━━━━━━━━━━━━━━━━━━━━

PCONLY | PCONLY
┇ Info: Enable/Disable private chat only
┇ Usage: ${usedPrefix + command} pconly
━━━━━━━━━━━━━━━━━━━━━━

GCONLY | GCONLY
┇ Info: Enable/Disable group chat only
┇ Usage: ${usedPrefix + command} gconly
━━━━━━━━━━━━━━━━━━━━━━

ANTIVIEWONCE | ANTIVIEWONCE
┇ Info: Enable/Disable anti-view-once
┇ Usage: ${usedPrefix + command} antiviewonce
━━━━━━━━━━━━━━━━━━━━━━

ANTICALL | ANTICALL
┇ Info: Enable/Disable anti-call
┇ Usage: ${usedPrefix + command} anticall
━━━━━━━━━━━━━━━━━━━━━━

ANTITOXIC | ANTITOXIC
┇ Info: Enable/Disable anti-toxic
┇ Usage: ${usedPrefix + command} antitoxic
━━━━━━━━━━━━━━━━━━━━━━

ANTITRABA | ANTITRABA
┇ Info: Enable/Disable anti-traba
┇ Usage: ${usedPrefix + command} antitraba
━━━━━━━━━━━━━━━━━━━━━━

ANTIARAB | ANTIARAB
┇ Info: Enable/Disable anti-arab numbers
┇ Usage: ${usedPrefix + command} antiarab
━━━━━━━━━━━━━━━━━━━━━━

ANTIARAB2 | ANTIARAB2
┇ Info: Enable/Disable anti-arab v2
┇ Usage: ${usedPrefix + command} antiarab2
━━━━━━━━━━━━━━━━━━━━━━

MODOADMIN | MODOADMIN
┇ Info: Enable/Disable admin mode
┇ Usage: ${usedPrefix + command} modoadmin
━━━━━━━━━━━━━━━━━━━━━━

SIMSIMI | SIMSIMI
┇ Info: Enable/Disable SimSimi AI
┇ Usage: ${usedPrefix + command} simsimi
━━━━━━━━━━━━━━━━━━━━━━

ANTIDELETE | ANTIDELETE
┇ Info: Enable/Disable anti-delete
┇ Usage: ${usedPrefix + command} antidelete
━━━━━━━━━━━━━━━━━━━━━━

AUDIOS_BOT | AUDIOS_BOT
┇ Info: Enable/Disable bot audio
┇ Usage: ${usedPrefix + command} audios_bot
━━━━━━━━━━━━━━━━━━━━━━

ANTISPAM | ANTISPAM
┇ Info: Enable/Disable anti-spam
┇ Usage: ${usedPrefix + command} antispam
━━━━━━━━━━━━━━━━━━━━━━

MODEJADIBOT | MODEJADIBOT
┇ Info: Enable/Disable sub-bot mode
┇ Usage: ${usedPrefix + command} modejadibot
━━━━━━━━━━━━━━━━━━━━━━

ANTIPRIVATE | ANTIPRIVATE
┇ Info: Enable/Disable anti-private
┇ Usage: ${usedPrefix + command} antiprivate
━━━━━━━━━━━━━━━━━━━━━━

GAME | GAME
┇ Info: Enable/Disable games
┇ Usage: ${usedPrefix + command} game
━━━━━━━━━━━━━━━━━━━━━━`;

  // Determine if enabling or disabling
  const isEnable = /true|enable|on|1/i.test(command);
  
  // Get database references
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[conn.user.jid] || {};
  
  // Get the feature to toggle
  const type = (args[0] || '').toLowerCase();
  let isAll = false;

  // ========== PROCESS EACH FEATURE ==========
  switch (type) {
    case 'welcome':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          return false;
        }
      } else if (!(isAdmin || isOwner || isROwner)) {
        global.dfail('admin', m, conn);
        return false;
      }
      chat.welcome = isEnable;
      break;
      
    case 'detect':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          return false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        return false;
      }
      chat.detect = isEnable;
      break;
      
    case 'detect2':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          return false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        return false;
      }
      chat.detect2 = isEnable;
      break;
      
    case 'simsimi':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.simi = isEnable;
      break;
      
    case 'antidelete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antidelete = isEnable;
      break;
      
    case 'public':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        return false;
      }
      global.opts['self'] = !isEnable;
      break;
      
    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antiLink = isEnable;
      break;
      
    case 'antilink2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antiLink2 = isEnable;
      break;
      
    case 'antiviewonce':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antiviewonce = isEnable;
      break;
      
    case 'modohorny':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.modohorny = isEnable;
      break;
      
    case 'modoadmin':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.modoadmin = isEnable;
      break;
      
    case 'autosticker':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.autosticker = isEnable;
      break;
      
    case 'audios':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.audios = isEnable;
      break;
      
    case 'restrict':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        return false;
      }
      bot.restrict = isEnable;
      break;
      
    case 'audios_bot':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        return false;
      }
      bot.audios_bot = isEnable;
      break;
      
    case 'autoread':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('rowner', m, conn);
        return false;
      }
      bot.autoread2 = isEnable;
      break;
      
    case 'pconly':
    case 'privateonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        return false;
      }
      global.opts['pconly'] = isEnable;
      break;
      
    case 'gconly':
    case 'grouponly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        return false;
      }
      global.opts['gconly'] = isEnable;
      break;
      
    case 'anticall':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        return false;
      }
      bot.antiCall = isEnable;
      break;
      
    case 'antiprivate':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        return false;
      }
      bot.antiPrivate = isEnable;
      break;
      
    case 'modejadibot':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        return false;
      }
      bot.modejadibot = isEnable;
      break;
      
    case 'antispam':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        return false;
      }
      bot.antispam = isEnable;
      break;
      
    case 'antitoxic':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antiToxic = isEnable;
      break;
      
    case 'game':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.game = isEnable;
      break;
      
    case 'antitraba':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antiTraba = isEnable;
      break;
      
    case 'antiarab':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antiArab = isEnable;
      break;
      
    case 'antiarab2':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          return false;
        }
      }
      chat.antiArab2 = isEnable;
      break;
      
    default:
      // Show help menu if no valid feature specified
      return await conn.sendMessage(m.chat, { text: helpMenu }, { quoted: m });
  }

  // Send confirmation message
  const status = isEnable ? '✅ *ENABLED*' : '❌ *DISABLED*';
  const scope = isAll ? 'Bot' : 'Chat';
  
  await conn.sendMessage(m.chat, {
    text: `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚙️ *Configuration Updated*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `• Feature: *${type}*\n` +
          `• Status: ${status}\n` +
          `• Scope: ${scope}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━`
  }, { quoted: m });
};

handler.command = /^((en|dis)able|(tru|fals)e|(turn)?[01]|config|setting)$/i;

export default handler;