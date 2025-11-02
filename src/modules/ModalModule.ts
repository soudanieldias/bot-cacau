import { ClientExtended } from '../types';
import staffModal from '../modals/staff-modal';
import youtuberModal from '../modals/youtuber-modal';
import { MessageFlags } from 'discord.js';

export class ModalModule {
  constructor(private client: ClientExtended) {
    this.client = client;
  }

  public async initialize(): Promise<void> {
    try {
      this.client.loggerModule.info(
        'ModalModule',
        'Carregando módulo de modais.',
      );

      this.client.modals.set('staff-form', {
        data: staffModal.data,
        customId: 'staff-form',
        execute: async (client: any, interaction: any) => {
          return await this.sendStaffModal(client, interaction);
        },
      });

      this.client.modals.set('youtuber-form', {
        data: youtuberModal.data,
        customId: 'youtuber-form',
        execute: async (client: any, interaction: any) => {
          return await this.sendYouTuberModal(client, interaction);
        },
      });

      this.client.loggerModule.info(
        'ModalModule',
        `✅ Carregados ${this.client.modals.size} modais na memória`,
      );

      this.client.loggerModule.info(
        'ModalModule',
        `📋 Modais disponíveis: ${Array.from(this.client.modals.keys()).join(', ')}`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'ModalModule',
        `Erro ao carregar modais: ${error}`,
      );
    }
  }

  public getModal(modalName: string) {
    return this.client.modals.get(modalName);
  }

  public getAvailableModals(): string[] {
    return Array.from(this.client.modals.keys());
  }

  public getAllModals() {
    return this.client.modals;
  }

  public async sendStaffModal(_client: any, interaction: any): Promise<void> {
    try {
      const { staffFormResponseEmbed } = await import(
        '../embeds/staff-form-response-embed'
      );
      const generateId = () => Math.random().toString(36).substr(2, 9);

      const formData = {
        id: generateId(),
        nickname: interaction.fields.getTextInputValue('nickname'),
        name: interaction.fields.getTextInputValue('name'),
        age: interaction.fields.getTextInputValue('age'),
        hour: interaction.fields.getTextInputValue('hour'),
        about: interaction.fields.getTextInputValue('experience'),
      };

      const responseEmbed = staffFormResponseEmbed(
        interaction.user,
        interaction.guild,
        formData,
      );

      const guildSettings = await this.client.databaseModule.getSettings(
        interaction.guild.id,
      );

      // this.client.loggerModule.info(
      //   'ModalModule',
      //   `Configurações da guild: ${JSON.stringify(guildSettings, null, 2)}`,
      // );

      const logsChannelId = (guildSettings as any)?.staffFormLogsChannelId;

      this.client.loggerModule.info(
        'ModalModule',
        `Canal de logs configurado: ${logsChannelId}`,
      );

      let logsChannel = interaction.channel;

      if (logsChannelId) {
        try {
          const configuredChannel =
            await interaction.guild.channels.fetch(logsChannelId);
          if (configuredChannel && configuredChannel.isTextBased()) {
            logsChannel = configuredChannel;
            this.client.loggerModule.info(
              'ModalModule',
              `Usando canal configurado: ${logsChannelId}`,
            );
          }
        } catch (error) {
          this.client.loggerModule.warn(
            'ModalModule',
            `Canal de logs de staff não encontrado: ${logsChannelId}`,
          );
        }
      } else {
        this.client.loggerModule.info(
          'ModalModule',
          'Nenhum canal de logs configurado, usando canal atual',
        );
        logsChannel = interaction.channel;
      }

      if (logsChannel && logsChannel.isTextBased()) {
        await logsChannel.send({
          embeds: [responseEmbed],
        });
      }

      await interaction.reply({
        content:
          '✅ Formulário de staff enviado com sucesso! Nossa equipe analisará sua candidatura em breve.',
        flags: MessageFlags.Ephemeral,
      });

      this.client.loggerModule.info(
        'ModalModule',
        `Formulário de staff enviado por ${interaction.user.tag} (${interaction.user.id})`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'ModalModule',
        `Erro ao processar formulário de staff: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao processar formulário. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  public async sendYouTuberModal(
    _client: any,
    interaction: any,
  ): Promise<void> {
    try {
      const { youTuberResponseEmbed } = await import(
        '../embeds/youtuber-form-response-embed'
      );
      const generateId = () => Math.random().toString(36).substr(2, 9);

      const formData = {
        id: generateId(),
        nickname: interaction.fields.getTextInputValue('nickname'),
        youtubeUrl: interaction.fields.getTextInputValue('youtubeUrl'),
        videoUrl: interaction.fields.getTextInputValue('videoUrl'),
      };

      const responseEmbed = youTuberResponseEmbed(
        interaction.user,
        interaction.guild,
        formData,
      );

      const guildSettings = await this.client.databaseModule.getSettings(
        interaction.guild.id,
      );

      this.client.loggerModule.info(
        'ModalModule',
        `Configurações da guild: ${JSON.stringify(guildSettings, null, 2)}`,
      );

      const logsChannelId = (guildSettings as any)?.youtuberFormLogsChannelId;

      this.client.loggerModule.info(
        'ModalModule',
        `Canal de logs configurado: ${logsChannelId}`,
      );

      let logsChannel = interaction.channel;

      if (logsChannelId) {
        try {
          const configuredChannel =
            await interaction.guild.channels.fetch(logsChannelId);
          if (configuredChannel && configuredChannel.isTextBased()) {
            logsChannel = configuredChannel;
            this.client.loggerModule.info(
              'ModalModule',
              `Usando canal configurado: ${logsChannelId}`,
            );
          }
        } catch (error) {
          this.client.loggerModule.warn(
            'ModalModule',
            `Canal de logs de youtuber não encontrado: ${logsChannelId}`,
          );
        }
      } else {
        this.client.loggerModule.info(
          'ModalModule',
          'Nenhum canal de logs configurado, usando canal atual',
        );
      }

      if (logsChannel && logsChannel.isTextBased()) {
        await logsChannel.send({
          embeds: [responseEmbed],
        });
      }

      await interaction.reply({
        content:
          '✅ Formulário de YouTuber enviado com sucesso! Nossa equipe analisará sua candidatura em breve.',
        flags: MessageFlags.Ephemeral,
      });

      this.client.loggerModule.info(
        'ModalModule',
        `Formulário de youtuber enviado por ${interaction.user.tag} (${interaction.user.id})`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'ModalModule',
        `Erro ao processar formulário de youtuber: ${error}`,
      );
      await interaction.reply({
        content: '❌ Erro ao processar formulário. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
