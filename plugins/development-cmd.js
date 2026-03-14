// plugins/dev.js
// Development Mode Controller for Saziki Bot
// Allows owner to enable/disable commands globally
// @author Saziki Bot Team
// Version: 1.0.0

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_MODE_FILE = path.join(__dirname, '../database/dev_mode.json');

// Initialize global devCommands array
global.devCommands = global.devCommands || [];

/**
 * Load dev commands from JSON file
 */
async function loadDevCommands() {
    try {
        const data = await fs.readFile(DEV_MODE_FILE, 'utf8');
        global.devCommands = JSON.parse(data);
        console.log('✅ Dev mode commands loaded:', global.devCommands);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, create it
            await saveDevCommands();
            console.log('✅ Dev mode file created');
        } else {
            console.error('❌ Error loading dev mode:', error);
        }
    }
}

/**
 * Save dev commands to JSON file
 */
async function saveDevCommands() {
    try {
        // Ensure database directory exists
        const dbDir = path.dirname(DEV_MODE_FILE);
        try {
            await fs.access(dbDir);
        } catch {
            await fs.mkdir(dbDir, { recursive: true });
        }
        
        await fs.writeFile(DEV_MODE_FILE, JSON.stringify(global.devCommands, null, 2));
    } catch (error) {
        console.error('❌ Error saving dev mode:', error);
    }
}

// Load commands when plugin initializes
loadDevCommands();

const handler = async (m, { conn, usedPrefix, command, args, isOwner }) => {
    // Check if user is owner
    if (!isOwner) {
        return m.reply(
            `⛔ *Access Denied*\n\n` +
            `This command is only available to the bot owner.`
        );
    }

    // Check command format
    if (args.length < 2) {
        return m.reply(
            `🛠️ *Dev Mode Controller*\n\n` +
            `*Usage:*\n` +
            `• ${usedPrefix}dev on <command> - Block a command\n` +
            `• ${usedPrefix}dev off <command> - Restore a command\n` +
            `• ${usedPrefix}dev list - Show blocked commands\n\n` +
            `*Examples:*\n` +
            `• ${usedPrefix}dev on .spam\n` +
            `• ${usedPrefix}dev off .spam\n` +
            `• ${usedPrefix}dev list\n\n` +
            `*Currently Blocked:* ${global.devCommands.length} commands`
        );
    }

    const action = args[0].toLowerCase();
    const targetCommand = args[1].toLowerCase();

    // Handle list command
    if (action === 'list') {
        if (global.devCommands.length === 0) {
            return m.reply(`📋 *Dev Mode List*\n\nNo commands are currently blocked.`);
        }
        
        const commandList = global.devCommands.map((cmd, index) => 
            `${index + 1}. \`.${cmd}\``
        ).join('\n');
        
        return m.reply(
            `📋 *Dev Mode - Blocked Commands*\n\n` +
            `${commandList}\n\n` +
            `*Total:* ${global.devCommands.length} commands`
        );
    }

    // Validate action
    if (action !== 'on' && action !== 'off') {
        return m.reply(`❌ Invalid action. Use \`on\`, \`off\`, or \`list\`.`);
    }

    // Remove dot prefix if present
    const cleanCommand = targetCommand.replace(/^\./, '');

    if (action === 'on') {
        // Block command
        if (global.devCommands.includes(cleanCommand)) {
            return m.reply(`⚠️ Command \`.${cleanCommand}\` is already in dev mode.`);
        }
        
        global.devCommands.push(cleanCommand);
        await saveDevCommands();
        
        m.reply(
            `✅ *Command Blocked*\n\n` +
            `• Command: \`.${cleanCommand}\`\n` +
            `• Status: 🔴 Under Maintenance\n\n` +
            `Users will now see maintenance message when trying to use this command.`
        );
        
    } else if (action === 'off') {
        // Restore command
        if (!global.devCommands.includes(cleanCommand)) {
            return m.reply(`⚠️ Command \`.${cleanCommand}\` is not in dev mode.`);
        }
        
        global.devCommands = global.devCommands.filter(cmd => cmd !== cleanCommand);
        await saveDevCommands();
        
        m.reply(
            `✅ *Command Restored*\n\n` +
            `• Command: \`.${cleanCommand}\`\n` +
            `• Status: 🟢 Public\n\n` +
            `Users can now use this command normally.`
        );
    }
};

handler.help = ['dev'];
handler.tags = ['owner'];
handler.command = /^(dev)$/i;
handler.owner = true;

export default handler;