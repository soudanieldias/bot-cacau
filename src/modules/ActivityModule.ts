import {
  ActivityType,
  CacheType,
  ChatInputCommandInteraction,
  MessageFlags,
  PresenceStatusData,
} from 'discord.js';
import { ClientExtended } from '../types';

export class ActivityModule {
  constructor(private client: ClientExtended) {
    client.once('clientReady', () => {
      this.setDefaultActivity();
    });
  }

  private setDefaultActivity(): void {
    try {
      this.client.user?.setActivity(
        process.env.PRESENCE_MESSAGE || 'Cacau BOT',
        {
          type: ActivityType.Playing,
          url: process.env.BOT_PRESENCE_URL,
        },
      );

      this.client.loggerModule.info(
        'ActivityModule',
        '✅ Atividade padrão definida com sucesso!',
      );
    } catch (error) {
      this.client.loggerModule.error(
        'ActivityModule',
        `❌ Erro ao definir atividade padrão: ${error}`,
      );
    }
  }

  public getCurrentActivity(): { activity: any; status: string | undefined } {
    const activity = this.client.user?.presence.activities[0];
    const status = this.client.user?.presence.status;

    return { activity, status };
  }

  public setActivity(
    activityType: string,
    name: string,
    url?: string,
  ): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const type = ActivityType[activityType as keyof typeof ActivityType];

        if (activityType === 'STREAMING' && !url) {
          this.client.loggerModule.error(
            'ActivityModule',
            '❌ URL é obrigatória para atividades do tipo STREAMING!',
          );
          resolve(false);
          return;
        }

        if (activityType === 'STREAMING' && url) {
          this.client.user?.setActivity(name, {
            type,
            url,
          });
        } else {
          this.client.user?.setActivity(name, {
            type,
          });
        }

        this.client.loggerModule.info(
          'ActivityModule',
          `✅ Atividade alterada para: ${activityType} ${name}`,
        );
        resolve(true);
      } catch (error) {
        this.client.loggerModule.error(
          'ActivityModule',
          `❌ Erro ao definir atividade: ${error}`,
        );
        resolve(false);
      }
    });
  }

  public setPresence(
    activityType: string,
    name: string,
    status: PresenceStatusData,
    url?: string,
  ): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const type = ActivityType[activityType as keyof typeof ActivityType];

        if (activityType === 'STREAMING' && !url) {
          this.client.loggerModule.error(
            'ActivityModule',
            '❌ URL é obrigatória para atividades do tipo STREAMING!',
          );
          resolve(false);
          return;
        }

        const presenceOptions: any = {
          status,
          activities: [
            {
              name,
              type,
            },
          ],
        };

        if (activityType === 'STREAMING' && url) {
          presenceOptions.activities[0].url = url;
        }

        this.client.user?.setPresence(presenceOptions);

        this.client.loggerModule.info(
          'ActivityModule',
          `✅ Presença alterada para: ${status} | ${activityType} ${name}`,
        );
        resolve(true);
      } catch (error) {
        this.client.loggerModule.error(
          'ActivityModule',
          `❌ Erro ao definir presença: ${error}`,
        );
        resolve(false);
      }
    });
  }

  public clearActivity(): Promise<boolean> {
    return new Promise(resolve => {
      try {
        this.client.user?.setPresence({ activities: [] });
        this.client.loggerModule.info(
          'ActivityModule',
          '✅ Atividade removida com sucesso!',
        );
        resolve(true);
      } catch (error) {
        this.client.loggerModule.error(
          'ActivityModule',
          `❌ Erro ao remover atividade: ${error}`,
        );
        resolve(false);
      }
    });
  }

  public resetPresence(): Promise<boolean> {
    return new Promise(resolve => {
      this.setDefaultActivity();
    });
  }

  public formatActivityForDisplay(): string {
    const { activity, status } = this.getCurrentActivity();

    if (!activity) {
      return `ℹ️ **Status Atual:** ${status || 'Desconhecido'}\n📊 **Atividade:** Nenhuma atividade definida`;
    }

    return `📊 **Status Atual:** ${status || 'Desconhecido'}\n🎮 **Atividade:**\n**Tipo:** ${activity.type}\n**Nome:** ${activity.name}${activity.url ? `\n**URL:** ${activity.url}` : ''}`;
  }

  public async handleGetCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const formattedActivity = this.formatActivityForDisplay();

    await interaction.reply({
      content: formattedActivity,
      flags: [MessageFlags.Ephemeral],
    });
  }

  public async handleSetCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const activity = interaction.options.getString('activity', true);
    const name = interaction.options.getString('name', true);
    const url = interaction.options.getString('url', false);

    const success = await this.setActivity(activity, name, url || undefined);

    if (success) {
      await interaction.reply({
        content: `✅ Atividade alterada para: **${activity} ${name}**`,
        flags: [MessageFlags.Ephemeral],
      });
    } else {
      await interaction.reply({
        content: '❌ Erro ao alterar atividade!',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  public async handlePresenceCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const activity = interaction.options.getString('activity', true);
    const name = interaction.options.getString('name', true);
    const status = interaction.options.getString('status', true);
    const url = interaction.options.getString('url', false);

    const success = await this.setPresence(
      activity,
      name,
      status as any,
      url || undefined,
    );

    if (success) {
      await interaction.reply({
        content: `✅ Presença alterada para: **${status}** | **${activity} ${name}**`,
        flags: [MessageFlags.Ephemeral],
      });
    } else {
      await interaction.reply({
        content: '❌ Erro ao alterar presença!',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  public async handleClearCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const success = await this.clearActivity();

    if (success) {
      await interaction.reply({
        content: '✅ Atividade removida com sucesso!',
        flags: [MessageFlags.Ephemeral],
      });
    } else {
      await interaction.reply({
        content: '❌ Erro ao remover atividade!',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  public async handleInvalidSubcommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.reply({
      content: '❌ Subcomando inválido!',
      flags: [MessageFlags.Ephemeral],
    });
  }

  public async handleCommandError(
    interaction: ChatInputCommandInteraction<CacheType>,
    error: any,
  ): Promise<void> {
    console.error('Erro no comando activity:', error);
    await interaction.reply({
      content: '❌ Erro ao executar o comando!',
      flags: [MessageFlags.Ephemeral],
    });
  }
}
