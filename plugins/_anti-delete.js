// plugins/anti-delete.js
// Anti-Delete Plugin - Recovers deleted messages with caching

/**
 * Message cache storage - stores up to 5000 messages to handle deletions
 */
global.msgCache = global.msgCache || {};

/**
 * Maximum number of messages to keep in cache
 */
const MAX_CACHE_SIZE = 5000;

/**
 * Format timestamp to HH:MM
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted time
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get message type from message object
 * @param {Object} msg - Message object
 * @returns {string} Message type
 */
function getMessageType(msg) {
  if (!msg || !msg.message) return 'unknown';
  
  const types = [
    'conversation',
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage',
    'stickerMessage',
    'contactMessage',
    'locationMessage',
    'pollCreationMessage',
    'extendedTextMessage'
  ];
  
  for (const type of types) {
    if (msg.message[type]) return type;
  }
  
  return 'unknown';
}

/**
 * Get message text content
 * @param {Object} msg - Message object
 * @returns {string} Message text
 */
function getMessageText(msg) {
  if (!msg || !msg.message) return '';
  
  const type = getMessageType(msg);
  
  switch (type) {
    case 'conversation':
      return msg.message.conversation || '';
    case 'extendedTextMessage':
      return msg.message.extendedTextMessage?.text || '';
    case 'imageMessage':
      return msg.message.imageMessage?.caption || '';
    case 'videoMessage':
      return msg.message.videoMessage?.caption || '';
    default:
      return '';
  }
}

/**
 * Manage cache size - remove oldest messages when limit reached
 */
function manageCacheSize() {
  const keys = Object.keys(global.msgCache);
  if (keys.length <= MAX_CACHE_SIZE) return;
  
  // Sort by timestamp and remove oldest
  const sorted = keys.sort((a, b) => 
    (global.msgCache[a]?.timestamp || 0) - (global.msgCache[b]?.timestamp || 0)
  );
  
  const toRemove = sorted.slice(0, keys.length - MAX_CACHE_SIZE);
  toRemove.forEach(key => delete global.msgCache[key]);
  
  console.log(`[Anti-Delete] Cache cleaned: removed ${toRemove.length} old messages`);
}

/**
 * Recover deleted message
 * @param {Object} conn - Socket connection
 * @param {string} chatId - Chat JID
 * @param {string} messageId - Deleted message ID
 * @param {string} sender - Sender JID
 */
async function recoverMessage(conn, chatId, messageId, sender) {
  const cachedMsg = global.msgCache[messageId];
  
  if (!cachedMsg) {
    console.log(`[Anti-Delete] Message ${messageId} not found in cache`);
    return;
  }
  
  const messageType = getMessageType(cachedMsg);
  const messageText = getMessageText(cachedMsg);
  const timeStr = formatTime(cachedMsg.timestamp || Date.now());
  
  // Create header
  const header = `🛡️ *ANTI-DELETE SYSTEM* 🛡️\n` +
                 `👤 *From:* @${sender.split('@')[0]}\n` +
                 `🕒 *Time:* ${timeStr}\n\n`;
  
  try {
    // Handle different message types
    switch (messageType) {
      case 'imageMessage':
        // Download and re-upload image to ensure availability
        const imageBuffer = await conn.downloadMediaMessage(cachedMsg);
        await conn.sendMessage(chatId, {
          image: imageBuffer,
          caption: header + (messageText ? `📝 *Caption:* ${messageText}` : ''),
          mentions: [sender]
        });
        break;
        
      case 'videoMessage':
        const videoBuffer = await conn.downloadMediaMessage(cachedMsg);
        await conn.sendMessage(chatId, {
          video: videoBuffer,
          caption: header + (messageText ? `📝 *Caption:* ${messageText}` : ''),
          mentions: [sender]
        });
        break;
        
      case 'audioMessage':
        const audioBuffer = await conn.downloadMediaMessage(cachedMsg);
        await conn.sendMessage(chatId, {
          audio: audioBuffer,
          mimetype: cachedMsg.message.audioMessage?.mimetype || 'audio/mp4',
          ptt: cachedMsg.message.audioMessage?.ptt || false,
          caption: header,
          mentions: [sender]
        });
        break;
        
      case 'stickerMessage':
        const stickerBuffer = await conn.downloadMediaMessage(cachedMsg);
        await conn.sendMessage(chatId, {
          sticker: stickerBuffer,
          caption: header,
          mentions: [sender]
        });
        break;
        
      case 'documentMessage':
        const docBuffer = await conn.downloadMediaMessage(cachedMsg);
        await conn.sendMessage(chatId, {
          document: docBuffer,
          fileName: cachedMsg.message.documentMessage?.fileName || 'document',
          mimetype: cachedMsg.message.documentMessage?.mimetype,
          caption: header,
          mentions: [sender]
        });
        break;
        
      case 'contactMessage':
        await conn.sendMessage(chatId, {
          contacts: {
            displayName: cachedMsg.message.contactMessage?.displayName || 'Contact',
            contacts: [{
              vcard: cachedMsg.message.contactMessage?.vcard || ''
            }]
          },
          contextInfo: {
            mentionedJid: [sender],
            stanzaId: messageId,
            participant: sender
          }
        });
        break;
        
      case 'locationMessage':
        await conn.sendMessage(chatId, {
          location: {
            degreesLatitude: cachedMsg.message.locationMessage?.degreesLatitude || 0,
            degreesLongitude: cachedMsg.message.locationMessage?.degreesLongitude || 0,
            name: cachedMsg.message.locationMessage?.name,
            address: cachedMsg.message.locationMessage?.address
          },
          contextInfo: {
            mentionedJid: [sender],
            stanzaId: messageId,
            participant: sender
          }
        });
        break;
        
      case 'pollCreationMessage':
        await conn.sendMessage(chatId, {
          poll: {
            name: cachedMsg.message.pollCreationMessage?.name || 'Poll',
            values: cachedMsg.message.pollCreationMessage?.options?.map(o => o.optionName) || [],
            selectableCount: 1
          },
          contextInfo: {
            mentionedJid: [sender],
            stanzaId: messageId,
            participant: sender
          }
        });
        break;
        
      case 'conversation':
      case 'extendedTextMessage':
      default:
        // For text messages, use copyNForward which preserves all context
        await conn.copyNForward(chatId, cachedMsg, true, {
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 0,
            isForwarded: true
          }
        });
        break;
    }
    
    console.log(`[Anti-Delete] Recovered ${messageType} from ${sender} in ${chatId}`);
    
  } catch (error) {
    console.error('[Anti-Delete] Recovery error:', error);
    
    // Fallback to simple text recovery
    try {
      await conn.sendMessage(chatId, {
        text: header + (messageText || '*Message could not be fully recovered*'),
        mentions: [sender]
      });
    } catch (fallbackError) {
      console.error('[Anti-Delete] Fallback error:', fallbackError);
    }
  }
}

/**
 * Main handler for the anti-delete plugin
 */
let handler = async (m, { conn, isAdmin, isOwner }) => {
  // Command handler for .antidelete
  if (m.text && m.text.startsWith('.antidelete')) {
    const args = m.text.split(' ').slice(1);
    const action = args[0]?.toLowerCase();
    
    // Ensure chat data exists
    if (!global.db?.data?.chats) global.db.data.chats = {};
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    
    const chat = global.db.data.chats[m.chat];
    
    // Check if user is admin or owner
    const isGroupAdmin = m.isGroup ? (isAdmin || isOwner) : true;
    
    if (!isGroupAdmin && !isOwner) {
      await m.reply('❌ *This command can only be used by group admins or bot owner*');
      return;
    }
    
    if (action === 'on' || action === 'enable') {
      chat.antidelete = true;
      await m.reply(`🛡️ *Anti-Delete Enabled*\n\nDeleted messages in this group will be recovered.`);
    } else if (action === 'off' || action === 'disable') {
      chat.antidelete = false;
      await m.reply(`🛡️ *Anti-Delete Disabled*\n\nDeleted messages will no longer be recovered.`);
    } else {
      const status = chat.antidelete ? '✅ Enabled' : '❌ Disabled';
      await m.reply(`🛡️ *ANTI-DELETE*\n\n` +
        `*Status:* ${status}\n\n` +
        `*Usage:*\n` +
        `• .antidelete on - Enable\n` +
        `• .antidelete off - Disable`);
    }
    return;
  }
};

/**
 * Before handler - caches messages and processes deletions
 */
handler.before = async (m, { conn }) => {
  try {
    // Cache all incoming messages
    if (m?.key?.id && m?.message && !m.isBaileys) {
      global.msgCache[m.key.id] = {
        message: m.message,
        key: m.key,
        sender: m.sender,
        timestamp: Date.now(),
        pushName: m.pushName
      };
      
      // Manage cache size
      manageCacheSize();
    }
    
    // Check for protocol messages (deletions)
    if (m.messageStubType === 0) { // 0 = REVOKE
      const chatId = m.key.remoteJid;
      
      // Check if anti-delete is enabled for this chat
      if (!global.db?.data?.chats?.[chatId]?.antidelete) return;
      
      const deletedMessageId = m.messageStubParameters?.[0];
      const sender = m.participant || m.key.participant;
      
      if (!deletedMessageId || !sender) return;
      
      console.log(`[Anti-Delete] Detected deletion: ${deletedMessageId}`);
      
      // Recover the deleted message
      await recoverMessage(conn, chatId, deletedMessageId, sender);
    }
    
  } catch (error) {
    console.error('[Anti-Delete] Before handler error:', error);
  }
};

handler.help = ['antidelete'];
handler.tags = ['group'];
handler.command = /^(antidelete)$/i;
handler.group = true;

export default handler;