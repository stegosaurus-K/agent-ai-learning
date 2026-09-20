/**  定义 AI 输出的数据契约  */

import { z } from "zod";
 
export const LeadResultSchema = z.object({
 
  intent: z.enum([
    "high",
    "medium",
    "low"
  ]),
 
  confidence: z
    .number()
    .min(0)
    .max(1),
 
  reason: z.string(),
 
  nextAction: z.enum([
    "sales_follow_up",
    "later_follow_up",
    "ignore"
  ])
 
});
 
export type LeadResult = z.infer<typeof LeadResultSchema>;
