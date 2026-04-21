import { z } from "zod";

export {
	createCommentSchema,
	updateCommentSchema,
	type CreateCommentInput,
	type UpdateCommentInput,
} from "@notiving/shared/schemas";

export const commentIdParam = z.object({
	id: z.string().uuid(),
});

