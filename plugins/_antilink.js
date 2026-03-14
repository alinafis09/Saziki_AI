// plugins/antilink.js
// Anti-Link Plugin - Simple and Clean Version

/**
 * Check if message contains any link using simple regex
 * @param {string} text - Message text to check
 * @returns {boolean} True if link found
 */
function containsLink(text) {
  if (!text || typeof text !== 'string') return false;
  
  // Simple regex to detect any http/https link
  const linkRegex = /(https?:\/\/[^\s]+)/gi;
  return linkRegex.test(text);
}

/**
 * Format warning message
 * @param {string} userJid - User JID
 * @returns {string} Formatted warning
 */
function formatWarning(userJid) {
  const mention = userJid.split('@')[0];
  return `⚠️ *ANTI-LINK SYSTEM* ⚠️\n\n` +
         `@${mention} *Links are not allowed in this group!*\n\n` +
         `👤 *User:* @${mention}\n\n` +
         `*You have been removed from the group.*`;
}

// Main handler for the .antilink command
let handler = async (m, { conn, isAdmin, isOwner }) => {
  // Only process if in a group
  if (!m.isGroup) {
    await m.reply('❌ *This command can only be used in groups*');
    return;
  }

  // Check if user is admin or owner
  if (!isAdmin && !isOwner) {
    await m.reply('❌ *This command can only be used by group admins*');
    return;
  }

  const args = m.text.split(' ').slice(1);
  const action = args[0]?.toLowerCase();

  // Ensure chat data exists
  if (!global.db?.data?.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {};
  }

  const chat = global.db.data.chats[m.chat];

  if (action === 'on' || action === 'enable') {
    chat.antiLink = true;
    await m.reply(`🔗 *Anti-Link Enabled*\n\nLinks are now prohibited in this group. Violators will be removed.`);
  } else if (action === 'off' || action === 'disable') {
    chat.antiLink = false;
    await m.reply(`🔗 *Anti-Link Disabled*\n\nLinks are now allowed in this group.`);
  } else {
    const status = chat.antiLink ? '✅ Enabled' : '❌ Disabled';
    await m.reply(`🔗 *ANTI-LINK SYSTEM*\n\n` +
      `*Status:* ${status}\n\n` +
      `*Usage:*\n` +
      `• .antilink on - Enable anti-link\n` +
      `• .antilink off - Disable anti-link\n\n` +
      `*Info:* When enabled, members who post links will be removed (requires bot to be admin).`);
  }
};

// Before handler to monitor messages
handler.before = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  // Skip if not in group
  if (!m.isGroup) return;

  // Skip if feature is not enabled
  const chat = global.db?.data?.chats?.[m.chat];
  if (!chat || !chat.antiLink) return;

  // Skip if sender is admin, owner, or bot itself
  if (isAdmin || isOwner || m.isBaileys || m.fromMe) return;

  // Skip non-text messages
  if (m.mtype !== 'conversation' && m.mtype !== 'extendedTextMessage') return;

  const text = m.text;
  
  // Check if contains link using simple regex
  if (!containsLink(text)) return;

  try {
    const userMention = m.sender;
    const userName = m.pushName || 'User';

    // 1. Delete the message
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender
        }
      });
      console.log(`[Anti-Link] Deleted message from ${userName}`);
    } catch (deleteError) {
      console.error('[Anti-Link] Failed to delete message:', deleteError);
    }

    // 2. Kick the user if bot is admin
    if (isBotAdmin) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [userMention], 'remove');
        console.log(`[Anti-Link] Removed ${userName} (${userMention}) for posting link`);
        
        // 3. Send warning message (optional, can be removed if you don't want to spam)
        // await conn.sendMessage(m.chat, {
        //   text: formatWarning(userMention),
        //   mentions: [userMention]
        // });
        
      } catch (kickError) {
        console.error('[Anti-Link] Failed to kick user:', kickError);
        
        // Send warning that kicking failed
        await conn.sendMessage(m.chat, {
          text: `⚠️ Failed to remove user. Please make sure I have admin privileges.`
        });
      }
    } else {
      // Just warn if bot is not admin
      const warningMsg = formatWarning(userMention);
      await conn.sendMessage(m.chat, {
        text: warningMsg,
        mentions: [userMention]
      });
    }

  } catch (error) {
    console.error('[Anti-Link] Error processing message:', error);
  }
};

// Initialize default settings for all chats
if (!global.db?.data?.chats) {
  global.db.data.chats = {};
}

handler.help = ['antilink'];
handler.tags = ['group'];
handler.command = /^(antilink)$/i;
handler.group = true;

export default handler;