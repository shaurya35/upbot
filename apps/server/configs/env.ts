import { z } from "zod";

const env = z.object({
    PORT: z.coerce.number().default(8080),
})