import fs from 'fs';
import path from 'path';
import { ROOT_FOLDER } from "../utils/fs-helpers.util";

type LevelType = "error" | "info";

export class BaseLogger {
  private filename: string;
  private level: LevelType;
  private logPath: string;
  
  constructor(filename: string, level: LevelType = "error") {
    this.filename = filename;
    this.level = level;
    this.logPath = path.join(ROOT_FOLDER, 'logs', filename);
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  get logger() {
    return {
      error: (message: string) => {
        try {
          if (this.level === 'error') {
            console.log('[BaseLogger] Writing to error log:', this.logPath);
            fs.appendFileSync(this.logPath, message + '\n');
            console.log('[BaseLogger] Error log written successfully');
          }
        } catch (error: any) {
          console.error('[BaseLogger] Failed to write error log:', error.message);
          console.error('[BaseLogger] Log path:', this.logPath);
          console.error('[BaseLogger] Message:', message);
        }
      },
      info: (message: string) => {
        try {
          if (this.level === 'info') {
            console.log('[BaseLogger] Writing to info log:', this.logPath);
            fs.appendFileSync(this.logPath, message + '\n');
            console.log('[BaseLogger] Info log written successfully');
          }
        } catch (error: any) {
          console.error('[BaseLogger] Failed to write info log:', error.message);
          console.error('[BaseLogger] Log path:', this.logPath);
          console.error('[BaseLogger] Message:', message);
        }
      }
    };
  }
}
