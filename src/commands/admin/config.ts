import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ChannelType,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configurações do servidor (admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName('suggestionschannel')
        .setDescription('Configurar canal de sugestões')
        .addChannelOption(opt =>
          opt
            .setName('canal')
            .setDescription('Canal onde as sugestões serão postadas')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand(sub =>
      sub
        .setName('show')
        .setDescription('Mostrar configurações atuais (suggestionsChannel)'),
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

      const sub = interaction.options.getSubcommand();

      if (sub === 'suggestionschannel') {
        const channel = interaction.options.getChannel('canal', true);

        const updateData: any = {
          suggestionsChannelId: channel.id,
        };

        await client.databaseModule.createSettings(
          interaction.guild!.id,
          updateData,
        );

        await interaction.reply({
          content: `✅ Canal de sugestões configurado para ${channel}`,
          flags: MessageFlags.Ephemeral,
        });

        client.loggerModule?.info?.(
          'ConfigCommand',
          `suggestionsChannel set to ${channel.id} by ${interaction.user.tag} in ${interaction.guild!.name}`,
        );
        return;
      }

      if (sub === 'show') {
        const guildData = await client.databaseModule.getSettings(
          interaction.guild!.id,
        );
        const suggestionsChannelId = (guildData as any)?.suggestionsChannelId;
        if (!suggestionsChannelId) {
          return interaction.reply({
            content: '❌ Canal de sugestões não configurado.',
            flags: MessageFlags.Ephemeral,
          });
        }

        const channel = interaction.guild?.channels.cache.get(
          suggestionsChannelId as string,
        );
        if (!channel) {
          return interaction.reply({
            content: `❌ Canal configurado (${suggestionsChannelId}) não encontrado no servidor.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        return interaction.reply({
          content: `Canal de sugestões: ${channel}`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      client.loggerModule?.error?.(
        'ConfigCommand',
        `Erro na configuração: ${error}`,
      );
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Erro ao configurar. Tente novamente.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.editReply({
          content: '❌ Erro ao configurar. Tente novamente.',
        });
      }
    }
  },
});
