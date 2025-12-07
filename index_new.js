require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const Logger = require('./utils/logger');
const { setupRoleSelection, availableRoles } = require('./systems/rolesSystemPaginated');
const { setupRules } = require('./systems/rulesSystem');
const { sendWelcomeMessage } = require('./systems/welcomeSystem');
const { handleButtons } = require('./handlers/buttonHandler');

// إنشاء البوت
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// عند استعداد البوت
client.once('ready', async () => {
    Logger.bot(`${client.user.tag} جاهز للعمل!`);
    Logger.info(`متصل بـ ${client.guilds.cache.size} سيرفر`);

    // تعيين حالة البوت
    client.user.setPresence({
        activities: [{ name: 'اختر رتبك! 🎭', type: 3 }],
        status: 'online'
    });

    // الحصول على السيرفر الأول
    const guild = client.guilds.cache.first();
    if (!guild) {
        Logger.error('البوت غير متصل بأي سيرفر!');
        return;
    }

    Logger.success(`متصل بسيرفر: ${guild.name}`);
    Logger.info(`عدد الأعضاء: ${guild.memberCount}`);

    // إنشاء الرتب تلقائياً
    Logger.system('جاري فحص وإنشاء الرتب المفقودة...');
    let createdRoles = 0;
    
    for (const [key, roleData] of Object.entries(availableRoles)) {
        const existingRole = guild.roles.cache.find(r => r.name === roleData.name);
        if (!existingRole) {
            try {
                await guild.roles.create({
                    name: roleData.name,
                    color: roleData.color,
                    reason: 'إنشاء تلقائي بواسطة البوت',
                    permissions: [],
                    mentionable: false
                });
                createdRoles++;
                Logger.success(`تم إنشاء رتبة: ${roleData.name}`);
            } catch (error) {
                Logger.error(`فشل إنشاء ${roleData.name}: ${error.message}`);
            }
        }
    }
    
    if (createdRoles > 0) {
        Logger.success(`تم إنشاء ${createdRoles} رتبة جديدة!`);
    } else {
        Logger.info('جميع الرتب موجودة مسبقاً');
    }

    // إعداد القنوات
    const rulesChannelId = process.env.RULES_CHANNEL_ID;
    const rolesChannelId = process.env.ROLES_CHANNEL_ID;

    const rulesChannel = guild.channels.cache.get(rulesChannelId);
    const rolesChannel = guild.channels.cache.get(rolesChannelId);

    // إعداد قناة القوانين
    if (rulesChannel) {
        Logger.system(`جاري إعداد نظام القوانين في #${rulesChannel.name}...`);
        await setupRules(rulesChannel);
    } else {
        Logger.warning(`لم يتم العثور على قناة القوانين (${rulesChannelId})`);
    }

    // إعداد قناة الرتب
    if (rolesChannel) {
        Logger.system(`جاري إعداد نظام الرتب في #${rolesChannel.name}...`);
        await setupRoleSelection(rolesChannel);
    } else {
        Logger.warning(`لم يتم العثور على قناة الرتب (${rolesChannelId})`);
        Logger.warning('يرجى التحقق من ملف .env');
    }

    Logger.success('تم إعداد جميع الأنظمة بنجاح!');
});

// الترحيب بالأعضاء الجدد
client.on(Events.GuildMemberAdd, async (member) => {
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    
    if (welcomeChannel) {
        await sendWelcomeMessage(member, welcomeChannel);
    }
});

// معالج الأزرار
handleButtons(client);

// معالج الأخطاء
client.on('error', error => {
    Logger.error(`خطأ في البوت: ${error.message}`);
});

process.on('unhandledRejection', error => {
    Logger.error(`خطأ غير معالج: ${error.message}`);
});

// تسجيل الدخول
const token = process.env.DISCORD_TOKEN;
if (!token) {
    Logger.error('⚠️ لم يتم العثور على DISCORD_TOKEN في ملف .env');
    Logger.warning('يرجى إضافة توكن البوت في ملف .env');
    process.exit(1);
}

client.login(token)
    .then(() => Logger.success('تم تسجيل الدخول بنجاح!'))
    .catch(error => {
        Logger.error(`فشل تسجيل الدخول: ${error.message}`);
        Logger.warning('تأكد من صحة التوكن في ملف .env');
        process.exit(1);
    });
