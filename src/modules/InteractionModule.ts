import {
  Client,
  Collection,
  Events,
  Interaction,
  MessageFlags,
} from 'discord.js';
import { CommandData, ClientExtended } from '../types';

export class InteractionModule {
  constructor(private client: ClientExtended) {}

  initialize(): void {
    this.client.on(
      Events.InteractionCreate,
      async (interaction: Interaction) => {
        try {
          // Select Menu Handling
          if (interaction.isStringSelectMenu()) {
            return await interaction.reply({
              content: 'Funcionalidade em Implementação',
              flags: [MessageFlags.Ephemeral],
            });
          }

          // Buttons Handling
          if (interaction.isButton()) {
            return await interaction.reply({
              content: 'Funcionalidade em Implementação',
              flags: [MessageFlags.Ephemeral],
            });
          }

          // Modal submission Handling
          if (interaction.isModalSubmit()) {
            return await interaction.reply({
              content: 'Funcionalidade em Implementação',
              flags: [MessageFlags.Ephemeral],
            });
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
              this.client as Client<true>,
              interaction,
            );
          }
        } catch (err) {}
      },
    );
  }
}
