const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
const Logger = require('../utils/logger');
const EmbedTemplates = require('../utils/embedBuilder');

// تعريف الرتب المتاحة
const availableRoles = {
    // رتب الاهتمامات
    gamer: { name: '🎮 عاشق الألعاب', description: 'لمحبي الألعاب', emoji: '🎮', color: '#5865F2' },
    music: { name: '🎵 محب الموسيقى', description: 'لمحبي الموسيقى', emoji: '🎵', color: '#1ABC9C' },
    anime: { name: '🍥 محب الأنمي', description: 'لمحبي الأنمي', emoji: '🍥', color: '#E91E63' },
    movies: { name: '🎬 محب الأفلام', description: 'لمحبي الأفلام', emoji: '🎬', color: '#9C27B0' },
    art: { name: '🎨 فنان مبدع', description: 'لمحبي الفنون', emoji: '🎨', color: '#FF9800' },
    tech: { name: '💻 تقني', description: 'لمحبي التكنولوجيا', emoji: '💻', color: '#3498DB' },
    sports: { name: '⚽ رياضي', description: 'لمحبي الرياضة', emoji: '⚽', color: '#2ECC71' },
    reader: { name: '📚 قارئ', description: 'لمحبي القراءة', emoji: '📚', color: '#795548' },
    
    // رتب المناطق الزمنية
    timezone1: { name: '🌅 الشرق الأوسط', description: 'السعودية، الإمارات، مصر', emoji: '🌅', color: '#FFD700' },
    timezone2: { name: '🌍 أوروبا', description: 'توقيت أوروبا', emoji: '🌍', color: '#4A90E2' },
    timezone3: { name: '🌏 آسيا', description: 'توقيت آسيا', emoji: '🌏', color: '#FF6B6B' },
    timezone4: { name: '🌎 الأمريكيتان', description: 'توقيت أمريكا', emoji: '🌎', color: '#A78BFA' }
};

// إنشاء بانر الرتب
function createRolesBanner() {
    const canvas = createCanvas(800, 200);
    const ctx = canvas.getContext('2d');
    
    // خلفية متدرجة
    const gradient = ctx.createLinearGradient(0, 0, 800, 200);
    gradient.addColorStop(0, '#7C3AED');
    gradient.addColorStop(1, '#6D28D9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 200);
    
    // نقاط ديكور
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 800, Math.random() * 200, Math.random() * 15 + 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // النص
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('🎭 اختر رتبك', 400, 110);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('اضغط على الزر واحصل على الرتبة فوراً', 400, 150);
    
    return canvas.toBuffer();
}

// إعداد نظام الرتب
async function setupRoleSelection(channel) {
    try {
        // حذف الرسائل القديمة
        const messages = await channel.messages.fetch({ limit: 50 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }

        // إنشاء البانر
        const buffer = createRolesBanner();
        const attachment = new AttachmentBuilder(buffer, { name: 'roles_banner.png' });

        // Embed رئيسي مختصر
        const mainEmbed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setTitle('🎭 نظام الرتب التفاعلي')
            .setDescription(
                '**مرحباً! اختر الرتب التي تناسبك:**\n\n' +
                '• اضغط على أي زر لإضافة الرتبة\n' +
                '• اضغط مرة أخرى لإزالتها\n' +
                '• يمكنك اختيار أكثر من رتبة\n\n' +
                '**الفئات المتاحة:**\n' +
                '🎯 رتب الاهتمامات • 🌍 رتب المناطق الزمنية'
            )
            .setImage('attachment://roles_banner.png')
            .setFooter({ text: 'اختر ما يناسبك!' })
            .setTimestamp();

        // Embed رتب الاهتمامات
        const interestsEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎯 رتب الاهتمامات')
            .setDescription('اختر الرتب التي تعبر عن اهتماماتك:')
            .addFields(
                { name: '🎮 ألعاب ورياضة', value: '🎮 ألعاب • ⚽ رياضة • 🎬 أفلام • 🍥 أنمي', inline: true },
                { name: '🎨 فنون وتقنية', value: '🎵 موسيقى • 🎨 فن • 💻 تقنية • 📚 قراءة', inline: true }
            );

        // Embed رتب المناطق
        const timezoneEmbed = new EmbedBuilder()
            .setColor('#4A90E2')
            .setTitle('🌍 رتب المناطق الزمنية')
            .setDescription('اختر منطقتك الزمنية للتواصل مع الأعضاء القريبين منك:')
            .addFields(
                { name: '📍 المناطق', value: '🌅 الشرق الأوسط • 🌍 أوروبا • 🌏 آسيا • 🌎 الأمريكيتان' }
            );

        // أزرار رتب الاهتمامات
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_gamer').setLabel('عاشق الألعاب').setStyle(ButtonStyle.Primary).setEmoji('🎮'),
            new ButtonBuilder().setCustomId('role_music').setLabel('محب الموسيقى').setStyle(ButtonStyle.Primary).setEmoji('🎵'),
            new ButtonBuilder().setCustomId('role_anime').setLabel('محب الأنمي').setStyle(ButtonStyle.Primary).setEmoji('🍥'),
            new ButtonBuilder().setCustomId('role_movies').setLabel('محب الأفلام').setStyle(ButtonStyle.Primary).setEmoji('🎬')
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_art').setLabel('فنان مبدع').setStyle(ButtonStyle.Primary).setEmoji('🎨'),
            new ButtonBuilder().setCustomId('role_tech').setLabel('تقني').setStyle(ButtonStyle.Primary).setEmoji('💻'),
            new ButtonBuilder().setCustomId('role_sports').setLabel('رياضي').setStyle(ButtonStyle.Primary).setEmoji('⚽'),
            new ButtonBuilder().setCustomId('role_reader').setLabel('قارئ').setStyle(ButtonStyle.Primary).setEmoji('📚')
        );

        // أزرار المناطق الزمنية
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_timezone1').setLabel('الشرق الأوسط').setStyle(ButtonStyle.Secondary).setEmoji('🌅'),
            new ButtonBuilder().setCustomId('role_timezone2').setLabel('أوروبا').setStyle(ButtonStyle.Secondary).setEmoji('🌍'),
            new ButtonBuilder().setCustomId('role_timezone3').setLabel('آسيا').setStyle(ButtonStyle.Secondary).setEmoji('🌏'),
            new ButtonBuilder().setCustomId('role_timezone4').setLabel('الأمريكيتان').setStyle(ButtonStyle.Secondary).setEmoji('🌎')
        );

        // أزرار التحكم
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('show_my_roles').setLabel('عرض رتبي').setStyle(ButtonStyle.Success).setEmoji('👤'),
            new ButtonBuilder().setCustomId('remove_all_roles').setLabel('إزالة الكل').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );

        // إرسال الرسائل
        await channel.send({ files: [attachment], embeds: [mainEmbed] });
        await channel.send({ embeds: [interestsEmbed], components: [row1, row2] });
        await channel.send({ embeds: [timezoneEmbed], components: [row3, row4] });

        Logger.success(`تم إنشاء نظام الرتب في: #${channel.name}`);

    } catch (error) {
        Logger.error(`خطأ في إنشاء نظام الرتب: ${error.message}`);
    }
}

// إدارة الرتب
async function manageRole(interaction, roleKey) {
    try {
        const member = interaction.member;
        const roleData = availableRoles[roleKey];
        
        if (!roleData) {
            return await interaction.reply({
                embeds: [EmbedTemplates.error('رتبة غير موجودة', 'هذه الرتبة غير متاحة في النظام.')],
                ephemeral: true
            });
        }

        const guild = interaction.guild;
        let role = guild.roles.cache.find(r => r.name === roleData.name);
        
        // إنشاء الرتبة إذا لم تكن موجودة
        if (!role) {
            try {
                role = await guild.roles.create({
                    name: roleData.name,
                    color: roleData.color,
                    reason: 'نظام الرتب التلقائي',
                    permissions: [],
                    mentionable: false
                });
                Logger.success(`تم إنشاء رتبة: ${roleData.name}`);
            } catch (error) {
                Logger.error(`فشل إنشاء رتبة ${roleData.name}: ${error.message}`);
                return await interaction.reply({
                    embeds: [EmbedTemplates.error('فشل الإنشاء', `تعذر إنشاء الرتبة ${roleData.name}`)],
                    ephemeral: true
                });
            }
        }

        const hasRole = member.roles.cache.has(role.id);

        if (hasRole) {
            // إزالة الرتبة
            await member.roles.remove(role);
            await interaction.reply({
                embeds: [EmbedTemplates.roleRemoved(roleData.name, roleData.emoji)],
                ephemeral: true
            });
            Logger.info(`إزالة ${roleData.name} من ${member.user.tag}`);
        } else {
            // إضافة الرتبة
            await member.roles.add(role);
            await interaction.reply({
                embeds: [EmbedTemplates.roleAdded(roleData.name, roleData.emoji, roleData.color)],
                ephemeral: true
            });
            Logger.success(`إضافة ${roleData.name} إلى ${member.user.tag}`);
        }

    } catch (error) {
        Logger.error(`خطأ في إدارة الرتب: ${error.message}`);
        await interaction.reply({
            embeds: [EmbedTemplates.error('خطأ', 'حدث خطأ أثناء معالجة طلبك.')],
            ephemeral: true
        });
    }
}

module.exports = {
    setupRoleSelection,
    manageRole,
    availableRoles
};
