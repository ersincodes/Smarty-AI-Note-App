import { z, ZodSchema } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
});

export type CreateNoteSchema = z.infer<typeof createCategorySchema>;

export const updateNoteSchema = createCategorySchema.extend({
  id: z.string().min(1),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1),
});
