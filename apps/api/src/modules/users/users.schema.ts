import { z } from "zod";

export {
	type UpdateUserInput,
	updateUserSchema,
} from "@notiving/shared/schemas";

export const userIdParam = z.object({
	id: z.string().uuid(),
});
