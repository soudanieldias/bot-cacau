import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';

export default {
  data: new ModalBuilder()
    .setCustomId('youtuber-form')
    .setTitle('Formulário de YouTuber - Cacau Bot')
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
          .setCustomId('youtubeUrl')
          .setLabel('Link do Canal (YouTube/TikTok/Twitch)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            'https://youtube.com/@skytyelmc ou https://twitch.tv/skytyelmc',
          )
          .setRequired(true)
          .setMaxLength(200)
          .setMinLength(10),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('videoUrl')
          .setLabel('Link do Vídeo de Divulgação')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            'https://youtube.com/watch?v=... ou https://tiktok.com/@...',
          )
          .setRequired(true)
          .setMaxLength(200)
          .setMinLength(10),
      ),
    ),
};
