import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  CacheType,
  PermissionFlagsBits,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Gerencia a atividade e presença do bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Mostra a atividade e presença atual do bot'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Define a atividade do bot')
        .addStringOption(option =>
          option
            .setName('activity')
            .setDescription('Tipo de atividade')
            .setRequired(true)
            .addChoices(
              { name: 'Jogando', value: 'PLAYING' },
              { name: 'Transmitindo', value: 'STREAMING' },
              { name: 'Ouvindo', value: 'LISTENING' },
              { name: 'Assistindo', value: 'WATCHING' },
              { name: 'Competindo', value: 'COMPETING' },
            ),
        )
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Nome da atividade')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('url')
            .setDescription('URL para streaming (apenas para STREAMING)')
            .setRequired(false),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('presence')
        .setDescription(
          'Define a presença completa do bot (atividade + status)',
        )
        .addStringOption(option =>
          option
            .setName('activity')
            .setDescription('Tipo de atividade')
            .setRequired(true)
            .addChoices(
              { name: 'Jogando', value: 'PLAYING' },
              { name: 'Transmitindo', value: 'STREAMING' },
              { name: 'Ouvindo', value: 'LISTENING' },
              { name: 'Assistindo', value: 'WATCHING' },
              { name: 'Competindo', value: 'COMPETING' },
            ),
        )
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Nome da atividade')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('status')
            .setDescription('Status do bot')
            .setRequired(true)
            .addChoices(
              { name: 'Online', value: 'online' },
              { name: 'Ausente', value: 'idle' },
              { name: 'Não Perturbe', value: 'dnd' },
              { name: 'Invisível', value: 'invisible' },
            ),
        )
        .addStringOption(option =>
          option
            .setName('url')
            .setDescription('URL para streaming (apenas para STREAMING)')
            .setRequired(false),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Remove a atividade atual do bot'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Reseta para a presença padrão do bot'),
    ),
  categories: ['admin'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    try {
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'get':
          await client.activityModule.handleGetCommand(interaction);
          break;
        case 'set':
          await client.activityModule.handleSetCommand(interaction);
          break;
        case 'presence':
          await client.activityModule.handlePresenceCommand(interaction);
          break;
        case 'clear':
          await client.activityModule.handleClearCommand(interaction);
          break;
        case 'reset':
          await client.activityModule.handleClearCommand(interaction);
          break;
        default:
          await client.activityModule.handleInvalidSubcommand(interaction);
      }
    } catch (error) {
      await client.loggerModule.error(
        'ActivityModule',
        'Erro ao manipular as atividades',
      );
    }
  },
});
