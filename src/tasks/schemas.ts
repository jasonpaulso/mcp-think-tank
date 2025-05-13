import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(3, "Task must be >2 chars"),
  status: z.enum(["todo", "in-progress", "blocked", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  created: z.string().datetime().default(() => new Date().toISOString()),
  due: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  dependsOn: z.array(z.string().uuid()).optional()
});

export type Task = z.infer<typeof TaskSchema>; 