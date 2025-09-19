import { CommandData } from "../../types";

import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits
} from 'discord.js';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Mostra o perfil do usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('O usuário cujo perfil você quer ver')
        .setRequired(false)
    ),
  categories: ['features'],
  
    async execute(
      client: Client<true>,
      interaction: ChatInputCommandInteraction
    ): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 512 });

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Perfil de ${user.username}`)
      .setThumbnail(avatarUrl)
      .addFields(
        { name: 'Nome do Usuário: ', value: `${user.username}` },
        { name: 'Menção do usuário: ', value: `<@!${user.id}>` },
        {
          name: 'Location: ',
          value: `${interaction.guild?.preferredLocale}`,
          inline: true,
        },
        {
          name: 'Created',
          value: `${interaction.guild?.createdAt.toLocaleString()}`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({
        text: `${client.user.username}`,
        iconURL: `${client.user.avatarURL()}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
});
