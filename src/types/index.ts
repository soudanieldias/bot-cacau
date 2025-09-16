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
import { ActivityModule, InteractionModule, LoggerModule } from '../modules';

export interface CommandData {
  data:
    | ApplicationCommandData
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  categories: string[];
  execute: (
    client: Client<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ) => Promise<void>;
}

export interface ModalData {
  customId: string;
  execute: (
    client: Client<true>,
    interaction: ModalSubmitInteraction<CacheType>,
  ) => Promise<void>;
}

export type ClientExtended = Client & {
  // Lists/items:
  buttons: Map<string, { execute: Function; customId: string }>;
  commands: Map<string, CommandData>;
  modals: Map<string, ModalData>;
  slashCommands: Map<string, CommandData>;

  // Modules:
  activityModule: ActivityModule;
  interactionModule: InteractionModule;
  loggerModule: LoggerModule;
};
