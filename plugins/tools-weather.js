// plugins/tools-weather.js
// Professional Weather System - Fixed Version

import axios from 'axios';

/**
 * Get weather information without API key
 * @param {string} city - City name
 * @returns {Promise<Object>} Weather data
 */
async function getWeatherFree(city) {
  try {
    // استخدام curl-like headers لتجنب الحظر
    const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'curl/7.68.0',
        'Accept': 'application/json'
      }
    });
    
    const data = response.data;
    
    // التحقق من وجود البيانات
    if (!data || !data.current_condition || !data.current_condition[0]) {
      throw new Error('No data received');
    }
    
    const current = data.current_condition[0];
    const area = data.nearest_area && data.nearest_area[0] ? data.nearest_area[0] : null;
    
    return {
      success: true,
      city: area?.areaName?.[0]?.value || city,
      country: area?.country?.[0]?.value || '',
      temp: current.temp_C || '?',
      feelsLike: current.FeelsLikeC || '?',
      humidity: current.humidity || '?',
      description: current.weatherDesc?.[0]?.value || 'Unknown',
      windSpeed: current.windspeedKmph || '?',
      windDir: current.winddir16Point || '?',
      pressure: current.pressure || '?',
      cloudCover: current.cloudcover || '?',
      visibility: current.visibility || '?',
      uvIndex: current.uvIndex || '0'
    };
  } catch (error) {
    console.error('Weather error:', error.message);
    return { success: false };
  }
}

/**
 * Get weather emoji based on condition
 * @param {string} condition - Weather condition
 * @returns {string} Weather emoji
 */
function getWeatherEmoji(condition) {
  const c = condition.toLowerCase();
  if (c.includes('sun') || c.includes('clear')) return '☀️';
  if (c.includes('cloud') && c.includes('part')) return '⛅';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('rain')) return '🌧️';
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('snow')) return '🌨️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('wind')) return '💨';
  return '🌡️';
}

/**
 * Create temperature progress bar
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Progress bar
 */
function createTempBar(temp) {
  const tempNum = parseInt(temp) || 20;
  const normalizedTemp = Math.min(40, Math.max(-10, tempNum));
  const percent = ((normalizedTemp + 10) / 50) * 100;
  const filled = Math.round(percent / 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  return bar;
}

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return m.reply(`🌤️ *WEATHER SYSTEM*\n\n` +
                   `*Usage:*\n` +
                   `• ${usedPrefix}weather <city>\n\n` +
                   `*Examples:*\n` +
                   `• ${usedPrefix}weather Casablanca\n` +
                   `• ${usedPrefix}weather Paris\n` +
                   `• ${usedPrefix}weather London\n` +
                   `• ${usedPrefix}weather New York\n` +
                   `• ${usedPrefix}weather طنجة`);
  }

  const waitMsg = await m.reply(`⏳ *Getting weather for ${text}...*`);

  try {
    const weather = await getWeatherFree(text);
    
    if (!weather.success) {
      // تجربة طريقة بديلة
      const simpleResponse = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=%c+%t+%h+%w`, {
        headers: { 'User-Agent': 'curl/7.68.0' }
      });
      
      const simpleData = simpleResponse.data.trim();
      
      const simpleMessage = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃   🌤️ *WEATHER INFO* 🌤️   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

📍 *${text}*

━━━━━━━━━━━━━━━━━━━━━
🌡️ *CURRENT CONDITIONS*
━━━━━━━━━━━━━━━━━━━━━

${simpleData}

━━━━━━━━━━━━━━━━━━━━━
👤 *Requested by:* @${m.sender.split('@')[0]}
`.trim();

      await conn.sendMessage(m.chat, {
        text: simpleMessage,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: `🌤️ Weather in ${text}`,
            body: simpleData,
            thumbnail: 'https://i.imgur.com/7Mh3ZqQ.png' ? await (await conn.getFile('https://i.imgur.com/7Mh3ZqQ.png')).data : null,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });

      await conn.sendMessage(m.chat, {
        text: '✅ *Weather information retrieved!*',
        edit: waitMsg.key
      });
      return;
    }

    const emoji = getWeatherEmoji(weather.description);
    const tempBar = createTempBar(weather.temp);
    
    // Format temperature
    const tempNum = parseInt(weather.temp);
    const tempSign = tempNum > 0 ? '+' : '';
    
    const message = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃   🌤️ *WEATHER INFO* 🌤️   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

📍 *${weather.city}${weather.country ? ', ' + weather.country : ''}*

━━━━━━━━━━━━━━━━━━━━━
🌡️ *TEMPERATURE*
━━━━━━━━━━━━━━━━━━━━━

   ${tempBar}
   ${emoji} ${tempSign}${weather.temp}°C  (Feels ${weather.feelsLike}°C)

━━━━━━━━━━━━━━━━━━━━━
📊 *DETAILS*
━━━━━━━━━━━━━━━━━━━━━

💧 Humidity    : ${weather.humidity}%
🌀 Pressure    : ${weather.pressure} hPa
💨 Wind        : ${weather.windSpeed} km/h (${weather.windDir})
☁️ Clouds      : ${weather.cloudCover}%
👁️ Visibility  : ${weather.visibility} km
🌅 UV Index    : ${weather.uvIndex}

━━━━━━━━━━━━━━━━━━━━━
👤 *Requested by:* @${m.sender.split('@')[0]}
`.trim();

    // صورة الطقس
    const weatherIcon = `https://openweathermap.org/img/wn/10d@2x.png`;

    await conn.sendMessage(m.chat, {
      text: message,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: `🌤️ ${weather.city} Weather`,
          body: `${emoji} ${weather.temp}°C • ${weather.description}`,
          thumbnail: await (await conn.getFile(weatherIcon)).data,
          sourceUrl: 'https://openweathermap.org',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      text: '✅ *Weather information retrieved!*',
      edit: waitMsg.key
    });

  } catch (error) {
    console.error('Weather error:', error);
    
    // آخر خيار - رسالة بسيطة
    await conn.sendMessage(m.chat, {
      text: `🌤️ *Weather for ${text}*\n\nCould not get detailed information. Please try again.`,
      edit: waitMsg.key
    });
  }
};

handler.help = ['weather', 'wt', 'طقس'];
handler.tags = ['tools'];
handler.command = /^(weather|wt|طقس)$/i;
handler.saki = false;
export default handler;;