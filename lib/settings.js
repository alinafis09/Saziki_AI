// lib/settings.js - Configuración centralizada para el bot
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ==================== CONFIGURACIÓN DEL PROPIETARIO ====================
export const owner = {
  numbers: [
    '261125656551615@s.whatsapp.net',
    '261125656551615@s.whatsapp.net',
    '261125656551615@s.whatsapp.net',
    '261125656551615@s.whatsapp.net',
    '261125656551615@s.whatsapp.net'
  ],
  names: [
    'Mareyo',
    'Ali Nafis',
    'Mareyo',
    'Mareyo',
    'Propietario 2'
  ],
  email: 'mareyo.edits@example.com',
  mainNumber: '261125656551615@s.whatsapp.net',
  creatorName: 'Mareyo',
  creatorAlias: '@mareyo.edits',
  instagram: 'https://www.instagram.com/mareyo.edits',
  whatsapp: 'https://wa.me/212719558797',
  groupLink: 'https://chat.whatsapp.com/HsiI2G8qVGS9W8Rjo6Hzvh',
  get jids() {
    return this.numbers.map(num => num + '@s.whatsapp.net');
  },
  isOwner(number) {
    if (!number) return false;
    const cleanNumber = number.toString().replace(/[^0-9]/g, '').replace(/^\+/, '');
    console.log(`🔍 Verificando si ${cleanNumber} es owner...`);
    const isOwner = this.numbers.some(ownerNum => {
      const cleanOwnerNum = ownerNum.toString().replace(/[^0-9]/g, '');
      if (cleanOwnerNum === cleanNumber) {
        console.log(`✅ Coincidencia exacta: ${cleanOwnerNum} === ${cleanNumber}`);
        return true;
      }
      if (cleanOwnerNum.endsWith(cleanNumber) && cleanNumber.length >= 9) {
        console.log(`✅ Coincidencia por terminación: ${cleanOwnerNum} termina con ${cleanNumber}`);
        return true;
      }
      if (cleanNumber.endsWith(cleanOwnerNum) && cleanOwnerNum.length >= 9) {
        console.log(`✅ Coincidencia por terminación inversa: ${cleanNumber} termina con ${cleanOwnerNum}`);
        return true;
      }
      return false;
    });
    if (isOwner) {
      console.log(`👑 ${cleanNumber} es propietario del bot`);
    } else {
      console.log(`❌ ${cleanNumber} NO es propietario del bot`);
    }
    return isOwner;
  },
  getOwnerName(number) {
    const cleanNumber = number.toString().replace(/[^0-9]/g, '');
    const index = this.numbers.findIndex(ownerNum => {
      const cleanOwnerNum = ownerNum.toString().replace(/[^0-9]/g, '');
      return cleanOwnerNum === cleanNumber || cleanOwnerNum.endsWith(cleanNumber) || cleanNumber.endsWith(cleanOwnerNum);
    });
    return index !== -1 ? this.names[index] : this.creatorName;
  }
};
// ==================== CONFIGURACIÓN DEL BOT ====================
export const bot = {
  name: 'Saziki Bot',
  altName: 'Laziki bot',
  version: '2.0.0',
  defaultPrefix: '.',
  allowedPrefixes: ['.', '#', '!', '/'],
  defaultLanguage: 'es',
  timezone: 'Africa/Casablanca',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss',
  defaultWelcome: '¡Bienvenido @user al grupo @subject!',
  defaultBye: '¡Adiós @user!',
  defaultLimits: {
    daily: 20,
    weekly: 100,
    monthly: 500,
    commandCooldown: 5,
  },
  features: {
    antiSpam: true,
    antiCall: true,
    antiLink: true,
    antiToxic: true,
    antiDelete: true,
    welcomeMessage: true,
    autoReadMessages: false,
    autoBlockCalls: true,
  },
  emojis: {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    owner: '👑',
    admin: '🛡️',
    premium: '💎',
    group: '👥',
    private: '🔒',
    download: '📥',
    upload: '📤',
    game: '🎮',
    utility: '🛠️',
    ai: '🤖',
    time: '⏰',
    date: '📆',
    level: '📊',
    user: '👤',
    bot: '🤖',
    link: '🔗',
    heart: '❤️',
    star: '⭐',
    fire: '🔥',
    crown: '👑',
    shield: '🛡️',
    globe: '🌐',
    mail: '📧',
    phone: '📱',
    github: '📂',
    youtube: '▶️',
    instagram: '📸',
    telegram: '📨',
    tiktok: '🎵',
    twitter: '🐦',
    facebook: '👤',
    web: '🌐'
  }
};
// ==================== REDES SOCIALES ====================
export const social = {
  github: {
    username: 'mareyo-edits',
    url: 'https://github.com/mareyo-edits',
    repository: 'https://github.com/mareyo-edits/saziki-bot',
    emoji: '📂'
  },
  instagram: {
    username: 'mareyo.edits',
    url: 'https://www.instagram.com/mareyo.edits',
    emoji: '📸'
  },
  whatsapp: {
    personal: 'https://wa.me/212719558797',
    channel: 'https://whatsapp.com/channel/0029VbB8fdr4inolWgXQ8l2a',
    group: 'https://chat.whatsapp.com/HsiI2G8qVGS9W8Rjo6Hzvh',
    emoji: '📱'
  },
  telegram: {
    username: 'saziki_bot',
    url: 'https://t.me/saziki_bot',
    channel: 'https://t.me/saziki_channel',
    emoji: '📨'
  },
  discord: {
    server: 'Saziki Community',
    invite: 'https://discord.gg/saziki',
    emoji: '💬'
  },
  youtube: {
    channel: 'Saziki Edits',
    url: 'https://youtube.com/@saziki',
    emoji: '▶️'
  },
  tiktok: {
    username: '@saziki',
    url: 'https://tiktok.com/@saziki',
    emoji: '🎵'
  },
  twitter: {
    username: '@saziki_bot',
    url: 'https://twitter.com/saziki_bot',
    emoji: '🐦'
  },
  facebook: {
    page: 'Saziki Bot',
    url: 'https://facebook.com/saziki.bot',
    emoji: '👤'
  },
  getAllFormatted() {
    return {
      instagram: `${this.instagram.emoji} *Instagram:* ${this.instagram.url}`,
      whatsapp: `${this.whatsapp.emoji} *WhatsApp:* ${this.whatsapp.personal}`,
      telegram: `${this.telegram.emoji} *Telegram:* ${this.telegram.url}`,
      discord: `${this.discord.emoji} *Discord:* ${this.discord.invite}`,
      youtube: `${this.youtube.emoji} *YouTube:* ${this.youtube.url}`,
      tiktok: `${this.tiktok.emoji} *TikTok:* ${this.tiktok.url}`,
      twitter: `${this.twitter.emoji} *Twitter:* ${this.twitter.url}`,
      facebook: `${this.facebook.emoji} *Facebook:* ${this.facebook.url}`,
      github: `${this.github.emoji} *GitHub:* ${this.github.url}`,
    };
  }
};
// ==================== GRUPOS OFICIALES (20 ESPACIOS) ====================
export const groups = {
  main: {
    name: '🎯 𝗚𝗿𝘂𝗽𝗼 𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹',
    link: 'https://chat.whatsapp.com/HsiI2G8qVGS9W8Rjo6Hzvh',
    id: 'HsiI2G8qVGS9W8Rjo6Hzvh',
    description: '✨ 𝗚𝗿𝘂𝗽𝗼 𝗼𝗳𝗶𝗰𝗶𝗮𝗹 𝗱𝗲𝗹 𝗯𝗼𝘁',
    language: 'es',
    category: 'main',
    emoji: '🎯'
  },
  group1: {
    name: '🌟 𝗚𝗿𝘂𝗽𝗼 𝟭',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx1',
    id: 'xxxxxxxxxxxxx1',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌟'
  },
  group2: {
    name: '✨ 𝗚𝗿𝘂𝗽𝗼 𝟮',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx2',
    id: 'xxxxxxxxxxxxx2',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '✨'
  },
  group3: {
    name: '🎉 𝗚𝗿𝘂𝗽𝗼 𝟯',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx3',
    id: 'xxxxxxxxxxxxx3',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🎉'
  },
  group4: {
    name: '🚀 𝗚𝗿𝘂𝗽𝗼 𝟰',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx4',
    id: 'xxxxxxxxxxxxx4',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🚀'
  },
  group5: {
    name: '💫 𝗚𝗿𝘂𝗽𝗼 𝟱',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx5',
    id: 'xxxxxxxxxxxxx5',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '💫'
  },
  group6: {
    name: '⚡ 𝗚𝗿𝘂𝗽𝗼 𝟲',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx6',
    id: 'xxxxxxxxxxxxx6',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '⚡'
  },
  group7: {
    name: '🔥 𝗚𝗿𝘂𝗽𝗼 𝟳',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx7',
    id: 'xxxxxxxxxxxxx7',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🔥'
  },
  group8: {
    name: '💎 𝗚𝗿𝘂𝗽𝗼 𝟴',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx8',
    id: 'xxxxxxxxxxxxx8',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '💎'
  },
  group9: {
    name: '🎨 𝗚𝗿𝘂𝗽𝗼 𝟵',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx9',
    id: 'xxxxxxxxxxxxx9',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🎨'
  },
  group10: {
    name: '🎪 𝗚𝗿𝘂𝗽𝗼 𝟭𝟬',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx10',
    id: 'xxxxxxxxxxxxx10',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🎪'
  },
  group11: {
    name: '🌈 𝗚𝗿𝘂𝗽𝗼 𝟭𝟭',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx11',
    id: 'xxxxxxxxxxxxx11',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌈'
  },
  group12: {
    name: '🌙 𝗚𝗿𝘂𝗽𝗼 𝟭𝟮',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx12',
    id: 'xxxxxxxxxxxxx12',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌙'
  },
  group13: {
    name: '☀️ 𝗚𝗿𝘂𝗽𝗼 𝟭𝟯',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx13',
    id: 'xxxxxxxxxxxxx13',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '☀️'
  },
  group14: {
    name: '⭐ 𝗚𝗿𝘂𝗽𝗼 𝟭𝟰',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx14',
    id: 'xxxxxxxxxxxxx14',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '⭐'
  },
  group15: {
    name: '🌠 𝗚𝗿𝘂𝗽𝗼 𝟭𝟱',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx15',
    id: 'xxxxxxxxxxxxx15',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌠'
  },
  group16: {
    name: '🌌 𝗚𝗿𝘂𝗽𝗼 𝟭𝟲',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx16',
    id: 'xxxxxxxxxxxxx16',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌌'
  },
  group17: {
    name: '🌆 𝗚𝗿𝘂𝗽𝗼 𝟭𝟳',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx17',
    id: 'xxxxxxxxxxxxx17',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌆'
  },
  group18: {
    name: '🏙️ 𝗚𝗿𝘂𝗽𝗼 𝟭𝟴',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx18',
    id: 'xxxxxxxxxxxxx18',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🏙️'
  },
  group19: {
    name: '🌃 𝗚𝗿𝘂𝗽𝗼 𝟭𝟵',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx19',
    id: 'xxxxxxxxxxxxx19',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌃'
  },
  group20: {
    name: '🌉 𝗚𝗿𝘂𝗽𝗼 𝟮𝟬',
    link: 'https://chat.whatsapp.com/xxxxxxxxxxxxx20',
    id: 'xxxxxxxxxxxxx20',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗱𝗲 𝘂𝘀𝘂𝗮𝗿𝗶𝗼𝘀',
    language: 'es',
    category: 'community',
    emoji: '🌉'
  },
  getAllGroups() {
    const groups = [];
    for (const key in this) {
      if (typeof this[key] === 'object' && this[key].link) {
        groups.push(this[key]);
      }
    }
    return groups;
  },
  getGroupLink(category = 'main') {
    const group = this[category] || this.main;
    return group ? group.link : null;
  },
  getAllGroupsFormatted() {
    const groups = this.getAllGroups();
    return groups.map(g => `• ${g.emoji} ${g.name}: ${g.link}`).join('\n');
  }
};
// ==================== CANALES OFICIALES (10 ESPACIOS) ====================
export const channels = {
  main: {
    name: '📢 𝗖𝗮𝗻𝗮𝗹 𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹',
    link: 'https://whatsapp.com/channel/0029VbB8fdr4inolWgXQ8l2a',
    id: '0029VbB8fdr4inolWgXQ8l2a',
    description: '✨ 𝗖𝗮𝗻𝗮𝗹 𝗼𝗳𝗶𝗰𝗶𝗮𝗹 𝗱𝗲𝗹 𝗯𝗼𝘁',
    language: 'es',
    category: 'main',
    emoji: '📢'
  },
  channel1: {
    name: '🌟 𝗖𝗮𝗻𝗮𝗹 𝟭',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx1',
    id: 'xxxxxxxxxxx1',
    description: '📌 𝗡𝗼𝘁𝗶𝗰𝗶𝗮𝘀 𝘆 𝗮𝗰𝘁𝘂𝗮𝗹𝗶𝘇𝗮𝗰𝗶𝗼𝗻𝗲𝘀',
    language: 'es',
    category: 'news',
    emoji: '🌟'
  },
  channel2: {
    name: '✨ 𝗖𝗮𝗻𝗮𝗹 𝟮',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx2',
    id: 'xxxxxxxxxxx2',
    description: '📌 𝗧𝘂𝘁𝗼𝗿𝗶𝗮𝗹𝗲𝘀 𝘆 𝗰𝗼𝗻𝘀𝗲𝗷𝗼𝘀',
    language: 'es',
    category: 'tutorials',
    emoji: '✨'
  },
  channel3: {
    name: '🎯 𝗖𝗮𝗻𝗮𝗹 𝟯',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx3',
    id: 'xxxxxxxxxxx3',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝘆 𝘀𝗼𝗽𝗼𝗿𝘁𝗲',
    language: 'es',
    category: 'support',
    emoji: '🎯'
  },
  channel4: {
    name: '🚀 𝗖𝗮𝗻𝗮𝗹 𝟰',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx4',
    id: 'xxxxxxxxxxx4',
    description: '📌 𝗡𝘂𝗲𝘃𝗼𝘀 𝗰𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝘆 𝗳𝘂𝗻𝗰𝗶𝗼𝗻𝗲𝘀',
    language: 'es',
    category: 'updates',
    emoji: '🚀'
  },
  channel5: {
    name: '💫 𝗖𝗮𝗻𝗮𝗹 𝟱',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx5',
    id: 'xxxxxxxxxxx5',
    description: '📌 𝗖𝗼𝗻𝘁𝗲𝗻𝗶𝗱𝗼 𝗲𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗼',
    language: 'es',
    category: 'exclusive',
    emoji: '💫'
  },
  channel6: {
    name: '⚡ 𝗖𝗮𝗻𝗮𝗹 𝟲',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx6',
    id: 'xxxxxxxxxxx6',
    description: '📌 𝗣𝗿𝗼𝗺𝗼𝗰𝗶𝗼𝗻𝗲𝘀 𝘆 𝘀𝗼𝗿𝘁𝗲𝗼𝘀',
    language: 'es',
    category: 'promotions',
    emoji: '⚡'
  },
  channel7: {
    name: '🔥 𝗖𝗮𝗻𝗮𝗹 𝟳',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx7',
    id: 'xxxxxxxxxxx7',
    description: '📌 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗲𝘀𝘁𝗮𝗰𝗮𝗱𝗼𝘀',
    language: 'es',
    category: 'featured',
    emoji: '🔥'
  },
  channel8: {
    name: '💎 𝗖𝗮𝗻𝗮𝗹 𝟴',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx8',
    id: 'xxxxxxxxxxx8',
    description: '📌 𝗖𝗼𝗻𝘁𝗲𝗻𝗶𝗱𝗼 𝗽𝗿𝗲𝗺𝗶𝘂𝗺',
    language: 'es',
    category: 'premium',
    emoji: '💎'
  },
  channel9: {
    name: '🎨 𝗖𝗮𝗻𝗮𝗹 𝟵',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx9',
    id: 'xxxxxxxxxxx9',
    description: '📌 𝗔𝗿𝘁𝗲 𝘆 𝗰𝗿𝗲𝗮𝘁𝗶𝘃𝗶𝗱𝗮𝗱',
    language: 'es',
    category: 'creative',
    emoji: '🎨'
  },
  channel10: {
    name: '🌐 𝗖𝗮𝗻𝗮𝗹 𝟭𝟬',
    link: 'https://whatsapp.com/channel/xxxxxxxxxxx10',
    id: 'xxxxxxxxxxx10',
    description: '📌 𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝗶𝗻𝘁𝗲𝗿𝗻𝗮𝗰𝗶𝗼𝗻𝗮𝗹',
    language: 'en',
    category: 'international',
    emoji: '🌐'
  },
  getAllChannels() {
    const channels = [];
    for (const key in this) {
      if (typeof this[key] === 'object' && this[key].link) {
        channels.push(this[key]);
      }
    }
    return channels;
  },
  getChannelLink(category = 'main') {
    const channel = this[category] || this.main;
    return channel ? channel.link : null;
  },
  getAllChannelsFormatted() {
    const channels = this.getAllChannels();
    return channels.map(c => `• ${c.emoji} ${c.name}: ${c.link}`).join('\n');
  }
};
// ==================== COMUNIDADES COMPLETAS ====================
export const communities = {
  groups: groups.getAllGroups(),
  channels: channels.getAllChannels(),
  getAllGroupsFormatted: groups.getAllGroupsFormatted.bind(groups),
  getAllChannelsFormatted: channels.getAllChannelsFormatted.bind(channels),
  getGroupLink: groups.getGroupLink.bind(groups),
  getChannelLink: channels.getChannelLink.bind(channels),
  getAllFormatted() {
    return `👥 *𝗚𝗥𝗨𝗣𝗢𝗦 𝗢𝗙𝗜𝗖𝗜𝗔𝗟𝗘𝗦*\n\n${this.getAllGroupsFormatted()}\n\n📢 *𝗖𝗔𝗡𝗔𝗟𝗘𝗦 𝗢𝗙𝗜𝗖𝗜𝗔𝗟𝗘𝗦*\n\n${this.getAllChannelsFormatted()}`;
  }
};
// ==================== MENSAJES PREDEFINIDOS ====================
export const messages = {
  errors: {
    ownerOnly: `> ${bot.emojis.warning} *This command can only be used by the bot owner𓂀*`,
    modsOnly: `> ${bot.emojis.warning} *Este comando solo puede ser usado por moderadores.*`,
    premiumOnly: `> ${bot.emojis.warning} *Este comando solo puede ser usado por usuarios premium.*`,
    groupOnly: `> ${bot.emojis.warning} *Este comando solo puede ser usado en grupos.*`,
    privateOnly: `> ${bot.emojis.warning} *Este comando solo puede ser usado en chats privados.*`,
    adminOnly: `${bot.emojis.warning} *Este comando solo puede ser usado por administradores del grupo.*`,
    botAdmin: `> ${bot.emojis.warning} *Necesito ser administrador para ejecutar este comando.*`,
    notRegistered: `> ${bot.emojis.warning} *Debes registrarte para usar este comando. Usa #register nombre.edad*`,
    featureDisabled: `> ${bot.emojis.warning} *Esta función está deshabilitada.*`,
    invalidNumber: `> ${bot.emojis.error} *Número de teléfono inválido.*`,
    insufficientLimit: `> ${bot.emojis.error} *No tienes suficientes límites.*`,
    insufficientLevel: `> ${bot.emojis.error} *Necesitas nivel %level% para usar este comando.*`,
    cooldown: `> ${bot.emojis.time} *Espera %time% segundos antes de usar otro comando.*`,
    banned: `> ${bot.emojis.error} *Has sido baneado.*\n*Motivo:* %reason%`,
  },
  success: {
    registered: `${bot.emojis.success} *Registro exitoso!*\n\n*Nombre:* %name%\n*Edad:* %age%\n*Registrado como:* @%user%`,
    limitAdded: `${bot.emojis.success} *Se agregaron %amount% límites a tu cuenta.*`,
    premiumActivated: `${bot.emojis.premium} *Premium activado hasta:* %date%`,
    commandExecuted: `${bot.emojis.success} *Comando ejecutado correctamente.*`,
    settingsUpdated: `${bot.emojis.success} *Configuración actualizada.*`,
  },
  info: {
    botInfo: `${bot.emojis.bot} *𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖𝗜𝗢́𝗡 𝗗𝗘𝗟 𝗕𝗢𝗧*\n\n` +
      `${bot.emojis.user} *𝗡𝗼𝗺𝗯𝗿𝗲:* %name%\n` +
      `${bot.emojis.star} *𝗩𝗲𝗿𝘀𝗶𝗼́𝗻:* %version%\n` +
      `${bot.emojis.owner} *𝗖𝗿𝗲𝗮𝗱𝗼𝗿:* %creator%\n` +
      `${bot.emojis.globe} *𝗣𝗿𝗲𝗳𝗶𝗷𝗼:* %prefix%\n` +
      `${bot.emojis.time} *𝗨𝗽𝘁𝗶𝗺𝗲:* %uptime%\n` +
      `${bot.emojis.group} *𝗚𝗿𝘂𝗽𝗼𝘀:* %groups%\n` +
      `${bot.emojis.user} *𝗨𝘀𝘂𝗮𝗿𝗶𝗼𝘀:* %users%`,
    creatorInfo: `${bot.emojis.owner} *𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖𝗜𝗢́𝗡 𝗗𝗘𝗟 𝗖𝗥𝗘𝗔𝗗𝗢𝗥*\n\n` +
      `${bot.emojis.user} *𝗡𝗼𝗺𝗯𝗿𝗲:* %name%\n` +
      `${bot.emojis.phone} *𝗡𝘂́𝗺𝗲𝗿𝗼:* wa.me/%number%\n` +
      `${bot.emojis.mail} *𝗘𝗺𝗮𝗶𝗹:* %email%\n` +
      `${bot.emojis.instagram} *𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺:* %instagram%\n` +
      `${bot.emojis.github} *𝗚𝗶𝘁𝗛𝘂𝗯:* %github%`,
    menuHeader: `┏━━「 *%name%* 」━━┓\n` +
      `┃\n` +
      `┃ ${bot.emojis.user} 𝗛𝗼𝗹𝗮, *%user%*\n` +
      `┃ ${bot.emojis.date} 𝗙𝗲𝗰𝗵𝗮: %date%\n` +
      `┃ ${bot.emojis.time} 𝗛𝗼𝗿𝗮: %time%\n` +
      `┃ ${bot.emojis.level} 𝗡𝗶𝘃𝗲𝗹: %level%\n` +
      `┃ ${bot.emojis.premium} 𝗣𝗿𝗲𝗺𝗶𝘂𝗺: %premium%\n` +
      `┃\n` +
      `┗━━━━━━━━━━━━┛\n\n`,
  },
  help: {
    general: `${bot.emojis.globe} *𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 𝗗𝗜𝗦𝗣𝗢𝗡𝗜𝗕𝗟𝗘𝗦*\n\n` +
      `𝗨𝘀𝗮 *%prefix%menu* 𝗽𝗮𝗿𝗮 𝘃𝗲𝗿 𝗲𝗹 𝗺𝗲𝗻𝘂́ 𝗽𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹\n` +
      `𝗨𝘀𝗮 *%prefix%help [𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝗶́𝗮]* 𝗽𝗮𝗿𝗮 𝗮𝘆𝘂𝗱𝗮 𝗲𝘀𝗽𝗲𝗰𝗶́𝗳𝗶𝗰𝗮\n\n` +
      `*𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝗶́𝗮𝘀 𝗱𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀:*\n`,
    categoryHeader: `┏━━「 *%category%* 」━━┓\n┃\n`,
    commandFormat: `┃ ${bot.emojis.star} *%prefix%%command%* %params%\n┃   ↳ %description%\n`,
  },
};
// ==================== FUNCIONES DE UTILIDAD ====================
export function getMainOwner() {
  return {
    number: owner.mainNumber,
    name: owner.creatorName,
    email: owner.email,
    creatorName: owner.creatorName,
    alias: owner.creatorAlias,
    instagram: owner.instagram,
    whatsapp: owner.whatsapp,
    groupLink: owner.groupLink,
    jid: owner.mainNumber + '@s.whatsapp.net'
  };
}
export function getErrorMessage(key, params = {}) {
  let message = messages.errors[key] || messages.errors.ownerOnly;
  Object.keys(params).forEach(param => {
    message = message.replace(new RegExp(`%${param}%`, 'g'), params[param]);
  });
  return message;
}
export function getSuccessMessage(key, params = {}) {
  let message = messages.success[key] || messages.success.commandExecuted;
  Object.keys(params).forEach(param => {
    message = message.replace(new RegExp(`%${param}%`, 'g'), params[param]);
  });
  return message;
}
export function getSocialInfo() {
  const socials = social.getAllFormatted();
  return `${bot.emojis.globe} *𝗥𝗘𝗗𝗘𝗦 𝗦𝗢𝗖𝗜𝗔𝗟𝗘𝗦*\n\n` +
    Object.values(socials).join('\n') +
    `\n\n${communities.getAllFormatted()}`;
}
export function getCurrentDate() {
  const d = new Date();
  return d.toLocaleDateString('es', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}
export function getCurrentTime() {
  const d = new Date();
  return d.toLocaleString('en-US', { 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
    hour12: true 
  });
}
export function formatUptime(uptime) {
  const d = Math.floor(uptime / 86400000);
  const h = Math.floor(uptime / 3600000) % 24;
  const m = Math.floor(uptime / 60000) % 60;
  const s = Math.floor(uptime / 1000) % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}
export default {
  owner,
  bot,
  social,
  groups,
  channels,
  communities,
  messages,
  getMainOwner,
  getErrorMessage,
  getSuccessMessage,
  getSocialInfo,
  getCurrentDate,
  getCurrentTime,
  formatUptime,
  isOwner: owner.isOwner
};