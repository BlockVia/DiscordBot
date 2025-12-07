const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

class EmbedTemplates {
    // Embed بسيط للنجاح
    static success(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(`${config.emojis.success} ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    // Embed بسيط للخطأ
    static error(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle(`${config.emojis.error} ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    // Embed للمعلومات
    static info(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(`${config.emojis.info} ${title}`)
            .setDescription(description)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    }

    // Embed مخصص
    static custom(options) {
        const embed = new EmbedBuilder();

        if (options.color) embed.setColor(options.color);
        if (options.title) embed.setTitle(options.title);
        if (options.description) embed.setDescription(options.description);
        if (options.fields) embed.addFields(options.fields);
        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.footer) embed.setFooter(options.footer);
        if (options.timestamp) embed.setTimestamp();

        return embed;
    }

    // Embed لإضافة رتبة (مختصر)
    static roleAdded(roleName, roleEmoji, roleColor) {
        return new EmbedBuilder()
            .setColor(roleColor)
            .setTitle('✅ تمت الإضافة')
            .setDescription(`تم إضافة رتبة **${roleEmoji} ${roleName}** لحسابك!`)
            .setTimestamp();
    }

    // Embed لإزالة رتبة (مختصر)
    static roleRemoved(roleName, roleEmoji) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle('🗑️ تمت الإزالة')
            .setDescription(`تم إزالة رتبة **${roleEmoji} ${roleName}** من حسابك.`)
            .setTimestamp();
    }
}

module.exports = EmbedTemplates;
