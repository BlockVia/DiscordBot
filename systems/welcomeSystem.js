const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const Logger = require('../utils/logger');

// إنشاء بطاقة ترحيب
async function createWelcomeCard(member) {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');
    
    // خلفية متدرجة
    const gradient = ctx.createLinearGradient(0, 0, 800, 300);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 300);
    
    // ديكور
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 800, Math.random() * 300, Math.random() * 20 + 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // صورة العضو (دائرة)
    try {
        const avatar = await loadImage(
            member.user.displayAvatarURL({ extension: 'jpg', size: 256 })
        );
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 70, 70, 160, 160);
        ctx.restore();
        
        // إطار الصورة
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(150, 150, 80, 0, Math.PI * 2);
        ctx.stroke();
    } catch (error) {
        Logger.error(`خطأ في تحميل صورة العضو: ${error.message}`);
    }
    
    // النصوص
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('🎉 مرحباً بك!', 280, 100);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#FBBF24';
    const username = member.user.username;
    const displayName = username.length > 20 ? username.substring(0, 20) + '...' : username;
    ctx.fillText(displayName, 280, 150);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#E0E0E0';
    ctx.fillText(`أنت العضو رقم #${member.guild.memberCount}`, 280, 190);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('نتمنى لك تجربة ممتعة! 🎊', 280, 230);
    
    return canvas.toBuffer();
}

// إرسال رسالة ترحيب
async function sendWelcomeMessage(member, channel) {
    try {
        // إنشاء بطاقة الترحيب
        const cardBuffer = await createWelcomeCard(member);
        const attachment = new AttachmentBuilder(cardBuffer, { name: 'welcome.png' });
        
        // Embed الترحيب
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#667eea')
            .setTitle(`🎉 مرحباً ${member.user.username}!`)
            .setDescription(
                `**أهلاً وسهلاً بك في ${member.guild.name}!**\n\n` +
                `👋 نحن سعداء بانضمامك إلينا\n` +
                `📝 لا تنسَ قراءة القوانين\n` +
                `🎭 اختر رتبك المفضلة\n` +
                `💬 ابدأ بالتعارف في القنوات\n\n` +
                `**أنت العضو رقم:** \`#${member.guild.memberCount}\``
            )
            .setImage('attachment://welcome.png')
            .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
            .setFooter({ 
                text: `انضم في ${new Date().toLocaleDateString('ar-SA')}` 
            })
            .setTimestamp();
        
        await channel.send({
            content: `${member}`,
            files: [attachment],
            embeds: [welcomeEmbed]
        });
        
        Logger.success(`تم إرسال رسالة ترحيب لـ ${member.user.tag}`);
    } catch (error) {
        Logger.error(`خطأ في إرسال رسالة الترحيب: ${error.message}`);
    }
}

// لا حاجة لرسالة ثابتة - فقط رسائل ترحيب عند دخول عضو

module.exports = {
    sendWelcomeMessage
};
