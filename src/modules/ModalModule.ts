import { globSync } from 'fs';
import { ClientExtended } from '../types';

export class ModalModule {
  constructor(private client: ClientExtended) {
    this.client = client;
  }

  public async initialize(): Promise<void> {
    try {
      this.client.loggerModule.info(
        'ModalModule',
        'Carregando módulo de modais.',
      );

      const modalFiles = globSync('src/modals/**/*.ts').flat();

      this.client.loggerModule.info(
        'ModalModule',
        `Encontrados ${modalFiles.length} arquivos de modal:`,
      );

      modalFiles.forEach((filePath: string) => {
        this.client.loggerModule.info('ModalModule', `  📁 ${filePath}`);
      });

      let loadedModals = 0;
      let skippedModals = 0;
      let duplicateModals = 0;

      for await (const filePath of modalFiles) {
        try {
          const modulePath = filePath.startsWith('.')
            ? filePath
            : `../../${filePath}`;
          const modalModule = await import(modulePath);
          const modalExport = modalModule.default || modalModule;
          const modal =
            typeof modalExport === 'function' ? modalExport() : modalExport;

          if (!modal || !modal.data) {
            this.client.loggerModule.error(
              'ModalModule',
              `❌ Modal inválido em ${filePath} - sem data`,
            );
            skippedModals++;
            continue;
          }

          const customId = modal.data.customId;

          if (!customId) {
            this.client.loggerModule.error(
              'ModalModule',
              `❌ Modal sem customId em ${filePath}`,
            );
            skippedModals++;
            continue;
          }

          if (this.client.modals && this.client.modals.has(customId)) {
            this.client.loggerModule.warn(
              'ModalModule',
              `⚠️ Modal duplicado: ${customId} já existe, ignorando ${filePath}`,
            );
            duplicateModals++;
            continue;
          }

          if (this.client.modals) {
            this.client.modals.set(customId, modal);

            this.client.loggerModule.info(
              'ModalModule',
              `✅ Carregado modal: ${customId}`,
            );
            loadedModals++;
          } else {
            this.client.loggerModule.error(
              'ModalModule',
              `❌ this.client.modals não está disponível para ${customId}`,
            );
            skippedModals++;
          }
        } catch (error) {
          this.client.loggerModule.error(
            'ModalModule',
            `❌ Erro ao carregar modal ${filePath}: ${error}`,
          );
          skippedModals++;
        }
      }

      this.client.loggerModule.info(
        'ModalModule',
        `📊 Resumo: ${loadedModals} carregados, ${skippedModals} ignorados, ${duplicateModals} duplicados`,
      );
    } catch (error) {
      this.client.loggerModule.error(
        'ModalModule',
        `❌ Erro ao carregar módulo de modais: ${error}`,
      );
    }
  }
}
