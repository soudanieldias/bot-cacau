import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { ClientExtended } from './types';
import { intentsList, partialsList } from './config';
import { OnReadyModule, LoggerModule } from './modules';
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
    this.client.slashCommands = new Map();
    this.client.modals = new Map();

    // Initialize modules
    this.client.loggerModule = new LoggerModule(this.client);
  }

  private async initializeModules(): Promise<void> {
    new OnReadyModule(this.client).initialize();

  }
  
  public async start(): Promise<void> {
    try {
      await this.client.login(this.token);
      await this.initializeModules();
    } catch (error) {
      this.client.loggerModule.error('Ocorreu um erro ao inicializar o BOT:', error);
      process.exit(1);
    }
  }
}
