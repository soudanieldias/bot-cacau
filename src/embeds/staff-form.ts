import {
  EmbedBuilder,
  Guild,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';

export const staffFormEmbed = (guild: Guild) => {
  const embed = new EmbedBuilder()
    .setColor('#DAA520')
    .setAuthor({
      name: guild.name,
      ...(guild.iconURL() ? { iconURL: guild.iconURL()! } : {}),
    })
    .setThumbnail(guild.iconURL() || null)
    .setTitle('FORMULÁRIO STAFF - CACAU BOT')
    .setDescription(
      'Para se juntar a equipe staff do servidor, você precisa preencher o `formulário`.\n\n' +
        '**Requisitos:**\n' +
        '• Ter pelo menos 15 anos\n' +
        '• Ser ativo no servidor\n' +
        '• Ter conhecimento sobre Minecraft\n' +
        '• Ter disponibilidade de horário\n' +
        '• Ter experiência com moderação',
    )
    .setFooter({ text: 'Formulário de Staff' })
    .setTimestamp();

  const staffButton = new ButtonBuilder()
    .setCustomId('staff-form')
    .setLabel('Abrir Formulário de Staff')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('📝');

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(staffButton),
    ],
  };
};
