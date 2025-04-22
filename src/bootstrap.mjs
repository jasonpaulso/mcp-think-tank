// src/bootstrap.mjs - New entry point
import { stderrLog } from './stderr-log.js';
stderrLog();  // Redirect console.log before loading any other modules
import './server.js'; 