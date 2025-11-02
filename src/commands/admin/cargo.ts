import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  Role,
  GuildMember,
  Guild,
} from 'discord.js';
import { ClientExtended, CommandData } from '../../types';

function filterMembersByType(
  members: GuildMember[],
  tipo: string,
  role: Role,
  operation: 'add' | 'remove',
): GuildMember[] {
  switch (tipo) {
    case 'all':
      if (operation === 'add') {
        return members.filter(
          member => !member.user.bot && !member.roles.cache.has(role.id),
        );
      } else {
        return members.filter(
          member => !member.user.bot && member.roles.cache.has(role.id),
        );
      }
    case 'player':
      if (operation === 'add') {
        return members.filter(
          member =>
            !member.user.bot &&
            member.roles.cache.size === 1 &&
            !member.roles.cache.has(role.id),
        );
      } else {
        return members.filter(
          member =>
            !member.user.bot &&
            member.roles.cache.has(role.id) &&
            member.roles.cache.size === 2,
        );
      }
    case 'staff':
      if (operation === 'add') {
        return members.filter(
          member =>
            !member.user.bot &&
            member.roles.cache.size > 1 &&
            !member.roles.cache.has(role.id),
        );
      } else {
        return members.filter(
          member =>
            !member.user.bot &&
            member.roles.cache.has(role.id) &&
            member.roles.cache.size > 2,
        );
      }
    default:
      return [];
  }
}

async function validateRoleOperation(
  interaction: ChatInputCommandInteraction,
  role: Role,
  operation: 'add' | 'remove',
): Promise<boolean> {
  if (!interaction.guild) {
    await interaction.reply({
      content: '❌ Este comando só pode ser usado em servidores!',
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  if (operation === 'remove' && role.id === interaction.guild.id) {
    await interaction.reply({
      content: '❌ Não é possível remover o cargo @everyone!',
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  if (role.position >= interaction.guild.members.me!.roles.highest.position) {
    await interaction.reply({
      content:
        '❌ Não posso gerenciar este cargo! Ele está acima da minha hierarquia.',
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}

async function processAddRole(
  client: ClientExtended,
  interaction: ChatInputCommandInteraction,
  role: Role,
  tipo: string,
  targetMembers: GuildMember[],
): Promise<void> {
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  let processedCount = 0;

  const batches: GuildMember[][] = [];
  for (let i = 0; i < targetMembers.length; i += batchSize) {
    batches.push(targetMembers.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map(async member => {
      try {
        await member.roles.add(
          role,
          `Bulk add cargo por ${interaction.user.tag}`,
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`${member.user.tag}: ${error}`);
      }
    });

    await Promise.all(promises);
    processedCount += batch.length;

    const percentage = Math.round(
      (processedCount / targetMembers.length) * 100,
    );

    await interaction.editReply({
      content: `🔄 Processando cargo "${role.name}" para ${tipo}...\n📊 Progresso: ${percentage}% (${processedCount}/${targetMembers.length})\n✅ Sucessos: ${successCount} | ❌ Erros: ${errorCount}`,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  let resultMessage = `✅ **Bulk de cargo concluído!**\n`;
  resultMessage += `📊 **Estatísticas:**\n`;
  resultMessage += `• ✅ Sucessos: ${successCount}\n`;
  resultMessage += `• ❌ Erros: ${errorCount}\n`;
  resultMessage += `• 🎯 Cargo: ${role.name}\n`;
  resultMessage += `• 👥 Tipo: ${tipo}\n`;

  if (errors.length > 0 && errors.length <= 10) {
    resultMessage += `\n**Erros encontrados:**\n`;
    errors.slice(0, 10).forEach(error => {
      resultMessage += `• ${error}\n`;
    });
    if (errors.length > 10) {
      resultMessage += `• ... e mais ${errors.length - 10} erros\n`;
    }
  }

  await interaction.followUp({
    content: resultMessage,
    flags: MessageFlags.Ephemeral,
  });

  client.loggerModule.info(
    'CargoCommand',
    `Bulk add cargo executado por ${interaction.user.tag}: ${successCount} sucessos, ${errorCount} erros`,
  );
}

async function processRemoveRole(
  client: ClientExtended,
  interaction: ChatInputCommandInteraction,
  role: Role,
  tipo: string,
  targetMembers: GuildMember[],
): Promise<void> {
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  let processedCount = 0;

  const batches: GuildMember[][] = [];
  for (let i = 0; i < targetMembers.length; i += batchSize) {
    batches.push(targetMembers.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map(async member => {
      try {
        await member.roles.remove(
          role,
          `Bulk remove cargo por ${interaction.user.tag}`,
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`${member.user.tag}: ${error}`);
      }
    });

    await Promise.all(promises);
    processedCount += batch.length;

    const percentage = Math.round(
      (processedCount / targetMembers.length) * 100,
    );

    await interaction.editReply({
      content: `🔄 Removendo cargo "${role.name}" de ${tipo}...\n📊 Progresso: ${percentage}% (${processedCount}/${targetMembers.length})\n✅ Sucessos: ${successCount} | ❌ Erros: ${errorCount}`,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  let resultMessage = `✅ **Remoção em massa concluída!**\n`;
  resultMessage += `📊 **Estatísticas:**\n`;
  resultMessage += `• ✅ Sucessos: ${successCount}\n`;
  resultMessage += `• ❌ Erros: ${errorCount}\n`;
  resultMessage += `• 🎯 Cargo: ${role.name}\n`;
  resultMessage += `• 👥 Tipo: ${tipo}\n`;

  if (errors.length > 0 && errors.length <= 10) {
    resultMessage += `\n**Erros encontrados:**\n`;
    errors.slice(0, 10).forEach(error => {
      resultMessage += `• ${error}\n`;
    });
    if (errors.length > 10) {
      resultMessage += `• ... e mais ${errors.length - 10} erros\n`;
    }
  }

  await interaction.followUp({
    content: resultMessage,
    flags: MessageFlags.Ephemeral,
  });

  client.loggerModule.info(
    'CargoCommand',
    `Bulk remove cargo executado por ${interaction.user.tag}: ${successCount} sucessos, ${errorCount} erros`,
  );
}

export default (): CommandData => ({
  data: new SlashCommandBuilder()
    .setName('cargo')
    .setDescription('Gerenciar cargos em massa no servidor [STAFF]')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Adicionar cargo em todos os membros do servidor')
        .addRoleOption(option =>
          option
            .setName('cargo')
            .setDescription('Cargo para adicionar')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de aplicação do cargo')
            .setRequired(true)
            .addChoices(
              { name: 'Todos os membros', value: 'all' },
              { name: 'Apenas players (sem cargos)', value: 'player' },
              { name: 'Apenas staff', value: 'staff' },
            ),
        )
        .addBooleanOption(option =>
          option
            .setName('confirmar')
            .setDescription('Confirmar a operação (obrigatório)')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remover cargo de todos os membros do servidor')
        .addRoleOption(option =>
          option
            .setName('cargo')
            .setDescription('Cargo para remover')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de remoção do cargo')
            .setRequired(true)
            .addChoices(
              { name: 'Todos os membros', value: 'all' },
              { name: 'Apenas players (sem cargos)', value: 'player' },
              { name: 'Apenas staff', value: 'staff' },
            ),
        )
        .addBooleanOption(option =>
          option
            .setName('confirmar')
            .setDescription('Confirmar a operação (obrigatório)')
            .setRequired(true),
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
      const role = interaction.options.getRole('cargo', true) as Role;
      const tipo = interaction.options.getString('tipo', true);
      const confirmar = interaction.options.getBoolean('confirmar', true);

      if (!confirmar) {
        return interaction.reply({
          content: '❌ Você deve confirmar a operação para continuar!',
          flags: MessageFlags.Ephemeral,
        });
      }

      const isValid = await validateRoleOperation(
        interaction,
        role,
        subcommand as 'add' | 'remove',
      );
      if (!isValid) return;

      if (subcommand === 'add') {
        await interaction.reply({
          content: `🔄 Iniciando bulk de cargo "${role.name}" para ${tipo}...`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: `🔄 Iniciando remoção em massa do cargo "${role.name}" para ${tipo}...`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.guild!.members.fetch();
      const members = Array.from(interaction.guild!.members.cache.values());

      const targetMembers = filterMembersByType(
        members,
        tipo,
        role,
        subcommand as 'add' | 'remove',
      );

      if (targetMembers.length === 0) {
        const message =
          subcommand === 'add'
            ? `❌ Nenhum membro encontrado para o tipo "${tipo}"!`
            : `❌ Nenhum membro encontrado com o cargo "${role.name}" para o tipo "${tipo}"!`;
        return interaction.followUp({
          content: message,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (subcommand === 'add') {
        await processAddRole(client, interaction, role, tipo, targetMembers);
      } else {
        await processRemoveRole(client, interaction, role, tipo, targetMembers);
      }
    } catch (error) {
      client.loggerModule.error(
        'CargoCommand',
        `Erro ao executar operação de cargo: ${error}`,
      );

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Erro ao executar operação de cargo. Tente novamente.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.followUp({
          content: '❌ Erro ao executar operação de cargo. Tente novamente.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
});
