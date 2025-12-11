import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.getTimestamp();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }

  private writeToFile(level: LogLevel, message: string) {
    const logFile = path.join(logsDir, `${level}.log`);
    fs.appendFileSync(logFile, message, 'utf8');
  }

  info(message: string, meta?: any) {
    const formatted = this.formatMessage('info', message, meta);
    if (process.env.NODE_ENV === 'development') {
      console.log(formatted.trim());
    }
    this.writeToFile('info', formatted);
  }

  warn(message: string, meta?: any) {
    const formatted = this.formatMessage('warn', message, meta);
    if (process.env.NODE_ENV === 'development') {
      console.warn(formatted.trim());
    }
    this.writeToFile('warn', formatted);
  }

  error(message: string, error?: Error | any, meta?: any) {
    const errorInfo = error?.stack || error?.message || error;
    const formatted = this.formatMessage('error', message, { ...meta, error: errorInfo });
    if (process.env.NODE_ENV === 'development') {
      console.error(formatted.trim());
    }
    this.writeToFile('error', formatted);
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, meta);
      console.debug(formatted.trim());
      this.writeToFile('debug', formatted);
    }
  }
}

export default new Logger();
