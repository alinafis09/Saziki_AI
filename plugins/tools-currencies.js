// plugins/tools-currency.js
// Live Currency Converter with Exchange Rates

import axios from 'axios';

// قائمة العملات المدعومة مع رموزها
export const currencies = {
  // العملات الرئيسية
  'USD': { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  'EUR': { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  'GBP': { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  'JPY': { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  'CNY': { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  'RUB': { name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  
  // العملات العربية
  'MAD': { name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦' },
  'EGP': { name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬' },
  'SAR': { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  'AED': { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  'KWD': { name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  'QAR': { name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦' },
  'BHD': { name: 'Bahraini Dinar', symbol: 'د.ب', flag: '🇧🇭' },
  'OMR': { name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲' },
  'YER': { name: 'Yemeni Rial', symbol: '﷼', flag: '🇾🇪' },
  'SDG': { name: 'Sudanese Pound', symbol: '£', flag: '🇸🇩' },
  'DZD': { name: 'Algerian Dinar', symbol: 'د.ج', flag: '🇩🇿' },
  'TND': { name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳' },
  'LYD': { name: 'Libyan Dinar', symbol: 'د.ل', flag: '🇱🇾' },
  'MRU': { name: 'Mauritanian Ouguiya', symbol: 'أ.م', flag: '🇲🇷' },
  
  // عملات أخرى مهمة
  'CAD': { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  'AUD': { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  'CHF': { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  'TRY': { name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  'INR': { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  'BRL': { name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  'ZAR': { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  'SGD': { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  'NZD': { name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  'KRW': { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' }
};

/**
 * Get live exchange rates
 * @param {string} base - Base currency
 * @returns {Promise<Object>} Exchange rates
 */
async function getExchangeRates(base = 'USD') {
  try {
    // Free API from exchangerate-api.com (no key needed)
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      timeout: 8000
    });
    
    return {
      success: true,
      base: response.data.base,
      rates: response.data.rates,
      date: response.data.date
    };
  } catch (error) {
    console.error('Exchange rate error:', error.message);
    
    // Backup API
    try {
      const backupResponse = await axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`, {
        timeout: 5000
      });
      
      return {
        success: true,
        base: base,
        rates: backupResponse.data[base.toLowerCase()],
        date: new Date().toISOString().split('T')[0]
      };
    } catch (backupError) {
      return {
        success: false,
        error: 'Could not fetch exchange rates'
      };
    }
  }
}

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency
 * @param {string} to - Target currency
 * @returns {Promise<Object>} Conversion result
 */
async function convertCurrency(amount, from, to) {
  try {
    const rates = await getExchangeRates(from);
    
    if (!rates.success) {
      throw new Error(rates.error);
    }
    
    const rate = rates.rates[to];
    if (!rate) {
      throw new Error(`Currency ${to} not supported`);
    }
    
    const result = amount * rate;
    
    return {
      success: true,
      from: from,
      to: to,
      amount: amount,
      result: result,
      rate: rate,
      date: rates.date
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Format currency with symbol
 * @param {number} amount - Amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency) {
  const curr = currencies[currency] || { symbol: currency, flag: '💱' };
  return `${curr.flag} ${amount.toFixed(2)} ${curr.symbol}`;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Help menu
    if (!text) {
      const popularCurrencies = ['USD', 'EUR', 'GBP', 'MAD', 'EGP', 'SAR', 'AED', 'JPY', 'CNY', 'TRY'];
      const currencyList = popularCurrencies.map(code => {
        const curr = currencies[code];
        return `• ${curr.flag} ${code} - ${curr.name}`;
      }).join('\n');

      return conn.sendMessage(m.chat, {
        text: `┏━━━━━━━━━━━━━━━━━━━━┓
┃   💱 *CURRENCY CONVERTER* 💱   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

━━━━━━━━━━━━━━━━━━━━━
📝 *USAGE*
━━━━━━━━━━━━━━━━━━━━━

• ${usedPrefix + command} <amount> <from> to <to>
• ${usedPrefix + command} <amount> <from> <to>

━━━━━━━━━━━━━━━━━━━━━
💡 *EXAMPLES*
━━━━━━━━━━━━━━━━━━━━━

• ${usedPrefix + command} 100 USD to MAD
• ${usedPrefix + command} 50 EUR GBP
• ${usedPrefix + command} 1000 MAD EUR
• ${usedPrefix + command} 500 SAR USD

━━━━━━━━━━━━━━━━━━━━━
🌍 *POPULAR CURRENCIES*
━━━━━━━━━━━━━━━━━━━━━

${currencyList}

━━━━━━━━━━━━━━━━━━━━━
💱 *All currencies:* ${usedPrefix}currencies
👤 @${m.sender.split('@')[0]}`,
        mentions: [m.sender]
      }, { quoted: m });
    }

    // Parse command
    const parts = text.split(' ');
    let amount, from, to;
    
    if (parts.includes('to')) {
      const toIndex = parts.indexOf('to');
      amount = parseFloat(parts[0]);
      from = parts[1].toUpperCase();
      to = parts[toIndex + 1].toUpperCase();
    } else if (parts.length === 3) {
      amount = parseFloat(parts[0]);
      from = parts[1].toUpperCase();
      to = parts[2].toUpperCase();
    } else {
      return m.reply(`❌ *Invalid format*\n\nExample: ${usedPrefix + command} 100 USD to MAD`);
    }

    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Please enter a valid amount');
    }

    if (!currencies[from]) {
      return m.reply(`❌ Currency "${from}" not supported\n\nUse ${usedPrefix}currencies to see all supported currencies`);
    }

    if (!currencies[to]) {
      return m.reply(`❌ Currency "${to}" not supported\n\nUse ${usedPrefix}currencies to see all supported currencies`);
    }

    const waitMsg = await m.reply(`💱 *Converting ${amount} ${from} to ${to}...*`);
    const startTime = Date.now();

    // Perform conversion
    const result = await convertCurrency(amount, from, to);

    if (!result.success) {
      throw new Error(result.error);
    }

    const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Calculate other common conversions
    const fromCurr = currencies[from];
    const toCurr = currencies[to];
    
    // Get rates for other common currencies
    const rates = await getExchangeRates(from);
    const commonCurrencies = ['USD', 'EUR', 'GBP', 'MAD', 'SAR', 'AED'];
    const otherRates = commonCurrencies
      .filter(c => c !== from && c !== to && rates.rates[c])
      .slice(0, 3)
      .map(c => {
        const converted = amount * rates.rates[c];
        return `• ${currencies[c].flag} ${converted.toFixed(2)} ${c}`;
      }).join('\n');

    const message = `┏━━━━━━━━━━━━━━━━━━━━┓
┃   💱 *CURRENCY CONVERSION* 💱   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

━━━━━━━━━━━━━━━━━━━━━
💵 *CONVERSION*
━━━━━━━━━━━━━━━━━━━━━

${fromCurr.flag} *${amount.toFixed(2)} ${from}* ${fromCurr.symbol}
   👇
${toCurr.flag} *${result.result.toFixed(2)} ${to}* ${toCurr.symbol}

━━━━━━━━━━━━━━━━━━━━━
📊 *EXCHANGE RATE*
━━━━━━━━━━━━━━━━━━━━━

1 ${from} = ${result.rate.toFixed(4)} ${to}
1 ${to} = ${(1 / result.rate).toFixed(4)} ${from}

━━━━━━━━━━━━━━━━━━━━━
💹 *OTHER CONVERSIONS*
━━━━━━━━━━━━━━━━━━━━━

${otherRates || '• No additional rates available'}

━━━━━━━━━━━━━━━━━━━━━
👤 @${m.sender.split('@')[0]}`;

    // Send result
    await conn.sendMessage(m.chat, {
      text: message,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: `💱 ${amount} ${from} = ${result.result.toFixed(2)} ${to}`,
          body: `Rate: 1 ${from} = ${result.rate.toFixed(4)} ${to}`,
          thumbnail: 'https://i.imgur.com/7Mh3ZqQ.png' ? await (await conn.getFile('https://i.imgur.com/7Mh3ZqQ.png')).data : null,
          sourceUrl: 'https://www.exchangerate-api.com',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });

    // Delete waiting message
    await conn.sendMessage(m.chat, {
      text: '✅ *Conversion complete!*',
      edit: waitMsg.key
    });

  } catch (error) {
    console.error('Currency error:', error);
    
    await m.reply(`❌ *Error:* ${error.message || 'Conversion failed'}\n\nPlease try again later.`);
  }
};

handler.help = ['currency', 'cur', 'money', 'عملات'];
handler.tags = ['tools'];
handler.command = /^(currency|cur|money|عملات)$/i;
handler.saki = false;

export default handler;