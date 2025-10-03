import {
  EmbedBuilder,
  Guild,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';

export const youTuberFormEmbed = (guild: Guild) => {
  const embed = new EmbedBuilder()
    .setColor('#DAA520')
    .setAuthor({
      name: guild.name,
      ...(guild.iconURL() ? { iconURL: guild.iconURL()! } : {}),
    })
    .setThumbnail(guild.iconURL() || null)
    .setTitle('INFLUENCER - CACAU BOT')
    .setDescription(
      'Receba benefícios exclusivos por postar vídeos do servidor no YouTube, TikTok ou abrir live na Twitch!\n\n' +
        '**Requisitos:**\n' +
        '• Ter um canal no YouTube, TikTok ou Twitch\n' +
        '• Ter pelo menos 100 inscritos/seguidores\n' +
        '• Fazer conteúdo relacionado ao servidor\n' +
        '• Ser ativo no servidor\n' +
        '• Manter constância de divulgação semanal\n\n' +
        '*Lembre-se que para manter o cargo é necessário que você mantenha constância de divulgação semanal e que a liberação do cargo depende da qualidade do vídeo postado!*',
    )
    .setFooter({ text: 'Formulário de Influencer' })
    .setTimestamp();

  const youtuberButton = new ButtonBuilder()
    .setCustomId('youtuber-form')
    .setLabel('Abrir Formulário de Youtuber')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('📹');

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(youtuberButton),
    ],
  };
};
