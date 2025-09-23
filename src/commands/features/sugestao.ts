import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { ClientExtended } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('sugestao')
    .setDescription('Sistema de sugestões')
    .addSubcommand(subcommand =>
      subcommand
        .setName('enviar')
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
              { name: 'RankUP', value: 'rankup' },
              { name: 'Problemas', value: 'Problemas' },
              { name: 'Compras', value: 'Compras' },
              { name: 'Outros', value: 'Outros' },
            ),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('config')
        .setDescription(
          'Configure o sistema de sugestões (apenas administradores)',
        )
        .addChannelOption(option =>
          option
            .setName('canal')
            .setDescription('Canal onde as sugestões serão enviadas')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('upvote_emoji')
            .setDescription('Emoji para upvote (padrão: 🟢)')
            .setRequired(false),
        )
        .addStringOption(option =>
          option
            .setName('downvote_emoji')
            .setDescription('Emoji para downvote (padrão: 🔴)')
            .setRequired(false),
        ),
    ),

  async execute(client: ClientExtended, interaction: any) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'enviar') {
        const suggestion = interaction.options.getString('sugestao', true);
        const category = interaction.options.getString('categoria', true);

        const guildData = await client.databaseModule.getSettings(
          interaction.guildId,
        );

        if (!guildData?.suggestionsChannelId) {
          return interaction.reply({
            content:
              '❌ O sistema de sugestões ainda não foi configurado. Use `/sugerir config` para configurar.',
            flags: MessageFlags.Ephemeral,
          });
        }

        const suggestionChannel = interaction.guild.channels.cache.get(
          guildData.suggestionsChannelId,
        );

        if (!suggestionChannel) {
          return interaction.reply({
            content:
              '❌ O canal de sugestões configurado não existe mais. Use `/sugestao config` para reconfigurar.',
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
              '❌ O bot não tem permissão para enviar mensagens no canal de sugestões.',
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
      } else if (subcommand === 'config') {
        const channel = interaction.options.getChannel('canal');
        const upvoteEmoji =
          interaction.options.getString('upvote_emoji') || '🟢';
        const downvoteEmoji =
          interaction.options.getString('downvote_emoji') || '🔴';

        if (!channel || channel.type !== 0) {
          return interaction.reply({
            content: '❌ Por favor, selecione um canal de texto válido.',
            flags: MessageFlags.Ephemeral,
          });
        }

        const botMember = interaction.guild.members.cache.get(client.user?.id);
        const permissions = channel.permissionsFor(botMember);

        if (
          !permissions.has('SendMessages') ||
          !permissions.has('AddReactions')
        ) {
          return interaction.reply({
            content:
              '❌ O bot não tem permissão para enviar mensagens e reagir neste canal.',
            flags: MessageFlags.Ephemeral,
          });
        }

        await client.databaseModule.updateSettings(interaction.guildId, {
          suggestionsChannelId: channel.id,
          upvoteEmoji: upvoteEmoji,
          downvoteEmoji: downvoteEmoji,
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Configuração Salva')
          .setDescription(
            `**Canal de Sugestões:** ${channel}\n` +
              `**Emoji Upvote:** ${upvoteEmoji}\n` +
              `**Emoji Downvote:** ${downvoteEmoji}\n` +
              'O sistema de sugestões foi configurado com sucesso!',
          )
          .setColor('#00ff00')
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });

        client.loggerModule.info(
          'SugestaoModule',
          `Sistema de sugestões configurado para ${interaction.guild.name} - Canal: ${channel.name}`,
        );
      }
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
