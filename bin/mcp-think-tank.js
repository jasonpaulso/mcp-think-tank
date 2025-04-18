#!/usr/bin/env node

/**
 * This is the executable entry point for the mcp-think-tank 
 * when installed globally via npm
 */

import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(here, "..", "dist", "server.js");
const serverURL = pathToFileURL(serverPath).href;
import(serverURL); 