import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';

export default {
  data: new ModalBuilder()
    .setCustomId('staff-form')
    .setTitle('Formulário de Staff - Cacau Bot')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('nickname')
          .setLabel('Nickname no Minecraft')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Digite seu nickname no Minecraft')
          .setRequired(true)
          .setMaxLength(16)
          .setMinLength(3),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel('Nome Real')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Digite seu nome real')
          .setRequired(true)
          .setMaxLength(50)
          .setMinLength(2),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('age')
          .setLabel('Idade')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Digite sua idade (mínimo 15 anos)')
          .setRequired(true)
          .setMaxLength(2)
          .setMinLength(2),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('hour')
          .setLabel('Horários de Disponibilidade')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: 14h às 22h (Seg-Sex)')
          .setRequired(true)
          .setMaxLength(100)
          .setMinLength(10),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('experience')
          .setLabel('Experiência e Motivação')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(
            'Descreva sua experiência, motivação e disponibilidade',
          )
          .setRequired(true)
          .setMaxLength(1000)
          .setMinLength(50),
      ),
    ),
};
