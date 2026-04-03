import { z } from "zod";
import { messages } from "../../validations/zod-messages";

export const v_role = z
    .object({
        userTypeId: z.number({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        roleName: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        isActive: z.boolean({
            required_error: messages.required,
            invalid_type_error: messages.type
        }),
    });