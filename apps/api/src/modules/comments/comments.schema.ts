import { z } from "zod";

export {
	type CreateCommentInput,
	createCommentSchema,
	type UpdateCommentInput,
	updateCommentSchema,
} from "@notiving/shared/schemas";

export const commentIdParam = z.object({
	id: z.string().uuid(),
});
