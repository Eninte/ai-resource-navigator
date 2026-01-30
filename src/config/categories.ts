export interface Category {
  slug: string;
  name: string;
  displayOrder: number;
}

export const CATEGORIES: Category[] = [
  { slug: 'foundation-models', name: '基础模型', displayOrder: 1 },
  { slug: 'coding', name: '代码编程', displayOrder: 2 },
  { slug: 'image', name: '图像处理', displayOrder: 3 },
  { slug: 'writing', name: '写作助手', displayOrder: 4 },
  { slug: 'office', name: '办公工具', displayOrder: 5 },
  { slug: 'knowledge', name: '知识管理', displayOrder: 6 },
  { slug: 'research', name: '科研学术', displayOrder: 7 },
  { slug: 'robotics', name: '机器人', displayOrder: 8 },
  { slug: 'entertainment', name: '娱乐陪伴', displayOrder: 9 },
];

export const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug);

export function getCategoryName(slug: string): string {
  const category = CATEGORIES.find(c => c.slug === slug);
  return category?.name || '未分类';
}
