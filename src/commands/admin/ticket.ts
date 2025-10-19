import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
} from 'discord.js';
import { ClientExtended } from '../../types';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Sistema de Ticket.')
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('config')
        .setDescription('Configure a funcionalidade de tickets')
        .addChannelOption((option: any) =>
          option
            .setName('canal')
            .setDescription(
              'Canal que a mensagem para criar ticket será enviada.',
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption((option: any) =>
          option
            .setName('logs')
            .setDescription('Canal que as logs será enviada.')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption((option: any) =>
          option
            .setName('categoria')
            .addChannelTypes(ChannelType.GuildCategory)
            .setDescription(
              'Selecione uma categoria a qual os tickets serão criados.',
            )
            .setRequired(true),
        )
        .addStringOption((option: any) =>
          option
            .setName('botao')
            .setDescription('O nome do botão de abrir tickets.')
            .setRequired(true),
        )
        .addRoleOption((option: any) =>
          option
            .setName('cargo')
            .setDescription('Cargo que podera ver os tickets.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('adduser')
        .setDescription('Adicione um membro a um ticket.')
        .addUserOption((option: any) =>
          option
            .setName('membro')
            .setDescription('Membro que será adicionado ao ticket.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('removeuser')
        .setDescription('Remova um membro do ticket.')
        .addUserOption((option: any) =>
          option
            .setName('membro')
            .setDescription('Membro que será removido do ticket.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('mencionar')
        .setDescription('Mencione o membro que abriu o ticket em seu privado.'),
    )
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('sendmodal')
        .setDescription('Reenvia o modal de tickets no canal atual.'),
    )
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('cleanup')
        .setDescription('Limpa tickets órfãos (canais que não existem mais).'),
    )
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('transfer')
        .setDescription('Transfere o ticket para outro atendente.')
        .addUserOption((option: any) =>
          option
            .setName('atendente')
            .setDescription('Atendente que receberá o ticket.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand: any) =>
      subcommand
        .setName('close')
        .setDescription(
          'Fecha um ticket com modal de fechamento e transcrição.',
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
      case 'close':
        // await client.ticketModule.ticketClose(client, interaction);
        await client.ticketModule.ticketTranscript(client, interaction);
        break;
    }
  },
};
