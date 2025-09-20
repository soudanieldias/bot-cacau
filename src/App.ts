import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { ClientExtended, CommandData } from './types';
import { intentsList, partialsList } from './config';
import {
  ActivityModule,
  CommandModule,
  DatabaseModule,
  InteractionModule,
  LoggerModule,
  OnReadyModule
} from './modules';
import dotenv from 'dotenv';

dotenv.config();

export default class App {
  private client: ClientExtended;
  private token: string | undefined;

  constructor() {
    this.token = process.env.TOKEN || '';

    this.client = new Client({
      intents: intentsList,
      partials: partialsList,
    }) as ClientExtended;

    // Initialize custom properties
    this.client.buttons = new Map();
    this.client.modals = new Map();
    this.client.slashCommands = new Map();

    // Initialize modules
    this.client.loggerModule = new LoggerModule(this.client);
    this.client.activityModule = new ActivityModule(this.client);
    this.client.databaseModule = new DatabaseModule(this.client);
  }

  private async initializeModules(): Promise<void> {
    await new OnReadyModule(this.client).initialize();
    await new CommandModule(this.client).initialize();
    await new InteractionModule(this.client).initialize();
    this.client.databaseModule.initialize();
  }

  public async start(): Promise<void> {
    try {
      await this.client.login(this.token);
      await this.initializeModules();
    } catch (error) {
      this.client.loggerModule.error('Main', `Ocorreu um erro ao iniciar o bot: ${error}`);
      process.exit(1);
    }
  }
}
