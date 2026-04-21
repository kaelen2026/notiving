import { z } from "zod";

export {
	type CreatePostInput,
	createPostSchema,
	type UpdatePostInput,
	updatePostSchema,
} from "@notiving/shared/schemas";

export const postIdParam = z.object({
	id: z.string().uuid(),
});
