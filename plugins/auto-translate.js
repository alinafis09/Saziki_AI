// plugins/auto-translate.js
// Auto-Translate messages to Custom Target Languages per Group

import translate from '@vitalets/google-translate-api';

/**
 * Common language codes for reference
 */
const COMMON_LANGUAGES = {
  'ar': 'العربية',
  'en': 'English',
  'fr': 'Français',
  'es': 'Español',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ru': 'Русский',
  'zh': '中文',
  'ja': '日本語',
  'ko': '한국어',
  'tr': 'Türkçe',
  'nl': 'Nederlands',
  'pl': 'Polski',
  'sv': 'Svenska',
  'da': 'Dansk',
  'fi': 'Suomi',
  'no': 'Norsk',
  'he': 'עברית',
  'hi': 'हिन्दी',
  'id': 'Bahasa Indonesia',
  'ms': 'Bahasa Melayu',
  'th': 'ภาษาไทย',
  'vi': 'Tiếng Việt'
};

/**
 * Get language name from ISO code
 * @param {string} code - ISO language code
 * @returns {string} Language name
 */
function getLanguageName(code) {
  return COMMON_LANGUAGES[code] || code;
}

/**
 * Check if text matches target language (simplified - based on script)
 * @param {string} text - Text to check
 * @param {string} targetLang - Target language code
 * @returns {boolean} True if likely same language
 */
function isInTargetLanguage(text, targetLang) {
  if (!text || !targetLang) return false;
  
  // Language script patterns
  const patterns = {
    'ar': /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/,
    'en': /^[a-zA-Z0-9\s\p{P}]+$/u,
    'fr': /^[a-zA-Z0-9\s\p{P}]+$/u,
    'es': /^[a-zA-Z0-9\s\p{P}]+$/u,
    'de': /^[a-zA-Z0-9\s\p{P}]+$/u,
    'ru': /[\u0400-\u04FF]/,
    'zh': /[\u4e00-\u9fff]/,
    'ja': /[\u3040-\u309F\u30A0-\u30FF\u4e00-\u9faf]/,
    'ko': /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,
    'he': /[\u0590-\u05FF]/,
    'hi': /[\u0900-\u097F]/,
    'th': /[\u0E00-\u0E7F]/
  };
  
  const pattern = patterns[targetLang];
  if (!pattern) return false;
  
  // Check if text matches the pattern for target language
  const textWithoutSpaces = text.replace(/\s/g, '');
  if (textWithoutSpaces.length === 0) return false;
  
  const matches = (textWithoutSpaces.match(pattern) || []).length;
  const ratio = matches / textWithoutSpaces.length;
  
  // If more than 70% matches the pattern, consider it's in that language
  return ratio > 0.7;
}

/**
 * Extract language from translation response
 * @param {Object} result - Translation result
 * @returns {string} Language code
 */
function extractSourceLanguage(result) {
  try {
    // Try different possible response structures
    if (result?.from?.language?.iso) {
      return result.from.language.iso;
    }
    if (result?.raw?.ld_result?.srclang) {
      return result.raw.ld_result.srclang;
    }
  } catch (e) {
    // Ignore errors
  }
  return 'unknown';
}

/**
 * Validate language code
 * @param {string} code - Language code to validate
 * @returns {boolean} True if valid
 */
function isValidLanguage(code) {
  return COMMON_LANGUAGES.hasOwnProperty(code);
}

/**
 * Format language list for display
 * @returns {string} Formatted language list
 */
function formatLanguageList() {
  const entries = Object.entries(COMMON_LANGUAGES).slice(0, 15);
  return entries.map(([code, name]) => `• ${code} - ${name}`).join('\n');
}

// Main translation handler
async function handleAutoTranslate(m, conn) {
  // Skip if no message or database
  if (!m || !m.text || !global.db?.data?.chats) return;
  
  const chat = global.db.data.chats[m.chat] || {};
  const targetLang = chat.autoTranslate;
  
  // Ignore if not in group or auto-translate is disabled (false, null, undefined)
  if (!m.isGroup || !targetLang) return;

  // Ignore bot's own messages
  if (m.isBaileys || m.fromMe) return;

  // Only translate text messages
  if (m.mtype !== 'conversation' && m.mtype !== 'extendedTextMessage') return;

  const text = m.text.trim();
  
  // Skip empty or very short messages (less than 3 words)
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 3) return;

  // Skip if message appears to be in target language
  if (isInTargetLanguage(text, targetLang)) return;

  try {
    // Translate to target language
    const result = await translate(text, { to: targetLang });
    
    if (!result || !result.text) return;
    
    // Extract source language from response
    const sourceLang = extractSourceLanguage(result);
    
    // Skip if source is the same as target (just in case detection missed it)
    if (sourceLang === targetLang) return;

    const sourceLangName = getLanguageName(sourceLang) || sourceLang;
    const targetLangName = getLanguageName(targetLang) || targetLang;
    const translatedText = result.text;

    // Send translation as reply
    await conn.sendMessage(m.chat, {
      text: `🌐 *Translation* (${sourceLangName} → ${targetLangName})\n\n${translatedText}`,
      contextInfo: {
        mentionedJid: [m.sender],
        stanzaId: m.key.id,
        participant: m.sender
      }
    }, { quoted: m });

  } catch (error) {
    // Silently fail - don't crash the bot
    console.error('Auto-translate error:', error.message);
    
    // If rate limited, wait a bit before trying again
    if (error.message.includes('Too Many Requests') || error.message.includes('429')) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Command handler for configuring auto-translate
let handler = async (m, { conn, isAdmin, isOwner }) => {
  // Only process commands that start with .autotranslate or .at
  const prefix = global.prefix || /^[#!/.]/;
  const isCommand = m.text && (
    m.text.startsWith('.autotranslate') || 
    m.text.startsWith('.at') ||
    m.text.startsWith('#autotranslate') ||
    m.text.startsWith('#at') ||
    m.text.startsWith('!autotranslate') ||
    m.text.startsWith('!at')
  );

  if (!isCommand) return;

  const args = m.text.split(' ').slice(1);
  const action = args[0]?.toLowerCase();
  
  // Ensure chat data exists
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {};
  }
  
  const chat = global.db.data.chats[m.chat];

  // Check if user is admin or owner
  const isGroupAdmin = m.isGroup ? (isAdmin || isOwner) : true;
  
  if (!isGroupAdmin && !isOwner) {
    await m.reply('❌ *This command can only be used by group admins or bot owner*');
    return;
  }

  // Handle different commands
  if (action === 'off' || action === 'disable') {
    // Disable auto-translate
    chat.autoTranslate = false;
    await m.reply(`🌐 *Auto-Translate Disabled*\n\nMessages will no longer be auto-translated.`);
    
  } else if (action === 'list' || action === 'help') {
    // Show language list
    const languageList = formatLanguageList();
    await m.reply(`🌐 *AVAILABLE LANGUAGES*\n\n${languageList}\n\n*Usage:* .at <code>\n*Example:* .at en`);
    
  } else if (action && isValidLanguage(action)) {
    // Enable with specific language
    chat.autoTranslate = action;
    const langName = getLanguageName(action);
    await m.reply(`🌐 *Auto-Translate Enabled*\n\nTarget Language: *${langName}* (${action})\nMessages will be translated to this language.`);
    
  } else if (!action) {
    // Show current status
    const currentLang = chat.autoTranslate;
    if (!currentLang) {
      await m.reply(`🌐 *AUTO-TRANSLATE*\n\n` +
        `*Status:* ❌ Disabled\n\n` +
        `*Usage:*\n` +
        `• .at <code> - Enable with language code\n` +
        `• .at off - Disable\n` +
        `• .at list - Show available languages\n\n` +
        `*Examples:*\n` +
        `• .at en - Translate to English\n` +
        `• .at fr - Translate to French\n` +
        `• .at ar - Translate to Arabic`);
    } else {
      const langName = getLanguageName(currentLang);
      await m.reply(`🌐 *AUTO-TRANSLATE*\n\n` +
        `*Status:* ✅ Enabled\n` +
        `*Target:* ${langName} (${currentLang})\n\n` +
        `*Commands:*\n` +
        `• .at <code> - Change language\n` +
        `• .at off - Disable\n` +
        `• .at list - Show available languages`);
    }
    
  } else {
    // Invalid language code
    await m.reply(`❌ *Invalid language code*\n\nUse *.at list* to see available languages.\nExample: .at en`);
  }
};

// Initialize default settings for all chats
if (!global.db?.data?.chats) {
  global.db.data.chats = {};
}

// This function runs before the main handler for every message
handler.before = async (m, { conn }) => {
  await handleAutoTranslate(m, conn);
};

handler.help = ['autotranslate', 'at'];
handler.tags = ['tools', 'group'];
handler.command = /^(autotranslate|at)$/i;
handler.group = true;

export default handler;