// respected.js
// 🤖 Enhanced AI System with Function Calling & Tools

import OpenAI from "openai";
import axios from 'axios';
import * as cheerio from 'cheerio';

// ==================== CONFIGURATION ====================
const GITHUB_TOKEN = "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";
const ENDPOINT = "https://models.github.ai/inference";
const MODEL_NAME = "openai/gpt-4o";

// ==================== EMOJIS ====================
const EMOJIS = {
    search: '🔍',
    weather: '🌤️',
    news: '📰',
    calculator: '🧮',
    time: '⏰',
    date: '📅',
    translate: '🌐',
    wiki: '📚',
    flight: '✈️',
    success: '✅',
    error: '❌',
    thinking: '💭',
    robot: '🤖',
    sparkles: '✨'
};

// ==================== TOOLS DEFINITIONS ====================

/**
 * البحث في الويب
 */
async function searchWeb(query) {
    try {
        const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('.result').each((i, el) => {
            if (i >= 3) return false;
            const title = $(el).find('.result__title').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            const link = $(el).find('.result__url').text().trim();
            
            if (title && snippet) {
                results.push({ title, snippet, link });
            }
        });
        
        return JSON.stringify(results);
    } catch (error) {
        return JSON.stringify({ error: "Search failed" });
    }
}

/**
 * الحصول على معلومات الطقس
 */
async function getWeather(city) {
    try {
        // استخدام Open-Meteo API (مجاني)
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        
        if (geoResponse.data.results && geoResponse.data.results.length > 0) {
            const { latitude, longitude, name } = geoResponse.data.results[0];
            
            const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weather = weatherResponse.data.current_weather;
            
            return JSON.stringify({
                city: name,
                temperature: `${weather.temperature}°C`,
                windspeed: `${weather.windspeed} km/h`,
                condition: weather.weathercode
            });
        }
        
        return JSON.stringify({ error: "City not found" });
    } catch (error) {
        return JSON.stringify({ error: "Weather fetch failed" });
    }
}

/**
 * الحصول على الوقت والتاريخ
 */
function getDateTime(location = 'local') {
    const now = new Date();
    return JSON.stringify({
        date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: now.toISOString()
    });
}

/**
 * آلة حاسبة
 */
function calculate(expression) {
    try {
        // تنظيف التعبير
        const cleanExp = expression.replace(/[^0-9+\-*/().\s]/g, '');
        const result = eval(cleanExp);
        return JSON.stringify({ expression: cleanExp, result: result });
    } catch (error) {
        return JSON.stringify({ error: "Invalid expression" });
    }
}

/**
 * البحث في ويكيبيديا
 */
async function searchWikipedia(query) {
    try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        
        return JSON.stringify({
            title: response.data.title,
            extract: response.data.extract,
            description: response.data.description,
            url: response.data.content_urls?.desktop?.page
        });
    } catch (error) {
        return JSON.stringify({ error: "Wikipedia article not found" });
    }
}

/**
 * ترجمة النص
 */
async function translateText(text, targetLang = 'ar') {
    try {
        // استخدام MyMemory API (مجاني)
        const response = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        
        return JSON.stringify({
            original: text,
            translated: response.data.responseData.translatedText,
            targetLanguage: targetLang
        });
    } catch (error) {
        return JSON.stringify({ error: "Translation failed" });
    }
}

/**
 * الحصول على الأخبار
 */
async function getNews(category = 'general') {
    try {
        // استخدام API مجاني للأخبار
        const response = await axios.get(`https://api.nytimes.com/svc/topstories/v2/${category}.json?api-key=demo`);
        
        const articles = response.data.results.slice(0, 5).map(article => ({
            title: article.title,
            abstract: article.abstract,
            url: article.url
        }));
        
        return JSON.stringify(articles);
    } catch (error) {
        return JSON.stringify({ error: "News fetch failed" });
    }
}

// ==================== TOOLS CONFIGURATION ====================

const tools = [
    {
        type: "function",
        function: {
            name: "searchWeb",
            description: "Search the web for current information, news, facts, or any real-time data",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to find information about"
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getWeather",
            description: "Get current weather information for a specific city",
            parameters: {
                type: "object",
                properties: {
                    city: {
                        type: "string",
                        description: "The name of the city to get weather for"
                    }
                },
                required: ["city"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getDateTime",
            description: "Get current date and time information",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "Optional location for timezone (defaults to local)"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "calculate",
            description: "Perform mathematical calculations",
            parameters: {
                type: "object",
                properties: {
                    expression: {
                        type: "string",
                        description: "The mathematical expression to calculate"
                    }
                },
                required: ["expression"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "searchWikipedia",
            description: "Search Wikipedia for detailed information about any topic",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The topic to search for on Wikipedia"
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "translateText",
            description: "Translate text between languages",
            parameters: {
                type: "object",
                properties: {
                    text: {
                        type: "string",
                        description: "The text to translate"
                    },
                    targetLang: {
                        type: "string",
                        description: "Target language code (e.g., 'ar' for Arabic, 'fr' for French, 'es' for Spanish)",
                        default: "ar"
                    }
                },
                required: ["text"]
            }
        }
    }
];

// Map function names to their implementations
const functionMap = {
    searchWeb: (args) => searchWeb(args.query),
    getWeather: (args) => getWeather(args.city),
    getDateTime: (args) => getDateTime(args.location),
    calculate: (args) => calculate(args.expression),
    searchWikipedia: (args) => searchWikipedia(args.query),
    translateText: (args) => translateText(args.text, args.targetLang || 'ar')
};

// ==================== MAIN ENHANCED AI FUNCTION ====================

/**
 * Enhanced AI Chat with Function Calling
 */
export async function enhancedChat(userMessage, systemPrompt = null, conversationHistory = []) {
    try {
        const client = new OpenAI({ 
            baseURL: ENDPOINT, 
            apiKey: GITHUB_TOKEN 
        });
        
        // Build messages
        const messages = [
            { 
                role: "system", 
                content: systemPrompt || `You are Saziki AI, an enhanced intelligent assistant with access to real-time tools.

🎯 Available Tools:
• 🔍 searchWeb - Search the internet for current information
• 🌤️ getWeather - Get real-time weather for any city
• ⏰ getDateTime - Get current date and time
• 🧮 calculate - Perform mathematical calculations
• 📚 searchWikipedia - Get detailed Wikipedia information
• 🌐 translateText - Translate between languages

💡 Guidelines:
• Use tools when you need real-time or specific information
• Be helpful, friendly, and conversational
• Use emojis naturally in responses
• For general conversation, respond directly without tools
• When using tools, explain what you're doing
• Provide comprehensive and detailed answers
• Always verify information from tools before responding`
            },
            ...conversationHistory,
            { role: "user", content: userMessage }
        ];
        
        console.log(`${EMOJIS.thinking} Enhanced AI processing: "${userMessage.substring(0, 50)}..."`);
        
        // First call - Check if tools are needed
        let response = await client.chat.completions.create({
            messages: messages,
            tools: tools,
            model: MODEL_NAME,
            temperature: 0.7,
            max_tokens: 2000
        });
        
        // Check if model wants to use tools
        if (response.choices[0].finish_reason === "tool_calls") {
            console.log(`${EMOJIS.search} Tool calls requested`);
            
            // Append model response to history
            messages.push(response.choices[0].message);
            
            // Process each tool call
            const toolCalls = response.choices[0].message.tool_calls || [];
            
            for (const toolCall of toolCalls) {
                if (toolCall.type === "function") {
                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);
                    
                    console.log(`${EMOJIS.robot} Calling: ${functionName}(${JSON.stringify(functionArgs)})`);
                    
                    // Call the function
                    const functionResult = await functionMap[functionName](functionArgs);
                    
                    // Append function result to history
                    messages.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: functionName,
                        content: functionResult
                    });
                }
            }
            
            // Get final response with tool results
            response = await client.chat.completions.create({
                messages: messages,
                tools: tools,
                model: MODEL_NAME,
                temperature: 0.7,
                max_tokens: 2000
            });
        }
        
        const finalResponse = response.choices[0].message.content;
        console.log(`${EMOJIS.success} Enhanced response generated (${finalResponse.length} chars)`);
        
        return {
            success: true,
            response: finalResponse,
            usedTools: messages.some(m => m.role === "tool")
        };
        
    } catch (error) {
        console.error(`${EMOJIS.error} Enhanced AI error:`, error.message);
        return {
            success: false,
            response: `${EMOJIS.error} I encountered an error while processing your request. Please try again.`,
            error: error.message
        };
    }
}

/**
 * Simple enhanced chat without conversation history
 */
export async function simpleEnhancedChat(userMessage) {
    return await enhancedChat(userMessage);
}

/**
 * Chat with custom system prompt
 */
export async function customEnhancedChat(userMessage, systemPrompt) {
    return await enhancedChat(userMessage, systemPrompt);
}

// ==================== EXPORT DEFAULT ====================

export default {
    enhancedChat,
    simpleEnhancedChat,
    customEnhancedChat,
    tools: Object.keys(functionMap)
};