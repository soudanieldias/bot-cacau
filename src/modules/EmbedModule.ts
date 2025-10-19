import { TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { ClientExtended } from '../types';
import { staffFormEmbed } from '../embeds/staff-form';
import { youTuberFormEmbed } from '../embeds/youtuber-form';

export class EmbedModule {
  private embeds: Map<string, any> = new Map();

  constructor(private client: ClientExtended) {
    this.client = client;
  }

  public async initialize(): Promise<void> {
    try {
      this.client.loggerModule.info(
        'EmbedModule',
        'Carregando módulo de embeds.',
      );

      // Carregar embeds estaticamente na memória
      this.embeds.set('staff-form', staffFormEmbed);
      this.embeds.set('youtuber-form', youTuberFormEmbed);

      this.client.loggerModule.info(
        'EmbedModule',
        `✅ Carregados ${this.embeds.size} embeds na memória`,
      );

      this.client.loggerModule.info(
        'EmbedModule',
        `📋 Embeds disponíveis: ${Array.from(this.embeds.keys()).join(', ')}`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'EmbedModule',
        `Erro ao carregar embeds: ${error}`,
      );
    }
  }

  public getEmbed(embedName: string) {
    return this.embeds.get(embedName);
  }

  public getAvailableEmbeds(): string[] {
    return Array.from(this.embeds.keys());
  }

  public getAllEmbeds() {
    return this.embeds;
  }

  public async sendEmbed(
    embedName: string,
    channel: TextChannel | NewsChannel | ThreadChannel,
  ): Promise<void> {
    try {
      this.client.loggerModule.info(
        'EmbedModule',
        `Tentando enviar embed: ${embedName}`,
      );
      this.client.loggerModule.info(
        'EmbedModule',
        `Embeds disponíveis: ${Array.from(this.embeds.keys()).join(', ')}`,
      );

      const embedFunction = this.getEmbed(embedName);

      if (!embedFunction) {
        throw new Error(`Embed '${embedName}' não encontrado`);
      }

      const result = embedFunction(channel.guild);

      await channel.send(result);

      this.client.loggerModule.info(
        'EmbedModule',
        `Embed ${embedName} enviado no canal ${channel.id}`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'EmbedModule',
        `Erro ao enviar embed ${embedName}: ${error}`,
      );
      throw error;
    }
  }
}
