import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
console.log(__filename);

const __dirname = path.dirname(__filename);
console.log(__dirname);

const logPath = path.join(__dirname, 'logs.txt');
console.log(logPath);


export function log(message) {
   const line = `${new Date().toISOString()} - ${message}\n`;
   fs.appendFile(logPath, line, () => {
      console.log('Yozib bo‘ldi');
   });
   //! fs.appendFile( qayerga , nima yozilsin , keyin nima bo‘lsin )
}

export function readLogs() {
   try {
      const data = fs.readFileSync(logPath, 'utf-8');
      console.log('Hamma loglar:\n' + data);
   } catch {
      console.log('logs.txt topilmadi yoki hali log yozilmagan.');
   }
}