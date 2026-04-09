// config.js
// إعدادات البوت الذكي

// رقم الهاتف الذي سيعمل عليه البوت (بدون +)
// مثال: 212656551615
global.botnumber = '212624052666';

// مسار حفظ الجلسة
global.authFile = 'SazikiSession';

// إعدادات الذكاء الاصطناعي (اختياري)
global.aiConfig = {
    enabled: true,           // تفعيل الذكاء الاصطناعي
    cooldown: 3000,         // 3 ثواني بين كل رسالة
    maxTokens: 1000,        // الحد الأقصى لطول الرد
    temperature: 0.7,       // درجة الإبداع (0-1)
    thinking: true          // تفعيل وضع التفكير
};

console.log('✅ Config loaded');
console.log(`📱 Bot will use number: ${global.botnumber}`);
