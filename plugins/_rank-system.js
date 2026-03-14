// plugins/rank-system.js
// Automatic Rank System for Saziki Bot
// @author Saziki Bot Team
// Version: 1.0.0

/**
 * This plugin automatically assigns ranks to users based on their level.
 * It runs before every message and updates the user's role in the database.
 */

let handler = m => m;

handler.before = function (m) {
    // Get user data from database
    const user = global.db.data.users[m.sender];
    
    // Skip if user doesn't exist (shouldn't happen, but safety check)
    if (!user) return true;
    
    // Determine rank based on user level
    // Levels increase as users interact more with the bot
    let role;
    
    if (user.level <= 3) {
        role = 'Warrior V';
    } else if (user.level <= 6) {
        role = 'Warrior IV';
    } else if (user.level <= 9) {
        role = 'Warrior III';
    } else if (user.level <= 12) {
        role = 'Warrior II';
    } else if (user.level <= 15) {
        role = 'Warrior I';
    } else if (user.level <= 18) {
        role = 'Elite V';
    } else if (user.level <= 21) {
        role = 'Elite IV';
    } else if (user.level <= 24) {
        role = 'Elite III';
    } else if (user.level <= 27) {
        role = 'Elite II';
    } else if (user.level <= 30) {
        role = 'Elite I';
    } else if (user.level <= 33) {
        role = 'Master V';
    } else if (user.level <= 36) {
        role = 'Master IV';
    } else if (user.level <= 39) {
        role = 'Master III';
    } else if (user.level <= 42) {
        role = 'Master II';
    } else if (user.level <= 45) {
        role = 'Master I';
    } else if (user.level <= 48) {
        role = 'Grand Master V';
    } else if (user.level <= 51) {
        role = 'Grand Master IV';
    } else if (user.level <= 54) {
        role = 'Grand Master III';
    } else if (user.level <= 57) {
        role = 'Grand Master II';
    } else if (user.level <= 60) {
        role = 'Grand Master I';
    } else if (user.level <= 63) {
        role = 'Epic V';
    } else if (user.level <= 66) {
        role = 'Epic IV';
    } else if (user.level <= 69) {
        role = 'Epic III';
    } else if (user.level <= 71) {
        role = 'Epic II';
    } else if (user.level <= 74) {
        role = 'Epic I';
    } else if (user.level <= 77) {
        role = 'Legend V';
    } else if (user.level <= 80) {
        role = 'Legend IV';
    } else if (user.level <= 83) {
        role = 'Legend III';
    } else if (user.level <= 86) {
        role = 'Legend II';
    } else if (user.level <= 89) {
        role = 'Legend I';
    } else if (user.level <= 91) {
        role = 'Mythic V';
    } else if (user.level <= 94) {
        role = 'Mythic IV';
    } else if (user.level <= 97) {
        role = 'Mythic III';
    } else if (user.level <= 100) {
        role = 'Mythic II';
    } else if (user.level <= 105) {
        role = 'Mythic I';
    } else if (user.level <= 120) {
        role = 'Mythic Glory';
    } else if (user.level <= 150) {
        role = 'Emerald V';
    } else if (user.level <= 160) {
        role = 'Emerald IV';
    } else if (user.level <= 170) {
        role = 'Emerald III';
    } else if (user.level <= 185) {
        role = 'Emerald II';
    } else if (user.level <= 200) {
        role = 'Emerald I';
    } else if (user.level <= 400) {
        role = 'Titan III';
    } else if (user.level <= 700) {
        role = 'Titan II';
    } else if (user.level <= 1000) {
        role = 'Titan I';
    } else {
        role = 'Star Dragon King';
    }

    // Update user's role in database
    user.role = role;
    
    return true;
};

handler.help = ['rank-system'];
handler.tags = ['system'];
handler.command = []; // No command, runs automatically

export default handler;