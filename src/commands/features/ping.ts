import { ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder } from "discord.js";
import { CommandData } from "../../types";

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong!'),
  categories: ['features'],

  async execute(
    client: Client<true>,
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    if(interaction.isRepliable()) {
      await interaction.reply({
        content: `Pong!\n${client.ws.ping}ms!`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
