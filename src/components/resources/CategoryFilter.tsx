'use client';

import { cn } from '@/lib/utils';
import { getCategoryName } from '@/config/categories';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
  resourceCounts: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  resourceCounts,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          )}
        >
          全部
          <span className="ml-1.5 text-xs opacity-70">
            ({Object.values(resourceCounts).reduce((a, b) => a + b, 0)})
          </span>
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            )}
          >
            {getCategoryName(category)}
            <span className="ml-1.5 text-xs opacity-70">
              ({resourceCounts[category] || 0})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
