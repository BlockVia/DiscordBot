const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
const Logger = require('../utils/logger');

// تعريف الرتب المتاحة
const availableRoles = {
    // رتب الاهتمامات
    gamer: { name: '🎮 عاشق الألعاب', description: 'لمحبي الألعاب', emoji: '🎮', color: '#5865F2', category: 'interests' },
    music: { name: '🎵 محب الموسيقى', description: 'لمحبي الموسيقى', emoji: '🎵', color: '#1ABC9C', category: 'interests' },
    anime: { name: '🍥 محب الأنمي', description: 'لمحبي الأنمي', emoji: '🍥', color: '#E91E63', category: 'interests' },
    movies: { name: '🎬 محب الأفلام', description: 'لمحبي الأفلام', emoji: '🎬', color: '#9C27B0', category: 'interests' },
    art: { name: '🎨 فنان مبدع', description: 'لمحبي الفنون', emoji: '🎨', color: '#FF9800', category: 'interests' },
    tech: { name: '💻 تقني', description: 'لمحبي التكنولوجيا', emoji: '💻', color: '#3498DB', category: 'interests' },
    sports: { name: '⚽ رياضي', description: 'لمحبي الرياضة', emoji: '⚽', color: '#2ECC71', category: 'interests' },
    reader: { name: '📚 قارئ', description: 'لمحبي القراءة', emoji: '📚', color: '#795548', category: 'interests' },
    
    // رتب المناطق الزمنية
    timezone1: { name: '🌅 الشرق الأوسط', description: 'السعودية، الإمارات، مصر', emoji: '🌅', color: '#FFD700', category: 'timezone' },
    timezone2: { name: '🌍 أوروبا', description: 'توقيت أوروبا', emoji: '🌍', color: '#4A90E2', category: 'timezone' },
    timezone3: { name: '🌏 آسيا', description: 'توقيت آسيا', emoji: '🌏', color: '#FF6B6B', category: 'timezone' },
    timezone4: { name: '🌎 الأمريكيتان', description: 'توقيت أمريكا', emoji: '🌎', color: '#A78BFA', category: 'timezone' }
};

// الصفحات
const pages = {
    main: {
        title: '🎭 نظام الرتب التفاعلي',
        description: '**مرحباً! اختر فئة الرتب:**\n\n' +
                    '🎯 **رتب الاهتمامات** - اختر حسب هواياتك\n' +
                    '🌍 **رتب المناطق** - حسب منطقتك الزمنية\n\n' +
                    '💡 اضغط على الزر للانتقال للصفحة',
        color: '#7C3AED',
        buttons: [
            { id: 'goto_interests', label: 'رتب الاهتمامات', style: ButtonStyle.Primary, emoji: '🎯' },
            { id: 'goto_timezone', label: 'رتب المناطق', style: ButtonStyle.Secondary, emoji: '🌍' },
            { id: 'show_my_roles', label: 'عرض رتبي', style: ButtonStyle.Success, emoji: '👤' }
        ]
    },
    interests: {
        title: '🎯 رتب الاهتمامات',
        description: '**اختر الرتب التي تعبر عن اهتماماتك:**\n\n' +
                    'اضغط على أي زر لإضافة/إزالة الرتبة',
        color: '#5865F2',
        roles: ['gamer', 'music', 'anime', 'movies', 'art', 'tech', 'sports', 'reader'],
        buttons: [
            { id: 'back_main', label: 'العودة', style: ButtonStyle.Secondary, emoji: '◀️' },
            { id: 'remove_all_roles', label: 'إزالة الكل', style: ButtonStyle.Danger, emoji: '🗑️' }
        ]
    },
    timezone: {
        title: '🌍 رتب المناطق الزمنية',
        description: '**اختر منطقتك الزمنية:**\n\n' +
                    'للتواصل مع الأعضاء القريبين منك',
        color: '#4A90E2',
        roles: ['timezone1', 'timezone2', 'timezone3', 'timezone4'],
        buttons: [
            { id: 'back_main', label: 'العودة', style: ButtonStyle.Secondary, emoji: '◀️' },
            { id: 'remove_all_roles', label: 'إزالة الكل', style: ButtonStyle.Danger, emoji: '🗑️' }
        ]
    }
};

// إنشاء بانر
function createRolesBanner() {
    const canvas = createCanvas(800, 200);
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 800, 200);
    gradient.addColorStop(0, '#7C3AED');
    gradient.addColorStop(1, '#6D28D9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 200);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 800, Math.random() * 200, Math.random() * 15 + 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('🎭 اختر رتبك', 400, 110);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('نظام الصفحات التفاعلي', 400, 150);
    
    return canvas.toBuffer();
}

// بناء صفحة
function buildPage(pageKey) {
    const page = pages[pageKey];
    const embed = new EmbedBuilder()
        .setColor(page.color)
        .setTitle(page.title)
        .setDescription(page.description)
        .setFooter({ text: 'استخدم الأزرار للتنقل' })
        .setTimestamp();

    const components = [];

    // أزرار الرتب
    if (page.roles) {
        const roleButtons = page.roles.map(roleKey => {
            const role = availableRoles[roleKey];
            return new ButtonBuilder()
                .setCustomId(`role_${roleKey}`)
                .setLabel(role.name.replace(role.emoji + ' ', ''))
                .setStyle(ButtonStyle.Primary)
                .setEmoji(role.emoji);
        });

        // تقسيم الأزرار إلى صفوف (4 أزرار لكل صف)
        for (let i = 0; i < roleButtons.length; i += 4) {
            const row = new ActionRowBuilder().addComponents(roleButtons.slice(i, i + 4));
            components.push(row);
        }
    }

    // أزرار التنقل
    if (page.buttons) {
        const navButtons = page.buttons.map(btn => {
            return new ButtonBuilder()
                .setCustomId(btn.id)
                .setLabel(btn.label)
                .setStyle(btn.style)
                .setEmoji(btn.emoji);
        });
        const navRow = new ActionRowBuilder().addComponents(navButtons);
        components.push(navRow);
    }

    return { embed, components };
}

// إعداد نظام الرتب
async function setupRoleSelection(channel) {
    try {
        const messages = await channel.messages.fetch({ limit: 50 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }

        const buffer = createRolesBanner();
        const attachment = new AttachmentBuilder(buffer, { name: 'roles_banner.png' });

        const mainPage = buildPage('main');
        mainPage.embed.setImage('attachment://roles_banner.png');

        await channel.send({
            files: [attachment],
            embeds: [mainPage.embed],
            components: mainPage.components
        });

        Logger.success(`تم إنشاء نظام الرتب في: #${channel.name}`);
    } catch (error) {
        Logger.error(`خطأ في إنشاء نظام الرتب: ${error.message}`);
    }
}

// معالجة التنقل بين الصفحات
async function handleNavigation(interaction, pageKey) {
    try {
        const page = buildPage(pageKey);
        
        await interaction.update({
            embeds: [page.embed],
            components: page.components
        });
    } catch (error) {
        Logger.error(`خطأ في التنقل: ${error.message}`);
    }
}

module.exports = {
    setupRoleSelection,
    handleNavigation,
    availableRoles,
    pages
};
