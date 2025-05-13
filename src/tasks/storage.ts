import fs from 'fs';
import path from 'path';
import os from 'os';
import { Task, TaskSchema } from './schemas.js';
import { createDirectory } from '../utils/fs.js';
import { createLogger } from '../utils/logger.js';
import { Mutex } from 'async-mutex';
import { z } from 'zod';

// Extract types from schema for use in code
type TaskStatus = z.infer<typeof TaskSchema.shape.status>;
type TaskPriority = z.infer<typeof TaskSchema.shape.priority>;

const logger = createLogger('taskStorage');

// Get tasks path from environment or use default
const tasksPath = process.env.TASKS_PATH || path.join(os.homedir(), '.mcp-think-tank/tasks.jsonl');

// Ensure directory exists
createDirectory(path.dirname(tasksPath));

// Safely log errors to stderr without interfering with stdout JSON
const safeErrorLog = (message: string) => {
  // Only log in debug mode or redirect to stderr
  if (process.env.MCP_DEBUG === 'true') {
    process.stderr.write(`${message}\n`);
  }
};

/**
 * Task storage class for managing task persistence
 */
export class TaskStorage {
  private tasks: Map<string, Task> = new Map();
  private filePath: string;
  private saveTimer: NodeJS.Timeout | null = null;
  private saveInterval: number = 1000; // 1 second
  private mutex: Mutex = new Mutex();
  
  /**
   * Create new task storage instance
   * 
   * @param filePath Optional custom path for task storage
   */
  constructor(filePath?: string) {
    // Determine file path
    this.filePath = filePath || path.join(os.homedir(), '.mcp-think-tank', 'tasks.jsonl');
    
    // Ensure directory exists
    this.ensureDirectoryExists();
    
    // Load initial tasks
    this.loadTasks();
    
    logger.info(`Task storage initialized at ${this.filePath}`);
  }
  
  /**
   * Create a new task
   * 
   * @param task Task to add
   * @returns The added task
   */
  async addTask(task: Task): Promise<Task> {
    return await this.mutex.runExclusive(async () => {
      if (this.tasks.has(task.id)) {
        throw new Error(`Task with ID ${task.id} already exists`);
      }
      
      this.tasks.set(task.id, task);
      
      // Schedule save
      this.scheduleSave();
      
      logger.debug(`Task ${task.id} added`);
      return task;
    });
  }
  
  /**
   * Get a task by ID
   * 
   * @param id Task ID
   * @returns Task if found, or undefined
   */
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  /**
   * Update an existing task
   * 
   * @param taskOrId Updated task or task ID
   * @param changes Optional changes if ID is provided
   * @returns Updated task
   */
  async updateTask(taskOrId: Task | string, changes?: Partial<Omit<Task, 'id'>>): Promise<Task> {
    return await this.mutex.runExclusive(async () => {
      const id = typeof taskOrId === 'string' ? taskOrId : taskOrId.id;
      const task = this.tasks.get(id);
      
      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }
      
      const updatedTask = {
        ...task,
        ...(typeof taskOrId === 'string' ? changes || {} : taskOrId)
      };
      
      this.tasks.set(id, updatedTask);
      
      // Schedule save
      this.scheduleSave();
      
      logger.debug(`Task ${id} updated`);
      return updatedTask;
    });
  }
  
  /**
   * Delete a task by ID
   * 
   * @param id Task ID to delete
   * @returns True if task was deleted, false if not found
   */
  async deleteTask(id: string): Promise<boolean> {
    return await this.mutex.runExclusive(async () => {
      if (!this.tasks.has(id)) {
        return false;
      }
      
      const deleted = this.tasks.delete(id);
      
      // Schedule save
      this.scheduleSave();
      
      logger.debug(`Task ${id} deleted`);
      return deleted;
    });
  }
  
  /**
   * Get all tasks
   * 
   * @returns Array of all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get tasks filtered by criteria
   * 
   * @param filter Filter criteria
   * @returns Filtered tasks
   */
  async getTasksBy(filter: Partial<Task>): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    
    return tasks.filter(task => {
      return Object.entries(filter).every(([key, value]) => 
        task[key as keyof Task] === value
      );
    });
  }
  
  /**
   * Save tasks immediately
   */
  async save(): Promise<void> {
    return this.saveImmediately();
  }
  
  /**
   * List all tasks with optional filtering
   * 
   * @param status Optional status filter
   * @param priority Optional priority filter
   * @returns List of matching tasks
   */
  async listTasks(status?: TaskStatus, priority?: TaskPriority): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    
    return tasks.filter(task => {
      if (status && task.status !== status) return false;
      if (priority && task.priority !== priority) return false;
      return true;
    });
  }
  
  /**
   * Get the next highest priority task
   * 
   * @returns Next task to work on
   */
  async getNextTask(): Promise<Task | undefined> {
    const allTasks = Array.from(this.tasks.values());
    const todoTasks = allTasks.filter(task => task.status === 'todo');
    
    if (todoTasks.length === 0) {
      return undefined;
    }
    
    // Sort by priority (high > medium > low)
    const priorityOrder: Record<TaskPriority, number> = {
      'high': 0,
      'medium': 1,
      'low': 2
    };
    
    todoTasks.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      // If same priority, sort by creation date (oldest first)
      if (priorityDiff === 0) {
        return new Date(a.created).getTime() - new Date(b.created).getTime();
      }
      
      return priorityDiff;
    });
    
    return todoTasks[0];
  }
  
  /**
   * Schedule a delayed save operation
   */
  private scheduleSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      this.saveImmediately();
    }, this.saveInterval);
  }
  
  /**
   * Save tasks to storage immediately
   */
  async saveImmediately(): Promise<void> {
    return await this.mutex.runExclusive(async () => {
      try {
        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
          this.saveTimer = null;
        }
        
        // Convert tasks to JSONL format
        const lines = Array.from(this.tasks.values()).map(task => JSON.stringify(task));
        
        // Write to file
        fs.writeFileSync(this.filePath, lines.join('\n') + '\n');
        
        logger.debug(`Saved ${this.tasks.size} tasks to ${this.filePath}`);
      } catch (error) {
        logger.error(`Failed to save tasks: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    });
  }
  
  /**
   * Ensure storage directory exists
   */
  private ensureDirectoryExists(): void {
    const directory = path.dirname(this.filePath);
    
    if (!fs.existsSync(directory)) {
      try {
        fs.mkdirSync(directory, { recursive: true });
        logger.info(`Created directory ${directory}`);
      } catch (error) {
        logger.error(`Failed to create directory ${directory}: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  }
  
  /**
   * Load tasks from storage
   */
  private loadTasks(): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        logger.info(`Task file ${this.filePath} doesn't exist yet, creating empty storage`);
        return;
      }
      
      const content = fs.readFileSync(this.filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      for (const line of lines) {
        try {
          const task = JSON.parse(line) as Task;
          this.tasks.set(task.id, task);
        } catch (error) {
          logger.warn(`Failed to parse task: ${line}, error: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      logger.info(`Loaded ${this.tasks.size} tasks from ${this.filePath}`);
    } catch (error) {
      logger.error(`Failed to load tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Clear all active timeouts
   */
  clearAllTimeouts(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }
}

/**
 * Singleton task storage instance
 */
export const taskStorage = new TaskStorage();

// Ensure all tasks are saved on process exit to prevent data loss
process.once('beforeExit', () => {
  safeErrorLog('Process beforeExit - saving tasks');
  taskStorage.saveImmediately();
});

// Also handle exit to ensure proper cleanup
process.once('exit', () => {
  safeErrorLog('Process exit - final cleanup');
  if (taskStorage) {
    taskStorage.clearAllTimeouts();
  }
});