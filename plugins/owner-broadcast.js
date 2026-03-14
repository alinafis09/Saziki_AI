// plugins/owner-broadcast.js
// Advanced Universal Broadcast Command with Media Support

/**
 * Sleep/delay utility function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format broadcast results for summary message
 * @param {Object} stats - Broadcast statistics
 * @returns {string} Formatted summary message
 */
function formatBroadcastSummary(stats) {
  const { total, success, failed, failedGroups, totalTime, contentType } = stats;
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  
  const contentTypeEmoji = {
    text: '📝',
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📎',
    poll: '📊',
    contact: '👤',
    location: '📍',
    sticker: '🎨'
  };
  
  let summary = `📢 *BROADCAST SUMMARY*\n\n`;
  summary += `📦 *Content Type:* ${contentTypeEmoji[contentType] || '📝'} ${contentType.toUpperCase()}\n`;
  summary += `📊 *Total Groups:* ${total}\n`;
  summary += `✅ *Success:* ${success}\n`;
  summary += `❌ *Failed:* ${failed}\n`;
  summary += `⏱️ *Time:* ${minutes}m ${seconds}s\n`;
  
  if (failedGroups.length > 0) {
    summary += `\n⚠️ *Failed Groups:*\n`;
    failedGroups.slice(0, 5).forEach(group => {
      summary += `  • ${group.subject || 'Unknown'} (${group.reason})\n`;
    });
    if (failedGroups.length > 5) {
      summary += `  • ... and ${failedGroups.length - 5} more\n`;
    }
  }
  
  return summary;
}

/**
 * Safely extract media message from quoted message
 * @param {Object} m - Message object
 * @returns {Object|null} Media content or null
 */
async function extractQuotedMedia(m, conn) {
  if (!m?.quoted) return null;
  
  try {
    const quoted = m.quoted;
    
    // Safely access message property
    if (!quoted?.message) return null;
    
    const msg = quoted.message;
    
    // Helper to safely get nested properties
    const safeGet = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    // Check for pollCreationMessage in various possible locations
    const pollMessage = msg.pollCreationMessage || 
                       safeGet(msg, 'message.pollCreationMessage') ||
                       safeGet(msg, 'extendedTextMessage.contextInfo.quotedMessage.pollCreationMessage');

    if (pollMessage) {
      return {
        type: 'poll',
        name: pollMessage.name || 'Poll',
        options: (pollMessage.options || []).map(opt => opt.optionName || opt)
      };
    }
    
    // Image Message
    if (msg.imageMessage) {
      const buffer = await quoted.download().catch(() => null);
      return {
        type: 'image',
        buffer,
        caption: msg.imageMessage.caption || '',
        mimetype: msg.imageMessage.mimetype
      };
    }
    
    // Video Message
    if (msg.videoMessage) {
      const buffer = await quoted.download().catch(() => null);
      return {
        type: 'video',
        buffer,
        caption: msg.videoMessage.caption || '',
        mimetype: msg.videoMessage.mimetype,
        seconds: msg.videoMessage.seconds
      };
    }
    
    // Audio Message
    if (msg.audioMessage) {
      const buffer = await quoted.download().catch(() => null);
      return {
        type: 'audio',
        buffer,
        mimetype: msg.audioMessage.mimetype,
        seconds: msg.audioMessage.seconds,
        ptt: msg.audioMessage.ptt
      };
    }
    
    // Document Message
    if (msg.documentMessage) {
      const buffer = await quoted.download().catch(() => null);
      return {
        type: 'document',
        buffer,
        fileName: msg.documentMessage.fileName || 'document',
        mimetype: msg.documentMessage.mimetype
      };
    }
    
    // Sticker Message
    if (msg.stickerMessage) {
      const buffer = await quoted.download().catch(() => null);
      return {
        type: 'sticker',
        buffer,
        mimetype: msg.stickerMessage.mimetype
      };
    }
    
    // Contact Message
    if (msg.contactMessage) {
      return {
        type: 'contact',
        displayName: msg.contactMessage.displayName,
        vcard: msg.contactMessage.vcard
      };
    }
    
    // Location Message
    if (msg.locationMessage) {
      return {
        type: 'location',
        degreesLatitude: msg.locationMessage.degreesLatitude,
        degreesLongitude: msg.locationMessage.degreesLongitude,
        name: msg.locationMessage.name,
        address: msg.locationMessage.address
      };
    }
    
    // Text in extendedTextMessage
    if (msg.extendedTextMessage?.text) {
      return {
        type: 'text',
        text: msg.extendedTextMessage.text
      };
    }
    
    // Plain conversation
    if (msg.conversation) {
      return {
        type: 'text',
        text: msg.conversation
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('Error extracting quoted media:', error);
    return null;
  }
}

/**
 * Send broadcast message to group based on content type
 * @param {Object} conn - Socket connection
 * @param {string} groupId - Group JID
 * @param {Object} content - Content to send
 * @param {string} text - Optional text for text broadcasts
 * @returns {Promise} Send result
 */
async function sendBroadcastToGroup(conn, groupId, content, text) {
  if (!content) {
    // Text only broadcast
    return await conn.sendMessage(groupId, {
      text: `📢 *BROADCAST*\n\n${text}`,
      contextInfo: {
        externalAdReply: {
          title: 'Broadcast from Owner',
          body: 'Saziki Bot',
          mediaType: 1
        }
      }
    });
  }
  
  // Media broadcast based on type
  switch (content.type) {
    case 'image':
      return await conn.sendMessage(groupId, {
        image: content.buffer,
        caption: `📢 *BROADCAST*\n\n${content.caption || ''}`,
        mimetype: content.mimetype,
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'video':
      return await conn.sendMessage(groupId, {
        video: content.buffer,
        caption: `📢 *BROADCAST*\n\n${content.caption || ''}`,
        mimetype: content.mimetype,
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'audio':
      return await conn.sendMessage(groupId, {
        audio: content.buffer,
        mimetype: content.mimetype,
        ptt: content.ptt || false,
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'document':
      return await conn.sendMessage(groupId, {
        document: content.buffer,
        fileName: content.fileName,
        mimetype: content.mimetype,
        caption: `📢 *BROADCAST*`,
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'sticker':
      return await conn.sendMessage(groupId, {
        sticker: content.buffer,
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'contact':
      return await conn.sendMessage(groupId, {
        contacts: {
          displayName: content.displayName,
          contacts: [{
            vcard: content.vcard
          }]
        },
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'location':
      return await conn.sendMessage(groupId, {
        location: {
          degreesLatitude: content.degreesLatitude,
          degreesLongitude: content.degreesLongitude,
          name: content.name,
          address: content.address
        },
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'poll':
      return await conn.sendMessage(groupId, {
        poll: {
          name: `📢 *BROADCAST*\n\n${content.name}`,
          values: content.options,
          selectableCount: 1
        },
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    case 'text':
      return await conn.sendMessage(groupId, {
        text: `📢 *BROADCAST*\n\n${content.text}`,
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
      
    default:
      // Fallback to text
      return await conn.sendMessage(groupId, {
        text: `📢 *BROADCAST*\n\n${text || 'Broadcast message'}`,
        contextInfo: {
          externalAdReply: {
            title: 'Broadcast from Owner',
            body: 'Saziki Bot',
            mediaType: 1
          }
        }
      });
  }
}

/**
 * Create a new poll from command text
 * @param {string} text - Command text in format "Question | Option1 | Option2"
 * @returns {Object|null} Poll content or null if invalid
 */
function createPollFromText(text) {
  if (!text || !text.includes('|')) return null;
  
  const parts = text.split('|').map(p => p.trim());
  if (parts.length < 3) return null; // Need at least question + 2 options
  
  const question = parts[0];
  const options = parts.slice(1);
  
  return {
    type: 'poll',
    name: question,
    options: options
  };
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Check if user is owner
  const senderNumber = m.sender.split('@')[0];
  const isOwner = global.owner?.some(owner => {
    const ownerNumber = Array.isArray(owner) ? owner[0] : owner;
    return ownerNumber?.replace(/[^0-9]/g, '') === senderNumber.replace(/[^0-9]/g, '');
  });

  if (!isOwner && !m.fromMe) {
    await m.reply('❌ *This command can only be used by the bot owner*');
    return;
  }

  // Check for poll creation from text first
  const pollFromText = createPollFromText(text);
  
  // Then check for quoted media
  const quotedMedia = await extractQuotedMedia(m, conn);
  
  let contentType = 'text';
  let contentForBroadcast = null;
  let broadcastText = text;

  if (pollFromText) {
    // Priority 1: Poll created from text command
    contentType = 'poll';
    contentForBroadcast = pollFromText;
    broadcastText = pollFromText.name;
  } else if (quotedMedia) {
    // Priority 2: Quoted media
    contentType = quotedMedia.type;
    contentForBroadcast = quotedMedia;
    broadcastText = text || (quotedMedia.caption || quotedMedia.text || '');
  } else if (!text) {
    // No input at all
    await m.reply(`📢 *UNIVERSAL BROADCAST*\n\n` +
      `*Usage:*\n` +
      `• ${usedPrefix + command} <message> - Broadcast text\n` +
      `• Reply to any message with ${usedPrefix + command} - Broadcast that media\n` +
      `• ${usedPrefix + command} Question | Option1 | Option2 - Create and broadcast a poll\n\n` +
      `*Supported Media:*\n` +
      `🖼️ Images • 🎥 Videos • 🎵 Audio • 📎 Documents\n` +
      `🎨 Stickers • 👤 Contacts • 📍 Location • 📊 Polls\n\n` +
      `*Examples:*\n` +
      `• ${usedPrefix + command} Hello everyone!\n` +
      `• ${usedPrefix + command} Favorite color? | Red | Blue | Green`);
    return;
  }

  // Send initial status
  const mediaEmoji = {
    text: '📝',
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📎',
    sticker: '🎨',
    contact: '👤',
    location: '📍',
    poll: '📊'
  };
  
  const statusMsg = await m.reply(`${mediaEmoji[contentType] || '📢'} *Broadcasting...*\n` +
    '▰▱▱▱▱▱▱▱▱▱ 10% - Fetching groups...');

  try {
    // Fetch all groups
    const groups = await conn.groupFetchAllParticipating();
    const groupList = Object.values(groups).filter(g => g.id.endsWith('@g.us'));
    const totalGroups = groupList.length;

    await conn.sendMessage(m.chat, {
      text: `${mediaEmoji[contentType] || '📢'} *Broadcasting...*\n` +
        `▰▰▱▱▱▱▱▱▱▱ 30% - Found ${totalGroups} groups\n` +
        `📦 Content: ${contentType.toUpperCase()}\n` +
        `⏱️ Est. time: ${Math.ceil(totalGroups * 3 / 60)} minutes`,
      edit: statusMsg.key
    });

    if (totalGroups === 0) {
      await conn.sendMessage(m.chat, {
        text: '❌ *No groups found*',
        edit: statusMsg.key
      });
      return;
    }

    // Broadcast statistics
    const stats = {
      total: totalGroups,
      success: 0,
      failed: 0,
      failedGroups: [],
      startTime: Date.now(),
      contentType: contentType
    };

    // Send broadcast to each group with 3-second delay
    for (let i = 0; i < groupList.length; i++) {
      const group = groupList[i];
      
      try {
        // Send message to group
        await sendBroadcastToGroup(conn, group.id, contentForBroadcast, broadcastText);
        
        stats.success++;
        
        // Update progress every 3 groups
        if ((i + 1) % 3 === 0 || i === groupList.length - 1) {
          const percent = Math.floor(((i + 1) / totalGroups) * 100);
          const barLength = Math.floor(percent / 10);
          const progressBar = '▰'.repeat(barLength) + '▱'.repeat(10 - barLength);
          
          await conn.sendMessage(m.chat, {
            text: `${mediaEmoji[contentType] || '📢'} *Broadcasting...*\n` +
              `${progressBar} ${percent}%\n` +
              `✅ Sent: ${i + 1}/${totalGroups} groups\n` +
              `📦 Content: ${contentType.toUpperCase()}`,
            edit: statusMsg.key
          });
        }
        
      } catch (error) {
        console.error(`Failed to send to group ${group.id}:`, error);
        stats.failed++;
        stats.failedGroups.push({
          id: group.id,
          subject: group.subject || 'Unknown',
          reason: error.message || 'Unknown error'
        });
      }

      // 3-second delay between sends (required for safety)
      await sleep(3000);
    }

    // Calculate total time
    stats.totalTime = Math.floor((Date.now() - stats.startTime) / 1000);
    
    // Send summary
    const summary = formatBroadcastSummary(stats);
    await conn.sendMessage(m.chat, { text: summary }, { quoted: m });

  } catch (error) {
    console.error('Broadcast error:', error);
    
    // Error message
    const errorMsg = `❌ *Broadcast Failed*\n\n` +
      `*Error:* ${error.message || 'Unknown error'}\n\n` +
      `Please check logs and try again.`;
    
    await conn.sendMessage(m.chat, {
      text: errorMsg,
      edit: statusMsg.key
    });
  }
};

handler.help = ['broadcast', 'bcast', 'bc'];
handler.tags = ['owner'];
handler.command = /^(broadcast|bcast|bc)$/i;
handler.owner = true;
handler.limit = false;
handler.premium = false;

export default handler;