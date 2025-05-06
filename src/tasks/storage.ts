import fs from 'fs';
import path from 'path';
import os from 'os';
import { Task } from './schemas.js';
import { createDirectory } from '../utils/fs.js';

// Get tasks path from environment or use default
const tasksPath = process.env.TASKS_PATH || path.join(os.homedir(), '.mcp-think-tank/tasks.jsonl');

// Ensure directory exists
createDirectory(path.dirname(tasksPath));

export class TaskStorage {
  private tasks: Map<string, Task> = new Map();
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private saveDebounceMs = 5000; // 5 seconds debounce
  private isShuttingDown = false;
  
  constructor() {
    this.load();
  }
  
  // Load tasks from file
  public load(): void {
    try {
      if (!fs.existsSync(tasksPath)) {
        // Create empty file if it doesn't exist
        fs.writeFileSync(tasksPath, '');
        return;
      }
      
      const content = fs.readFileSync(tasksPath, 'utf-8');
      if (!content.trim()) {
        return;
      }
      
      // Process file line by line
      const lines = content.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const task = JSON.parse(line) as Task;
          this.tasks.set(task.id, task);
        } catch (err) {
          console.error(`Error parsing task line: ${err}`);
        }
      }
    } catch (err) {
      console.error(`Error loading tasks: ${err}`);
    }
  }
  
  // Save a single task (append to file)
  private saveTask(task: Task, operation: string): void {
    try {
      const entry = JSON.stringify({
        ...task,
        _operation: operation,
        _timestamp: new Date().toISOString()
      });
      
      fs.appendFileSync(tasksPath, `${entry}\n`);
      this.logOperation(operation, task);
    } catch (err) {
      console.error(`Error saving task: ${err}`);
    }
  }
  
  // Clear all timeouts - important for graceful shutdown
  public clearAllTimeouts(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.isShuttingDown = true;
  }
  
  // Save immediately - used during shutdown
  public saveImmediately(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    
    try {
      // Use sync operations for clean shutdown
      const tmpTasks: string[] = [];
      for (const task of this.tasks.values()) {
        const entry = JSON.stringify({
          ...task,
          _operation: 'save',
          _timestamp: new Date().toISOString()
        });
        tmpTasks.push(entry);
      }
      
      if (tmpTasks.length > 0) {
        fs.writeFileSync(tasksPath, tmpTasks.join('\n') + '\n', 'utf8');
        console.error(`Saved ${tmpTasks.length} tasks during shutdown`);
      }
    } catch (err) {
      console.error(`Error during immediate task save: ${err}`);
    }
  }
  
  // Save all tasks (used for batch operations)
  public save(): void {
    // Don't schedule new saves during shutdown
    if (this.isShuttingDown) {
      return;
    }
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      
      try {
        // We'll use a temporary file approach to avoid race conditions
        const tempPath = `${tasksPath}.tmp`;
        
        // Use a more direct approach with less event listeners
        const taskEntries: string[] = [];
        for (const task of this.tasks.values()) {
          const entry = JSON.stringify({
            ...task,
            _operation: 'save',
            _timestamp: new Date().toISOString()
          });
          taskEntries.push(entry);
        }
        
        // Write to temp file
        fs.writeFileSync(tempPath, taskEntries.join('\n') + '\n', 'utf8');
        
        // Rename temp file to real file (atomic operation)
        fs.renameSync(tempPath, tasksPath);
      } catch (err) {
        console.error(`Error batch saving tasks: ${err}`);
      }
    }, this.saveDebounceMs);
  }
  
  // Get all tasks
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  // Get filtered tasks
  public getTasksBy(filter: Partial<Task>): Task[] {
    return this.getAllTasks().filter(task => {
      for (const [key, value] of Object.entries(filter)) {
        if (task[key as keyof Task] !== value) {
          return false;
        }
      }
      return true;
    });
  }
  
  // Add a new task
  public addTask(task: Task): Task {
    this.tasks.set(task.id, task);
    this.saveTask(task, 'add');
    return task;
  }
  
  // Update a task
  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    this.saveTask(updatedTask, 'update');
    return updatedTask;
  }
  
  // Delete a task
  public deleteTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }
    
    this.tasks.delete(id);
    this.saveTask(task, 'delete');
    return true;
  }
  
  // Log operation
  private logOperation(_op: string, _task: Task): void {
    // No logging
  }
}

// Export singleton instance
export const taskStorage = new TaskStorage();

// Ensure all tasks are saved on process exit to prevent data loss
process.once('beforeExit', () => {
  console.error('Process beforeExit - saving tasks');
  taskStorage.saveImmediately();
});

// Also handle exit to ensure proper cleanup
process.once('exit', () => {
  console.error('Process exit - final cleanup');
  if (taskStorage) {
    taskStorage.clearAllTimeouts();
  }
});