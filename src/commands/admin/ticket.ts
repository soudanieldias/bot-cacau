import { ChatInputCommandInteraction } from 'discord.js';
import { ClientExtended } from '../../types';

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { TicketModule } = require('../../modules');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Sistema de Ticket.')
    .setDMPermission(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName('config')
        .setDescription('Configure a funcionalidade de tickets')
        .addChannelOption(option =>
          option
            .setName('canal')
            .setDescription(
              'Canal que a mensagem para criar ticket será enviada.',
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption(option =>
          option
            .setName('logs')
            .setDescription('Canal que as logs será enviada.')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption(option =>
          option
            .setName('categoria')
            .addChannelTypes(ChannelType.GuildCategory)
            .setDescription(
              'Selecione uma categoria a qual os tickets serão criados.',
            )
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('botao')
            .setDescription('O nome do botão de abrir tickets.')
            .setRequired(true),
        )
        .addRoleOption(option =>
          option
            .setName('cargo')
            .setDescription('Cargo que podera ver os tickets.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('adduser')
        .setDescription('Adicione um membro a um ticket.')
        .addUserOption(option =>
          option
            .setName('membro')
            .setDescription('Membro que será adicionado ao ticket.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('removeuser')
        .setDescription('Remova um membro do ticket.')
        .addUserOption(option =>
          option
            .setName('membro')
            .setDescription('Membro que será removido do ticket.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('mencionar')
        .setDescription('Mencione o membro que abriu o ticket em seu privado.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('sendmodal')
        .setDescription('Reenvia o modal de tickets no canal atual.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cleanup')
        .setDescription('Limpa tickets órfãos (canais que não existem mais).'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('transfer')
        .setDescription('Transfere o ticket para outro atendente.')
        .addUserOption(option =>
          option
            .setName('atendente')
            .setDescription('Atendente que receberá o ticket.')
            .setRequired(true),
        ),
    ),
  categories: ['staff'],

  execute: async (
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ) => {
    switch (interaction.options.getSubcommand()) {
      case 'config':
        await client.ticketModule.config(client, interaction);
        break;
      case 'adduser':
        await client.ticketModule.addUser(client, interaction);
        break;
      case 'removeuser':
        await client.ticketModule.removeUser(client, interaction);
        break;
      case 'mencionar':
        await client.ticketModule.ticketMentionUser(client, interaction);
        break;
      case 'sendmodal':
        await client.ticketModule.sendModal(client, interaction);
        break;
      case 'cleanup':
        await client.ticketModule.cleanupOrphanedTickets(client, interaction);
        break;
      case 'transfer':
        await client.ticketModule.transferTicket(client, interaction);
        break;
    }
  },
};
