'use client';

import { CATEGORIES } from '@/config/categories';
import { CategorySection, Resource } from './CategorySection';

interface CategoryFeedProps {
  initialData?: Record<string, { resources: Resource[], total: number }>;
}

export function CategoryFeed({ initialData = {} }: CategoryFeedProps) {
  return (
    <div className="space-y-12 pb-12">
      {CATEGORIES.map((category) => {
        const data = initialData[category.slug] || { resources: [], total: 0 };
        return (
          <CategorySection 
            key={category.slug} 
            category={category.slug} 
            title={category.name}
            initialResources={data.resources}
            initialTotal={data.total}
          />
        );
      })}
    </div>
  );
}
