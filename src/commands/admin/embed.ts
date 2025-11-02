import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Sistema de Embeds [STAFF]')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('sendembed')
        .setDescription('Envia um embed específico no canal atual')
        .addStringOption(option =>
          option
            .setName('embed')
            .setDescription('Nome do embed para enviar')
            .setRequired(true)
            .addChoices(
              { name: 'Staff Form', value: 'staff-form' },
              { name: 'Youtuber Form', value: 'youtuber-form' },
            ),
        ),
    ),
  categories: ['staff'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    try {
      if (!(await client.interactionModule.checkifUserIsDeveloper(interaction)))
        return;

      if (!interaction.isRepliable()) return;

      const embedName = interaction.options.getString('embed', true);

      if (interaction.channel && !interaction.channel.isDMBased()) {
        await client.embedModule.sendEmbed(
          embedName,
          interaction.channel as any,
        );
      }

      await interaction.reply({
        content: `✅ Embed "${embedName}" enviado com sucesso!`,
        flags: MessageFlags.Ephemeral,
      });

      client.loggerModule.info(
        'EmbedCommand',
        `Embed ${embedName} enviado por ${interaction.user.tag} em ${interaction.guild!.name}`,
      );
    } catch (error) {
      client.loggerModule.error(
        'EmbedCommand',
        `Erro ao enviar embed: ${error}`,
      );

      await interaction.reply({
        content: '❌ Erro ao enviar embed. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
