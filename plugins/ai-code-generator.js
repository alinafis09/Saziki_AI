// plugins/ai-code-generator.js
// AI Code Generator for Saziki Bot
// @author Saziki Bot Team
// Version: 1.0.0

import OpenAI from 'openai';

// ==================== CONFIGURATION ====================
const NVIDIA_API_KEY = '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';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';
const MODEL = "z-ai/glm4.7";

// Initialize OpenAI client with NVIDIA base URL
const openai = new OpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: BASE_URL,
});

// ==================== LANGUAGE CONFIGURATIONS ====================
const LANGUAGE_CONFIG = {
    javascript: {
        name: 'JavaScript',
        extension: 'js',
        emoji: '🟨',
        systemPrompt: `You are an expert JavaScript developer. Write clean, efficient, and well-commented JavaScript code. Include proper error handling and follow best practices.`
    },
    python: {
        name: 'Python',
        extension: 'py',
        emoji: '🐍',
        systemPrompt: `You are an expert Python developer. Write clean, efficient, and well-commented Python code. Include proper error handling and follow PEP 8 guidelines.`
    },
    html: {
        name: 'HTML',
        extension: 'html',
        emoji: '🌐',
        systemPrompt: `You are an expert web developer. Write clean, semantic HTML5 code with proper structure and accessibility.`
    },
    css: {
        name: 'CSS',
        extension: 'css',
        emoji: '🎨',
        systemPrompt: `You are an expert CSS developer. Write clean, modern CSS code with proper selectors and responsive design.`
    },
    java: {
        name: 'Java',
        extension: 'java',
        emoji: '☕',
        systemPrompt: `You are an expert Java developer. Write clean, efficient, and well-commented Java code. Follow OOP principles and best practices.`
    },
    cpp: {
        name: 'C++',
        extension: 'cpp',
        emoji: '⚙️',
        systemPrompt: `You are an expert C++ developer. Write clean, efficient, and well-commented C++ code. Follow modern C++ standards.`
    },
    php: {
        name: 'PHP',
        extension: 'php',
        emoji: '🐘',
        systemPrompt: `You are an expert PHP developer. Write clean, secure, and well-commented PHP code. Follow PSR standards.`
    },
    ruby: {
        name: 'Ruby',
        extension: 'rb',
        emoji: '💎',
        systemPrompt: `You are an expert Ruby developer. Write clean, elegant Ruby code following Ruby conventions.`
    },
    go: {
        name: 'Go',
        extension: 'go',
        emoji: '🔵',
        systemPrompt: `You are an expert Go developer. Write clean, efficient Go code following Go best practices.`
    },
    rust: {
        name: 'Rust',
        extension: 'rs',
        emoji: '🦀',
        systemPrompt: `You are an expert Rust developer. Write safe, efficient Rust code with proper error handling.`
    },
    sql: {
        name: 'SQL',
        extension: 'sql',
        emoji: '🗄️',
        systemPrompt: `You are an expert SQL developer. Write efficient, well-structured SQL queries with proper indexing and optimization.`
    },
    bash: {
        name: 'Bash',
        extension: 'sh',
        emoji: '🐚',
        systemPrompt: `You are an expert Bash script developer. Write efficient, well-commented shell scripts with error handling.`
    }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Detect programming language from command
 * @param {string} cmd - Command text
 * @returns {Object} - Language configuration
 */
function detectLanguage(cmd) {
    for (const [key, config] of Object.entries(LANGUAGE_CONFIG)) {
        if (cmd.includes(key) || cmd.startsWith(key)) {
            return { ...config, key };
        }
    }
    return { ...LANGUAGE_CONFIG.javascript, key: 'javascript' }; // Default to JavaScript
}

/**
 * Format code block for WhatsApp
 * @param {string} code - Code content
 * @param {string} language - Programming language
 * @returns {string} - Formatted code block
 */
function formatCodeBlock(code, language) {
    return `\`\`\`${language}\n${code}\n\`\`\``;
}

/**
 * Extract code from AI response
 * @param {string} response - Full AI response
 * @returns {Object} - Code and explanation
 */
function extractCode(response) {
    // Try to extract code between ``` blocks
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
        codeBlocks.push(match[1].trim());
    }
    
    // If code blocks found, use them
    if (codeBlocks.length > 0) {
        const code = codeBlocks.join('\n\n');
        // Remove code blocks from response to get explanation
        const explanation = response.replace(codeBlockRegex, '').trim();
        return { code, explanation };
    }
    
    // If no code blocks, assume entire response is code
    return { code: response, explanation: '' };
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Check if prompt is provided
    if (!text) {
        let helpText = `💻 *AI Code Generator*\n\n`;
        helpText += `*Usage:* ${usedPrefix}${command} <language> <description>\n\n`;
        helpText += `*Supported Languages:*\n`;
        
        for (const [key, config] of Object.entries(LANGUAGE_CONFIG)) {
            helpText += `${config.emoji} *${config.name}* - \`${key}\`\n`;
        }
        
        helpText += `\n*Examples:*\n`;
        helpText += `• ${usedPrefix}code python calculator app\n`;
        helpText += `• ${usedPrefix}code javascript function to reverse a string\n`;
        helpText += `• ${usedPrefix}code html create a login form\n\n`;
        helpText += `*Powered by NVIDIA API*`;
        
        return m.reply(helpText);
    }

    // Detect language from command
    const { key: langKey, name: langName, emoji, systemPrompt } = detectLanguage(text);
    
    // Remove language prefix from prompt
    let prompt = text.replace(new RegExp(`^${langKey}\\s*`, 'i'), '').trim();
    
    if (!prompt) {
        return m.reply(`❌ Please describe what code you want me to generate in ${langName}.`);
    }

    // Send initial processing message
    const waitMsg = await m.reply(`🧠 *Generating ${emoji} ${langName} code...*`);

    try {
        // Create completion with streaming
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: `${systemPrompt}\n\nProvide the code with clear explanations. Format the code in proper markdown code blocks with the language specified.`
                },
                {
                    role: "user",
                    content: `Generate ${langName} code for: ${prompt}`
                }
            ],
            temperature: 0.7,
            top_p: 1,
            max_tokens: 8192,
            stream: true
        });

        // Collect response chunks
        let fullResponse = '';
        let reasoning = '';
        
        for await (const chunk of completion) {
            const reasoningContent = chunk.choices[0]?.delta?.reasoning_content;
            const content = chunk.choices[0]?.delta?.content || '';
            
            if (reasoningContent) reasoning += reasoningContent;
            fullResponse += content;
            
            // Update message periodically
            if (fullResponse.length % 200 === 0) {
                await conn.sendMessage(m.chat, {
                    text: `🧠 *Generating ${emoji} ${langName} code...*\n\n${fullResponse.substring(0, 100)}...`,
                    edit: waitMsg.key
                }).catch(() => {});
            }
        }

        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Extract code and explanation
        const { code, explanation } = extractCode(fullResponse);
        
        // Format the final message
        let finalMessage = `${emoji} *${langName} Code Generated*\n\n`;
        
        if (explanation) {
            finalMessage += `📝 *Explanation:*\n${explanation}\n\n`;
        }
        
        finalMessage += `💻 *Code:*\n${formatCodeBlock(code, langKey)}`;
        
        // Add reasoning if available (for debugging/learning)
        if (reasoning && reasoning.length > 0) {
            finalMessage += `\n\n🤔 *AI Reasoning:*\n${reasoning.substring(0, 500)}...`;
        }

        // Send the response
        await conn.sendMessage(m.chat, {
            text: finalMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: `💻 AI Code Generator - ${langName}`,
                    body: `Generated ${langName} code for: ${prompt.substring(0, 30)}...`,
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: 'https://www.nvidia.com',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Code Generator Error:', error);
        
        // Delete waiting message
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        // Send error message
        let errorMessage = '❌ *Error*\n\n';
        
        if (error.response) {
            errorMessage += `API Error (${error.response.status}): ${error.response.statusText || 'Unknown error'}`;
            
            if (error.response.status === 401) {
                errorMessage += '\n\n❌ *Invalid API Key*\nPlease check your NVIDIA API key.';
            } else if (error.response.status === 403) {
                errorMessage += '\n\n❌ *Access Forbidden*\nYour API key does not have permission to access this model.';
            } else if (error.response.status === 429) {
                errorMessage += '\n\n❌ *Rate Limit Exceeded*\nToo many requests. Please try again later.';
            }
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage += '❌ *Connection Failed*\nCould not connect to NVIDIA API.';
        } else {
            errorMessage += error.message || 'Failed to generate code';
        }

        await m.reply(errorMessage);
    }
};

// ==================== SIMPLE COMMAND (Non-streaming) ====================

let simpleHandler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return m.reply(`❌ Please describe what code you want me to generate.`);
    }

    const waitMsg = await m.reply('🧠 *Generating code...*');

    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: "You are an expert programmer. Generate clean, efficient code with explanations." },
                { role: "user", content: text }
            ],
            max_tokens: 4096,
            temperature: 0.7,
            stream: false
        });

        const response = completion.choices[0]?.message?.content || 'No response';

        await conn.sendMessage(m.chat, { delete: waitMsg.key });

        await conn.sendMessage(m.chat, {
            text: `💻 *Generated Code:*\n\n${response}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: '💻 AI Code Generator',
                    body: 'Simple Mode',
                    thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                    sourceUrl: 'https://www.nvidia.com',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

    } catch (error) {
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        m.reply(`❌ Error: ${error.message}`);
    }
};

// ==================== COMMAND CONFIGURATION ====================

handler.help = ['code', 'generate'];
handler.tags = ['ai', 'programming'];
handler.command = /^(code|generate|program)$/i;
handler.saki = false;

simpleHandler.help = ['simplecode'];
simpleHandler.command = /^(simplecode)$/i;
simpleHandler.tags = ['ai', 'programming'];
simpleHandler.limit = true;

export { handler, simpleHandler };
export default handler;