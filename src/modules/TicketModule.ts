import {
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
} from 'discord.js';
import discordTranscripts from 'discord-html-transcripts';
import { PrismaClient } from '@prisma/client';
import { ClientExtended } from '../types';

export class TicketModule {
  private prisma: PrismaClient;
  private ticketCategories: Array<{
    id: string;
    name: string;
    emoji: string;
    description: string;
    color: string;
  }> = [
    {
      id: 'financeiro',
      name: 'Financeiro',
      emoji: '💰',
      description: 'Assuntos financeiros e pagamentos',
      color: '#00ff00',
    },
    {
      id: 'ajuda',
      name: 'Ajuda',
      emoji: '❓',
      description: 'Precisa de ajuda ou suporte',
      color: '#0099ff',
    },
    {
      id: 'compra',
      name: 'Compra',
      emoji: '🛒',
      description: 'Compras e vendas',
      color: '#ff6600',
    },
    {
      id: 'reclamacao',
      name: 'Reclamação',
      emoji: '😠',
      description: 'Reclamações e problemas',
      color: '#ff0000',
    },
    {
      id: 'sugestao',
      name: 'Sugestão',
      emoji: '💡',
      description: 'Sugestões e ideias',
      color: '#ffff00',
    },
  ];

  constructor(private client: ClientExtended) {}

  private async getGuildData(guildId: string) {
    try {
      return await this.client.databaseModule.getTicketSettings(guildId);
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao obter dados da guilda: ${error}`,
      );
      return null;
    }
  }

  private buildTicketModal() {
    const modal = new ModalBuilder()
      .setCustomId('ticket-modal')
      .setTitle('Configuração do Sistema de Tickets');

    const openTitleInput = new TextInputBuilder()
      .setCustomId('opentitle')
      .setLabel('Título da Mensagem de Abertura')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Digite o título da mensagem de abertura')
      .setRequired(true);

    const openDescriptionInput = new TextInputBuilder()
      .setCustomId('opendescription')
      .setLabel('Descrição da Mensagem de Abertura')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Digite a descrição da mensagem de abertura')
      .setRequired(true);

    const ticketTitleInput = new TextInputBuilder()
      .setCustomId('tickettitle')
      .setLabel('Título do Ticket')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Digite o título do ticket')
      .setRequired(true);

    const ticketDescriptionInput = new TextInputBuilder()
      .setCustomId('ticketdescription')
      .setLabel('Descrição do Ticket')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Digite a descrição do ticket')
      .setRequired(true);

    const firstActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(openTitleInput);
    const secondActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        openDescriptionInput,
      );
    const thirdActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(ticketTitleInput);
    const fourthActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        ticketDescriptionInput,
      );

    modal.addComponents(
      firstActionRow,
      secondActionRow,
      thirdActionRow,
      fourthActionRow,
    );
    return modal;
  }

  private buildOpenedTicketEmbed(interaction: any, guildData: any) {
    return new EmbedBuilder()
      .setColor('#2f3136')
      .setAuthor({
        name: guildData.ticketTitle || 'Sistema de Tickets',
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setDescription(guildData.ticketDescription || 'Bem-vindo ao seu ticket!')
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      });
  }

  private buildTicketButtons(type: string, isClaimed: boolean = false) {
    const buttons: ButtonBuilder[] = [];

    if (type === 'opened') {
      const claimButton = new ButtonBuilder()
        .setCustomId('ticket-claim')
        .setStyle(ButtonStyle.Success)
        .setLabel('Claim Ticket')
        .setEmoji('🎯')
        .setDisabled(isClaimed);

      const closeButton = new ButtonBuilder()
        .setCustomId('ticket-close')
        .setStyle(ButtonStyle.Danger)
        .setLabel('Fechar Ticket')
        .setEmoji('🔒');

      const mentionButton = new ButtonBuilder()
        .setCustomId('ticket-mention')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Mencionar Usuário')
        .setEmoji('👤');

      buttons.push(claimButton, closeButton, mentionButton);
    } else if (type === 'reopened') {
      const closeButton = new ButtonBuilder()
        .setCustomId('ticket-close-message')
        .setStyle(ButtonStyle.Danger)
        .setLabel('Apagar Mensagem')
        .setEmoji('🗑️');

      buttons.push(closeButton);
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
  }

  private buildReopenedTicketEmbed(interaction: any, guildData: any) {
    return new EmbedBuilder()
      .setColor('#2f3136')
      .setAuthor({
        name: guildData.ticketTitle || 'Sistema de Tickets',
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setDescription('Ticket reaberto! Como posso ajudá-lo?')
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      });
  }

  async config(_client: any, interaction: any) {
    try {
      const canal = interaction.options.getChannel('canal');
      const canalLogs = interaction.options.getChannel('logs');
      const categoria = interaction.options.getChannel('categoria');
      const botaoTicket = interaction.options.getString('botao');
      const cargo = interaction.options.getRole('cargo');

      await this.client.databaseModule.upsertTicketSettings(
        interaction.guild.id,
        {
          ticketChannelId: canal.id,
          ticketButtonName: botaoTicket,
          announcesChannelId: canalLogs.id,
          modRoleId: cargo.id,
          ticketCategoryId: categoria.id,
          ticketLogsChannelId: canalLogs.id,
          ticketRoleId: cargo.id,
          ticketTitle: botaoTicket,
        },
      );

      return await interaction.showModal(this.buildTicketModal());
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro na configuração: ${error}`,
      );
    }
  }

  async ticketModal(client: any, interaction: any) {
    const openTitle = interaction.fields.getTextInputValue('opentitle');
    const openDescription =
      interaction.fields.getTextInputValue('opendescription');
    const ticketTitle = interaction.fields.getTextInputValue('tickettitle');
    const ticketDescription =
      interaction.fields.getTextInputValue('ticketdescription');

    await this.client.databaseModule.updateTicketSettings(
      interaction.guild.id,
      {
        ticketTitle: ticketTitle,
        ticketDescription: ticketDescription,
      },
    );

    const embedTicket = new EmbedBuilder()
      .setColor('#2f3136')
      .setAuthor({
        name: `${openTitle}`,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setDescription(openDescription)
      .addFields({
        name: '🎫 Categorias Disponíveis',
        value: this.ticketCategories
          .map(cat => `${cat.emoji} **${cat.name}** - ${cat.description}`)
          .join('\n'),
        inline: false,
      })
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      });

    const guildData = await this.getGuildData(interaction.guildId);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket-category-select')
      .setPlaceholder('Selecione o tipo de ticket que você precisa')
      .setMinValues(1)
      .setMaxValues(1);

    for (const category of this.ticketCategories) {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(category.name)
          .setDescription(category.description)
          .setValue(category.id)
          .setEmoji(category.emoji),
      );
    }

    const selectRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
    const channel = interaction.guild.channels.cache.get(
      guildData?.ticketChannelId,
    );

    channel.send({ embeds: [embedTicket], components: [selectRow] });

    await interaction.reply({
      content: `
      ✅ Configuração do sistema de ticket realizada com sucesso!
      \n\n🎫 **Categorias disponíveis:**
      \n${this.ticketCategories.map(cat => `${cat.emoji} ${cat.name}`).join(', ')}
      `,
      flags: MessageFlags.Ephemeral,
    });
  }

  async checkTicketConfig(client: any, interaction: any) {
    const hasAdminRole = interaction.memberPermissions?.has([
      PermissionFlagsBits.Administrator,
    ]);
    if (!hasAdminRole) return interaction.reply('Erro: Não Autorizado!!!');
    return;
  }

  async cleanupOrphanedTickets(client: any, interaction: any) {
    try {
      this.client.loggerModule.info(
        'TicketModule',
        `Iniciando limpeza de tickets órfãos para guild: ${interaction.guildId}`,
      );

      const cleanedCount =
        await this.client.databaseModule.cleanupOrphanedTickets(
          interaction.guildId,
        );

      await interaction.reply({
        content: `🧹 **Limpeza de tickets órfãos concluída!**\n\n✅ **${cleanedCount} tickets** foram marcados como fechados automaticamente.\n\n*Tickets com canais que não existem mais foram limpos.*`,
        flags: MessageFlags.Ephemeral,
      });

      this.client.loggerModule.info(
        'TicketModule',
        `Limpeza concluída: ${cleanedCount} tickets órfãos limpos`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro na limpeza de tickets órfãos: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao limpar tickets órfãos. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async claimTicket(client: any, interaction: any) {
    try {
      this.client.loggerModule.info(
        'TicketModule',
        `Fazendo claim do ticket no canal: ${interaction.channelId}`,
      );

      const ticket = await this.client.databaseModule.getTicketByChannel(
        interaction.channelId,
      );

      if (!ticket) {
        return interaction.reply({
          content: '❌ Este comando só pode ser usado em canais de ticket.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (ticket.claimedBy === interaction.user.id) {
        return interaction.reply({
          content: '❌ Você já reivindicou este ticket.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const guildData = await this.getGuildData(interaction.guildId);
      if (!guildData) {
        return interaction.reply({
          content: '❌ Configuração de tickets não encontrada.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const hasTicketRole = interaction.member.roles.cache.has(
        guildData.ticketRoleId || '',
      );
      if (!hasTicketRole) {
        return interaction.reply({
          content: `❌ Você precisa do cargo <@&${guildData.ticketRoleId}> para reivindicar tickets.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await this.client.databaseModule.claimTicket(
        ticket.id,
        interaction.user.id,
      );

      if (interaction.isButton()) {
        const updatedButtons = this.buildTicketButtons('opened', true);
        await interaction.message.edit({
          components: [updatedButtons],
        });
      }

      const iniciadoEmbed = new EmbedBuilder()
        .setTitle('Atendimento iniciado')
        .setDescription(`**Atendente:** ${interaction.user}`)
        .setColor('#2f3136')
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      await interaction.channel.send({
        embeds: [iniciadoEmbed],
      });

      await interaction.reply({
        content:
          '✅ **Ticket reivindicado com sucesso!**\n\nVocê acaba de iniciar o atendimento. Para transferir use **/ticket transferir <usuário>**',
        flags: MessageFlags.Ephemeral,
      });

      this.client.loggerModule.info(
        'TicketModule',
        `Ticket ${ticket.id} reivindicado por ${interaction.user.id}`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao fazer claim do ticket: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao reivindicar ticket. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async transferTicket(client: any, interaction: any) {
    try {
      this.client.loggerModule.info(
        'TicketModule',
        `Transferindo ticket no canal: ${interaction.channelId}`,
      );

      const ticket = await this.client.databaseModule.getTicketByChannel(
        interaction.channelId,
      );

      if (!ticket) {
        return interaction.reply({
          content: '❌ Este comando só pode ser usado em canais de ticket.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!ticket.claimedBy) {
        return interaction.reply({
          content: '❌ Este ticket ainda não foi reivindicado por ninguém.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const newAttendant = interaction.options.getUser('atendente');
      if (!newAttendant) {
        return interaction.reply({
          content: '❌ Atendente não encontrado.',
          flags: MessageFlags.Ephemeral,
        });
      }

      await this.client.databaseModule.transferTicket(
        ticket.id,
        newAttendant.id,
      );

      const transferEmbed = new EmbedBuilder()
        .setTitle('Atendimento Transferido')
        .setDescription(
          `O Atendimento foi transferido.\n\n**Informações:**\nTransferido por: ${interaction.user}\nTransferido para: ${newAttendant}`,
        )
        .setColor('#2f3136')
        .setThumbnail(newAttendant.displayAvatarURL())
        .setTimestamp();

      await interaction.channel.send({
        embeds: [transferEmbed],
      });

      await interaction.reply({
        content: `✅ **Ticket transferido com sucesso!**\n\n🎫 **Ticket:** #${ticket.ticketNumber.toString().padStart(4, '0')}\n👤 **Novo Atendente:** <@${newAttendant.id}>\n⏰ **Transferido em:** <t:${Math.floor(Date.now() / 1000)}:F>`,
        flags: MessageFlags.Ephemeral,
      });

      this.client.loggerModule.info(
        'TicketModule',
        `Ticket ${ticket.id} transferido para ${newAttendant.id}`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao transferir ticket: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao transferir ticket. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async sendModal(client: any, interaction: any) {
    try {
      const guildData = await this.getGuildData(interaction.guildId);

      if (!guildData) {
        return interaction.reply({
          content:
            '❌ Sistema de tickets não configurado. Use `/ticket config` primeiro.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const embedTicket = new EmbedBuilder()
        .setColor('#2f3136')
        .setAuthor({
          name: guildData.ticketTitle || 'Sistema de Tickets',
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          guildData.ticketDescription ||
            'Clique no botão abaixo para abrir um ticket!',
        )
        .addFields({
          name: '🎫 Categorias Disponíveis',
          value: this.ticketCategories
            .map(cat => `${cat.emoji} **${cat.name}** - ${cat.description}`)
            .join('\n'),
          inline: false,
        })
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket-category-select')
        .setPlaceholder('Selecione o tipo de ticket que você precisa')
        .setMinValues(1)
        .setMaxValues(1);

      for (const category of this.ticketCategories) {
        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(category.name)
            .setDescription(category.description)
            .setValue(category.id)
            .setEmoji(category.emoji),
        );
      }

      const selectRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          selectMenu,
        );

      await interaction.reply({
        content: '✅ Modal de tickets reenviado com sucesso!',
        flags: MessageFlags.Ephemeral,
      });

      await interaction.channel.send({
        embeds: [embedTicket],
        components: [selectRow],
      });
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao reenviar modal: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao reenviar modal. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async ticketOpen(client: any, interaction: any) {
    try {
      const existingTicket =
        await this.client.databaseModule.findExistingTicket(
          interaction.guildId,
          interaction.user.id,
        );

      if (existingTicket) {
        return interaction.reply({
          content: `**Já existe um ticket aberto para a sua conta -> <#${existingTicket.channelId}>.**\n\n*Você só pode ter um ticket aberto por vez, independente da categoria.*`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const categorySelectEmbed = new EmbedBuilder()
        .setColor('#2f3136')
        .setTitle('🎫 Sistema de Tickets')
        .setDescription('Selecione o tipo de ticket que você precisa:')
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket-category-select')
        .setPlaceholder('Selecione o tipo de ticket que você precisa')
        .setMinValues(1)
        .setMaxValues(1);

      for (const category of this.ticketCategories) {
        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(category.name)
            .setDescription(category.description)
            .setValue(category.id)
            .setEmoji(category.emoji),
        );
      }

      const selectRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          selectMenu,
        );

      await interaction.reply({
        embeds: [categorySelectEmbed],
        components: [selectRow],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao abrir ticket: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao abrir ticket. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async createTicketWithCategory(
    client: any,
    interaction: any,
    categoryId: string,
  ) {
    try {
      this.client.loggerModule.info(
        'TicketModule',
        `Iniciando criação de ticket para categoria: ${categoryId}`,
      );

      if (interaction.replied || interaction.deferred) {
        return this.client.loggerModule.warn(
          'TicketModule',
          'Interação já foi respondida, ignorando...',
        );
      }

      if (!this.client.databaseModule) {
        this.client.loggerModule.error(
          'TicketModule',
          'DatabaseModule não inicializado',
        );
        return interaction.reply({
          content: '❌ Sistema de banco de dados não inicializado.',
          flags: MessageFlags.Ephemeral,
        });
      }

      this.client.loggerModule.info(
        'TicketModule',
        `Buscando configuração da guild: ${interaction.guildId}`,
      );
      const guildData = await this.getGuildData(interaction.guildId);
      if (!guildData) {
        this.client.loggerModule.error(
          'TicketModule',
          `Configuração não encontrada para guild: ${interaction.guildId}`,
        );
        return interaction.reply({
          content: '❌ Configuração de tickets não encontrada.',
          flags: MessageFlags.Ephemeral,
        });
      }

      this.client.loggerModule.info(
        'TicketModule',
        `Verificando se já existe ticket aberto para usuário: ${interaction.user.id}`,
      );
      const existingTicket =
        await this.client.databaseModule.findExistingTicket(
          interaction.guildId,
          interaction.user.id,
        );

      if (existingTicket) {
        this.client.loggerModule.warn(
          'TicketModule',
          `Ticket já existe: ${existingTicket.channelId} (categoria: ${existingTicket.categoryId})`,
        );
        return interaction.reply({
          content: `**Já existe um ticket aberto para a sua conta -> <#${existingTicket.channelId}>.**\n\n*Você só pode ter um ticket aberto por vez, independente da categoria.*`,
          flags: MessageFlags.Ephemeral,
        });
      }

      this.client.loggerModule.info(
        'TicketModule',
        'Nenhum ticket existente encontrado, prosseguindo com criação...',
      );

      this.client.loggerModule.info(
        'TicketModule',
        `Buscando categoria: ${categoryId}`,
      );
      const category = this.ticketCategories.find(cat => cat.id === categoryId);

      if (!category) {
        this.client.loggerModule.error(
          'TicketModule',
          `Categoria não encontrada: ${categoryId}`,
        );
        return interaction.reply({
          content: '❌ Categoria não encontrada.',
          flags: MessageFlags.Ephemeral,
        });
      }

      this.client.loggerModule.info(
        'TicketModule',
        `Categoria encontrada: ${category.name} (${category.emoji})`,
      );
      this.client.loggerModule.info(
        'TicketModule',
        'Criando ticket no banco de dados...',
      );

      const ticket = await this.client.databaseModule.createTicket(
        interaction.guildId,
        {
          categoryId,
          userId: interaction.user.id,
          channelId: '',
        },
      );

      if (!ticket) {
        this.client.loggerModule.error(
          'TicketModule',
          'Falha ao criar ticket no banco de dados',
        );
        return interaction.reply({
          content: '❌ Erro ao criar ticket no banco de dados.',
          flags: MessageFlags.Ephemeral,
        });
      }

      this.client.loggerModule.info(
        'TicketModule',
        `Ticket criado no banco: ${ticket.id} (número: ${ticket.ticketNumber})`,
      );

      const channelName = `${category.emoji}・ticket-${ticket.ticketNumber.toString().padStart(4, '0')}`;
      this.client.loggerModule.info(
        'TicketModule',
        `Criando canal: ${channelName}`,
      );

      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `${interaction.user.id}`,
        parent: guildData.ticketCategoryId,
        permissionOverwrites: [
          {
            id: guildData.ticketRoleId || '',
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AddReactions,
            ],
          },
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AddReactions,
            ],
          },
        ],
      });

      this.client.loggerModule.info(
        'TicketModule',
        `Canal criado: ${ticketChannel.name} (ID: ${ticketChannel.id})`,
      );

      this.client.loggerModule.info(
        'TicketModule',
        'Atualizando canal no banco de dados...',
      );
      await this.client.databaseModule.updateTicketChannel(
        ticket.id,
        ticketChannel.id,
      );

      const embed = new EmbedBuilder()
        .setColor((category.color as any) || '#2f3136')
        .setAuthor({
          name: `${category.emoji} Ticket #${ticket.ticketNumber.toString().padStart(4, '0')}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          category.description ||
            `Bem-vindo ao seu ticket de ${category.emoji} ${category.name}!`,
        )
        .addFields(
          {
            name: '👤 Usuário',
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: '📅 Criado em',
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true,
          },
          { name: '🎫 Número', value: `#${ticket.ticketNumber}`, inline: true },
        )
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      const buttons = this.buildTicketButtons('opened');

      const ticketLinkEmbed = new EmbedBuilder()
        .setColor((category.color as any) || '#2f3136')
        .setDescription(
          `Seu ticket ${category.emoji} #${ticket.ticketNumber.toString().padStart(4, '0')} foi criado em ${ticketChannel}`,
        )
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      const ticketLinkButton = new ButtonBuilder()
        .setLabel('Ir para o ticket')
        .setURL(ticketChannel.url)
        .setStyle(ButtonStyle.Link);

      const ticketLinkRow = new ActionRowBuilder().addComponents(
        ticketLinkButton,
      );

      await interaction.reply({
        embeds: [ticketLinkEmbed],
        components: [ticketLinkRow],
        flags: MessageFlags.Ephemeral,
      });

      this.client.loggerModule.info(
        'TicketModule',
        'Enviando embed para o canal do ticket...',
      );

      let mentionContent = '';
      if (guildData.ticketRoleId) {
        mentionContent = `<@&${guildData.ticketRoleId}>`;
        this.client.loggerModule.info(
          'TicketModule',
          `Mencionando cargo: ${guildData.ticketRoleId}`,
        );
      }

      await ticketChannel
        .send({
          content: mentionContent,
          embeds: [embed],
          components: [buttons],
        })
        .then((m: any) => m.pin());

      this.client.loggerModule.info(
        'TicketModule',
        `Ticket criado com sucesso: ${ticketChannel.name}`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao criar ticket com categoria: ${error}`,
      );

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Erro ao criar ticket. Tente novamente.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }

  async ticketClose(client: any, interaction: any) {
    try {
      const channel = interaction.channel;
      const userId = channel.topic;
      const guildData = await this.getGuildData(interaction.guildId);
      if (!guildData) {
        return interaction.reply({
          content: '❌ Configuração de tickets não encontrada.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!userId) {
        throw new Error('ID do usuário não encontrado no topic do canal');
      }

      await channel.permissionOverwrites.edit(userId, {
        ViewChannel: false,
      });

      await channel.permissionOverwrites.edit(guildData.ticketRoleId || '', {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true,
        EmbedLinks: true,
        AddReactions: true,
      });

      await channel.permissionOverwrites.edit(interaction.guild.id, {
        ViewChannel: false,
      });

      const ticketClosedEmbed = new EmbedBuilder()
        .setColor('#2f3136')
        .setAuthor({
          name: guildData.ticketTitle || 'Sistema de Tickets',
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setDescription('Ticket fechado, escolha uma ação abaixo.')
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      const reopenButton = new ButtonBuilder()
        .setCustomId('ticket-reopen')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Reabrir Ticket');

      const transcriptButton = new ButtonBuilder()
        .setCustomId('ticket-transcript')
        .setStyle(ButtonStyle.Danger)
        .setLabel('Transcrever Ticket');

      const buttonsRow = new ActionRowBuilder().addComponents(
        reopenButton,
        transcriptButton,
      );

      await interaction.reply({
        embeds: [ticketClosedEmbed],
        components: [buttonsRow],
      });
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao fechar ticket: ${error.message}`,
      );
      await interaction.reply({
        content: '❌ Erro ao fechar o ticket. Por favor, tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async ticketReopen(client: any, interaction: any) {
    const ticketMember = interaction.channel.topic;
    const memberData = interaction.guild.members.cache.get(ticketMember);
    const guildData = await this.getGuildData(interaction.guildId);
    if (!guildData) {
      return interaction.reply({
        content: '❌ Configuração de tickets não encontrada.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (memberData) {
      await interaction.channel.permissionOverwrites.edit(ticketMember, {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true,
        EmbedLinks: true,
        AddReactions: true,
      });
    }

    await interaction.channel.permissionOverwrites.edit(
      guildData.ticketRoleId,
      {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true,
        EmbedLinks: true,
        AddReactions: true,
      },
    );

    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
      ViewChannel: false,
    });

    const embed = this.buildReopenedTicketEmbed(interaction, guildData);
    const buttons = this.buildTicketButtons('reopened');

    await interaction.message.delete();

    await interaction.reply({
      content: `<@!${interaction.channel.topic}>`,
      embeds: [embed],
      components: [buttons],
    });
  }

  async ticketCloseMessage(client: any, interaction: any) {
    try {
      await interaction.message.delete();
    } catch (error) {
      console.error('Erro ao apagar mensagem:', error);
    }
  }

  async ticketTranscript(client: any, interaction: any) {
    try {
      const channel = interaction.channel;
      const userId = channel.topic;

      if (!userId) {
        throw new Error('ID do usuário não encontrado no topic do canal');
      }

      const countdownMsg = await interaction.reply({
        content: '🔄 Gerando transcript e fechando ticket em 5 segundos...',
        flags: MessageFlags.Ephemeral,
      });

      for (let i = 4; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await countdownMsg.edit({
          content: `🔄 Gerando transcript e fechando ticket em ${i} segundos...`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const attachment = await discordTranscripts.createTranscript(channel, {
        limit: -1,
        filename: `transcript-${channel.name}.html`,
        poweredBy: false,
        hydrate: true,
      });

      await countdownMsg.edit({
        content: '✅ Gerando transcript e fechando ticket agora...',
        flags: MessageFlags.Ephemeral,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const guildData = await this.getGuildData(interaction.guildId);
      const logsChannel = guildData
        ? interaction.guild.channels.cache.get(
            guildData.ticketLogsChannelId || '',
          )
        : null;

      const ticket = await this.client.databaseModule.getTicketByChannel(
        interaction.channelId,
      );
      let attendantInfo = '';
      if (ticket?.claimedBy) {
        const attendant = await interaction.client.users.fetch(
          ticket.claimedBy,
        );
        attendantInfo = `\n👤 **Atendente:** ${attendant.tag} (<@${ticket.claimedBy}>)`;
      }

      if (logsChannel) {
        const embed = new EmbedBuilder()
          .setColor('#2f3136')
          .setTitle('Transcript de Ticket')
          .setDescription(
            `Ticket de <@${userId}> fechado por ${interaction.user.tag}${attendantInfo}`,
          )
          .setTimestamp();

        await logsChannel.send({
          embeds: [embed],
          files: [attachment],
        });
      } else {
        this.client.loggerModule.error(
          'TicketModule',
          'Canal de logs não encontrado',
        );
      }

      await channel.delete();
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao gerar transcript: ${error.message}`,
      );
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Erro ao gerar transcript. Por favor, tente novamente.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }

  async ticketMentionUser(client: any, interaction: any) {
    const {
      channel: { topic },
      guild,
    } = interaction;

    const user = await guild.members.fetch(topic);
    if (user) {
      await interaction.reply({
        content: `<@!${topic}>`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async addUser(client: any, interaction: any) {
    try {
      const member = interaction.options.getUser('membro');
      const channel = interaction.channel;

      if (!member) {
        return interaction.reply({
          content: '❌ Membro não encontrado.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!channel.topic) {
        return interaction.reply({
          content: '❌ Este comando só pode ser usado em canais de ticket.',
          flags: MessageFlags.Ephemeral,
        });
      }

      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true,
        EmbedLinks: true,
        AddReactions: true,
      });

      await interaction.reply({
        content: `✅ ${member} foi adicionado ao ticket.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao adicionar usuário: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao adicionar usuário ao ticket.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async removeUser(client: any, interaction: any) {
    try {
      const member = interaction.options.getUser('membro');
      const channel = interaction.channel;

      if (!member) {
        return interaction.reply({
          content: '❌ Membro não encontrado.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!channel.topic) {
        return interaction.reply({
          content: '❌ Este comando só pode ser usado em canais de ticket.',
          flags: MessageFlags.Ephemeral,
        });
      }

      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: false,
      });

      await interaction.reply({
        content: `✅ ${member} foi removido do ticket.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      this.client.loggerModule.error(
        'TicketModule',
        `Erro ao remover usuário: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao remover usuário do ticket.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
