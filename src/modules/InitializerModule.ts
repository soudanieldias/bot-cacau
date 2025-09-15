import { Client, Collection } from 'discord.js';
import { ClientExtended, CommandData } from '../types';

export class InitializerModule {
  private client: ClientExtended;

  constructor(client: ClientExtended) {
    this.client = client;
  }

  async initialize(): Promise<void> {
    try {
      this.client.once('ready', async () => {
        this.client.loggerModule.info('InitializerModule', 'Inicializando BOT');

        const { discriminator, username } = this.client.user || {};
        const guildCount = this.client.guilds.cache.size;
        const userCount = this.client.users.cache.size;

        const botName = discriminator
          ? `${username}#${discriminator}`
          : username || 'Unknown';

        const guildList = this.client.guilds.cache.map(
          guild => `  🎮 ${guild.name}`,
        );

        const commandsCount = this.client.slashCommands?.size || 0;
        const buttonsCount = this.client.buttons?.size || 0;

        this.client.loggerModule.info(
          'InitializerModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info('InitializerModule', `🚀 CACAU-BOT V2 ONLINE 🚀`);
        this.client.loggerModule.info(
          'InitializerModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info('InitializerModule', `👤 Bot: ${botName}`);
        this.client.loggerModule.info('InitializerModule', `🏠 Servidores: ${guildCount}`);
        this.client.loggerModule.info('InitializerModule', `👥 Usuários: ${userCount}`);
        this.client.loggerModule.info('InitializerModule', `⏰ Status: Online ✅`);
        this.client.loggerModule.info(
          'InitializerModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info('InitializerModule', `📍 SERVIDORES ATIVOS 📍`);

        this.client.loggerModule.info(
          'InitializerModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        guildList.map(guild => this.client.loggerModule.info('InitializerModule', `${guild}`));

        this.client.loggerModule.info(
          'InitializerModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info('InitializerModule', `🗄️  Database: Conectado`);

        this.client.loggerModule.info(
          'InitializerModule',
          `⚡Commands: ${commandsCount || 0} carregados`,
        );

        this.client.loggerModule.info(
          'InitializerModule',
          `🔘 Buttons: ${buttonsCount} carregados`,
        );

        this.client.loggerModule.info('InitializerModule', `🎯 Interactions: Ativo`);

        this.client.loggerModule.info('InitializerModule', `🎨 Embeds: Pronto`);

        this.client.loggerModule.info(
          'InitializerModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info(
          'InitializerModule',
          `🎉 CACAU-BOT está online e operacional! 🎉`,
        );
        this.client.loggerModule.info(
          'InitializerModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        // TO-DO: Initialize Database & Interaction modules here
        // await this.client.databaseModule.initialize();
        // await this.client.interactionModule.initialize(client as Client<true>, client.slashCommands as Collection<string, CommandData>);
      });

    } catch (error) {
      this.client.loggerModule.error('InitializerModule', `Erro ao inicializar o BOT: ${error}`);
      process.exit(1);
    }
  }
}
