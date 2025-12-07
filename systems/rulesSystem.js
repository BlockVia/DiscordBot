const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
const Logger = require('../utils/logger');

// ID رتبة الـ Member التي تُعطى عند الموافقة على القوانين
const MEMBER_ROLE_ID = '1447238055600591006';

// جميع القوانين في قائمة واحدة
const allRules = [
    {
        number: 1,
        emoji: '1️⃣',
        title: 'الاحترام أولًا',
        description: 'يُمنع الإساءة على أي عضو.\nالتعامل يكون باحترام مهما كانت الاختلافات.'
    },
    {
        number: 2,
        emoji: '2️⃣',
        title: 'ممنوع السبام',
        description: 'تجنب تكرار الرسائل أو الإعلانات بدون إذن.\nيُمنع إزعاج الأعضاء بالمنشن المتكرر.'
    },
    {
        number: 3,
        emoji: '3️⃣',
        title: 'عدم نشر المحتوى المخالف',
        description: 'يمنع نشر محتوى مسيء، عنصري، غير لائق، أو يخالف قوانين ديسكورد العامة.\nيمنع مشاركة روابط مشبوهة أو ضارة.'
    },
    {
        number: 4,
        emoji: '4️⃣',
        title: 'القنوات لها استخدام محدد',
        description: 'التزم بموضوع كل قناة.\nلا تستخدم قنوات الكتابة للنقاشات الصوتية والعكس.'
    },
    {
        number: 5,
        emoji: '5️⃣',
        title: 'الخصوصية مهمّة',
        description: 'يُمنع مشاركة معلومات شخصية لك أو للآخرين.\nلا تُصور أو تسجّل المكالمات بدون إذن.'
    },
    {
        number: 6,
        emoji: '6️⃣',
        title: 'الطاقم الإداري',
        description: 'قرارات الإدارة نهائية.\nأي اعتراض يكون بأسلوب محترم ومن خلال القنوات المخصّصة.'
    },
    {
        number: 7,
        emoji: '7️⃣',
        title: 'يمنع الترويج',
        description: 'لا يُسمح بالترويج لسيرفرات أو حسابات أو خدمات إلا بإذن الإدارة.'
    },
    {
        number: 8,
        emoji: '8️⃣',
        title: 'الاستخدام العادل للبوتات',
        description: 'استخدم البوتات بشكل منطقي دون تخريب أو إساءة.'
    },
    {
        number: 9,
        emoji: '9️⃣',
        title: 'الحفاظ على جو السيرفر',
        description: 'الهدف من السيرفر هو المتعة والتفاعل؛ حافظ على جو إيجابي.\nالخلافات الشخصية تُحلّ خارج السيرفر.'
    },
    {
        number: 10,
        emoji: '🔟',
        title: 'منع إدخال المشكلات الشخصية',
        description: 'يُمنع منعًا باتًا إدخال المشكلات الشخصية أو العاطفية داخل السيرفر، وأي مخالفة لهذا البند قد تؤدي إلى باند مباشر. الرجاء الحفاظ على بيئة السيرفر مريحة للجميع.'
    }
];

// إنشاء بانر القوانين
function createRulesBanner() {
    const canvas = createCanvas(800, 200);
    const ctx = canvas.getContext('2d');
    
    // خلفية
    const gradient = ctx.createLinearGradient(0, 0, 800, 200);
    gradient.addColorStop(0, '#E74C3C');
    gradient.addColorStop(1, '#C0392B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 200);
    
    // ديكور
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 800, Math.random() * 200, Math.random() * 15 + 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // النص
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('📜 قوانين السيرفر', 400, 110);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('الالتزام بها يجعل المجتمع أفضل', 400, 150);
    
    return canvas.toBuffer();
}


// إعداد نظام القوانين
async function setupRules(channel) {
    try {
        const messages = await channel.messages.fetch({ limit: 50 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        const buffer = createRulesBanner();
        const attachment = new AttachmentBuilder(buffer, { name: 'rules_banner.png' });
        
        // Embed واحد مع جميع القوانين
        const rulesEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('📜 قوانين السيرفر')
            .setDescription('⚠️ **الالتزام بها يجعل المجتمع أفضل**')
            .setImage('attachment://rules_banner.png');
        
        // إضافة جميع القوانين
        allRules.forEach(rule => {
            rulesEmbed.addFields({
                name: `${rule.emoji} **${rule.number}. ${rule.title}**`,
                value: rule.description,
                inline: false
            });
        });
        
        rulesEmbed.setFooter({ text: 'اضغط على "أوافق" للتأكيد' })
                  .setTimestamp();
        
        const acceptButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rules_accept')
                .setLabel('أوافق على القوانين')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
        );
        
        await channel.send({
            files: [attachment],
            embeds: [rulesEmbed],
            components: [acceptButton]
        });
        
        Logger.success(`تم إنشاء نظام القوانين في: #${channel.name}`);
    } catch (error) {
        Logger.error(`خطأ في إنشاء نظام القوانين: ${error.message}`);
    }
}

// معالجة الموافقة
async function handleRulesAccept(interaction) {
    try {
        const member = interaction.member;
        const guild = interaction.guild;

        // محاولة جلب رتبة الـ Member
        const memberRole = guild.roles.cache.get(MEMBER_ROLE_ID);

        if (!memberRole) {
            Logger.warning(`لم يتم العثور على رتبة Member بالـ ID: ${MEMBER_ROLE_ID}`);
        } else {
            try {
                // إعطاء الرتبة للعضو إذا لم تكن عنده
                if (!member.roles.cache.has(MEMBER_ROLE_ID)) {
                    await member.roles.add(memberRole, 'موافقة على قوانين السيرفر');
                    Logger.success(`تم إعطاء رتبة Member لـ ${member.user.tag}`);
                }
            } catch (roleError) {
                Logger.error(`تعذر إعطاء رتبة Member لـ ${member.user.tag}: ${roleError.message}`);
            }
        }

        // تحديث الزر ليصبح verified
        const verifiedButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rules_verified')
                .setLabel('✅ موافق')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
        
        await interaction.update({
            components: [verifiedButton]
        });
        
        // رسالة خاصة للمستخدم
        const acceptEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('✅ شكراً لموافقتك!')
            .setDescription(
                `**مرحباً ${interaction.user.username}!**\n\n` +
                'تم تسجيل موافقتك على القوانين ✅\n' +
                'تم إعطاؤك رتبة Member في السيرفر (إن كانت متوفرة)\n' +
                'يمكنك الآن الاستمتاع بجميع ميزات السيرفر!'
            )
            .setTimestamp();
        
        await interaction.followUp({
            embeds: [acceptEmbed],
            ephemeral: true
        });
        
        Logger.success(`${interaction.user.tag} وافق على القوانين`);
    } catch (error) {
        Logger.error(`خطأ في معالجة الموافقة: ${error.message}`);
    }
}

module.exports = {
    setupRules,
    handleRulesAccept
};
