import { globSync } from 'fs';
import { ClientExtended } from '../types';

export class EmbedModule {
  private embeds: Map<string, any> = new Map();

  constructor(private client: ClientExtended) {
    this.client = client;
  }

  public async initialize(): Promise<void> {
    try {
      this.client.loggerModule.info(
        'EmbedModule',
        'Carregando módulo de embeds.',
      );

      const embedFiles = globSync('src/embeds/**/*.ts').flat();

      this.client.loggerModule.info(
        'EmbedModule',
        `Encontrados ${embedFiles.length} arquivos de embed:`,
      );

      embedFiles.forEach((filePath: string) => {
        this.client.loggerModule.info('EmbedModule', `  📁 ${filePath}`);
      });

      let loadedEmbeds = 0;
      let skippedEmbeds = 0;
      let duplicateEmbeds = 0;

      for await (const filePath of embedFiles) {
        try {
          const modulePath = filePath.startsWith('.')
            ? filePath
            : `../../${filePath}`;
          const embedModule = await import(modulePath);

          // Procurar por exports nomeados (export const)
          const embedExports = Object.keys(embedModule).filter(
            key => embedModule[key] && typeof embedModule[key] === 'function',
          );

          if (embedExports.length === 0) {
            this.client.loggerModule.error(
              'EmbedModule',
              `❌ Nenhum embed válido encontrado em ${filePath}`,
            );
            skippedEmbeds++;
            continue;
          }

          for (const exportName of embedExports) {
            const embed = embedModule[exportName];

            if (!embed || typeof embed !== 'function') {
              this.client.loggerModule.error(
                'EmbedModule',
                `❌ Embed inválido em ${filePath} - não é uma função`,
              );
              skippedEmbeds++;
              continue;
            }

            // Extrair o nome do embed do nome do arquivo
            const embedName =
              filePath.split('/').pop()?.replace('.ts', '') || exportName;

            if (this.embeds.has(embedName)) {
              this.client.loggerModule.warn(
                'EmbedModule',
                `⚠️ Embed duplicado: ${embedName} já existe, ignorando ${filePath}`,
              );
              duplicateEmbeds++;
              continue;
            }

            this.embeds.set(embedName, embed);

            this.client.loggerModule.info(
              'EmbedModule',
              `✅ Carregado embed: ${embedName}`,
            );
            loadedEmbeds++;
          }
        } catch (error) {
          this.client.loggerModule.error(
            'EmbedModule',
            `❌ Erro ao carregar embed ${filePath}: ${error}`,
          );
          skippedEmbeds++;
        }
      }

      this.client.loggerModule.info(
        'EmbedModule',
        `📊 Resumo: ${loadedEmbeds} carregados, ${skippedEmbeds} ignorados, ${duplicateEmbeds} duplicados`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'EmbedModule',
        `Erro ao carregar embeds: ${error}`,
      );
    }
  }

  public getEmbed(embedName: string) {
    return this.embeds.get(embedName);
  }

  public getAvailableEmbeds(): string[] {
    return Array.from(this.embeds.keys());
  }

  public getAllEmbeds() {
    return this.embeds;
  }
}
