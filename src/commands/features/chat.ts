import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from 'discord.js';
import { ClientExtended } from '../../types';
import ollama from 'ollama';

const UNSAFE_REGEX =
  /\b(?:bomba|bomb|explosiv|explosive|detonat|detonar|fabricar|manufactur|instruc|como fazer|arma|armas|drogas|suicid|ataque|weapon|knife|gun|rifle)\b/i;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription(
      'Converse com o modelo (respostas limitadas ao contexto do Cacau BOT).',
    )
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('O que você quer perguntar ao assistente?')
        .setRequired(true),
    ),
  categories: ['features'],

  execute: async (
    client: ClientExtended,
    interaction: ChatInputCommandInteraction,
  ): Promise<any> => {
    const prompt = interaction.options.getString('prompt', true).trim();

    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

    if (UNSAFE_REGEX.test(normalize(prompt))) {
      return interaction.reply({
        content:
          '❌ Não posso ajudar com instruções perigosas, ilegais ou que representem risco.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // usar flags para evitar warning deprecatado
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const systemMessage = `Você é o assistente do Cacau BOT. Responda somente com informações relacionadas ao Cacau BOT, seu comportamento, comandos e funcionalidades presentes neste repositório. Se a pergunta estiver fora do contexto do bot, responda que não pode ajudar e sugira onde procurar (ex: documentação, README). Não forneça instruções perigosas, ilegais ou que incentivem dano. Seja conciso e útil.`;

    try {
      const res: any = await (ollama as any).chat({
        model: 'artifish/llama3.2-uncensored',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
      });

      const content =
        res?.message?.content ?? res?.['message']?.content ?? String(res ?? '');

      // Checar conteúdo gerado pelo modelo (normalizando primeiro)
      client.loggerModule?.info?.('ChatCommand', `Resposta (raw): ${content}`); // Log da resposta crua
      const normalizedContent = normalize(String(content));
      const match = normalizedContent.match(UNSAFE_REGEX);
      client.loggerModule?.info?.(
        'ChatCommand',
        `Resposta (normalized): ${normalizedContent} | match: ${match}`,
      );

      if (match) {
        await interaction.editReply(
          '❌ A resposta gerada contém conteúdo potencialmente perigoso e foi bloqueada.',
        );
        return;
      }

      // Discord limita mensagens a ~2000 chars; fragmentar se necessário
      const maxChunk = 1900;
      const chunks: string[] = [];
      for (let i = 0; i < content.length; i += maxChunk) {
        chunks.push(content.slice(i, i + maxChunk));
      }

      if (chunks.length === 0) {
        await interaction.editReply('Sem resposta do modelo.');
        return;
      }

      await interaction.editReply(chunks.shift() || '');
      for (const chunk of chunks) {
        await interaction.followUp({ content: chunk, ephemeral: true });
      }
    } catch (error: any) {
      client.loggerModule?.error?.(
        'ChatCommand',
        `Erro ao chamar ollama: ${error}`,
      );
      const message = error?.message
        ? `Erro: ${error.message}`
        : 'Erro ao processar a requisição.';
      try {
        await interaction.editReply(`❌ ${message}`);
      } catch (e) {
        // fallback se editReply falhar
        await interaction.followUp({
          content: `❌ ${message}`,
          ephemeral: true,
        });
      }
    }
  },
};
