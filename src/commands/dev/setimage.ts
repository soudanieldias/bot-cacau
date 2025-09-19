import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
} from 'discord.js';
import { CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('setimage')
    .setDescription('Mude avatar do bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(option =>
      option
        .setName('avatar')
        .setDescription('O avatar')
        .setRequired(true)
    ),
  categories: ['dev'],

  async execute (client: Client<true>, interaction: ChatInputCommandInteraction): Promise<void> {
    const isDeveloper = interaction.user.id === process.env.DEV_ID;

    if (!isDeveloper) interaction.reply('Erro: Não Autorizado!!!');

    const avatar = interaction.options.getAttachment('avatar')!;

    async function sendMessage(message) {
      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setDescription(message);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (avatar.contentType !== 'image/gif')
      return await sendMessage('Use um gif para emojis animados');

    var error;

    await client.user.setAvatar(avatar.url).catch(async err => {
      error = true;
      console.log(err);
      return await sendMessage(`Erro: '${err.toString()}'`);
    });

    if (error) return;
    await sendMessage('Enviado');
  },
});
