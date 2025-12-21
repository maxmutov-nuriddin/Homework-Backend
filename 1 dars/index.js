import { log, readLogs } from './logger.js';

log('App started');

setTimeout(() => {
  log('First timeout event');
}, 2000);

let count = 0;

const interval = setInterval(() => {
  log('Interval tick');
  count++;
  if (count === 3) clearInterval(interval);
}, 1000);

setTimeout(() => {
  readLogs();
}, 5000);
