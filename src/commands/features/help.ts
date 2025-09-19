import { EmbedBuilder } from '@discordjs/builders';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lista os comandos disponíveis no BOT')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
  categories: ['help'],

  execute: async (client, interaction) => {
    if (!client.user) return;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Comandos Disponíveis:');

    client.slashCommands.forEach(cmd => {
      embed.addFields({
        name: `Name: **${cmd.data.name}**`,
        value: `Description: ***${cmd.data.description}***\n`,
      });
    });

    return await interaction.reply({ embeds: [embed] });
  },
};
