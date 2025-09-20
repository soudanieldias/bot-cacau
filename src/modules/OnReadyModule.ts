import { Client, Collection } from 'discord.js';
import { ClientExtended, CommandData } from '../types';

export class OnReadyModule {
  constructor(private client: ClientExtended) {
    this.client = client;
  }

  async initialize(): Promise<void> {
    try {
      this.client.once('clientReady', async () => {
        this.client.loggerModule.info('OnReadyModule', 'Inicializando BOT');

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
          'OnReadyModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `🚀 CACAU-BOT V2 ONLINE 🚀`,
        );
        this.client.loggerModule.info(
          'OnReadyModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info('OnReadyModule', `👤 Bot: ${botName}`);
        this.client.loggerModule.info(
          'OnReadyModule',
          `🏠 Servidores: ${guildCount}`,
        );
        this.client.loggerModule.info(
          'OnReadyModule',
          `👥 Usuários: ${userCount}`,
        );
        this.client.loggerModule.info('OnReadyModule', `⏰ Status: Online ✅`);
        this.client.loggerModule.info(
          'OnReadyModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `📍 SERVIDORES ATIVOS 📍`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        guildList.map(guild =>
          this.client.loggerModule.info('OnReadyModule', `${guild}`),
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `🗄️  Database: Conectado`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `⚡Commands: ${commandsCount || 0} carregados`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `🔘 Buttons: ${buttonsCount} carregados`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `🎯 Interactions: Ativo`,
        );

        this.client.loggerModule.info('OnReadyModule', `🎨 Embeds: Pronto`);

        this.client.loggerModule.info(
          'OnReadyModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        this.client.loggerModule.info(
          'OnReadyModule',
          `🎉 CACAU-BOT está online e operacional! 🎉`,
        );
        this.client.loggerModule.info(
          'OnReadyModule',
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        );

        // TO-DO: Initialize Database & Interaction modules here
        await this.client.databaseModule.initialize();
        // await this.client.interactionModule.initialize(client as Client<true>, client.slashCommands as Collection<string, CommandData>);
      });
    } catch (error) {
      this.client.loggerModule.error(
        'OnReadyModule',
        `Erro ao inicializar o BOT: ${error}`,
      );
      process.exit(1);
    }
  }
}
