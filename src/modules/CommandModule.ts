import { globSync } from 'fs';
import { ClientExtended } from '../types';

export class CommandModule {
  constructor(private client: ClientExtended) {
    this.client = client;
  }

  public async initialize(): Promise<void> {
    this.client.loggerModule.info(
      'CommandModule', 'Carregando módulo de comandos.'
    );

    const commandFiles = [ ...globSync('src/commands/**/*.ts').flat() ];

    this.client.loggerModule.info(
      'CommandModule',
      `Encontrados ${commandFiles.length} arquivos de comando:`,
    );

    commandFiles.forEach((filePath: string) => {
      this.client.loggerModule.info('CommandModule', `  📁 ${filePath}`);
    });

    let loadedCommands = 0;
    let skippedCommands = 0;
    let duplicateCommands = 0;

    const restCommands: any[] = [];
    for (const filePath of commandFiles) {
      try {
        const modulePath = filePath.startsWith('.') ? filePath : `../../${filePath}`;
        const commandModule = await import(modulePath);
        const commandExport = commandModule.default || commandModule;
        const command = typeof commandExport === 'function' ? commandExport() : commandExport;

        if (!command || !command.data) {
          this.client.loggerModule.warn(
            'CommandModule',
            `❌ Comando inválido em ${filePath} - sem data`,
          );
          skippedCommands++;
          continue;
        }

        const { name, description } = command.data;

        if (!name || !description) {
          this.client.loggerModule.warn(
            'CommandModule',
            `❌ Comando incompleto em ${filePath} - nome: "${name}", descrição: "${description}"`,
          );
          skippedCommands++;
          continue;
        }

        if (
          this.client.slashCommands &&
          this.client.slashCommands.has(name)
        ) {
          this.client.loggerModule.warn(
            'CommandModule',
            `⚠️ Comando duplicado: ${name} já existe, ignorando ${filePath}`,
          );
          duplicateCommands++;
          continue;
        }

        if (this.client.slashCommands) {
          this.client.slashCommands.set(name, command);
          restCommands.push(command.data);
          this.client.loggerModule.info(
            'CommandModule',
            `✅ Carregado comando: ${name.toLowerCase()} - ${description}`,
          );
          loadedCommands++;
        } else {
          this.client.loggerModule.error(
            'CommandModule',
            `❌ this.client.slashCommands não está disponível para ${name}`,
          );
          skippedCommands++;
        }
      } catch (error) {
        this.client.loggerModule.error(
          'CommandModule',
          `❌ Erro ao carregar comando ${filePath}: ${error}`,
        );
        skippedCommands++;
      }
    }
  }
}
