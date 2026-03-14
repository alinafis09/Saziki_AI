// plugins/spam.js
// Advanced Sniper Console for Saziki Bot
// @author Saziki Bot Team
// Version: 4.0.0 - Sniper Console Edition

import axios from 'axios';
import { delay } from '@whiskeysockets/baileys';

// ==================== DECORATIVE ELEMENTS ====================
const DECOR = {
    // Box Drawing
    TOP_LEFT: '┏',
    TOP_RIGHT: '┓',
    BOTTOM_LEFT: '┗',
    BOTTOM_RIGHT: '┛',
    HORIZONTAL: '━',
    VERTICAL: '┋',
    DOUBLE_HORIZONTAL: '═',
    DOUBLE_VERTICAL: '║',
    
    // Arrows & Symbols
    LEFT_ARROW: '⊰',
    RIGHT_ARROW: '⊱',
    STAR: '✨',
    DIVIDER: '─',
    DOUBLE_DIVIDER: '━━',
    BULLET: '•',
    DOTTED: '┈',
    CORNER: '╌',
    HEART: '❤️',
    ROCKET: '🚀',
    FIRE: '🔥',
    
    // Geometric
    CIRCLE: '◉',
    SQUARE: '▣',
    DIAMOND: '◆',
    CROSS: '✧',
    DOT: '·',
    MID_DOT: '‧',
    WAVE: '〜',
    INFINITY: '∞',
    
    // Progress Bar
    PROGRESS_FILL: '▣',
    PROGRESS_EMPTY: '▢',
    PROGRESS_FILL_ALT: '█',
    PROGRESS_EMPTY_ALT: '░',
    
    // Math & Logic
    INTERSECTION: '∩',
    UNION: '∪',
    INTEGRAL: '∫',
    DOUBLE_INTEGRAL: '∬',
    TRIPLE_INTEGRAL: '∭',
    CONTOUR_INTEGRAL: '∮',
    SURFACE_INTEGRAL: '∯',
    VOLUME_INTEGRAL: '∰',
    THEREFORE: '∴',
    BECAUSE: '∵',
    ANGLE: '∠',
    PERPENDICULAR: '⊥',
    PARALLEL: '∥',
    LOGICAL_AND: '∧',
    LOGICAL_OR: '∨',
    LOGICAL_NOT: '¬',
    LOGICAL_XOR: '⊻',
    SUBSET: '⊂',
    SUPERSET: '⊃',
    ELEMENT: '∈',
    FOR_ALL: '∀',
    EXISTS: '∃',
    NABLA: '∇',
    PARTIAL: '∂',
    SUM: '∑',
    PRODUCT: '∏',
    
    // Animals
    ZEBRA: '🦓',
    LION: '🦁',
    TIGER: '🐯',
    ELEPHANT: '🐘',
    GIRAFFE: '🦒',
    MONKEY: '🐒',
    PANDA: '🐼',
    FOX: '🦊',
    WOLF: '🐺',
    CAT: '🐱',
    DOG: '🐶',
    BIRD: '🐦',
    EAGLE: '🦅',
    OWL: '🦉',
    FROG: '🐸',
    FISH: '🐠',
    DOLPHIN: '🐬',
    WHALE: '🐋',
    SNAKE: '🐍',
    DRAGON: '🐉',
    OCTOPUS: '🐙',
    SHARK: '🦈',
    UNICORN: '🦄',
    PHOENIX: '🔥🦅',
    
    // Rotating Scanner Symbols
    SCANNER: ['/', '-', '\\', '|'],
    
    // Sniper Icons
    SNIPER: '🎯',
    CROSSHAIR: '⌖',
    TARGET: '◎',
    BULLSEYE: '⦿',
    SCOPE: '◉',
    
    // Decorative Borders
    BORDER1: '╔╗╚╝═║',
    BORDER2: '┌┐└┘─│',
    BORDER3: '┏┓┗┛━┃',
    BORDER4: '▀▄▌▐',
    BORDER5: '█▓▒░'
};

// ==================== RANK SYSTEM ====================
const RANKS = [
    { min: 1, max: 10, title: '🔰 NOVICE HUNTER', font: 'SERIF_BOLD', icon: '🔰' },
    { min: 11, max: 25, title: '⚡ ELITE STRIKER', font: 'SANS_BOLD', icon: '⚡' },
    { min: 26, max: 50, title: '💀 ELITE KILLER', font: 'GOTHIC_BOLD', icon: '💀' },
    { min: 51, max: 75, title: '👑 SNIPER LEGEND', font: 'SCRIPT_BOLD', icon: '👑' },
    { min: 76, max: 100, title: '🔥 HEADSHOT MASTER', font: 'DOUBLE_STRUCK', icon: '🔥' },
    { min: 101, max: 150, title: '⚔️ ASSASSIN GOD', font: 'SERIF_BOLD_ITALIC', icon: '⚔️' },
    { min: 151, max: 200, title: '🌀 QUANTUM SNIPER', font: 'TYPEWRITER', icon: '🌀' },
    { min: 201, max: 500, title: '∞ INFINITY HUNTER', font: 'SANS_BOLD_ITALIC', icon: '∞' }
];

// ==================== DYNAMIC STATUS PHRASES ====================
const STATUS_PHRASES = [
    {
        main: '🌪️ DATA STORM...',
        icon: '🌪️',
        animal: DECOR.EAGLE,
        desc: 'Packet vortex created',
        math: DECOR.DOUBLE_INTEGRAL
    },
    {
        main: '🌀 PACKET VORTEX...',
        icon: '🌀',
        animal: DECOR.DOLPHIN,
        desc: 'Routing through quantum tunnels',
        math: DECOR.TRIPLE_INTEGRAL
    },
    {
        main: '∴ THEREFORE IMPACT...',
        icon: '∴',
        animal: DECOR.PANDA,
        desc: 'Logical conclusion reached',
        math: DECOR.THEREFORE
    },
    {
        main: '🧠 LOGICAL CONCLUSION...',
        icon: '🧠',
        animal: DECOR.OWL,
        desc: 'AI processing complete',
        math: DECOR.LOGICAL_AND
    },
    {
        main: '⚡∫ QUANTUM FLUX...',
        icon: '⚡',
        animal: DECOR.WHALE,
        desc: '∫∫∫ Wave function collapse',
        math: DECOR.VOLUME_INTEGRAL
    },
    {
        main: '∰ DIMENSIONAL RIFT...',
        icon: '∰',
        animal: DECOR.DRAGON,
        desc: '4D space-time distortion',
        math: DECOR.SURFACE_INTEGRAL
    },
    {
        main: '⊻ XOR ENCRYPTION...',
        icon: '⊻',
        animal: DECOR.FOX,
        desc: 'Logical gates flipping',
        math: DECOR.LOGICAL_XOR
    },
    {
        main: '🔥 THERMAL OVERDRIVE...',
        icon: '🔥',
        animal: DECOR.LION,
        desc: 'Core temperature critical',
        math: DECOR.INTERSECTION
    },
    {
        main: '🎯 ACQUIRING TARGET...',
        icon: '🎯',
        animal: DECOR.SHARK,
        desc: 'Laser guidance active',
        math: DECOR.SUBSET
    },
    {
        main: '⌖ SNIPER LOCKED...',
        icon: '⌖',
        animal: DECOR.EAGLE,
        desc: 'Headshot trajectory calculated',
        math: DECOR.ELEMENT
    }
];

// ==================== RANDOM DECOR SETS ====================
const DECOR_SETS = [
    {
        name: 'MATH SET',
        symbols: [DECOR.INTEGRAL, DECOR.DOUBLE_INTEGRAL, DECOR.TRIPLE_INTEGRAL, 
                  DECOR.VOLUME_INTEGRAL, DECOR.SURFACE_INTEGRAL, DECOR.CONTOUR_INTEGRAL],
        animals: [DECOR.SNAKE, DECOR.DRAGON],
        border: '▛▜▙▟▀█'
    },
    {
        name: 'ANIMAL SET',
        symbols: [DECOR.LION, DECOR.TIGER, DECOR.EAGLE, DECOR.SHARK, DECOR.DRAGON],
        animals: [DECOR.PANDA, DECOR.FOX, DECOR.OWL],
        border: '🦁🐯🦅🐉'
    },
    {
        name: 'LOGIC SET',
        symbols: [DECOR.LOGICAL_AND, DECOR.LOGICAL_OR, DECOR.LOGICAL_XOR, DECOR.LOGICAL_NOT],
        animals: [DECOR.OWL, DECOR.FOX],
        border: '∧∨⊻¬'
    },
    {
        name: 'SET THEORY',
        symbols: [DECOR.SUBSET, DECOR.SUPERSET, DECOR.ELEMENT, DECOR.INTERSECTION, DECOR.UNION],
        animals: [DECOR.CAT, DECOR.DOG],
        border: '⊂⊃∈∩∪'
    },
    {
        name: 'CALCULUS',
        symbols: [DECOR.INTEGRAL, DECOR.PARTIAL, DECOR.NABLA, DECOR.SUM, DECOR.PRODUCT],
        animals: [DECOR.FISH, DECOR.WHALE],
        border: '∫∂∇∑∏'
    },
    {
        name: 'PREDATOR SET',
        symbols: [DECOR.LION, DECOR.TIGER, DECOR.SHARK, DECOR.EAGLE],
        animals: [DECOR.WOLF, DECOR.FOX],
        border: '🦁🐯🦈🦅'
    }
];

// ==================== FONT STYLES ====================
const FONTS = {
    SERIF: {
        REGULAR: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗',
        BOLD: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
        ITALIC: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧',
        BOLD_ITALIC: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛'
    },
    SANS: {
        REGULAR: '𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫',
        BOLD: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
        ITALIC: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻',
        BOLD_ITALIC: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯'
    },
    SCRIPT: {
        REGULAR: '𝒜𝒞ℰ𝒢ℐ𝒦𝒩𝒪𝒫𝒬𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏',
        BOLD: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃'
    },
    GOTHIC: {
        REGULAR: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷',
        BOLD: '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟'
    },
    DOUBLE_STRUCK: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡',
    TYPEWRITER: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿',
    SMALL_CAPS: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get rank based on count
 * @param {number} count - Message count
 * @returns {Object} - Rank information
 */
function getRank(count) {
    for (const rank of RANKS) {
        if (count >= rank.min && count <= rank.max) {
            return rank;
        }
    }
    return RANKS[RANKS.length - 1]; // Return highest rank if beyond
}

/**
 * Get rotating scanner symbol
 * @param {number} index - Current iteration
 * @returns {string} - Scanner symbol
 */
function getScannerSymbol(index) {
    return DECOR.SCANNER[index % DECOR.SCANNER.length];
}

/**
 * Generate a visual progress bar
 * @param {number} current - Current progress
 * @param {number} total - Total
 * @param {number} length - Bar length
 * @returns {string} - Progress bar
 */
function generateProgressBar(current, total, length = 15) {
    const percentage = Math.min(100, Math.round((current / total) * 100));
    const filled = Math.floor((percentage / 100) * length);
    const empty = length - filled;
    
    const fillChar = DECOR.PROGRESS_FILL;
    const emptyChar = DECOR.PROGRESS_EMPTY;
    
    return fillChar.repeat(filled) + emptyChar.repeat(empty);
}

/**
 * Generate a hacker-style progress bar with math symbols
 * @param {number} current - Current progress
 * @param {number} total - Total
 * @param {Object} decorSet - Current decor set
 * @returns {string} - Decorated progress bar
 */
function generateHackerBar(current, total, decorSet) {
    const percentage = Math.min(100, Math.round((current / total) * 100));
    const length = 12;
    const filled = Math.floor((percentage / 100) * length);
    
    let bar = '';
    for (let i = 0; i < length; i++) {
        if (i < filled) {
            bar += decorSet.symbols[i % decorSet.symbols.length];
        } else {
            bar += DECOR.DOT;
        }
    }
    
    return bar;
}

/**
 * Get random decor set
 * @param {number} index - Batch index
 * @returns {Object} - Decor set
 */
function getDecorSet(index) {
    return DECOR_SETS[index % DECOR_SETS.length];
}

/**
 * Create unique border for each batch
 * @param {Object} decorSet - Current decor set
 * @param {number} variant - Border variant
 * @returns {Object} - Border characters
 */
function getUniqueBorder(decorSet, variant) {
    const borders = [
        { 
            tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║',
            decor: decorSet.symbols[0]
        },
        { 
            tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃',
            decor: decorSet.symbols[1 % decorSet.symbols.length]
        },
        { 
            tl: '▛', tr: '▜', bl: '▙', br: '▟', h: '▀', v: '█',
            decor: decorSet.animals[0]
        },
        { 
            tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│',
            decor: decorSet.animals[1 % decorSet.animals.length]
        },
        { 
            tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│',
            decor: decorSet.symbols[2 % decorSet.symbols.length]
        }
    ];
    
    return borders[variant % borders.length];
}

/**
 * Apply a specific font style to text
 * @param {string} text - Original text
 * @param {string} style - Font style to apply
 * @returns {string} - Converted text
 */
function applyFont(text, style = 'SERIF_REGULAR') {
    if (!text) return text;
    
    const fontMap = {
        'SERIF_REGULAR': (t) => t,
        'SERIF_BOLD': (t) => convertToUnicode(t, FONTS.SERIF.BOLD),
        'SERIF_ITALIC': (t) => convertToUnicode(t, FONTS.SERIF.ITALIC),
        'SERIF_BOLD_ITALIC': (t) => convertToUnicode(t, FONTS.SERIF.BOLD_ITALIC),
        'SANS_BOLD': (t) => convertToUnicode(t, FONTS.SANS.BOLD),
        'SANS_ITALIC': (t) => convertToUnicode(t, FONTS.SANS.ITALIC),
        'SANS_BOLD_ITALIC': (t) => convertToUnicode(t, FONTS.SANS.BOLD_ITALIC),
        'SCRIPT_REGULAR': (t) => convertToUnicode(t, FONTS.SCRIPT.REGULAR),
        'SCRIPT_BOLD': (t) => convertToUnicode(t, FONTS.SCRIPT.BOLD),
        'GOTHIC_REGULAR': (t) => convertToUnicode(t, FONTS.GOTHIC.REGULAR),
        'GOTHIC_BOLD': (t) => convertToUnicode(t, FONTS.GOTHIC.BOLD),
        'DOUBLE_STRUCK': (t) => convertToUnicode(t, FONTS.DOUBLE_STRUCK),
        'TYPEWRITER': (t) => convertToUnicode(t, FONTS.TYPEWRITER),
        'SMALL_CAPS': (t) => convertToUnicode(t, FONTS.SMALL_CAPS)
    };
    
    const converter = fontMap[style] || fontMap['SERIF_REGULAR'];
    return converter(text);
}

/**
 * Convert text to Unicode fancy font
 * @param {string} text - Original text
 * @param {string} fontSet - Unicode font mapping
 * @returns {string} - Converted text
 */
function convertToUnicode(text, fontSet) {
    const baseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let char of text) {
        const index = baseChars.indexOf(char);
        if (index !== -1 && index < fontSet.length) {
            result += fontSet[index];
        } else {
            result += char;
        }
    }
    return result;
}

/**
 * Create decorative box with custom border
 * @param {string} title - Box title
 * @param {string} content - Box content
 * @param {Object} border - Border configuration
 * @returns {string} - Formatted box
 */
function createDecorativeBox(title, content, border) {
    const lines = content.split('\n');
    const width = Math.max(title.length, ...lines.map(l => l.length)) + 8;
    
    const topLine = border.tl + border.h.repeat(width) + border.tr;
    const bottomLine = border.bl + border.h.repeat(width) + border.br;
    const titleLine = border.v + '  ' + applyFont(title, 'SANS_BOLD') + '  '.padEnd(width - title.length - 2, ' ') + border.v;
    
    let result = `${topLine}\n${titleLine}\n${border.v}  ${border.h.repeat(width - 2)}  ${border.v}\n`;
    
    for (const line of lines) {
        result += `${border.v}  ${line.padEnd(width - 2, ' ')}  ${border.v}\n`;
    }
    
    result += bottomLine;
    result += `\n${border.decor.repeat(3)} SNIPER CONSOLE v4.0 ${border.decor.repeat(3)}`;
    
    return result;
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Check if text is provided
    if (!text) {
        const helpBox = `╔════════════════════════════╗
║  🎯 SAZIKI SNIPER CONSOLE  🎯  ║
╠════════════════════════════╣
║  Usage: ${usedPrefix}${command} <number> | <count> | <message>
║  
║  Example:
║  ${usedPrefix}spam 212600000000 | 50 | Hello
║  
║  RANKS:
║  🔰 1-10: NOVICE HUNTER
║  ⚡ 11-25: ELITE STRIKER
║  💀 26-50: ELITE KILLER
║  👑 51-75: SNIPER LEGEND
║  🔥 76-100: HEADSHOT MASTER
║  ⚔️ 101-150: ASSASSIN GOD
║  🌀 151-200: QUANTUM SNIPER
║  ∞ 201+: INFINITY HUNTER
║  
║  FEATURES:
║  • Real-time rotating scanner (/ - \\ |)
║  • Dynamic rank system
║  • 6 decorative sets
║  • Animal & Math symbols
╚════════════════════════════╝`;
        
        return m.reply(helpBox);
    }

    // Parse input
    const parts = text.split('|').map(p => p.trim());
    
    if (parts.length < 3) {
        return m.reply(
            `╔════════════════════╗
║  ⚠️ INVALID FORMAT  ║
╠════════════════════╣
║  ${DECOR.CROSS} Please use:
║  ${usedPrefix}${command} <number> | <count> | <message>
╚════════════════════╝`
        );
    }

    const targetNumber = parts[0].replace(/[^0-9]/g, '');
    const count = parseInt(parts[1]);
    let message = parts.slice(2).join(' | ');

    // Validate inputs
    if (!targetNumber || targetNumber.length < 10) {
        return m.reply(
            `╔══════════════════════╗
║  ❌ INVALID NUMBER  ║
╠══════════════════════╣
║  ${DECOR.NOT} Provide valid number
║  Example: 212600000000
╚══════════════════════╝`
        );
    }

    if (isNaN(count) || count < 1) {
        return m.reply(
            `╔══════════════════════╗
║  ⚠️ INVALID COUNT  ║
╠══════════════════════╣
║  ${DECOR.NOT} Count must be >=1
║  You entered: ${parts[1]}
╚══════════════════════╝`
        );
    }

    if (!message) {
        return m.reply(
            `╔══════════════════════╗
║  ❌ EMPTY MESSAGE  ║
╠══════════════════════╣
║  ${DECOR.NOT} Provide a message
╚══════════════════════╝`
        );
    }

    // Format the target JID
    const targetJid = targetNumber.includes('@') ? targetNumber : `${targetNumber}@s.whatsapp.net`;

    // Get rank based on count
    const rank = getRank(count);
    const styledRank = applyFont(rank.title, rank.font);

    // Send confirmation message
    const confirmBox = `╔════════════════════════════╗
║  ${rank.icon} SNIPER MISSION INITIATED ${rank.icon}  ║
╠════════════════════════════╣
║  ${DECOR.CIRCLE} Target: ${targetNumber}
║  ${DECOR.CIRCLE} Count: ${count} messages
║  ${DECOR.CIRCLE} Rank: ${styledRank}
║  ${DECOR.CIRCLE} Delay: 1 second
║  
║  ${DECOR.ROCKET} ${DECOR.FIRE} Locking target... ${DECOR.FIRE} ${DECOR.ROCKET}
╚════════════════════════════╝`;
    
    await m.reply(confirmBox);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Font variations
    const fontStyles = [
        'SERIF_BOLD', 'SERIF_ITALIC', 'SERIF_BOLD_ITALIC',
        'SANS_BOLD', 'SANS_ITALIC', 'SCRIPT_REGULAR',
        'SCRIPT_BOLD', 'GOTHIC_REGULAR', 'GOTHIC_BOLD',
        'DOUBLE_STRUCK', 'TYPEWRITER', 'SMALL_CAPS'
    ];

    // ========== SINGLE PROGRESS MESSAGE ==========
    // Send initial progress message and save its key
    const initialPhrase = STATUS_PHRASES[0];
    const initialDecorSet = DECOR_SETS[0];
    const initialBorder = getUniqueBorder(initialDecorSet, 0);
    const initialBar = generateProgressBar(0, count, 20);
    const initialHacker = generateHackerBar(0, count, initialDecorSet);
    const scanner = getScannerSymbol(0);
    
    const initialProgress = 
        `${initialBorder.tl}${initialBorder.h.repeat(40)}${initialBorder.tr}\n` +
        `${initialBorder.v}  ${initialPhrase.animal} ⚡ SNIPER CONSOLE ⚡ ${initialPhrase.animal}  ${initialBorder.v}\n` +
        `${initialBorder.v}  ${initialBorder.h.repeat(38)}  ${initialBorder.v}\n` +
        `${initialBorder.v}  ${initialPhrase.animal} ${initialPhrase.main} ${initialPhrase.animal}\n` +
        `${initialBorder.v}  ${initialPhrase.desc} ${initialPhrase.math}\n` +
        `${initialBorder.v}  \n` +
        `${initialBorder.v}  ${DECOR.SQUARE} Standard: ${initialBar}\n` +
        `${initialBorder.v}  ${DECOR.VOLUME_INTEGRAL} Hacker: ${initialHacker}\n` +
        `${initialBorder.v}  \n` +
        `${initialBorder.v}  ${DECOR.BULLET} Rank: ${styledRank}\n` +
        `${initialBorder.v}  ${DECOR.BULLET} Sent: 0/${count}\n` +
        `${initialBorder.v}  ${DECOR.BULLET} Failed: 0\n` +
        `${initialBorder.v}  ${DECOR.BULLET} Progress: 0%\n` +
        `${initialBorder.v}  ${DECOR.BULLET} Scanner: [${scanner}]\n` +
        `${initialBorder.v}  ${DECOR.BULLET} Attack Phase: ${initialPhrase.icon}\n` +
        `${initialBorder.v}  ${DECOR.BULLET} Decor Set: ${initialDecorSet.name}\n` +
        `${initialBorder.bl}${initialBorder.h.repeat(40)}${initialBorder.br}\n` +
        `${initialBorder.decor.repeat(3)} ACQUIRING TARGET ${initialBorder.decor.repeat(3)}`;

    const progressMsg = await conn.sendMessage(m.chat, { text: initialProgress }, { quoted: m });
    const progressKey = progressMsg.key;

    // Send spam messages with delay
    let successCount = 0;
    let failCount = 0;
    let currentDecorSet = initialDecorSet;
    let batchCounter = 0;

    for (let i = 0; i < count; i++) {
        try {
            // Change decor set every 5 messages
            if (i % 5 === 0) {
                batchCounter++;
                currentDecorSet = getDecorSet(batchCounter);
            }
            
            // Random font
            const randomFont = fontStyles[Math.floor(Math.random() * fontStyles.length)];
            const styledMessage = applyFont(message, randomFont);
            
            // Get border for this batch
            const border = getUniqueBorder(currentDecorSet, batchCounter);
            
            const spamMessage = 
                `${border.tl}${border.h.repeat(30)}${border.tr}\n` +
                `${border.v}  ${currentDecorSet.symbols[i % currentDecorSet.symbols.length]} SNIPER SHOT #${i + 1} ${currentDecorSet.animals[i % currentDecorSet.animals.length]}  ${border.v}\n` +
                `${border.v}  ${border.h.repeat(28)}  ${border.v}\n` +
                `${border.v}  ${styledMessage}\n` +
                `${border.v}  \n` +
                `${border.v}  ${DECOR.SNIPER} Target: ${targetNumber}\n` +
                `${border.v}  ${DECOR.CROSSHAIR} Accuracy: 99.${(i % 100).toString().padStart(2, '0')}%\n` +
                `${border.bl}${border.h.repeat(30)}${border.br}\n` +
                `${border.decor.repeat(2)} HEADSHOT QUEUE ${border.decor.repeat(2)}`;

            await conn.sendMessage(targetJid, {
                text: spamMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        title: 'Saziki Sniper 🤖',
                        body: `🎯 Shot #${i + 1}`,
                        thumbnailUrl: 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VaYourChannelID',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            });
            
            successCount++;
            
            // Update the SINGLE progress message every 2 seconds
            if ((i + 1) % 2 === 0 || i === count - 1) {
                // Rotate through status phrases
                const phraseIndex = Math.floor((i / 2) % STATUS_PHRASES.length);
                const currentPhrase = STATUS_PHRASES[phraseIndex];
                const currentScanner = getScannerSymbol(i);
                
                const progressBar = generateProgressBar(i + 1, count, 20);
                const hackerBar = generateHackerBar(i + 1, count, currentDecorSet);
                const percentage = Math.round(((i + 1) / count) * 100);
                const border = getUniqueBorder(currentDecorSet, batchCounter);
                
                const updatedProgress = 
                    `${border.tl}${border.h.repeat(40)}${border.tr}\n` +
                    `${border.v}  ${currentPhrase.animal} ⚡ SNIPER CONSOLE ⚡ ${currentPhrase.animal}  ${border.v}\n` +
                    `${border.v}  ${border.h.repeat(38)}  ${border.v}\n` +
                    `${border.v}  ${currentPhrase.animal} ${currentPhrase.main} ${currentPhrase.animal}\n` +
                    `${border.v}  ${currentPhrase.desc} ${currentPhrase.math}\n` +
                    `${border.v}  \n` +
                    `${border.v}  ${DECOR.SQUARE} Standard: ${progressBar}\n` +
                    `${border.v}  ${DECOR.VOLUME_INTEGRAL} Hacker: ${hackerBar}\n` +
                    `${border.v}  \n` +
                    `${border.v}  ${DECOR.BULLET} Rank: ${styledRank}\n` +
                    `${border.v}  ${DECOR.BULLET} Sent: ${successCount}/${count}\n` +
                    `${border.v}  ${DECOR.BULLET} Failed: ${failCount}\n` +
                    `${border.v}  ${DECOR.BULLET} Progress: ${percentage}%\n` +
                    `${border.v}  ${DECOR.BULLET} Scanner: [${currentScanner}]\n` +
                    `${border.v}  ${DECOR.BULLET} Attack Phase: ${currentPhrase.icon}\n` +
                    `${border.v}  ${DECOR.BULLET} Decor Set: ${currentDecorSet.name}\n` +
                    `${border.bl}${border.h.repeat(40)}${border.br}\n` +
                    `${border.decor.repeat(3)} ACTIVE SNIPER ${border.decor.repeat(3)}`;

                // Edit the existing message
                await conn.sendMessage(m.chat, {
                    text: updatedProgress,
                    edit: progressKey
                });
            }
            
            // Delay between messages
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.error(`Failed to send message #${i + 1}:`, error);
            failCount++;
            
            if (failCount > 5) {
                throw new Error('Too many consecutive failures');
            }
        }
    }

    // Final update to progress message
    const finalPhrase = STATUS_PHRASES[STATUS_PHRASES.length - 1];
    const finalScanner = getScannerSymbol(count);
    const finalBar = generateProgressBar(count, count, 20);
    const finalHacker = generateHackerBar(count, count, currentDecorSet);
    const border = getUniqueBorder(currentDecorSet, batchCounter);
    
    const finalProgress = 
        `${border.tl}${border.h.repeat(40)}${border.tr}\n` +
        `${border.v}  ${finalPhrase.animal} ✅ MISSION COMPLETE ✅ ${finalPhrase.animal}  ${border.v}\n` +
        `${border.v}  ${border.h.repeat(38)}  ${border.v}\n` +
        `${border.v}  ${finalPhrase.animal} ${finalPhrase.main} ${finalPhrase.animal}\n` +
        `${border.v}  ${finalPhrase.desc} ${finalPhrase.math}\n` +
        `${border.v}  \n` +
        `${border.v}  ${DECOR.SQUARE} Standard: ${finalBar}\n` +
        `${border.v}  ${DECOR.VOLUME_INTEGRAL} Hacker: ${finalHacker}\n` +
        `${border.v}  \n` +
        `${border.v}  ${DECOR.BULLET} Rank: ${styledRank}\n` +
        `${border.v}  ${DECOR.BULLET} Final Score: ${successCount}/${count}\n` +
        `${border.v}  ${DECOR.BULLET} Failed: ${failCount}\n` +
        `${border.v}  ${DECOR.BULLET} Accuracy: ${Math.round((successCount / count) * 100)}%\n` +
        `${border.v}  ${DECOR.BULLET} Scanner: [${finalScanner}]\n` +
        `${border.v}  \n` +
        `${border.v}  ${DECOR.HEART} ${DECOR.INFINITY} TARGET ELIMINATED ${DECOR.INFINITY} ${DECOR.HEART}\n` +
        `${border.bl}${border.h.repeat(40)}${border.br}\n` +
        `${border.decor.repeat(3)} SNIPER LOGOUT ${border.decor.repeat(3)}`;

    await conn.sendMessage(m.chat, {
        text: finalProgress,
        edit: progressKey
    });

    // Send final report
    const finalBox = 
        `╔════════════════════════════╗
║  ${rank.icon} SNIPER REPORT ${rank.icon}  ║
╠════════════════════════════╣
║  ${DECOR.BULLET} Target: ${targetNumber}
║  ${DECOR.BULLET} Rank: ${styledRank}
║  ${DECOR.BULLET} Shots Fired: ${count}
║  ${DECOR.BULLET} Hits: ${successCount}
║  ${DECOR.BULLET} Misses: ${failCount}
║  ${DECOR.BULLET} Accuracy: ${Math.round((successCount / count) * 100)}%
║  
║  ${DECOR.HEART} ${DECOR.INFINITY} GG WP ${DECOR.INFINITY} ${DECOR.HEART}
╚════════════════════════════╝`;

    await conn.sendMessage(m.chat, { text: finalBox }, { quoted: m });
};

handler.help = ['spam'];
handler.tags = ['tools'];
handler.command = /^(spam|blast|attack|snipe)$/i;
handler.limit = 15;
handler.premium = true;
handler.owner = false;

export default handler;