import {
  ApplicationCommandData,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

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

export type ClientExtended = Client & {
  commands: Map<string, CommandData>;
};
