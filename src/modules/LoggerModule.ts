import { Client, EmbedBuilder } from 'discord.js';
import colors from 'colors';
import * as fs from 'fs';
import * as path from 'path';

export class LoggerModule {
  private debug: boolean;
  private debugToDev: boolean;
  private developerId: string;
  private logsDir: string;
  private currentLogFile: string;
  private latestLogFile: string;
  private currentDate: string;

  constructor(private client: Client) {
    this.debug = process.env['DEBUG'] === 'true';
    this.debugToDev = process.env['DEBUG_TO_DEV'] === 'true';
    this.developerId = process.env['DEVELOPER_ID'] || '';

    this.logsDir = path.join(process.cwd(), 'logs');
    this.latestLogFile = path.join(this.logsDir, 'latest.log');
    this.currentDate = this.getCurrentDate();
    this.currentLogFile = path.join(this.logsDir, `${this.currentDate}.log`);

    this.initializeLogs();
  }

  private initializeLogs(): void {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }

      this.checkAndRotateLogs();

      this.writeToFile(
        'INFO',
        'Logger',
        'Bot iniciado - Sistema de logs ativado',
      );
    } catch (error) {
      console.error('Erro ao inicializar sistema de logs:', error);
    }
  }

  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private checkAndRotateLogs(): void {
    const today = this.getCurrentDate();

    if (this.currentDate !== today) {
      this.currentDate = today;
      this.currentLogFile = path.join(this.logsDir, `${this.currentDate}.log`);

      this.writeToFile('INFO', 'Logger', `=== NOVO DIA - ${today} ===`);
    }
  }

  private getFullTimestamp(): string {
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const time = now.toLocaleTimeString('pt-BR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `[${date} ${time}]`;
  }

  private writeToFile(level: string, module: string, message: string): void {
    try {
      this.checkAndRotateLogs();

      const timestamp = this.getFullTimestamp();
      const logEntry = `${timestamp} [${level}/${module}]: ${message}\n`;

      fs.appendFileSync(this.currentLogFile, logEntry);

      fs.appendFileSync(this.latestLogFile, logEntry);
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  async info(module: string, msg: string): Promise<void> {
    this.writeToFile('INFO', module, msg);

    if (this.debug) {
      console.log(
        colors.green(`${this.getFullTimestamp()}[INFO/${module}]`),
        msg,
      );
    }
    if (this.debugToDev && this.developerId) {
      await this.sendToDev(module, msg);
    }
  }

  async error(module: string, msg: string): Promise<void> {
    this.writeToFile('ERROR', module, msg);

    if (this.debug) {
      console.error(
        colors.red(`${this.getFullTimestamp()}[ERROR/${module}]`),
        msg,
      );
    }
    if (this.debugToDev && this.developerId) {
      await this.sendToDev(module, msg);
    }
  }

  async warn(module: string, msg: string): Promise<void> {
    this.writeToFile('WARN', module, msg);

    if (this.debug) {
      console.warn(
        colors.yellow(`${this.getFullTimestamp()}[WARN/${module}]`),
        msg,
      );
    }

    if (this.debugToDev && this.developerId) {
      await this.sendToDev(module, msg);
    }
  }

  private async sendToDev(module: string, msg: string): Promise<void> {
    try {
      const dev = await this.client.users.fetch(this.developerId);
      if (!dev) {
        console.warn(
          colors.yellow(
            `${this.getFullTimestamp()}[WARN/Logger] Desenvolvedor não encontrado`,
          ),
        );
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Debug - ${module}`)
        .setDescription(msg)
        .setTimestamp()
        .setFooter({
          text: 'Debug Message',
        });

      await dev.send({ embeds: [embed] });
    } catch (error) {
      console.error(
        colors.red(
          `${this.getFullTimestamp()}[ERROR/Logger] Erro ao enviar mensagem de debug:`,
        ),
        error,
      );
    }
  }

  // public getLogsDirectory(): string {
  //   return this.logsDir;
  // }

  // public getLatestLogPath(): string {
  //   return this.latestLogFile;
  // }

  // public getCurrentLogPath(): string {
  //   return this.currentLogFile;
  // }

  // public async getLatestLogs(lines: number = 50): Promise<string[]> {
  //   try {
  //     if (!fs.existsSync(this.latestLogFile)) {
  //       return [];
  //     }

  //     const content = fs.readFileSync(this.latestLogFile, 'utf8');
  //     const logLines = content.split('\n').filter(line => line.trim() !== '');

  //     return logLines.slice(-lines);
  //   } catch (error) {
  //     this.writeToFile('ERROR', 'Logger', `Erro ao ler latest.log: ${error}`);
  //     return [];
  //   }
  // }

  // public async getLogsByDate(date: string): Promise<string[]> {
  //   try {
  //     const logFile = path.join(this.logsDir, `${date}.log`);

  //     if (!fs.existsSync(logFile)) {
  //       return [];
  //     }

  //     const content = fs.readFileSync(logFile, 'utf8');
  //     return content.split('\n').filter(line => line.trim() !== '');
  //   } catch (error) {
  //     this.writeToFile(
  //       'ERROR',
  //       'Logger',
  //       `Erro ao ler log do dia ${date}: ${error}`,
  //     );
  //     return [];
  //   }
  // }

  // public async clearLatestLog(): Promise<void> {
  //   try {
  //     fs.writeFileSync(this.latestLogFile, '');
  //     this.writeToFile('INFO', 'Logger', 'latest.log limpo');
  //   } catch (error) {
  //     this.writeToFile(
  //       'ERROR',
  //       'Logger',
  //       `Erro ao limpar latest.log: ${error}`,
  //     );
  //   }
  // }

  // public async listLogFiles(): Promise<string[]> {
  //   try {
  //     const files = fs.readdirSync(this.logsDir);
  //     return files.filter(file => file.endsWith('.log')).sort();
  //   } catch (error) {
  //     this.writeToFile(
  //       'ERROR',
  //       'Logger',
  //       `Erro ao listar arquivos de log: ${error}`,
  //     );
  //     return [];
  //   }
  // }
}
