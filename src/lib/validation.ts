import { z } from 'zod';

export const SubmitResourceSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过100字符'),
  url: z.string().url('请输入有效的URL'),
  category: z.string().optional().default('uncategorized'),
  price: z.enum(['Free', 'Freemium', 'Paid']).optional().default('Freemium'),
  is_open_source: z.boolean().optional().default(false),
  description: z.string().max(500, '描述不能超过500字符').optional(),
});

export const LoginSchema = z.object({
  password: z.string().min(1, '密码不能为空'),
});

export const ApproveSchema = z.object({
  resourceId: z.string().uuid('无效的资源ID'),
  action: z.enum(['approve', 'reject']),
});

export const StickySchema = z.object({
  resourceId: z.string().uuid('无效的资源ID'),
  type: z.enum(['global', 'category']),
  order: z.number().int().min(0).max(99),
});

export const EditResourceSchema = z.object({
  resourceId: z.string().uuid('无效的资源ID'),
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过100字符').optional(),
  description: z.string().max(500, '描述不能超过500字符').optional(),
  category: z.string().optional(),
  price: z.enum(['Free', 'Freemium', 'Paid']).optional(),
  is_open_source: z.boolean().optional(),
  url: z.string().url('请输入有效的URL').optional(),
});

// Schema for admin updating resources (PATCH API)
export const UpdateResourceSchema = z.object({
  id: z.string(),
  status: z.enum(['published', 'pending', 'rejected', 'delisted']).optional(),
  category: z.string().optional(),
  global_sticky_order: z.number().int().min(0).max(100).optional(),
  category_sticky_order: z.number().int().min(0).max(100).optional(),
});

export type SubmitResourceInput = z.infer<typeof SubmitResourceSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ApproveInput = z.infer<typeof ApproveSchema>;
export type StickyInput = z.infer<typeof StickySchema>;
export type EditResourceInput = z.infer<typeof EditResourceSchema>;
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;
