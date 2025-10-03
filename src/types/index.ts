import {
  ApplicationCommandData,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import {
  ActivityModule,
  DatabaseModule,
  EmbedModule,
  InteractionModule,
  LoggerModule,
  ModalModule,
  TicketModule,
} from '../modules';

export type ClientExtended = Client & {
  // Lists/items:
  buttons: Map<string, { execute: Function; customId: string }>;
  commands: Map<string, CommandData>;
  modals: Map<string, ModalData>;
  slashCommands: Map<string, CommandData>;

  // Modules:
  activityModule: ActivityModule;
  databaseModule: DatabaseModule;
  embedModule: EmbedModule;
  interactionModule: InteractionModule;
  loggerModule: LoggerModule;
  modalModule: ModalModule;
  ticketModule: TicketModule;
};

export interface CommandData {
  data:
    | ApplicationCommandData
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  categories: string[];
  execute: (
    client: ClientExtended,
    interaction: ChatInputCommandInteraction<CacheType>,
  ) => Promise<void>;
}

export interface ModalData {
  data: any;
  customId: string;
  execute: (
    client: ClientExtended,
    interaction: ModalSubmitInteraction<CacheType>,
  ) => Promise<void>;
}
