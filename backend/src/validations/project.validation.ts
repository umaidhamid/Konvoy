import { z } from "zod";


 const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Project name is required"),
    description: z.string().optional(),
  }),
});


export { createProjectSchema };
