import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('clearmessages')
    .setDescription(
      'Remove um número especificado de mensagens no canal atual. [STAFF]',
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(quantity =>
      quantity
        .setName('quantity')
        .setDescription(
          'Quantas mensagens deseja remover? (Um número entre 1-100).',
        )
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    ),
  categories: ['staff'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    try {
      if (!(await client.interactionModule.checkifUserIsDeveloper(interaction)))
        return;

      if (interaction.isRepliable()) {
        const MESSAGES_TO_DELETE = Number(
          interaction.options.get('quantity')!.value,
        );

        await (interaction.channel as TextChannel).bulkDelete(
          MESSAGES_TO_DELETE,
          true,
        );

        await interaction.reply({
          content: `Foram limpas ${MESSAGES_TO_DELETE} mensagens do canal`,
        });
      }
    } catch (error) {
      console.error('[ClearMessages] Error: ', error);
    }
  },
});
