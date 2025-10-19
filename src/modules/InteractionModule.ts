import { Events, Interaction, MessageFlags } from 'discord.js';
import { ClientExtended } from '../types';

export class InteractionModule {
  constructor(private client: ClientExtended) {}

  initialize(): void {
    this.client.on(
      Events.InteractionCreate,
      async (interaction: Interaction) => {
        try {
          // Select Menu Handling
          if (interaction.isStringSelectMenu()) {
            switch (interaction.customId) {
              case 'ticket-category-select':
                const categoryId = interaction.values[0]!;
                return await this.client.ticketModule.createTicketWithCategory(
                  this.client,
                  interaction,
                  categoryId,
                );
              default:
                return await interaction.reply({
                  content: 'Select Menu não reconhecido',
                  flags: [MessageFlags.Ephemeral],
                });
            }
          }

          // Buttons Handling
          if (interaction.isButton()) {
            switch (interaction.customId) {
              case 'ticket-open':
                return await this.client.ticketModule.ticketOpen(
                  this.client,
                  interaction,
                );
              case 'ticket-close':
                return await this.client.ticketModule.ticketClose(
                  this.client,
                  interaction,
                );
              case 'ticket-reopen':
                return await this.client.ticketModule.ticketReopen(
                  this.client,
                  interaction,
                );
              case 'ticket-transcript':
                return await this.client.ticketModule.ticketTranscript(
                  this.client,
                  interaction,
                );
              case 'ticket-mention':
                return await this.client.ticketModule.ticketMentionUser(
                  this.client,
                  interaction,
                );
              case 'ticket-claim':
                return await this.client.ticketModule.claimTicket(
                  this.client,
                  interaction,
                );
              case 'ticket-close-message':
                return await this.client.ticketModule.ticketCloseMessage(
                  this.client,
                  interaction,
                );
              case 'staff-form':
                const staffModal = this.client.modals.get('staff-form');
                if (staffModal && staffModal.data) {
                  await interaction.showModal(staffModal.data);
                } else {
                  return await interaction.reply({
                    content: '❌ Modal não encontrado!',
                    flags: [MessageFlags.Ephemeral],
                  });
                }
              case 'youtuber-form':
                const youtuberModal = this.client.modals.get('youtuber-form');
                if (youtuberModal && youtuberModal.data) {
                  return await interaction.showModal(youtuberModal.data);
                } else {
                  return await interaction.reply({
                    content: '❌ Modal não encontrado!',
                    flags: [MessageFlags.Ephemeral],
                  });
                }
              case 'edit-title':
              case 'edit-description':
              case 'edit-color':
              case 'edit-thumbnail':
              case 'edit-image':
              case 'edit-footer':
              case 'edit-author':
                return await this.handleEmbedEdit(interaction);
              case 'edit-fields':
                return await this.handleEmbedFields(interaction);
              case 'preview-embed':
                return await this.handleEmbedPreview(interaction);
              case 'send-embed':
                return await this.handleEmbedSend(interaction);
              case 'reset-embed':
                return await this.handleEmbedReset(interaction);
              default:
                if (interaction.customId.startsWith('ticket-category-')) {
                  const categoryId = interaction.customId.replace(
                    'ticket-category-',
                    '',
                  );
                  return await this.client.ticketModule.createTicketWithCategory(
                    this.client,
                    interaction,
                    categoryId,
                  );
                }
                return await interaction.reply({
                  content: `Botão não reconhecido ${interaction.customId}`,
                  flags: [MessageFlags.Ephemeral],
                });
            }
          }

          // Modal submission Handling
          if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
              case 'ticket-modal':
                return await this.client.ticketModule.ticketModal(
                  this.client,
                  interaction,
                );
              case 'staff-form':
                return await this.client.modalModule.sendStaffModal(
                  this.client,
                  interaction,
                );
              case 'youtuber-form':
                return await this.client.modalModule.sendYouTuberModal(
                  this.client,
                  interaction,
                );
              case 'embed-editor-title':
              case 'embed-editor-description':
              case 'embed-editor-color':
              case 'embed-editor-thumbnail':
              case 'embed-editor-image':
              case 'embed-editor-footer':
              case 'embed-editor-author':
              case 'embed-editor-authorIcon':
                return await this.handleEmbedModalSubmit(interaction);
              case 'embed-editor-field':
                return await this.handleEmbedFieldModalSubmit(interaction);
              default:
                return await interaction.reply({
                  content: 'Modal não reconhecido',
                  flags: [MessageFlags.Ephemeral],
                });
            }
          }

          // Slash Command Handling
          if (interaction.isChatInputCommand()) {
            const command = this.client.slashCommands.get(
              interaction.commandName,
            );

            if (!command) {
              return interaction.reply({
                content: 'Erro ao executar o comando: NÃO ENCONTRADO',
                flags: [MessageFlags.Ephemeral],
              });
            }

            return await command.execute(
              this.client as ClientExtended,
              interaction,
            );
          }
        } catch (err) {}
      },
    );
  }

  private async handleEmbedEdit(interaction: any): Promise<void> {
    try {
      const field = interaction.customId.replace('edit-', '');

      this.client.loggerModule.info(
        'InteractionModule',
        `Tentando editar campo: ${field}`,
      );

      const { createEmbedEditorModal } = await import(
        '../modals/embed-editor-modal'
      );

      const messageId = this.extractMessageIdFromInteraction(interaction);
      this.client.loggerModule.info(
        'InteractionModule',
        `MessageId extraído: ${messageId}`,
      );

      if (!messageId) {
        return await interaction.reply({
          content: '❌ Sessão não encontrada. Use /createembed novamente.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      const embedData = this.client.embedSessions?.get(messageId);
      let currentValue = '';

      if (embedData) {
        switch (field) {
          case 'title':
            currentValue = embedData.title || '';
            break;
          case 'description':
            currentValue = embedData.description || '';
            break;
          case 'color':
            currentValue = embedData.color ? embedData.color.toString() : '';
            break;
          case 'thumbnail':
            currentValue = embedData.thumbnail || '';
            break;
          case 'image':
            currentValue = embedData.image || '';
            break;
          case 'footer':
            currentValue = embedData.footer || '';
            break;
          case 'author':
            currentValue = embedData.author || '';
            break;
        }
      }

      this.client.loggerModule.info(
        'InteractionModule',
        `Valor atual para ${field}: "${currentValue}"`,
      );

      const modal = createEmbedEditorModal(field, currentValue);
      await interaction.showModal(modal);
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao abrir modal de edição: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao abrir editor. Tente novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  private async handleEmbedFields(interaction: any): Promise<void> {
    try {
      // Verificar se a sessão existe
      const messageId = this.extractMessageIdFromInteraction(interaction);
      if (!messageId) {
        return await interaction.reply({
          content: '❌ Sessão não encontrada. Use /createembed novamente.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      const { createFieldModal } = await import('../modals/embed-editor-modal');
      const modal = createFieldModal();
      await interaction.showModal(modal);
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao abrir modal de campos: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao abrir editor de campos. Tente novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  private async handleEmbedPreview(interaction: any): Promise<void> {
    try {
      const messageId = this.extractMessageIdFromInteraction(interaction);
      if (!messageId) {
        return await interaction.reply({
          content: '❌ Sessão não encontrada. Use /createembed novamente.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      const embedData = this.client.embedSessions?.get(messageId);

      if (!embedData) {
        return await interaction.reply({
          content: '❌ Nenhum embed encontrado. Use /createembed primeiro.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      const embed = this.buildEmbedFromData(embedData);

      await interaction.reply({
        content: '👁️ **Preview do seu embed:**',
        embeds: [embed],
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao fazer preview: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao gerar preview. Tente novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  private async handleEmbedSend(interaction: any): Promise<void> {
    try {
      const messageId = this.extractMessageIdFromInteraction(interaction);
      if (!messageId) {
        return await interaction.reply({
          content: '❌ Sessão não encontrada. Use /createembed novamente.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      const embedData = this.client.embedSessions?.get(messageId);

      if (!embedData) {
        return await interaction.reply({
          content: '❌ Nenhum embed encontrado. Use /createembed primeiro.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      const embed = this.buildEmbedFromData(embedData);

      if (interaction.channel && !interaction.channel.isDMBased()) {
        await interaction.channel.send({ embeds: [embed] });

        await interaction.reply({
          content: '✅ Embed enviado com sucesso!',
          flags: [MessageFlags.Ephemeral],
        });

        // Limpar sessão
        this.client.embedSessions?.delete(messageId);
      }
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao enviar embed: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao enviar embed. Tente novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  private async handleEmbedReset(interaction: any): Promise<void> {
    try {
      const messageId = this.extractMessageIdFromInteraction(interaction);
      if (!messageId) {
        return await interaction.reply({
          content: '❌ Sessão não encontrada. Use /createembed novamente.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      // Limpar sessão
      this.client.embedSessions?.delete(messageId);

      await interaction.reply({
        content: '🔄 Embed resetado! Use /createembed para começar novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao resetar embed: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao resetar embed. Tente novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  private async handleEmbedModalSubmit(interaction: any): Promise<void> {
    try {
      const field = interaction.customId.replace('embed-editor-', '');
      const value = interaction.fields.getTextInputValue(
        `embed-${field}-input`,
      );

      const messageId = this.extractMessageIdFromInteraction(interaction);
      if (!messageId) {
        return await interaction.reply({
          content: '❌ Sessão não encontrada. Use /createembed novamente.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      if (!this.client.embedSessions) {
        this.client.embedSessions = new Map();
      }

      let embedData = this.client.embedSessions.get(messageId);
      if (!embedData) {
        embedData = { fields: [] };
      }

      // Processar valor baseado no campo
      switch (field) {
        case 'title':
          embedData.title = value || undefined;
          break;
        case 'description':
          embedData.description = value || undefined;
          break;
        case 'color':
          if (value) {
            if (value.startsWith('#')) {
              embedData.color = parseInt(value.replace('#', ''), 16);
            } else {
              embedData.color = parseInt(value) || undefined;
            }
          } else {
            embedData.color = undefined;
          }
          break;
        case 'thumbnail':
          embedData.thumbnail = value || undefined;
          break;
        case 'image':
          embedData.image = value || undefined;
          break;
        case 'footer':
          embedData.footer = value || undefined;
          break;
        case 'author':
          embedData.author = value || undefined;
          break;
        case 'authorIcon':
          embedData.authorIcon = value || undefined;
          break;
      }

      this.client.embedSessions.set(messageId, embedData);

      await interaction.reply({
        content: `✅ ${field.charAt(0).toUpperCase() + field.slice(1)} atualizado com sucesso!`,
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao processar modal: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao processar edição. Tente novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  private async handleEmbedFieldModalSubmit(interaction: any): Promise<void> {
    try {
      const name = interaction.fields.getTextInputValue(
        'embed-field-name-input',
      );
      const value = interaction.fields.getTextInputValue(
        'embed-field-value-input',
      );
      const inlineStr = interaction.fields.getTextInputValue(
        'embed-field-inline-input',
      );
      const inline = inlineStr?.toLowerCase() === 'true';

      const messageId = this.extractMessageIdFromInteraction(interaction);
      if (!messageId) {
        return await interaction.reply({
          content: '❌ Sessão não encontrada. Use /createembed novamente.',
          flags: [MessageFlags.Ephemeral],
        });
      }

      if (!this.client.embedSessions) {
        this.client.embedSessions = new Map();
      }

      let embedData = this.client.embedSessions.get(messageId);
      if (!embedData) {
        embedData = { fields: [] };
      }

      embedData.fields.push({ name, value, inline });
      this.client.embedSessions.set(messageId, embedData);

      await interaction.reply({
        content: `✅ Campo "${name}" adicionado com sucesso!`,
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao adicionar campo: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao adicionar campo. Tente novamente.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  private buildEmbedFromData(embedData: any): any {
    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder();

    if (embedData.title) embed.setTitle(embedData.title);
    if (embedData.description) embed.setDescription(embedData.description);
    if (embedData.color) embed.setColor(embedData.color);
    if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
    if (embedData.image) embed.setImage(embedData.image);
    if (embedData.footer) embed.setFooter({ text: embedData.footer });
    if (embedData.author) {
      embed.setAuthor({
        name: embedData.author,
        iconURL: embedData.authorIcon,
      });
    }
    if (embedData.fields && embedData.fields.length > 0) {
      embed.addFields(embedData.fields);
    }

    return embed;
  }

  private extractMessageIdFromInteraction(interaction: any): string | null {
    try {
      if (
        interaction.message &&
        interaction.message.embeds &&
        interaction.message.embeds.length > 0
      ) {
        const embed = interaction.message.embeds[0];
        if (embed.footer && embed.footer.text) {
          const match = embed.footer.text.match(/Sessão: (embed_\d+_\d+)/);
          if (match) {
            return match[1];
          }
        }
      }

      if (this.client.embedSessions) {
        const userSessions = Array.from(this.client.embedSessions.entries())
          .filter(([key]) => key.includes(interaction.user.id))
          .sort((a, b) => {
            const timestampA = parseInt(a[0].split('_').pop() || '0');
            const timestampB = parseInt(b[0].split('_').pop() || '0');
            return timestampB - timestampA;
          });

        if (userSessions.length > 0) {
          return userSessions[0]?.[0] || null;
        }
      }

      return null;
    } catch (error) {
      this.client.loggerModule.error(
        'InteractionModule',
        `Erro ao extrair sessionId: ${error}`,
      );
      return null;
    }
  }
}
