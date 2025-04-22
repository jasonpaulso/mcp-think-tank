#!/usr/bin/env node

/**
 * This is the executable entry point for the mcp-think-tank 
 * when installed globally via npm
 */

import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const bootstrapPath = resolve(here, "..", "dist", "bootstrap.mjs");
const bootstrapURL = pathToFileURL(bootstrapPath).href;
import(bootstrapURL); 