import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

interface EmbedData {
  title?: string;
  description?: string;
  color?: number;
  thumbnail?: string;
  image?: string;
  footer?: string;
  author?: string;
  authorIcon?: string;
  sessionId?: string;
  fields: Array<{ name: string; value: string; inline?: boolean }>;
}

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('createembed')
    .setDescription('Criar embed personalizável de forma interativa [STAFF]')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  categories: ['staff'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    try {
      if (!interaction.isRepliable()) return;

      const hasAdminRole = interaction.memberPermissions?.has([
        PermissionFlagsBits.Administrator,
      ]);

      if (!hasAdminRole) {
        return interaction.reply({
          content: '❌ Erro: Não Autorizado!',
          flags: MessageFlags.Ephemeral,
        });
      }

      const embedData: EmbedData = {
        fields: [],
      };

      const embed = new EmbedBuilder()
        .setTitle('🎨 Editor de Embed')
        .setDescription('Use os botões abaixo para personalizar seu embed!')
        .setColor(0x5865f2)
        .setTimestamp()
        .setFooter({ text: 'Clique nos botões para editar' });

      const editButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('edit-title')
          .setLabel('📝 Título')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('edit-description')
          .setLabel('📄 Descrição')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('edit-color')
          .setLabel('🎨 Cor')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('edit-thumbnail')
          .setLabel('🖼️ Thumbnail')
          .setStyle(ButtonStyle.Secondary),
      );

      const editButtons2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('edit-image')
          .setLabel('🖼️ Imagem')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('edit-footer')
          .setLabel('📌 Rodapé')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('edit-author')
          .setLabel('👤 Autor')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('edit-fields')
          .setLabel('📋 Campos')
          .setStyle(ButtonStyle.Secondary),
      );

      const actionButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('preview-embed')
          .setLabel('👁️ Preview')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('send-embed')
          .setLabel('📤 Enviar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('reset-embed')
          .setLabel('🔄 Resetar')
          .setStyle(ButtonStyle.Danger),
      );

      if (!client.embedSessions) {
        client.embedSessions = new Map();
      }

      const sessionId = `embed_${interaction.user.id}_${Date.now()}`;

      embedData.sessionId = sessionId;
      client.embedSessions.set(sessionId, embedData);

      embed.setFooter({ text: `Sessão: ${sessionId}` });

      await interaction.reply({
        embeds: [embed],
        components: [editButtons, editButtons2, actionButtons],
        flags: MessageFlags.Ephemeral,
      });

      client.loggerModule.info(
        'CreateEmbedCommand',
        `Sessão de criação de embed iniciada por ${interaction.user.tag} em ${interaction.guild!.name}`,
      );
    } catch (error) {
      client.loggerModule.error(
        'CreateEmbedCommand',
        `Erro ao criar sessão de embed: ${error}`,
      );

      await interaction.reply({
        content: '❌ Erro ao criar sessão de embed. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
