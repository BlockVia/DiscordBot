const { Events, EmbedBuilder } = require('discord.js');
const { availableRoles } = require('../systems/rolesSystemPaginated');
const { handleNavigation } = require('../systems/rolesSystemPaginated');
const { handleRulesAccept } = require('../systems/rulesSystem');
const EmbedTemplates = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

// دالة إدارة الرتب
async function manageRoleAction(interaction, roleKey) {
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
            await member.roles.remove(role);
            await interaction.reply({
                embeds: [EmbedTemplates.roleRemoved(roleData.name, roleData.emoji)],
                ephemeral: true
            });
            Logger.info(`إزالة ${roleData.name} من ${member.user.tag}`);
        } else {
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

function handleButtons(client) {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isButton()) return;

        try {
            const buttonId = interaction.customId;
            
            // معالجة التنقل في الرتب
            if (buttonId === 'goto_interests') {
                await handleNavigation(interaction, 'interests');
            }
            else if (buttonId === 'goto_timezone') {
                await handleNavigation(interaction, 'timezone');
            }
            else if (buttonId === 'back_main') {
                await handleNavigation(interaction, 'main');
            }
            
            // معالجة أزرار الرتب
            else if (buttonId.startsWith('role_')) {
                const roleKey = buttonId.replace('role_', '');
                await manageRoleAction(interaction, roleKey);
            }
            
            // معالجة القوانين
            else if (buttonId === 'rules_accept') {
                await handleRulesAccept(interaction);
            }
            
            // زر عرض الرتب الحالية
            else if (buttonId === 'show_my_roles') {
                const member = interaction.member;
                const roles = member.roles.cache
                    .filter(role => !role.managed && role.id !== interaction.guild.id)
                    .map(role => role.toString())
                    .join(', ') || 'لا يوجد لديك رتب خاصة';

                const rolesEmbed = new EmbedBuilder()
                    .setColor('#3498DB')
                    .setTitle('👤 رتبك الحالية')
                    .setDescription(`**${member.user.username}**`)
                    .addFields(
                        { name: '📊 عدد الرتب', value: `${member.roles.cache.size - 1}`, inline: true },
                        { name: '🎨 اللون', value: `${member.displayHexColor}`, inline: true },
                        { name: '📋 الرتب', value: roles }
                    )
                    .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
                    .setTimestamp();

                await interaction.reply({
                    embeds: [rolesEmbed],
                    ephemeral: true
                });
            }
            
            // زر إزالة جميع الرتب
            else if (buttonId === 'remove_all_roles') {
                const member = interaction.member;
                const guild = interaction.guild;
                
                const removableRoles = member.roles.cache.filter(role => 
                    role.id !== guild.id && 
                    !role.managed &&
                    Object.values(availableRoles).some(r => r.name === role.name)
                );
                
                if (removableRoles.size === 0) {
                    return await interaction.reply({
                        embeds: [EmbedTemplates.error('لا يوجد رتب', 'لا تملك أي رتب قابلة للإزالة.')],
                        ephemeral: true
                    });
                }
                
                await member.roles.remove(removableRoles);
                
                const removedEmbed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle('🗑️ تم الإزالة')
                    .setDescription(`تمت إزالة **${removableRoles.size}** رتبة من حسابك.`)
                    .addFields(
                        { name: '📋 الرتب المزالة', value: removableRoles.map(r => r.name).join('\n') }
                    )
                    .setTimestamp();

                await interaction.reply({
                    embeds: [removedEmbed],
                    ephemeral: true
                });

                Logger.info(`تمت إزالة ${removableRoles.size} رتبة من ${member.user.tag}`);
            }

        } catch (error) {
            Logger.error(`خطأ في معالجة الزر: ${error.message}`);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    embeds: [EmbedTemplates.error('خطأ', 'حدث خطأ أثناء معالجة طلبك.')],
                    ephemeral: true
                }).catch(() => {});
            }
        }
    });
}

module.exports = { handleButtons };
