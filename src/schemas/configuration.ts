import { z } from "zod";

export const secretsSchema = z.object({
    CPI_URL: z.string(),

    CPI_USERNAME: z.string(),
    CPI_PASSWORD: z.string(),
});

export const configurationSchema = z.object({

});