import { checkStorage } from '../lib/storage-check.js';
import { storageConfig } from '../lib/storage-config.js';
if (!storageConfig().url || !storageConfig().token) throw Error('Configure approved test Redis credentials in .env.local');
console.log('Redis verification:', await checkStorage());
