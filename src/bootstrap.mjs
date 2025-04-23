// src/bootstrap.mjs - New entry point
import { stderrLog } from './src/stderr-log.js';
stderrLog();  // Redirect console.log before loading any other modules
import './src/server.js'; 