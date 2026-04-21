import { z } from "zod";

export {
	createPostSchema,
	updatePostSchema,
	type CreatePostInput,
	type UpdatePostInput,
} from "@notiving/shared/schemas";

export const postIdParam = z.object({
	id: z.string().uuid(),
});

