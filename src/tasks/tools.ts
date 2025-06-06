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
      ).describe("List of tasks to create with their details")
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
        
        await taskStorage.addTask(task);
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
            // Use the knowledgeGraph directly, avoiding any console logs
            if (!knowledgeGraph.entities.has(entity.name)) {
              knowledgeGraph.entities.set(entity.name, {
                name: entity.name,
                entityType: entity.entityType,
                observations: [...entity.observations]
              });
            }
          }
          graphStorage.save();
          if (log) log.info(`Created ${entities.length} task entities in knowledge graph`);
        } catch (err) {
          if (log) log.error(`Failed to sync tasks with knowledge graph: ${err}`);
        }
      }
      
      await taskStorage.save();
      
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
      status: z.enum(['todo', 'in-progress', 'blocked', 'done']).describe("Filter tasks by status").optional(),
      priority: z.enum(['low', 'medium', 'high']).describe("Filter tasks by priority level").optional()
    }),
    execute: async ({ status, priority }, context) => {
      const _log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const filter: Partial<Task> = {};
      
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      
      const tasks = Object.keys(filter).length > 0
        ? await taskStorage.getTasksBy(filter)
        : await taskStorage.getAllTasks();
      
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
    parameters: z.object({
      random_string: z.string().describe("Dummy parameter for no-parameter tools").optional()
    }),
    execute: async (_args, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const todoTasks = await taskStorage.getTasksBy({ status: 'todo' });
      
      if (todoTasks.length === 0) {
        return JSON.stringify({
          message: 'No todo tasks available',
          task: null
        });
      }
      
      // Sort by priority (high -> medium -> low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const nextTask = todoTasks.sort((a: Task, b: Task) => 
        priorityOrder[a.priority as keyof typeof priorityOrder] - 
        priorityOrder[b.priority as keyof typeof priorityOrder]
      )[0];
      
      // Update status to in-progress
      const updatedTask = await taskStorage.updateTask(nextTask.id, { 
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
      id: z.string().uuid().describe("UUID of the task to mark as completed")
    }),
    execute: async ({ id }, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const updatedTask = await taskStorage.updateTask(id, { status: 'done' });
      
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
          id: z.string().uuid().describe("UUID of the task to update"),
          description: z.string().min(3).describe("New task description").optional(),
          status: z.enum(['todo', 'in-progress', 'blocked', 'done']).describe("New task status").optional(),
          priority: z.enum(['low', 'medium', 'high']).describe("New priority level").optional(),
          due: z.string().datetime().describe("New due date in ISO format").optional(),
          tags: z.array(z.string()).describe("New tags for the task").optional()
        })
      ).describe("List of task updates to apply")
    }),
    execute: async ({ updates }, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      const results = {
        success: [] as Task[],
        failed: [] as string[]
      };
      
      for (const update of updates) {
        const { id, ...changes } = update;
        try {
          const updatedTask = await taskStorage.updateTask(id, changes);
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
        } catch (error) {
          results.failed.push(id);
        }
      }
      
      await taskStorage.save();
      
      return JSON.stringify({
        message: `Updated ${results.success.length} tasks, ${results.failed.length} failed`,
        success: results.success,
        failed: results.failed
      });
    }
  });
} 