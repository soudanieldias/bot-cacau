import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { ClientExtended, CommandData } from '../../types';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lista os comandos disponíveis no BOT')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
  categories: ['help'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    if (!client.user) return;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Comandos Disponíveis:');

    client.slashCommands.forEach(cmd => {
      const commandData = cmd.data as any | CommandData;
      embed.addFields({
        name: `Name: **${commandData.name}**`,
        value: `Description: ***${commandData.description}***\n`,
      });
    });

    return await interaction.reply({ embeds: [embed] });
  },
};
