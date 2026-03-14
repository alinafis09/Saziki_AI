// plugins/games.js
// Interactive Games Collection for WhatsApp Groups

import crypto from 'crypto';

// Game sessions storage
const gameSessions = {
  ttt: new Map(),      // Tic-Tac-Toe games
  rps: new Map(),      // Rock Paper Scissors
  math: new Map(),     // Math quiz games
  scramble: new Map()  // Word scramble games
};

// Game timeouts (5 minutes = 300000ms)
const GAME_TIMEOUT = 300000;

// Word list for scramble game
const WORD_LIST = [
  'javascript', 'whatsapp', 'bot', 'developer', 'programming',
  'computer', 'internet', 'website', 'application', 'database',
  'server', 'client', 'network', 'security', 'encryption',
  'algorithm', 'function', 'variable', 'constant', 'library',
  'framework', 'backend', 'frontend', 'mobile', 'desktop',
  'python', 'java', 'ruby', 'php', 'swift', 'kotlin', 'rust',
  'gaming', 'streaming', 'download', 'upload', 'message',
  'telegram', 'discord', 'signal', 'privacy', 'account'
];

// Math difficulty settings
const MATH_SETTINGS = {
  easy: { min: 1, max: 10, reward: 10 },
  medium: { min: 5, max: 20, reward: 25 },
  hard: { min: 10, max: 50, reward: 50 }
};

/**
 * Clean up old game sessions
 */
function cleanupOldSessions() {
  const now = Date.now();
  
  Object.keys(gameSessions).forEach(gameType => {
    gameSessions[gameType].forEach((session, id) => {
      if (session && now - session.created > GAME_TIMEOUT) {
        gameSessions[gameType].delete(id);
      }
    });
  });
}

// Run cleanup every minute
setInterval(cleanupOldSessions, 60000);

/**
 * Generate random math equation
 * @param {string} difficulty - easy/medium/hard
 * @returns {Object} Equation object
 */
function generateMathEquation(difficulty = 'easy') {
  const settings = MATH_SETTINGS[difficulty] || MATH_SETTINGS.easy;
  const { min, max } = settings;
  
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1, num2, answer;
  
  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (max - min + 1)) + min;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (num1 - min + 1)) + min;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
  }
  
  return {
    text: `${num1} ${operator} ${num2} = ?`,
    answer: answer.toString(),
    difficulty,
    reward: settings.reward
  };
}

/**
 * Scramble a word
 * @param {string} word - Word to scramble
 * @returns {string} Scrambled word
 */
function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Safely ensure user exists in database
 * @param {string} userId - User JID
 * @returns {Object|null} User object or null
 */
function ensureUser(userId) {
  if (!userId) return null;
  
  try {
    if (!global.db?.data?.users) global.db.data.users = {};
    if (!global.db.data.users[userId]) {
      global.db.data.users[userId] = {
        money: 0,
        exp: 0,
        level: 0,
        games: { wins: 0, losses: 0, draws: 0 }
      };
    }
    return global.db.data.users[userId];
  } catch (error) {
    console.error('Error ensuring user:', error);
    return null;
  }
}

/**
 * Safely get opponent from mention or quoted message
 * @param {Object} m - Message object
 * @returns {string|null} Opponent JID or null
 */
function getOpponent(m) {
  // Check mentions first
  if (m.mentions && Array.isArray(m.mentions) && m.mentions.length > 0) {
    return m.mentions[0];
  }
  
  // Check quoted message
  if (m.quoted && m.quoted.sender) {
    return m.quoted.sender;
  }
  
  return null;
}

/**
 * Safely get user name for display
 * @param {Object} conn - Socket connection
 * @param {string} jid - User JID
 * @returns {string} User name
 */
async function getUserName(conn, jid) {
  if (!jid) return 'Unknown';
  try {
    return await conn.getName(jid) || jid.split('@')[0];
  } catch {
    return jid.split('@')[0];
  }
}

// Main handler
let handler = async (m, { conn, args, usedPrefix, command }) => {
  const sender = m.sender;
  const chatId = m.chat;
  const isGroup = m.isGroup;
  
  // Ensure user exists in database
  ensureUser(sender);
  const user = global.db.data.users[sender] || { money: 0, games: {} };

  // Tic-Tac-Toe (XO) Game
  if (command === 'xo' || command === 'ttt') {
    if (!isGroup) {
      await m.reply('❌ *Tic-Tac-Toe can only be played in groups*');
      return;
    }

    const opponent = getOpponent(m);
    if (!opponent) {
      await m.reply(`❌ *Please mention or reply to someone to play with*\n\n` +
        `Example:\n` +
        `• ${usedPrefix}xo @user\n` +
        `• ${usedPrefix}xo (reply to someone's message)`);
      return;
    }

    if (opponent === sender) {
      await m.reply('❌ *You cannot play with yourself*');
      return;
    }

    // Check if there's already a game in this chat
    if (gameSessions.ttt.has(chatId)) {
      await m.reply('❌ *A game is already in progress in this group*');
      return;
    }

    // Get player names
    const senderName = await getUserName(conn, sender);
    const opponentName = await getUserName(conn, opponent);

    // Create new game session
    const gameId = crypto.randomBytes(4).toString('hex');
    const game = {
      id: gameId,
      players: [sender, opponent],
      currentPlayer: sender,
      board: ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'],
      moves: 0,
      created: Date.now(),
      status: 'waiting'
    };

    gameSessions.ttt.set(chatId, game);

    const boardDisplay = `
╔══════════════════╗
║     🎮 *TIC-TAC-TOE* 🎮     ║
╚══════════════════╝

👤 ${senderName} (❌) vs ${opponentName} (⭕)

Current turn: @${sender.split('@')[0]}

${game.board[0]} ${game.board[1]} ${game.board[2]}
${game.board[3]} ${game.board[4]} ${game.board[5]}
${game.board[6]} ${game.board[7]} ${game.board[8]}

Reply with position 1-9 to place your mark
`.trim();

    await conn.sendMessage(chatId, {
      text: boardDisplay,
      mentions: [sender, opponent]
    }, { quoted: m });

    // Set timeout to end game if no moves
    setTimeout(() => {
      const currentGame = gameSessions.ttt.get(chatId);
      if (currentGame && currentGame.id === gameId) {
        gameSessions.ttt.delete(chatId);
        conn.sendMessage(chatId, {
          text: '⏰ *Game timed out due to inactivity*'
        });
      }
    }, GAME_TIMEOUT);
  }

  // Rock Paper Scissors
  else if (command === 'rps') {
    const choices = ['rock', 'paper', 'scissors'];
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    
    const userChoice = args[0]?.toLowerCase();
    
    if (!userChoice || !choices.includes(userChoice)) {
      await m.reply(`🎮 *ROCK PAPER SCISSORS*\n\n` +
        `*Usage:* ${usedPrefix}rps <rock/paper/scissors>\n` +
        `*Example:* ${usedPrefix}rps rock\n\n` +
        `*Choices:* 🪨 rock, 📄 paper, ✂️ scissors`);
      return;
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    
    let result, reward = 10;
    
    if (userChoice === botChoice) {
      result = 'draw';
      if (user.games) user.games.draws = (user.games.draws || 0) + 1;
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'win';
      user.money = (user.money || 0) + reward;
      user.exp = (user.exp || 0) + reward;
      if (user.games) user.games.wins = (user.games.wins || 0) + 1;
    } else {
      result = 'lose';
      if (user.games) user.games.losses = (user.games.losses || 0) + 1;
    }

    const resultText = {
      win: `🎉 *You Win!* (+${reward}💰)`,
      lose: '😢 *You Lose!*',
      draw: '🤝 *It\'s a Draw!*'
    }[result];

    const message = `🎮 *ROCK PAPER SCISSORS*\n\n` +
      `${emojis[userChoice]} You: *${userChoice}*\n` +
      `${emojis[botChoice]} Bot: *${botChoice}*\n\n` +
      `${resultText}\n\n` +
      `💰 Balance: ${user.money || 0}`;

    await m.reply(message);
  }

  // Math Quiz
  else if (command === 'math') {
    const difficulty = args[0]?.toLowerCase() || 'easy';
    
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      await m.reply(`📊 *MATH QUIZ*\n\n` +
        `*Usage:* ${usedPrefix}math <easy/medium/hard>\n` +
        `*Example:* ${usedPrefix}math medium\n\n` +
        `*Difficulties:*\n` +
        `• Easy: +10💰\n` +
        `• Medium: +25💰\n` +
        `• Hard: +50💰`);
      return;
    }

    // Check if there's already a math game in this chat
    if (gameSessions.math.has(chatId)) {
      await m.reply('❌ *A math quiz is already active in this group*');
      return;
    }

    const equation = generateMathEquation(difficulty);
    const gameId = crypto.randomBytes(4).toString('hex');
    
    const game = {
      id: gameId,
      equation: equation,
      answered: false,
      created: Date.now(),
      participants: new Set()
    };

    gameSessions.math.set(chatId, game);

    const message = `📊 *MATH QUIZ*\n\n` +
      `*Difficulty:* ${difficulty.toUpperCase()}\n` +
      `*Reward:* ${equation.reward}💰\n\n` +
      `*Question:* ${equation.text}\n\n` +
      `First to answer correctly wins!`;

    await m.reply(message);

    // Set timeout to end game
    setTimeout(() => {
      const currentGame = gameSessions.math.get(chatId);
      if (currentGame && currentGame.id === gameId && !currentGame.answered) {
        gameSessions.math.delete(chatId);
        conn.sendMessage(chatId, {
          text: '⏰ *Time\'s up! No one answered correctly.*'
        });
      }
    }, 60000); // 1 minute for math quiz
  }

  // Word Scramble
  else if (command === 'scramble') {
    // Check if there's already a scramble game in this chat
    if (gameSessions.scramble.has(chatId)) {
      await m.reply('❌ *A word scramble is already active in this group*');
      return;
    }

    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const scrambled = scrambleWord(randomWord);
    const gameId = crypto.randomBytes(4).toString('hex');
    
    const game = {
      id: gameId,
      original: randomWord,
      scrambled: scrambled,
      answered: false,
      created: Date.now(),
      participants: new Set(),
      hint: randomWord.slice(0, 3) + '...'
    };

    gameSessions.scramble.set(chatId, game);

    const message = `💡 *WORD SCRAMBLE*\n\n` +
      `*Scrambled:* *${scrambled}*\n` +
      `*Hint:* ${game.hint}\n` +
      `*Reward:* 20💰\n\n` +
      `Reply with the correct word to win!`;

    await m.reply(message);

    // Set timeout to end game
    setTimeout(() => {
      const currentGame = gameSessions.scramble.get(chatId);
      if (currentGame && currentGame.id === gameId && !currentGame.answered) {
        gameSessions.scramble.delete(chatId);
        conn.sendMessage(chatId, {
          text: `⏰ *Time's up!*\n\nThe word was: *${randomWord}*`
        });
      }
    }, 60000); // 1 minute for scramble
  }
};

// Message handler for game answers
handler.before = async (m, { conn }) => {
  if (!m.text || m.isBaileys || m.fromMe) return;
  
  const chatId = m.chat;
  const sender = m.sender;
  
  // Handle Math Quiz answers
  const mathGame = gameSessions.math.get(chatId);
  if (mathGame && !mathGame.answered && mathGame.equation && m.text.trim() === mathGame.equation.answer) {
    // Check if user already answered
    if (mathGame.participants.has(sender)) return;
    
    mathGame.participants.add(sender);
    
    // First correct answer
    if (!mathGame.answered) {
      mathGame.answered = true;
      
      const user = ensureUser(sender);
      if (user) {
        user.money = (user.money || 0) + mathGame.equation.reward;
        user.exp = (user.exp || 0) + mathGame.equation.reward;
      }
      
      await conn.sendMessage(chatId, {
        text: `🎉 *Correct!*\n\n` +
          `@${sender.split('@')[0]} answered correctly!\n` +
          `+${mathGame.equation.reward}💰`,
        mentions: [sender]
      }, { quoted: m });
      
      gameSessions.math.delete(chatId);
    }
  }
  
  // Handle Word Scramble answers
  const scrambleGame = gameSessions.scramble.get(chatId);
  if (scrambleGame && !scrambleGame.answered && scrambleGame.original) {
    const userAnswer = m.text.trim().toLowerCase();
    
    if (userAnswer === scrambleGame.original) {
      // Check if user already answered
      if (scrambleGame.participants.has(sender)) return;
      
      scrambleGame.participants.add(sender);
      
      // First correct answer
      if (!scrambleGame.answered) {
        scrambleGame.answered = true;
        
        const user = ensureUser(sender);
        if (user) {
          user.money = (user.money || 0) + 20;
          user.exp = (user.exp || 0) + 20;
        }
        
        await conn.sendMessage(chatId, {
          text: `🎉 *Correct!*\n\n` +
            `@${sender.split('@')[0]} guessed the word!\n` +
            `+20💰`,
          mentions: [sender]
        }, { quoted: m });
        
        gameSessions.scramble.delete(chatId);
      }
    }
  }
  
  // Handle Tic-Tac-Toe moves
  const tttGame = gameSessions.ttt.get(chatId);
  if (tttGame && tttGame.players && tttGame.board && /^[1-9]$/.test(m.text.trim())) {
    const position = parseInt(m.text.trim()) - 1;
    
    // Validate position
    if (position < 0 || position > 8) return;
    
    const currentPlayerIndex = tttGame.players.indexOf(tttGame.currentPlayer);
    
    // Check if it's the player's turn
    if (sender !== tttGame.currentPlayer) {
      const currentPlayerName = tttGame.currentPlayer ? 
        `@${tttGame.currentPlayer.split('@')[0]}` : 'Unknown';
      
      await conn.sendMessage(chatId, {
        text: `❌ It's not your turn. Current player: ${currentPlayerName}`,
        mentions: tttGame.currentPlayer ? [tttGame.currentPlayer] : []
      }, { quoted: m });
      return;
    }
    
    // Check if position is valid
    if (tttGame.board[position] !== '⬜') {
      await m.reply('❌ That position is already taken!');
      return;
    }
    
    // Place mark
    const mark = currentPlayerIndex === 0 ? '❌' : '⭕';
    tttGame.board[position] = mark;
    tttGame.moves++;
    
    // Check win conditions
    const winPatterns = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // columns
      [0,4,8], [2,4,6]           // diagonals
    ];
    
    let winner = null;
    for (const pattern of winPatterns) {
      if (pattern.every(i => tttGame.board[i] === mark)) {
        winner = tttGame.currentPlayer;
        break;
      }
    }
    
    // Switch player
    tttGame.currentPlayer = tttGame.players[(currentPlayerIndex + 1) % 2];
    
    const boardDisplay = `
${tttGame.board[0]} ${tttGame.board[1]} ${tttGame.board[2]}
${tttGame.board[3]} ${tttGame.board[4]} ${tttGame.board[5]}
${tttGame.board[6]} ${tttGame.board[7]} ${tttGame.board[8]}
`.trim();

    // Game over conditions
    if (winner) {
      const user = ensureUser(winner);
      if (user) {
        user.money = (user.money || 0) + 50;
        user.exp = (user.exp || 0) + 50;
        if (user.games) user.games.wins = (user.games.wins || 0) + 1;
      }
      
      await conn.sendMessage(chatId, {
        text: `🎮 *TIC-TAC-TOE*\n\n` +
          `${boardDisplay}\n\n` +
          `🎉 *Winner:* @${winner.split('@')[0]}!\n` +
          `+50💰`,
        mentions: [winner]
      }, { quoted: m });
      
      gameSessions.ttt.delete(chatId);
      
    } else if (tttGame.moves === 9) {
      // Draw
      if (tttGame.players && Array.isArray(tttGame.players)) {
        tttGame.players.forEach(player => {
          const user = ensureUser(player);
          if (user && user.games) {
            user.games.draws = (user.games.draws || 0) + 1;
          }
        });
      }
      
      await conn.sendMessage(chatId, {
        text: `🎮 *TIC-TAC-TOE*\n\n` +
          `${boardDisplay}\n\n` +
          `🤝 *It's a Draw!*`
      }, { quoted: m });
      
      gameSessions.ttt.delete(chatId);
      
    } else {
      // Game continues
      const currentPlayer = tttGame.currentPlayer || tttGame.players[0];
      
      await conn.sendMessage(chatId, {
        text: `🎮 *TIC-TAC-TOE*\n\n` +
          `${boardDisplay}\n\n` +
          `Current turn: @${currentPlayer.split('@')[0]}`,
        mentions: [currentPlayer]
      }, { quoted: m });
    }
  }
};

handler.help = ['xo', 'ttt', 'rps', 'math', 'scramble'];
handler.tags = ['games'];
handler.command = /^(xo|ttt|rps|math|scramble)$/i;

export default handler;