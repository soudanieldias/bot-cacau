import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong!'),
  categories: ['features'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    if (interaction.isRepliable()) {
      await interaction.reply({
        content: `Pong!\n${client.ws.ping}ms!`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
