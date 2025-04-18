import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Task } from '../src/tasks/schemas.js';
import { TaskStorage } from '../src/tasks/storage.js';
import { v4 as uuidv4 } from 'uuid';

// Mock the dependencies
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => false),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    appendFileSync: vi.fn(),
    createWriteStream: vi.fn(() => ({
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn((event, callback) => callback())
    })),
    renameSync: vi.fn()
  }
}));

vi.mock('../src/utils/fs.js', () => ({
  createDirectory: vi.fn()
}));

vi.mock('../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('fastmcp', () => ({
  FastMCP: class {
    addTool = vi.fn();
    callTool = vi.fn();
    start = vi.fn();
  }
}));

// Add a helper to clear all tasks for testing
declare module '../src/tasks/storage.js' {
  interface TaskStorage {
    clearAllTasks(): void;
  }
}

TaskStorage.prototype.clearAllTasks = function () {
  (this as unknown as { tasks: Map<string, Task> }).tasks.clear();
};

describe('Task Management', () => {
  let taskStorage: TaskStorage;
  
  beforeEach(() => {
    vi.resetAllMocks();
    // Create a new instance for each test
    taskStorage = new TaskStorage();
    // Use the public helper to clear tasks
    taskStorage.clearAllTasks();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  
  it('should create a new task', () => {
    const task: Task = {
      id: uuidv4(),
      description: 'Test task',
      status: 'todo',
      priority: 'medium'
    };
    
    const result = taskStorage.addTask(task);
    expect(result).toEqual(task);
    expect(taskStorage.getAllTasks()).toContain(task);
  });
  
  it('should update an existing task', () => {
    const task: Task = {
      id: uuidv4(),
      description: 'Test task',
      status: 'todo',
      priority: 'medium'
    };
    
    taskStorage.addTask(task);
    
    const updatedTask = taskStorage.updateTask(task.id, {
      description: 'Updated task',
      priority: 'high'
    });
    
    expect(updatedTask).toEqual({
      ...task,
      description: 'Updated task',
      priority: 'high'
    });
  });
  
  it('should return null when updating a non-existent task', () => {
    const result = taskStorage.updateTask('non-existent-id', {
      description: 'This should fail'
    });
    
    expect(result).toBeNull();
  });
  
  it('should delete a task', () => {
    const task: Task = {
      id: uuidv4(),
      description: 'Task to delete',
      status: 'todo',
      priority: 'low'
    };
    
    taskStorage.addTask(task);
    const deleteResult = taskStorage.deleteTask(task.id);
    
    expect(deleteResult).toBe(true);
    expect(taskStorage.getAllTasks()).not.toContain(task);
  });
  
  it('should filter tasks by status', () => {
    const todoTask: Task = {
      id: uuidv4(),
      description: 'Todo task',
      status: 'todo',
      priority: 'medium'
    };
    
    const doneTask: Task = {
      id: uuidv4(),
      description: 'Done task',
      status: 'done',
      priority: 'medium'
    };
    
    taskStorage.addTask(todoTask);
    taskStorage.addTask(doneTask);
    
    const todoTasks = taskStorage.getTasksBy({ status: 'todo' });
    expect(todoTasks).toHaveLength(1);
    expect(todoTasks[0]).toEqual(todoTask);
    
    const doneTasks = taskStorage.getTasksBy({ status: 'done' });
    expect(doneTasks).toHaveLength(1);
    expect(doneTasks[0]).toEqual(doneTask);
  });
  
  it('should filter tasks by priority', () => {
    const highTask: Task = {
      id: uuidv4(),
      description: 'High priority task',
      status: 'todo',
      priority: 'high'
    };
    
    const lowTask: Task = {
      id: uuidv4(),
      description: 'Low priority task',
      status: 'todo',
      priority: 'low'
    };
    
    taskStorage.addTask(highTask);
    taskStorage.addTask(lowTask);
    
    const highTasks = taskStorage.getTasksBy({ priority: 'high' });
    expect(highTasks).toHaveLength(1);
    expect(highTasks[0]).toEqual(highTask);
  });
  
  it('should debounce save operations', () => {
    vi.useFakeTimers();
    
    const task: Task = {
      id: uuidv4(),
      description: 'Test task',
      status: 'todo',
      priority: 'medium'
    };
    
    taskStorage.addTask(task);
    taskStorage.save();
    
    // Timer should be set but not executed yet
    expect(vi.getTimerCount()).toBe(1);
    
    // Fast-forward time
    vi.advanceTimersByTime(5000);
    
    // Timer should have executed
    expect(vi.getTimerCount()).toBe(0);
  });
}); 