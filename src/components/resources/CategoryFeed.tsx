'use client';

import { CATEGORIES } from '@/config/categories';
import { CategorySection } from './CategorySection';

export function CategoryFeed() {
  return (
    <div className="space-y-12 pb-12">
      {CATEGORIES.map((category) => (
        <CategorySection 
          key={category.slug} 
          category={category.slug} 
          title={category.name} 
        />
      ))}
    </div>
  );
}
