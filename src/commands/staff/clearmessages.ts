import { Client, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('clearmessages')
    .setDescription('Remove um número especificado de mensagens no canal atual. [STAFF]')
    .addIntegerOption(quantity => (
      quantity.setName('quantity')
      .setDescription('Digite a quantidade de mensagens a serem deletadas (Um número entre 1-100).')
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true)
    )),
  categories: ['staff'],

	async execute (_client:Client<true>, interaction:ChatInputCommandInteraction): Promise<void> {
    try {
      if (interaction.isRepliable()) {
        const hasAdminRole = interaction.memberPermissions?.has([PermissionFlagsBits.Administrator]);
        const MESSAGES_TO_DELETE = Number(interaction.options.get('quantity')!.value);

        if (!hasAdminRole) await interaction.reply('ERRO: Não Autorizado!!!');

        await (interaction.channel as TextChannel).bulkDelete(MESSAGES_TO_DELETE, true);

        await interaction.reply({ content: `Foram limpas ${MESSAGES_TO_DELETE} mensagens do canal`});
      }
    } catch (error) {
      console.error('[ClearMessages] Error: ', error);
    }
  }
});
