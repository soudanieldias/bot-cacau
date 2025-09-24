import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { ClientExtended } from '../../types/index';

export default {
  data: new SlashCommandBuilder()
    .setName('sugestao')
    .setDescription('Envie uma sugestão')
    .addStringOption(option =>
      option
        .setName('sugestao')
        .setDescription('Escreva sua sugestão')
        .setRequired(true)
        .setMaxLength(1000),
    )
    .addStringOption(option =>
      option
        .setName('categoria')
        .setDescription('Categoria da sugestão')
        .setRequired(true)
        .addChoices(
          { name: 'Discord', value: 'discord' },
          { name: 'Survival', value: 'survival' },
        ),
    ),

  async execute(client: ClientExtended, interaction: any) {
    try {
      const suggestion = interaction.options.getString('sugestao', true);
      const category = interaction.options.getString('categoria', true);

      const guildData = await client.databaseModule.getSettings(
        interaction.guildId,
      );

      if (!guildData?.suggestionsChannelId) {
        return interaction.reply({
          content:
            '❌ O sistema de sugestões ainda não foi configurado. Use `/config suggest` para configurar.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const suggestionChannel = interaction.guild.channels.cache.get(
        guildData.suggestionsChannelId,
      );

      if (!suggestionChannel) {
        return interaction.reply({
          content: '❌ O canal de sugestões não está configurado.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const botMember = interaction.guild.members.cache.get(client.user?.id);
      const permissions = suggestionChannel.permissionsFor(botMember);

      if (
        !permissions.has('SendMessages') ||
        !permissions.has('AddReactions')
      ) {
        return interaction.reply({
          content:
            '❌ Bot sem permissão para enviar mensagens no canal de sugestões.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTitle(`📝 Sugestão - ${category}`)
        .setDescription(`**Enviada por ${interaction.user}:**\n${suggestion}`)
        .setFooter({
          text: `ID: ${interaction.user.id}`,
        })
        .setTimestamp();

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const message = await suggestionChannel.send({ embeds: [embed] });

      const upvoteEmoji = (guildData as any).upvoteEmoji || '🟢';
      const downvoteEmoji = (guildData as any).downvoteEmoji || '🔴';

      await message.react(upvoteEmoji);
      await message.react(downvoteEmoji);

      try {
        await message.startThread({
          name: `Sugestão de ${interaction.user.username}`,
          reason: `Discussão sobre sugestão de ${interaction.user.username}`,
        });
      } catch (error) {
        client.loggerModule.warn(
          'SugestaoModule',
          `Não foi possível criar thread para sugestão: ${error}`,
        );
      }

      const confirmEmbed = new EmbedBuilder()
        .setDescription('✅ Sua sugestão foi enviada com sucesso!')
        .setColor('#00ff00');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Ver sugestão')
          .setURL(message.url)
          .setStyle(ButtonStyle.Link),
      );

      await interaction.editReply({
        embeds: [confirmEmbed],
        components: [row],
      });

      client.loggerModule.info(
        'SugestaoModule',
        `Sugestão enviada por ${interaction.user.tag} em ${interaction.guild.name}`,
      );
    } catch (error) {
      client.loggerModule.error(
        'SugestaoModule',
        `Erro ao processar comando: ${error}`,
      );

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Erro ao processar comando. Tente novamente.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.editReply({
          content: '❌ Erro ao processar comando. Tente novamente.',
        });
      }
    }
  },
};
