// plugins/tools-google.js
// Enhanced Google Search with spell checking

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Correct spelling mistakes in Arabic/English
 * @param {string} query - Search query
 * @returns {string} Corrected query
 */
function correctSpelling(query) {
  // Common Arabic misspellings
  const corrections = {
    'دكاء': 'ذكاء',
    'صطناعي': 'اصطناعي',
    'دكاء صطناعي': 'ذكاء اصطناعي',
    'الذكاءالصطناعي': 'الذكاء الاصطناعي',
    'برمجة': 'برمجة',
    'تطبور': 'تطوير',
    'تطبر': 'تطوير',
    'ويب': 'ويب',
    'انترنت': 'إنترنت',
    'برنامج': 'برنامج',
    'تطبيق': 'تطبيق'
  };

  let corrected = query.toLowerCase();
  
  // Apply corrections
  for (const [wrong, right] of Object.entries(corrections)) {
    corrected = corrected.replace(new RegExp(wrong, 'gi'), right);
  }
  
  return corrected;
}

/**
 * Search Google with better error handling
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
async function googleSearch(query) {
  const results = [];
  
  try {
    // Try Google HTML scraping (most reliable)
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&num=10`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Try multiple Google result selectors
    const selectors = [
      'div.g',
      'div.Gx5Zad',
      'div.tF2Cxc',
      'div.egMi0',
      'div.kCrYT'
    ];

    for (const selector of selectors) {
      $(selector).each((i, el) => {
        if (results.length >= 5) return false; // Limit to 5 results

        // Try different title selectors
        const title = $(el).find('h3').text() || 
                     $(el).find('.LC20lb').text() || 
                     $(el).find('.DKV0Md').text() || 
                     $(el).find('.vvjwJb').text();
        
        // Try different link selectors
        let link = $(el).find('a').attr('href') || '';
        if (link.startsWith('/url?q=')) {
          link = decodeURIComponent(link.split('/url?q=')[1].split('&')[0]);
        } else if (link.startsWith('/')) {
          link = 'https://google.com' + link;
        }
        
        // Try different snippet selectors
        const snippet = $(el).find('.VwiC3b').text() || 
                       $(el).find('.IsZvec').text() || 
                       $(el).find('.MUxGbd').text() || 
                       $(el).find('.yDYNvb').text() ||
                       'No description available';

        if (title && link && !link.includes('google.com/search')) {
          results.push({
            title: title,
            link: link,
            snippet: snippet.substring(0, 200)
          });
        }
      });

      if (results.length > 0) break;
    }

    // If still no results, try alternative search
    if (results.length === 0) {
      const altResponse = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      });

      const $alt = cheerio.load(altResponse.data);
      
      $alt('li.b_algo').each((i, el) => {
        if (results.length >= 5) return false;
        
        const title = $alt(el).find('h2').text();
        const link = $alt(el).find('a').attr('href');
        const snippet = $alt(el).find('.b_caption p').text();
        
        if (title && link) {
          results.push({ title, link, snippet });
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `┏━━━━━━━━━━━━━━━━━━━━┓
┃   🔍 *GOOGLE SEARCH* 🔍   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

━━━━━━━━━━━━━━━━━━━━━
📝 *USAGE*
━━━━━━━━━━━━━━━━━━━━━

• ${usedPrefix + command} <search query>
• ${usedPrefix + command} (reply to message)

━━━━━━━━━━━━━━━━━━━━━
💡 *EXAMPLES*
━━━━━━━━━━━━━━━━━━━━━

• ${usedPrefix + command} ما هو الذكاء الاصطناعي
• ${usedPrefix + command} JavaScript tutorial
• ${usedPrefix + command} Python programming
• ${usedPrefix + command} كيف أتعلم البرمجة

━━━━━━━━━━━━━━━━━━━━━
👤 @${m.sender.split('@')[0]}`,
      mentions: [m.sender]
    }, { quoted: m });
  }

  let query = text;
  if (!query && m.quoted?.text) {
    query = m.quoted.text;
  }

  const waitMsg = await m.reply(`🔍 *Searching for:* "${query}"\n⏱️ Please wait...`);
  const startTime = Date.now();

  try {
    // Correct spelling
    const correctedQuery = correctSpelling(query);
    
    // Show if spelling was corrected
    if (correctedQuery !== query.toLowerCase()) {
      await conn.sendMessage(m.chat, {
        text: `📝 *Did you mean:* "${correctedQuery}"?`,
        edit: waitMsg.key
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Perform search
    const results = await googleSearch(correctedQuery);
    const searchTime = ((Date.now() - startTime) / 1000).toFixed(1);

    if (results.length === 0) {
      // Suggest alternatives
      const suggestions = [
        'الذكاء الاصطناعي',
        'تعلم البرمجة',
        'JavaScript',
        'Python'
      ];
      
      const suggestionList = suggestions.map(s => `• ${s}`).join('\n');
      
      await conn.sendMessage(m.chat, {
        text: `❌ *No results for:* "${query}"

💡 *Try these instead:*
${suggestionList}

📝 *Tips:*
• Check your spelling
• Use simpler words
• Try in English
• Be more specific`,
        edit: waitMsg.key
      });
      return;
    }

    // Format results
    let message = `┏━━━━━━━━━━━━━━━━━━━━┓
┃   🔍 *GOOGLE RESULTS* 🔍   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

━━━━━━━━━━━━━━━━━━━━━
📝 *Query:* ${query}
📊 *Results:* ${results.length}
⚡ *Time:* ${searchTime}s
━━━━━━━━━━━━━━━━━━━━━\n\n`;

    results.forEach((result, index) => {
      message += `*${index + 1}. ${result.title}*\n`;
      message += `🔗 ${result.link}\n`;
      message += `📄 ${result.snippet.substring(0, 150)}${result.snippet.length > 150 ? '...' : ''}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━
👤 *Requested by:* @${m.sender.split('@')[0]}`;

    // Send results
    await conn.sendMessage(m.chat, {
      text: message,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: `🔍 "${query}" - ${results.length} results`,
          body: `Found in ${searchTime}s`,
          thumbnail: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' ? await (await conn.getFile('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png')).data : null,
          sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(correctedQuery)}`,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });

    // Delete waiting message
    await conn.sendMessage(m.chat, {
      text: '✅ *Search complete!*',
      edit: waitMsg.key
    });

  } catch (error) {
    console.error('Search error:', error);
    
    await conn.sendMessage(m.chat, {
      text: `❌ *Error:* ${error.message || 'Search failed'}\n\nPlease try again later.`,
      edit: waitMsg.key
    });
  }
};

handler.help = ['google', 'search', 'g', 'بحث'];
handler.tags = ['tools'];
handler.command = /^(google|search|g|بحث)$/i;
handler.saki = false;

export default handler;