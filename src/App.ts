


export default class App {
  constructor() {
    console.log('Initializing BOT');
  }

  public async start(): Promise<void> {
    try {
      console.log('Starting BOT');
    } catch (error) {
      console.error('Error starting BOT:', error);
      process.exit(1);
    }
  }
}