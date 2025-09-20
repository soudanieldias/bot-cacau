import { ClientExtended } from '../types';
import { PrismaClient } from '@prisma/client';

export class DatabaseModule {
  private readonly prisma: PrismaClient;

  constructor(private readonly client: ClientExtended) {
    this.prisma = new PrismaClient();
    this.client.databaseModule = this;
  }

  async initialize(): Promise<void> {
    try {
      await this.client.loggerModule.info('Database', 'Inicializando...');

      await this.populateServers();

      await this.client.loggerModule.info(
        'Database',
        'Inicializada com sucesso.',
      );
    } catch (error) {
      await this.client.loggerModule.error('Database', `Erro: ${error}`);
      throw error;
    }
  }

  async populateServers(): Promise<void> {
    try {
      const servers = this.client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        iconURL: guild.iconURL() || null,
        bannerURL: guild.bannerURL() || null,
      }));

      for (const server of servers) {
        await this.prisma.guilds.upsert({
          where: { id: server.id },
          update: server,
          create: server,
        });
      }

      await this.client.loggerModule.info(
        'Database',
        'Guildas populadas no banco de dados com sucesso.',
      );
    } catch (error) {
      await this.client.loggerModule.error('Database', `Erro: ${error}`);
    }
  }

  async findGuildTicketConfig(guildId: string) {
    try {
      const ticketSettings = await this.prisma.settings.findUnique({
        where: { id: guildId },
      });

      return ticketSettings || null;
    } catch (error) {
      await this.client.loggerModule.error('Database', `Erro: ${error}`);
      return null;
    }
  }

  async getGuildData(guildId: string) {
    try {
      return await this.prisma.settings.findUnique({
        where: { id: guildId },
      });
    } catch (error) {
      await this.client.loggerModule.error(
        'Database',
        `Erro no arquivo: ${error}`,
      );
      return null;
    }
  }

  async createUser(
    discordId: string,
    username: string,
    points = 0,
  ): Promise<void> {
    try {
      await this.prisma.users.upsert({
        where: { id: discordId },
        update: { username, points },
        create: { id: discordId, username, points },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar/atualizar usuário: ${error}`,
      );
    }
  }

  async getUser(discordId: string) {
    return await this.prisma.users.findUnique({
      where: { id: discordId },
    });
  }

  async updateUserPoints(discordId: string, points: number): Promise<void> {
    try {
      await this.prisma.users.update({
        where: { id: discordId },
        data: { points },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar pontos do usuário: ${error}`,
      );
    }
  }

  async createGuild(
    discordId: string,
    name: string,
    iconURL?: string,
    bannerURL?: string,
  ): Promise<void> {
    try {
      await this.prisma.guilds.upsert({
        where: { id: discordId },
        update: { name, iconURL, bannerURL },
        create: { id: discordId, name, iconURL, bannerURL },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar/atualizar servidor: ${error}`,
      );
    }
  }

  async getGuild(discordId: string) {
    return await this.prisma.guilds.findUnique({
      where: { id: discordId },
    });
  }

  async getAllGuilds(): Promise<any[]> {
    return await this.prisma.guilds.findMany();
  }

  async createSettings(guildId: string, settings: any): Promise<void> {
    try {
      await this.prisma.settings.upsert({
        where: { id: guildId },
        update: settings,
        create: { id: guildId, ...settings },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar/atualizar configurações: ${error}`,
      );
    }
  }

  async getSettings(guildId: string) {
    return await this.prisma.settings.findUnique({
      where: { id: guildId },
    });
  }

  async updateSettings(guildId: string, settings: any): Promise<void> {
    try {
      await this.prisma.settings.update({
        where: { id: guildId },
        data: settings,
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar configurações: ${error}`,
      );
    }
  }
}
