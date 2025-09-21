import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Mostra o avatar do usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('O usuário cujo avatar você quer ver')
        .setRequired(false),
    ),
  categories: ['features'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    try {
      const user = interaction.options.getUser('user') || interaction.user;

      const avatarUrl = user.displayAvatarURL({ size: 512 });

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${user.username}'s Avatar`)
        .setImage(avatarUrl);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  },
});
