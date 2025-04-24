import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TaskSchema, Task } from './schemas.js';
import { taskStorage } from './storage.js';
import { graph as knowledgeGraph, graphStorage } from '../memory/storage.js';

export function registerTaskTools(server: FastMCP): void {
  // No need to initialize, use shared persistent knowledge graph
  
  // 1. Plan tasks - Create multiple tasks at once
  server.addTool({
    name: 'plan_tasks',
    description: 'Create multiple tasks from a plan. Generates IDs and syncs with knowledge graph.',
    parameters: z.object({
      tasks: z.array(
        TaskSchema.omit({ id: true, status: true })
          .extend({
            priority: z.enum(['low', 'medium', 'high']).default('medium')
          })
      )
    }),
    execute: async ({ tasks }, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const createdTasks: Task[] = [];
      const entities = [];

      for (const taskData of tasks) {
        const task: Task = {
          id: uuidv4(),
          status: 'todo',
          ...taskData
        };
        
        taskStorage.addTask(task);
        createdTasks.push(task);
        
        // Create entities in knowledge graph
        entities.push({
          name: `Task-${task.id}`,
          entityType: 'task',
          observations: [
            `Description: ${task.description}`,
            `Priority: ${task.priority}`,
            `Status: ${task.status}`,
            `Created: ${new Date().toISOString()}`
          ]
        });
      }
      
      // Create knowledge graph entities if possible
      if (entities.length > 0) {
        try {
          for (const entity of entities) {
            knowledgeGraph.addEntity(entity);
          }
          graphStorage.save();
          if (log) log.info(`Created ${entities.length} task entities in knowledge graph`);
        } catch (err) {
          if (log) log.error(`Failed to sync tasks with knowledge graph: ${err}`);
        }
      }
      
      taskStorage.save();
      
      return JSON.stringify({ 
        tasks: createdTasks,
        message: `Created ${createdTasks.length} tasks`
      });
    }
  });
  
  // 2. List tasks - Get tasks with optional filtering
  server.addTool({
    name: 'list_tasks',
    description: 'List tasks with optional filtering by status and priority.',
    parameters: z.object({
      status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional()
    }),
    execute: async ({ status, priority }, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const filter: Partial<Task> = {};
      
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      
      const tasks = Object.keys(filter).length > 0
        ? taskStorage.getTasksBy(filter)
        : taskStorage.getAllTasks();
      
      return JSON.stringify({
        tasks,
        count: tasks.length,
        filter: Object.keys(filter).length > 0 ? filter : 'none'
      });
    }
  });
  
  // 3. Next task - Get the next highest priority todo task and mark it in-progress
  server.addTool({
    name: 'next_task',
    description: 'Get the next highest priority todo task and mark it as in-progress.',
    parameters: z.object({}),
    execute: async (_args, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const todoTasks = taskStorage.getTasksBy({ status: 'todo' });
      
      if (todoTasks.length === 0) {
        return JSON.stringify({
          message: 'No todo tasks available',
          task: null
        });
      }
      
      // Sort by priority (high -> medium -> low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const nextTask = todoTasks.sort((a, b) => 
        priorityOrder[a.priority as keyof typeof priorityOrder] - 
        priorityOrder[b.priority as keyof typeof priorityOrder]
      )[0];
      
      // Update status to in-progress
      const updatedTask = taskStorage.updateTask(nextTask.id, { 
        status: 'in-progress' 
      });
      
      // Add observation to knowledge graph
      if (knowledgeGraph && updatedTask) {
        try {
          const observation = `Started: ${new Date().toISOString()}`;
          knowledgeGraph.addObservations(`Task-${updatedTask.id}`, [observation]);
          graphStorage.save();
        } catch (err) {
          if (log) log.error(`Failed to update task in knowledge graph: ${err}`);
        }
      }
      
      return JSON.stringify({
        message: updatedTask ? 'Task marked as in-progress' : 'Failed to update task',
        task: updatedTask
      });
    }
  });
  
  // 4. Complete task - Mark a task as done
  server.addTool({
    name: 'complete_task',
    description: 'Mark a task as completed.',
    parameters: z.object({
      id: z.string().uuid()
    }),
    execute: async ({ id }, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const updatedTask = taskStorage.updateTask(id, { status: 'done' });
      
      if (!updatedTask) {
        return JSON.stringify({
          success: false,
          message: `Task with ID ${id} not found`
        });
      }
      
      // Add observation to knowledge graph
      if (knowledgeGraph) {
        try {
          const observation = `Completed: ${new Date().toISOString()}`;
          knowledgeGraph.addObservations(`Task-${id}`, [observation]);
          graphStorage.save();
        } catch (err) {
          if (log) log.error(`Failed to update task completion in knowledge graph: ${err}`);
        }
      }
      
      return JSON.stringify({
        success: true,
        message: 'Task marked as done',
        task: updatedTask
      });
    }
  });
  
  // 5. Update tasks - Update multiple tasks at once
  server.addTool({
    name: 'update_tasks',
    description: 'Update multiple tasks with new values.',
    parameters: z.object({
      updates: z.array(
        z.object({
          id: z.string().uuid(),
          description: z.string().min(3).optional(),
          status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
          priority: z.enum(['low', 'medium', 'high']).optional(),
          due: z.string().datetime().optional(),
          tags: z.array(z.string()).optional()
        })
      )
    }),
    execute: async ({ updates }, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const results = {
        success: [] as Task[],
        failed: [] as string[]
      };
      
      for (const update of updates) {
        const { id, ...changes } = update;
        const updatedTask = taskStorage.updateTask(id, changes);
        
        if (updatedTask) {
          results.success.push(updatedTask);
          
          // Update knowledge graph
          if (knowledgeGraph && (changes.description || changes.priority || changes.status)) {
            try {
              const observations = [];
              if (changes.description) observations.push(`Description: ${changes.description}`);
              if (changes.priority) observations.push(`Priority: ${changes.priority}`);
              if (changes.status) observations.push(`Status: ${changes.status}`);
              
              knowledgeGraph.addObservations(`Task-${id}`, observations);
              graphStorage.save();
            } catch (err) {
              if (log) log.error(`Failed to update task entity in knowledge graph: ${err}`);
            }
          }
        } else {
          results.failed.push(id);
        }
      }
      
      taskStorage.save();
      
      return JSON.stringify({
        message: `Updated ${results.success.length} tasks, ${results.failed.length} failed`,
        success: results.success,
        failed: results.failed
      });
    }
  });
} 