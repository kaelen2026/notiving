import { z } from "zod";

export {
	updateUserSchema,
	type UpdateUserInput,
} from "@notiving/shared/schemas";

export const userIdParam = z.object({
	id: z.string().uuid(),
});

