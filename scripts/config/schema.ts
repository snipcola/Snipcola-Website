import { z } from "zod";

export const SiteConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  language: z.string().default("en"),
  variables: z.record(z.string(), z.string()),
  icon: z.object({
    type: z.string(),
    data: z.string(),
  }),
  brand: z.object({
    text: z.string(),
    icon: z.object({
      data: z.string().optional(),
      label: z.string(),
      width: z.number(),
      height: z.number(),
    }),
    buttons: z.array(
      z.object({
        label: z.string(),
        icon: z.string(),
        url: z.string(),
        type: z.string().optional(),
        newTab: z.boolean().optional().default(true),
      }),
    ),
  }),
  sections: z.array(
    z.object({
      name: z.string(),
      icon: z.string(),
      columns: z.number().int().min(1).max(6).optional().default(3),
      links: z.array(
        z.object({
          label: z.string(),
          icon: z.string(),
          text: z.string().optional(),
          url: z.string(),
          notice: z.string().optional(),
          newTab: z.boolean().optional().default(true),
        }),
      ),
    }),
  ),
  copyright: z.string(),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
