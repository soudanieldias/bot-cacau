import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ChannelType,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('forms')
    .setDescription('Sistema de Formulários [STAFF]')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('send-embed')
        .setDescription('Enviar embed de formulário')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Tipo de formulário')
            .setRequired(true)
            .addChoices(
              { name: 'Staff', value: 'staff' },
              { name: 'YouTuber', value: 'youtuber' },
            ),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('config')
        .setDescription('Configurar canais de logs dos formulários')
        .addChannelOption(option =>
          option
            .setName('staff-channel-logs')
            .setDescription('Canal para logs dos formulários de Staff')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        )
        .addChannelOption(option =>
          option
            .setName('youtuber-channel-logs')
            .setDescription('Canal para logs dos formulários de YouTuber')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    ),

  categories: ['staff'],

  async execute(
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> {
    try {
      if (!(await client.interactionModule.checkifUserIsDeveloper(interaction)))
        return;

      if (!interaction.isRepliable()) return;

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'send-embed') {
        const formType = interaction.options.getString('type', true);

        if (interaction.channel && !interaction.channel.isDMBased()) {
          const embedName =
            formType === 'staff' ? 'staff-form-embed' : 'youtuber-form-embed';
          await client.embedModule.sendEmbed(
            embedName,
            interaction.channel as any,
          );
        }

        await interaction.reply({
          content: `✅ Embed de formulário ${formType} enviado com sucesso!`,
          flags: MessageFlags.Ephemeral,
        });

        client.loggerModule.info(
          'FormsCommand',
          `Embed ${formType} enviado por ${interaction.user.tag} em ${interaction.guild!.name}`,
        );
      }

      if (subcommand === 'config') {
        const staffLogsChannel =
          interaction.options.getChannel('staff-channel-logs');
        const youtuberLogsChannel = interaction.options.getChannel(
          'youtuber-channel-logs',
        );

        if (!staffLogsChannel && !youtuberLogsChannel) {
          return interaction.reply({
            content: '❌ Você deve especificar pelo menos um canal!',
            flags: MessageFlags.Ephemeral,
          });
        }

        const updateData: any = {};

        if (staffLogsChannel) {
          updateData.staffFormLogsChannelId = staffLogsChannel.id;
        }

        if (youtuberLogsChannel) {
          updateData.youtuberFormLogsChannelId = youtuberLogsChannel.id;
        }

        client.loggerModule.info(
          'FormsCommand',
          `Dados para atualização: ${JSON.stringify(updateData, null, 2)}`,
        );

        await client.databaseModule.createSettings(
          interaction.guild!.id,
          updateData,
        );

        client.loggerModule.info(
          'FormsCommand',
          'Configurações salvas no banco de dados',
        );

        let responseMessage = '✅ Configuração atualizada com sucesso!\n\n';

        if (staffLogsChannel) {
          responseMessage += `📝 **Logs de Staff:** <#${staffLogsChannel.id}>\n`;
        }

        if (youtuberLogsChannel) {
          responseMessage += `📹 **Logs de YouTuber:** <#${youtuberLogsChannel.id}>\n`;
        }

        await interaction.reply({
          content: responseMessage,
          flags: MessageFlags.Ephemeral,
        });

        client.loggerModule.info(
          'FormsCommand',
          `Configuração de formulários atualizada por ${interaction.user.tag} em ${interaction.guild!.name}`,
        );
      }
    } catch (error) {
      client.loggerModule.error(
        'FormsCommand',
        `Erro na configuração: ${error}`,
      );

      await interaction.reply({
        content: '❌ Erro ao configurar. Tente novamente.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
