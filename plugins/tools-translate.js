// plugins/tools-translate.js
// Professional Translation System - Fixed Version

import axios from 'axios';

// قائمة اللغات المدعومة مع رموزها
export const languages = {
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'ar': 'العربية',
  'am': 'Amharic',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'zh': '中文',
  'zh-cn': '中文 (简体)',
  'zh-tw': '中文 (繁體)',
  'co': 'Corsican',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English',
  'eo': 'Esperanto',
  'et': 'Estonian',
  'tl': 'Filipino',
  'fi': 'Finnish',
  'fr': 'Français',
  'fy': 'Frisian',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'he': 'עברית',
  'hi': 'हिन्दी',
  'hmn': 'Hmong',
  'hu': 'Magyar',
  'is': 'Íslenska',
  'ig': 'Igbo',
  'id': 'Bahasa Indonesia',
  'ga': 'Gaeilge',
  'it': 'Italiano',
  'ja': '日本語',
  'jw': 'Jawa',
  'kn': 'ಕನ್ನಡ',
  'kk': 'Қазақ',
  'km': 'ខ្មែរ',
  'rw': 'Kinyarwanda',
  'ko': '한국어',
  'ku': 'Kurdî',
  'ky': 'Кыргыз',
  'lo': 'ລາວ',
  'la': 'Latin',
  'lv': 'Latviešu',
  'lt': 'Lietuvių',
  'lb': 'Lëtzebuergesch',
  'mk': 'Македонски',
  'mg': 'Malagasy',
  'ms': 'Melayu',
  'ml': 'മലയാളം',
  'mt': 'Malti',
  'mi': 'Māori',
  'mr': 'मराठी',
  'mn': 'Монгол',
  'my': 'မြန်မာ',
  'ne': 'नेपाली',
  'no': 'Norsk',
  'or': 'ଓଡ଼ିଆ',
  'ps': 'پښتو',
  'fa': 'فارسی',
  'pl': 'Polski',
  'pt': 'Português',
  'pa': 'ਪੰਜਾਬੀ',
  'ro': 'Română',
  'ru': 'Русский',
  'sm': 'Gagana Samoa',
  'gd': 'Gàidhlig',
  'sr': 'Српски',
  'st': 'Sesotho',
  'sn': 'Shona',
  'sd': 'سنڌي',
  'si': 'සිංහල',
  'sk': 'Slovenčina',
  'sl': 'Slovenščina',
  'so': 'Soomaali',
  'es': 'Español',
  'su': 'Sunda',
  'sw': 'Kiswahili',
  'sv': 'Svenska',
  'tg': 'Тоҷикӣ',
  'ta': 'தமிழ்',
  'tt': 'Татар',
  'te': 'తెలుగు',
  'th': 'ไทย',
  'tr': 'Türkçe',
  'tk': 'Türkmen',
  'uk': 'Українська',
  'ur': 'اردو',
  'ug': 'ئۇيغۇر',
  'uz': 'Oʻzbek',
  'vi': 'Tiếng Việt',
  'cy': 'Cymraeg',
  'xh': 'isiXhosa',
  'yi': 'ייִדיש',
  'yo': 'Yorùbá',
  'zu': 'isiZulu'
};

/**
 * Get language code from name or code
 * @param {string} lang - Language name or code
 * @returns {string} Language code
 */
function getLanguageCode(lang) {
  if (!lang) return 'en';
  
  const lowerLang = lang.toLowerCase().trim();
  
  // If it's already a valid code
  if (languages[lowerLang]) return lowerLang;
  
  // Search by name (case insensitive)
  for (const [code, name] of Object.entries(languages)) {
    if (name.toLowerCase() === lowerLang || 
        name.toLowerCase().includes(lowerLang) ||
        lowerLang.includes(name.toLowerCase())) {
      return code;
    }
  }
  
  return 'en';
}

/**
 * Translate text using Google Translate (most reliable)
 * @param {string} text - Text to translate
 * @param {string} to - Target language
 * @returns {Promise<Object>} Translation result
 */
async function translateWithGoogle(text, to) {
  try {
    // Google Translate API (unofficial but reliable)
    const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: 'auto',
        tl: to,
        dt: 't',
        q: text
      },
      timeout: 8000
    });
    
    if (response.data && response.data[0]) {
      const translated = response.data[0].map(item => item[0]).join('');
      const detectedLang = response.data[2] || 'unknown';
      
      return {
        success: true,
        translatedText: translated,
        detectedLang: detectedLang,
        detectedLangName: languages[detectedLang] || detectedLang,
        source: 'Google Translate'
      };
    }
  } catch (e) {
    console.log('Google Translate failed:', e.message);
  }
  return { success: false };
}

/**
 * Translate text using Lingva (alternative)
 * @param {string} text - Text to translate
 * @param {string} to - Target language
 * @returns {Promise<Object>} Translation result
 */
async function translateWithLingva(text, to) {
  try {
    const response = await axios.get(`https://lingva.ml/api/v1/auto/${to}/${encodeURIComponent(text)}`, {
      timeout: 5000
    });
    
    if (response.data && response.data.translation) {
      return {
        success: true,
        translatedText: response.data.translation,
        detectedLang: response.data.info?.detectedSource || 'unknown',
        source: 'Lingva'
      };
    }
  } catch (e) {}
  return { success: false };
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Parse arguments
    const args = text.split(' ');
    let targetLang = 'en';
    let textToTranslate = '';
    
    // Check if first argument is a language
    if (args.length > 0) {
      const possibleLang = args[0].toLowerCase();
      if (languages[possibleLang] || Object.values(languages).some(v => v.toLowerCase() === possibleLang)) {
        targetLang = getLanguageCode(args[0]);
        textToTranslate = args.slice(1).join(' ');
      } else {
        textToTranslate = text;
      }
    }
    
    // If no text, show help
    if (!textToTranslate && !m.quoted?.text) {
      const popularLangs = [
        'ar : العربية',
        'en : English', 
        'es : Español', 
        'fr : Français', 
        'de : Deutsch',
        'it : Italiano', 
        'pt : Português', 
        'ru : Русский', 
        'zh : 中文',
        'ja : 日本語', 
        'ko : 한국어', 
        'tr : Türkçe',
        'hi : हिन्दी',
        'ur : اردو',
        'fa : فارسی'
      ];
      
      return m.reply(`🌐 *TRANSLATION SYSTEM*\n\n` +
                     `*Usage:*\n` +
                     `• ${usedPrefix + command} <language> <text>\n` +
                     `• ${usedPrefix + command} <language> (reply to message)\n\n` +
                     `*Examples:*\n` +
                     `• ${usedPrefix + command} en مرحبا بالعالم\n` +
                     `• ${usedPrefix + command} ar Hello world\n` +
                     `• ${usedPrefix + command} fr (reply to message)\n\n` +
                     `*Popular languages:*\n` +
                     popularLangs.map(l => `   • ${l}`).join('\n') + '\n\n' +
                     `*All languages:* ${usedPrefix}langs`);
    }
    
    // Get text from quoted message if needed
    if (!textToTranslate && m.quoted?.text) {
      textToTranslate = m.quoted.text;
    }
    
    if (!textToTranslate) {
      return m.reply('❌ Please provide text to translate');
    }
    
    const waitMsg = await m.reply(`⏳ *Translating...*`);

    // Try Google Translate first (most reliable)
    let result = await translateWithGoogle(textToTranslate, targetLang);
    
    // If Google fails, try Lingva
    if (!result.success) {
      result = await translateWithLingva(textToTranslate, targetLang);
    }
    
    if (!result.success) {
      throw new Error('All translation services failed');
    }

    // Get language names
    const targetLangName = languages[targetLang] || targetLang;
    const detectedLangName = result.detectedLangName || languages[result.detectedLang] || 'Unknown';

    // Flag emojis
    const flagEmojis = {
      'ar': '🇸🇦', 'en': '🇬🇧', 'es': '🇪🇸', 'fr': '🇫🇷', 
      'de': '🇩🇪', 'it': '🇮🇹', 'pt': '🇵🇹', 'ru': '🇷🇺',
      'zh': '🇨🇳', 'ja': '🇯🇵', 'ko': '🇰🇷', 'tr': '🇹🇷',
      'hi': '🇮🇳', 'ur': '🇵🇰', 'fa': '🇮🇷', 'nl': '🇳🇱',
      'pl': '🇵🇱', 'sv': '🇸🇪', 'da': '🇩🇰', 'no': '🇳🇴',
      'fi': '🇫🇮', 'el': '🇬🇷', 'he': '🇮🇱', 'th': '🇹🇭',
      'vi': '🇻🇳', 'id': '🇮🇩', 'ms': '🇲🇾'
    };
    
    const sourceFlag = flagEmojis[result.detectedLang] || '🌐';
    const targetFlag = flagEmojis[targetLang] || '🌐';

    // Create message
    const message = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃   🌐 *TRANSLATION* 🌐   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

━━━━━━━━━━━━━━━━━━━━━
📝 *ORIGINAL TEXT*
━━━━━━━━━━━━━━━━━━━━━

${sourceFlag} *${detectedLangName}*
${textToTranslate}

━━━━━━━━━━━━━━━━━━━━━
🔄 *TRANSLATED TEXT*
━━━━━━━━━━━━━━━━━━━━━

${targetFlag} *${targetLangName}*
${result.translatedText}

━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by:* ${result.source}
👤 *Requested by:* @${m.sender.split('@')[0]}
`.trim();

    // Thumbnail
    const thumbnail = 'https://i.imgur.com/7Mh3ZqQ.png';

    await conn.sendMessage(m.chat, {
      text: message,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: `🌐 ${detectedLangName} → ${targetLangName}`,
          body: result.translatedText.substring(0, 50) + '...',
          thumbnail: thumbnail ? await (await conn.getFile(thumbnail)).data : null,
          sourceUrl: 'https://translate.google.com',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      text: '✅ *Translation complete!*',
      edit: waitMsg.key
    });

  } catch (error) {
    console.error('Translation error:', error);
    m.reply(`❌ *Error:* ${error.message || 'Translation failed'}\n\nPlease try again later.`);
  }
};

handler.help = ['translate', 'tr', 'ترجمة'];
handler.tags = ['tools'];
handler.command = /^(translate|tr|ترجم|ترجمة)$/i;
handler.saki = false;

export default handler;