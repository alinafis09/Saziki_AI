// plugins/cmdmanager.js
// Complete Custom Command Manager for Saziki Bot
// @author Saziki Bot Team
// Version: 2.0.0

import fs from 'fs';

// ==================== MAIN HANDLER ====================
const handler = async (m, { conn, usedPrefix, command, text }) => {
  // Initialize sticker database if not exists
  global.db.data.sticker = global.db.data.sticker || {};
  
  const sticker = global.db.data.sticker;
  
  // ========== LIST COMMANDS (cmdlist / listcmd) ==========
  if (command === 'cmdlist' || command === 'listcmd') {
    if (Object.keys(sticker).length === 0) {
      return m.reply(
        `📋 *Custom Commands List*\n\n` +
        `No custom commands found.\n` +
        `Use ${usedPrefix}addcmd to add new commands.`
      );
    }

    const commandList = Object.entries(sticker).map(([key, value], index) => {
      const lockedStatus = value.locked ? '🔒 Locked' : '🔓 Unlocked';
      const creator = value.creator ? `@${value.creator.split('@')[0]}` : 'Unknown';
      
      return `*${index + 1}.* ━━━━━━━━━━━━━━━━━━━━
  📌 *Command:* ${value.text}
  🔑 *Hash:* \`${key.substring(0, 15)}...\`
  🔒 *Status:* ${lockedStatus}
  👤 *Creator:* ${creator}
  ⏰ *Created:* ${new Date(value.at).toLocaleString()}`;
    }).join('\n\n');

    const totalCommands = Object.keys(sticker).length;
    const lockedCount = Object.values(sticker).filter(cmd => cmd.locked).length;

    return m.reply(
      `📋 *CUSTOM COMMANDS MANAGER*\n\n` +
      `📊 *Statistics*\n` +
      `• Total Commands: ${totalCommands}\n` +
      `• Locked Commands: ${lockedCount}\n` +
      `• Unlocked: ${totalCommands - lockedCount}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${commandList}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 *Tips:*\n` +
      `• Use ${usedPrefix}addcmd to add new command\n` +
      `• Use ${usedPrefix}delcmd to remove command\n` +
      `• Reply to media with command name to add`,
      { mentions: Object.values(sticker).map((x) => x.creator).filter(Boolean) }
    );
  }
  
  // ========== ADD COMMAND (addcmd / setcmd / cmdadd / cmdset) ==========
  else if (command === 'addcmd' || command === 'setcmd' || command === 'cmdadd' || command === 'cmdset') {
    // Check if user replied to a message
    if (!m.quoted) {
      return m.reply(
        `❌ *Error - Add Command*\n\n` +
        `Please reply to an image or sticker to set as custom command.\n\n` +
        `*Usage:* ${usedPrefix + command} <command_name>\n` +
        `*Example:* ${usedPrefix + command} #menu`
      );
    }
    
    // Check if the quoted message has a file hash
    if (!m.quoted.fileSha256) {
      return m.reply(
        `❌ *Error - Add Command*\n\n` +
        `The replied message does not contain a valid file.\n` +
        `Please reply to an image or sticker.`
      );
    }
    
    // Check if command name is provided
    if (!text) {
      return m.reply(
        `❌ *Error - Add Command*\n\n` +
        `Please provide a command name.\n\n` +
        `*Usage:* ${usedPrefix + command} <command_name>\n` +
        `*Example:* ${usedPrefix + command} #menu\n\n` +
        `*Note:* Command name should start with # for best practice`
      );
    }

    const hash = m.quoted.fileSha256.toString('base64');
    
    // Check if command already exists and is locked
    if (sticker[hash] && sticker[hash].locked) {
      return m.reply(
        `❌ *Error - Add Command*\n\n` +
        `This command is locked and cannot be modified.\n` +
        `Hash: ${hash.substring(0, 20)}...`
      );
    }

    // Check if command name already exists in another hash
    const existingCommand = Object.entries(sticker).find(([_, cmd]) => cmd.text === text);
    if (existingCommand && existingCommand[0] !== hash) {
      return m.reply(
        `❌ *Error - Add Command*\n\n` +
        `Command name *${text}* already exists.\n` +
        `Please use a different name.`
      );
    }

    // Save the custom command
    sticker[hash] = {
      text: text,
      mentionedJid: m.mentionedJid || [],
      creator: m.sender,
      at: Date.now(),
      locked: false
    };

    return m.reply(
      `✅ *Success - Command Added*\n\n` +
      `• Command: *${text}*\n` +
      `• Hash: \`${hash.substring(0, 20)}...\`\n` +
      `• Status: 🔓 Unlocked\n\n` +
      `Users can now use *${text}* to get this media.`
    );
  }
  
  // ========== DELETE COMMAND (delcmd / removecmd) ==========
  else if (command === 'delcmd' || command === 'removecmd') {
    let hash = text;
    
    // If user replied to a message, get hash from that message
    if (m.quoted && m.quoted.fileSha256) {
      hash = m.quoted.fileSha256.toString('base64');
    }
    
    // Check if hash is provided
    if (!hash) {
      return m.reply(
        `❌ *Error - Delete Command*\n\n` +
        `Please provide the command hash or reply to the command media.\n\n` +
        `*Usage:* ${usedPrefix + command} <hash>\n` +
        `*Example:* ${usedPrefix + command} abc123...\n` +
        `*Or reply to the command media with:* ${usedPrefix + command}`
      );
    }
    
    // Check if command exists
    if (!sticker[hash]) {
      return m.reply(
        `❌ *Error - Delete Command*\n\n` +
        `Command not found with hash: ${hash.substring(0, 20)}...\n` +
        `Use ${usedPrefix}listcmd to see all commands.`
      );
    }
    
    // Check if command is locked
    if (sticker[hash] && sticker[hash].locked) {
      return m.reply(
        `❌ *Error - Delete Command*\n\n` +
        `This command is locked and cannot be deleted.\n` +
        `Command: *${sticker[hash].text}*`
      );
    }

    const commandName = sticker[hash].text;
    
    // Delete the command
    delete sticker[hash];

    return m.reply(
      `✅ *Success - Command Deleted*\n\n` +
      `• Command: *${commandName}*\n` +
      `• Hash: \`${hash.substring(0, 20)}...\`\n\n` +
      `The command has been removed successfully.`
    );
  }
  
  // ========== LOCK/UNLOCK COMMAND (lockcmd / unlockcmd) ==========
  else if (command === 'lockcmd' || command === 'unlockcmd') {
    let hash = text;
    const isLock = command === 'lockcmd';
    
    // If user replied to a message, get hash from that message
    if (m.quoted && m.quoted.fileSha256) {
      hash = m.quoted.fileSha256.toString('base64');
    }
    
    // Check if hash is provided
    if (!hash) {
      return m.reply(
        `❌ *Error - ${isLock ? 'Lock' : 'Unlock'} Command*\n\n` +
        `Please provide the command hash or reply to the command media.\n\n` +
        `*Usage:* ${usedPrefix + command} <hash>\n` +
        `*Example:* ${usedPrefix + command} abc123...`
      );
    }
    
    // Check if command exists
    if (!sticker[hash]) {
      return m.reply(
        `❌ *Error - ${isLock ? 'Lock' : 'Unlock'} Command*\n\n` +
        `Command not found with hash: ${hash.substring(0, 20)}...`
      );
    }

    // Update lock status
    sticker[hash].locked = isLock;

    return m.reply(
      `✅ *Success - Command ${isLock ? 'Locked' : 'Unlocked'}*\n\n` +
      `• Command: *${sticker[hash].text}*\n` +
      `• Status: ${isLock ? '🔒 Locked' : '🔓 Unlocked'}\n\n` +
      `${isLock ? 'This command can no longer be modified.' : 'This command can now be modified.'}`
    );
  }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = [
  'cmdlist',
  'addcmd',
  'delcmd',
  'lockcmd',
  'unlockcmd'
];

handler.command = [
  // List commands
  'cmdlist', 'listcmd',
  // Add commands
  'addcmd', 'setcmd', 'cmdadd', 'cmdset',
  // Delete commands
  'delcmd', 'removecmd',
  // Lock/Unlock commands
  'lockcmd', 'unlockcmd'
];

handler.tags = ['owner'];
handler.rowner = true; // Only real owner can use this command

export default handler;