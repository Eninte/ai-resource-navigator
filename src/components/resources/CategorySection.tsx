'use client';

import { useState, useEffect, useCallback } from 'react';
import { ResourceCard } from './ResourceCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  price: string;
  is_open_source: boolean;
  global_sticky_order: number;
  category_sticky_order: number;
  published_at: Date | string;
}

interface CategorySectionProps {
  category: string;
  title: string;
}

export function CategorySection({ category, title }: CategorySectionProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 12; // 3 rows * 4 cols (Desktop)

  const { ref, isVisible } = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '200px', // Start loading before it enters viewport
  });

  const [hasFetched, setHasFetched] = useState(false);

  const fetchResources = useCallback(async (isLoadMore = false) => {
    // If already loading, prevent duplicate requests
    // But allow if it's a new loadMore request (though loading should block button)
    setLoading(true);
    setError(false);

    try {
      const currentOffset = isLoadMore ? offset : 0;
      const response = await fetch(
        `/api/resources?category=${category}&limit=${LIMIT}&offset=${currentOffset}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (isLoadMore) {
        setResources(prev => [...prev, ...data.resources]);
        setOffset(prev => prev + LIMIT);
      } else {
        setResources(data.resources);
        setOffset(LIMIT);
      }
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error(`无法加载 ${title} 分类资源`);
    } finally {
      setLoading(false);
    }
  }, [category, offset, title]);

  useEffect(() => {
    if (isVisible && !hasFetched) {
      setHasFetched(true);
      fetchResources();
    }
  }, [isVisible, hasFetched, fetchResources]);

  // Placeholder to preserve layout stability before loading
  if (!hasFetched && !isVisible) {
    return <div ref={ref as React.RefObject<HTMLDivElement>} className="min-h-[300px]" />;
  }

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-8 scroll-mt-20" id={`category-${category}`}>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-[Montserrat] shrink-0">
          {title}
        </h2>
        <div className="h-px flex-1 bg-linear-to-r from-black/10 to-transparent dark:from-white/10" />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border/50">
          <p className="mb-4">加载失败</p>
          <Button variant="outline" onClick={() => fetchResources(false)} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
            
            {loading && (
              // Skeleton Loading
              Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="h-[280px] rounded-xl bg-muted/50 animate-pulse border border-black/5 dark:border-white/5" />
              ))
            )}
          </div>

          {!loading && resources.length < total && (
            <div className="mt-8 text-center">
              <Button 
                variant="secondary" 
                onClick={() => fetchResources(true)}
                className="min-w-[120px] shadow-sm hover:shadow-md transition-all bg-background border border-input hover:bg-accent hover:text-accent-foreground"
              >
                加载更多 ({total - resources.length})
              </Button>
            </div>
          )}
          
           {!loading && resources.length === 0 && !error && (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg">
              暂无资源
            </div>
          )}
        </>
      )}
    </section>
  );
}
