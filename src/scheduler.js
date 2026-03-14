// src/scheduler.js
// Automated Message Scheduler using node-cron
// @author Saziki Bot Team
// Version: 1.0.0

import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==================== CONFIGURATION ====================
const SCHEDULER_DB_PATH = path.join(process.cwd(), 'database/scheduler.json');
const BOT_THUMBNAIL = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg';

// ==================== TASK STORAGE ====================

/**
 * Initialize scheduler database
 */
async function initSchedulerDB() {
    try {
        await fs.access(SCHEDULER_DB_PATH);
    } catch {
        // Create database if it doesn't exist
        const initialData = {
            tasks: [],
            history: []
        };
        await fs.writeFile(SCHEDULER_DB_PATH, JSON.stringify(initialData, null, 2));
        console.log('✅ Scheduler database created');
    }
}

/**
 * Load all scheduled tasks from database
 */
async function loadTasks() {
    try {
        const data = await fs.readFile(SCHEDULER_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
        return { tasks: [], history: [] };
    }
}

/**
 * Save tasks to database
 */
async function saveTasks(tasks) {
    try {
        await fs.writeFile(SCHEDULER_DB_PATH, JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error('❌ Error saving tasks:', error);
    }
}

/**
 * Add a new scheduled task
 */
export async function addTask(jid, message, cronExpression, taskName = 'Reminder', options = {}) {
    const db = await loadTasks();
    
    const task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jid,
        message,
        cronExpression,
        taskName,
        createdAt: new Date().toISOString(),
        lastRun: null,
        nextRun: null,
        isActive: true,
        runCount: 0,
        options: {
            includeThumbnail: options.includeThumbnail || false,
            customTitle: options.customTitle || taskName,
            ...options
        }
    };
    
    db.tasks.push(task);
    await saveTasks(db);
    
    console.log(`✅ Task scheduled: ${taskName} for ${jid} (${cronExpression})`);
    return task;
}

/**
 * Remove a scheduled task
 */
export async function removeTask(taskId) {
    const db = await loadTasks();
    db.tasks = db.tasks.filter(t => t.id !== taskId);
    await saveTasks(db);
    console.log(`✅ Task removed: ${taskId}`);
}

/**
 * Get all active tasks
 */
export async function getActiveTasks() {
    const db = await loadTasks();
    return db.tasks.filter(t => t.isActive);
}

/**
 * Log task execution history
 */
async function logTaskExecution(taskId, status, error = null) {
    const db = await loadTasks();
    
    db.history.push({
        taskId,
        timestamp: new Date().toISOString(),
        status,
        error: error?.message || null
    });
    
    // Keep only last 100 history entries
    if (db.history.length > 100) {
        db.history = db.history.slice(-100);
    }
    
    await saveTasks(db);
}

// ==================== CRON SCHEDULER ====================

/**
 * Initialize all scheduled tasks
 */
export async function initializeScheduler(conn) {
    await initSchedulerDB();
    
    const db = await loadTasks();
    const activeTasks = db.tasks.filter(t => t.isActive);
    
    console.log(`🔄 Initializing scheduler with ${activeTasks.length} tasks...`);
    
    // Schedule each active task
    activeTasks.forEach(task => {
        scheduleCronTask(conn, task);
    });
    
    console.log('✅ Scheduler initialized');
}

/**
 * Schedule a single cron task
 */
function scheduleCronTask(conn, task) {
    if (!cron.validate(task.cronExpression)) {
        console.error(`❌ Invalid cron expression for task ${task.id}: ${task.cronExpression}`);
        return;
    }
    
    const scheduledTask = cron.schedule(task.cronExpression, async () => {
        await executeTask(conn, task);
    });
    
    // Store the cron object for potential later manipulation
    global.scheduledTasks = global.scheduledTasks || {};
    global.scheduledTasks[task.id] = scheduledTask;
    
    console.log(`⏰ Task scheduled: ${task.taskName} (${task.cronExpression})`);
}

/**
 * Execute a scheduled task
 */
async function executeTask(conn, task) {
    try {
        console.log(`⏰ Executing task: ${task.taskName} for ${task.jid}`);
        
        // Check if JID is valid
        if (!task.jid || !task.jid.includes('@')) {
            throw new Error('Invalid JID');
        }
        
        // Prepare message content
        let messageContent = {};
        
        if (task.options.includeThumbnail) {
            messageContent = {
                text: `*${task.options.customTitle || task.taskName}*\n\n${task.message}`,
                contextInfo: {
                    externalAdReply: {
                        title: task.options.customTitle || task.taskName,
                        body: 'Scheduled Message',
                        thumbnailUrl: BOT_THUMBNAIL,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            };
        } else {
            messageContent = { text: task.message };
        }
        
        // Send the message
        await conn.sendMessage(task.jid, messageContent);
        
        // Update task in database
        const db = await loadTasks();
        const taskIndex = db.tasks.findIndex(t => t.id === task.id);
        
        if (taskIndex !== -1) {
            db.tasks[taskIndex].lastRun = new Date().toISOString();
            db.tasks[taskIndex].runCount = (db.tasks[taskIndex].runCount || 0) + 1;
            
            // Calculate next run
            const parts = task.cronExpression.split(' ');
            // Simple next run calculation (you might want a more robust solution)
            const nextRunDate = new Date();
            nextRunDate.setSeconds(0);
            db.tasks[taskIndex].nextRun = nextRunDate.toISOString();
            
            await saveTasks(db);
        }
        
        await logTaskExecution(task.id, 'success');
        console.log(`✅ Task executed successfully: ${task.taskName}`);
        
    } catch (error) {
        console.error(`❌ Task execution failed: ${task.taskName}`, error);
        await logTaskExecution(task.id, 'failed', error);
    }
}

// ==================== EXAMPLE TASKS ====================

/**
 * Example: Daily Reminder at 8 AM
 */
export async function addDailyReminder(jid, message, options = {}) {
    return addTask(
        jid,
        message,
        '0 8 * * *', // Every day at 08:00
        'Daily Reminder',
        { includeThumbnail: true, ...options }
    );
}

/**
 * Example: Weekly Report every Monday at 9 AM
 */
export async function addWeeklyReport(jid, message, options = {}) {
    return addTask(
        jid,
        message,
        '0 9 * * 1', // Every Monday at 09:00
        'Weekly Report',
        { includeThumbnail: true, ...options }
    );
}

/**
 * Example: Monthly Newsletter on 1st of month at 10 AM
 */
export async function addMonthlyNewsletter(jid, message, options = {}) {
    return addTask(
        jid,
        message,
        '0 10 1 * *', // 1st of every month at 10:00
        'Monthly Newsletter',
        { includeThumbnail: true, ...options }
    );
}

/**
 * Example: Hourly Check-in
 */
export async function addHourlyCheckin(jid, message, options = {}) {
    return addTask(
        jid,
        message,
        '0 * * * *', // Every hour
        'Hourly Check-in',
        { includeThumbnail: false, ...options }
    );
}

// ==================== TASK MANAGEMENT COMMANDS ====================

/**
 * Command handler for scheduling messages (to be used in plugins)
 */
export async function handleScheduleCommand(m, conn, args) {
    try {
        // .schedule add 08:00 "Daily Reminder" "Remember to drink water"
        if (args[0] === 'add' && args.length >= 4) {
            const time = args[1]; // 08:00
            const name = args[2];
            const message = args.slice(3).join(' ');
            
            // Convert time to cron expression (HH:MM)
            const [hour, minute] = time.split(':');
            const cronExp = `${minute} ${hour} * * *`;
            
            const task = await addTask(m.sender, message, cronExp, name, {
                includeThumbnail: true,
                customTitle: name
            });
            
            await conn.sendMessage(m.chat, {
                text: `✅ *Task Scheduled*\n\n*Name:* ${name}\n*Time:* ${time}\n*Message:* ${message}\n*ID:* ${task.id.substring(0, 8)}...`
            }, { quoted: m });
        }
        
        // .schedule list
        else if (args[0] === 'list') {
            const tasks = await getActiveTasks();
            const userTasks = tasks.filter(t => t.jid === m.sender);
            
            if (userTasks.length === 0) {
                return m.reply('📭 No scheduled tasks found.');
            }
            
            let listMessage = '*📋 Your Scheduled Tasks*\n\n';
            userTasks.forEach((task, i) => {
                listMessage += `${i+1}. *${task.taskName}*\n`;
                listMessage += `   ⏰ ${task.cronExpression}\n`;
                listMessage += `   📝 ${task.message.substring(0, 30)}${task.message.length > 30 ? '...' : ''}\n`;
                listMessage += `   🆔 ${task.id.substring(0, 8)}\n\n`;
            });
            
            await conn.sendMessage(m.chat, { text: listMessage }, { quoted: m });
        }
        
        // .schedule remove <taskId>
        else if (args[0] === 'remove' && args[1]) {
            await removeTask(args[1]);
            await m.reply('✅ Task removed successfully.');
        }
        
        else {
            await m.reply(
                '*📝 Schedule Commands*\n\n' +
                '• `.schedule add HH:MM "Name" Message` - Add task\n' +
                '• `.schedule list` - List your tasks\n' +
                '• `.schedule remove <taskId>` - Remove task'
            );
        }
        
    } catch (error) {
        console.error('Schedule command error:', error);
        await m.reply(`❌ Error: ${error.message}`);
    }
}

// ==================== EXPORTS ====================

export default {
    addTask,
    removeTask,
    getActiveTasks,
    initializeScheduler,
    addDailyReminder,
    addWeeklyReport,
    addMonthlyNewsletter,
    addHourlyCheckin,
    handleScheduleCommand
};