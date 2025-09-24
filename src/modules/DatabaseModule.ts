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

      await this.prisma.$connect();
      await this.client.loggerModule.info(
        'Database',
        'Conexão com banco estabelecida',
      );

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
        update: {
          name,
          iconURL: iconURL || null,
          bannerURL: bannerURL || null,
        },
        create: {
          id: discordId,
          name,
          iconURL: iconURL || null,
          bannerURL: bannerURL || null,
        },
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
      await this.prisma.settings.upsert({
        where: { id: guildId },
        update: settings,
        create: { id: guildId, ...settings },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar configurações: ${error}`,
      );
    }
  }

  async upsertTicketSettings(guildId: string, ticketData: any): Promise<void> {
    try {
      await this.prisma.settings.upsert({
        where: { id: guildId },
        update: ticketData,
        create: { id: guildId, ...ticketData },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar/atualizar configurações de ticket: ${error}`,
      );
    }
  }

  async updateTicketSettings(guildId: string, ticketData: any): Promise<void> {
    try {
      await this.prisma.settings.update({
        where: { id: guildId },
        data: ticketData,
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar configurações de ticket: ${error}`,
      );
    }
  }

  async getTicketSettings(guildId: string) {
    try {
      return await this.prisma.settings.findUnique({
        where: { id: guildId },
        select: {
          ticketChannelId: true,
          ticketButtonName: true,
          ticketCategoryId: true,
          ticketLogsChannelId: true,
          ticketRoleId: true,
          ticketTitle: true,
          ticketDescription: true,
          modRoleId: true,
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao obter configurações de ticket: ${error}`,
      );
      return null;
    }
  }

  async createTicketCategory(
    guildId: string,
    categoryData: {
      name: string;
      emoji?: string;
      description?: string;
      color?: string;
    },
  ) {
    try {
      const category = await this.prisma.ticketCategories.create({
        data: {
          id: `${guildId}-${categoryData.name.toLowerCase()}`,
          guildId,
          name: categoryData.name,
          emoji: categoryData.emoji || null,
          description: categoryData.description || null,
          color: categoryData.color || null,
        },
      });

      await this.prisma.ticketCounters.create({
        data: {
          id: `${guildId}-counter`,
          guildId,
          counter: 0,
        },
      });

      return category;
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar categoria de ticket: ${error}`,
      );
      return null;
    }
  }

  async getTicketCategories(guildId: string) {
    try {
      return await this.prisma.ticketCategories.findMany({
        where: { guildId, isActive: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao obter categorias de tickets: ${error}`,
      );
      return [];
    }
  }

  async getNextTicketNumber(guildId: string) {
    try {
      let counter = await this.prisma.ticketCounters.findUnique({
        where: {
          guildId,
        },
      });

      if (!counter) {
        counter = await this.prisma.ticketCounters.create({
          data: {
            id: `${guildId}-${Date.now()}`,
            guildId,
            counter: 0,
          },
        });
      }

      const updatedCounter = await this.prisma.ticketCounters.update({
        where: {
          guildId,
        },
        data: {
          counter: counter.counter + 1,
        },
      });

      return updatedCounter.counter.toString().padStart(4, '0');
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao obter próximo número do ticket: ${error}`,
      );
      return '0001';
    }
  }

  async createTicket(
    guildId: string,
    ticketData: {
      categoryId: string;
      userId: string;
      channelId: string;
    },
  ) {
    try {
      const ticketNumber = await this.getNextTicketNumber(guildId);

      const ticket = await this.prisma.tickets.create({
        data: {
          id: `${guildId}-${ticketNumber}-${Date.now()}`,
          guildId,
          categoryId: ticketData.categoryId,
          userId: ticketData.userId,
          channelId: ticketData.channelId,
          ticketNumber: parseInt(ticketNumber),
        },
      });

      return ticket;
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar ticket: ${error}`,
      );
      return null;
    }
  }

  async getTicketByChannel(channelId: string) {
    try {
      return await this.prisma.tickets.findFirst({
        where: { channelId },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao obter ticket por canal: ${error}`,
      );
      return null;
    }
  }

  async updateTicketStatus(ticketId: string, status: string) {
    try {
      return await this.prisma.tickets.update({
        where: { id: ticketId },
        data: {
          status,
          closedAt: status === 'closed' ? new Date() : null,
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar status do ticket: ${error}`,
      );
      return null;
    }
  }

  async initializeDefaultTicketCategories(guildId: string) {
    try {
      const defaultCategories = [
        {
          name: 'financeiro',
          emoji: '💰',
          description: 'Assuntos financeiros',
          color: '#00ff00',
        },
        {
          name: 'ajuda',
          emoji: '❓',
          description: 'Precisa de ajuda',
          color: '#0099ff',
        },
        {
          name: 'compra',
          emoji: '🛒',
          description: 'Compras e vendas',
          color: '#ff6600',
        },
      ];

      for (const category of defaultCategories) {
        await this.createTicketCategory(guildId, category);
      }

      this.client.loggerModule.info(
        'DatabaseModule',
        `Categorias padrão de tickets criadas para a guilda ${guildId}`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao inicializar categorias padrão: ${error}`,
      );
    }
  }

  async findExistingTicket(guildId: string, userId: string) {
    try {
      const ticket = await this.prisma.tickets.findFirst({
        where: {
          guildId,
          userId,
          status: 'open',
        },
      });

      if (!ticket) {
        return null;
      }

      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) {
        this.client.loggerModule.warn(
          'DatabaseModule',
          `Guild não encontrada: ${guildId}`,
        );
        return null;
      }

      const channel = guild.channels.cache.get(ticket.channelId);
      if (!channel) {
        this.client.loggerModule.warn(
          'DatabaseModule',
          `Canal do ticket não existe mais: ${ticket.channelId}`,
        );

        await this.updateTicketStatus(ticket.id, 'closed');
        this.client.loggerModule.info(
          'DatabaseModule',
          `Ticket ${ticket.id} marcado como fechado (canal inexistente)`,
        );

        return null;
      }

      return ticket;
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao buscar ticket existente: ${error}`,
      );
      return null;
    }
  }

  async getTicketCategory(categoryId: string) {
    try {
      return await this.prisma.ticketCategories.findUnique({
        where: { id: categoryId },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao obter categoria: ${error}`,
      );
      return null;
    }
  }

  async updateTicketChannel(ticketId: string, channelId: string) {
    try {
      return await this.prisma.tickets.update({
        where: { id: ticketId },
        data: { channelId },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar canal do ticket: ${error}`,
      );
      return null;
    }
  }

  async cleanupOrphanedTickets(guildId: string) {
    try {
      this.client.loggerModule.info(
        'DatabaseModule',
        `Limpando tickets órfãos para guild: ${guildId}`,
      );

      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) {
        this.client.loggerModule.warn(
          'DatabaseModule',
          `Guild não encontrada para limpeza: ${guildId}`,
        );
        return 0;
      }

      const openTickets = await this.prisma.tickets.findMany({
        where: {
          guildId,
          status: 'open',
        },
      });

      let cleanedCount = 0;
      for (const ticket of openTickets) {
        const channel = guild.channels.cache.get(ticket.channelId);
        if (!channel) {
          await this.updateTicketStatus(ticket.id, 'closed');
          cleanedCount++;
          this.client.loggerModule.info(
            'DatabaseModule',
            `Ticket órfão fechado: ${ticket.id}`,
          );
        }
      }

      this.client.loggerModule.info(
        'DatabaseModule',
        `${cleanedCount} tickets órfãos limpos`,
      );
      return cleanedCount;
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao limpar tickets órfãos: ${error}`,
      );
      return 0;
    }
  }

  async claimTicket(ticketId: string, claimedBy: string) {
    try {
      return await this.prisma.tickets.update({
        where: { id: ticketId },
        data: {
          claimedBy,
          claimedAt: new Date(),
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao fazer claim do ticket: ${error}`,
      );
      return null;
    }
  }

  async transferTicket(ticketId: string, newClaimedBy: string) {
    try {
      return await this.prisma.tickets.update({
        where: { id: ticketId },
        data: {
          claimedBy: newClaimedBy,
          claimedAt: new Date(),
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao transferir ticket: ${error}`,
      );
      return null;
    }
  }

  async getTicketById(ticketId: string) {
    try {
      return await this.prisma.tickets.findUnique({
        where: { id: ticketId },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao buscar ticket por ID: ${error}`,
      );
      return null;
    }
  }

  // Métodos para formulários
  async createStaffForm(formData: {
    guildId: string;
    userId: string;
    nickname: string;
    name: string;
    age: string;
    hour: string;
    about: string;
  }) {
    try {
      return await this.prisma.staffForms.create({
        data: {
          id: `${formData.guildId}-${formData.userId}-${Date.now()}`,
          ...formData,
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar formulário de Staff: ${error}`,
      );
      return null;
    }
  }

  async createYouTuberForm(formData: {
    guildId: string;
    userId: string;
    nickname: string;
    youtubeUrl: string;
    videoUrl: string;
  }) {
    try {
      return await this.prisma.youTuberForms.create({
        data: {
          id: `${formData.guildId}-${formData.userId}-${Date.now()}`,
          ...formData,
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao criar formulário de YouTuber: ${error}`,
      );
      return null;
    }
  }

  async getStaffForms(guildId: string, status?: string) {
    try {
      return await this.prisma.staffForms.findMany({
        where: {
          guildId,
          ...(status && { status }),
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao buscar formulários de Staff: ${error}`,
      );
      return [];
    }
  }

  async getYouTuberForms(guildId: string, status?: string) {
    try {
      return await this.prisma.youTuberForms.findMany({
        where: {
          guildId,
          ...(status && { status }),
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao buscar formulários de YouTuber: ${error}`,
      );
      return [];
    }
  }

  async updateStaffFormStatus(
    formId: string,
    status: string,
    reviewedBy: string,
  ) {
    try {
      return await this.prisma.staffForms.update({
        where: { id: formId },
        data: {
          status,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar status do formulário de Staff: ${error}`,
      );
      return null;
    }
  }

  async updateYouTuberFormStatus(
    formId: string,
    status: string,
    reviewedBy: string,
  ) {
    try {
      return await this.prisma.youTuberForms.update({
        where: { id: formId },
        data: {
          status,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao atualizar status do formulário de YouTuber: ${error}`,
      );
      return null;
    }
  }

  async getStaffFormById(formId: string) {
    try {
      return await this.prisma.staffForms.findUnique({
        where: { id: formId },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao buscar formulário de Staff por ID: ${error}`,
      );
      return null;
    }
  }

  async getYouTuberFormById(formId: string) {
    try {
      return await this.prisma.youTuberForms.findUnique({
        where: { id: formId },
      });
    } catch (error) {
      this.client.loggerModule.error(
        'DatabaseModule',
        `Erro ao buscar formulário de YouTuber por ID: ${error}`,
      );
      return null;
    }
  }
}
