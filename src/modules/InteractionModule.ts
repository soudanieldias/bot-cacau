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
}
