'use client';

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCategoryName } from '@/config/categories';

interface Resource {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  price: string;
  is_open_source: boolean;
  global_sticky_order: number;
  category_sticky_order: number;
  token?: string;
}

interface ResourceCardProps {
  resource: Resource;
}

const PRICE_COLORS: Record<string, string> = {
  Free: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  Freemium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  Paid: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const isSticky = resource.global_sticky_order > 0 || resource.category_sticky_order > 0;

  return (
    <Card className={cn(
      'group relative transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden',
      'border border-black/5 dark:border-white/10',
      'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]',
      'dark:shadow-[0_2px_8px_rgba(255,255,255,0.02)] dark:hover:shadow-[0_12px_32px_rgba(255,255,255,0.04)]',
      'bg-card hover:bg-card/95',
      isSticky && 'ring-1 ring-primary/20 bg-linear-to-br from-primary/5 to-transparent'
    )}>
      {isSticky && (
        <div className="absolute top-0 right-0 p-2 z-10">
          <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary backdrop-blur-sm shadow-sm border border-primary/10">
            置顶
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 pr-8">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {resource.name}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className={cn('text-xs font-medium border shadow-none', PRICE_COLORS[resource.price])}>
            {resource.price === 'Free' ? '免费' : resource.price === 'Freemium' ? '免费增值' : '付费'}
          </Badge>
          
          {resource.is_open_source && (
            <Badge variant="outline" className="bg-blue-500/5 text-blue-700 dark:text-blue-400 border-blue-500/10 text-xs font-medium shadow-none">
              开源
            </Badge>
          )}
          
          <Badge variant="secondary" className="text-xs text-muted-foreground bg-muted/50 border border-transparent hover:border-border transition-colors shadow-none">
            {getCategoryName(resource.category)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-5 min-h-[40px] leading-relaxed">
          {resource.description || '暂无描述'}
        </p>
        
        <Button
          variant="default"
          size="sm"
          className="w-full gap-2 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/20 bg-linear-to-r from-primary to-primary/90 hover:to-primary hover:scale-[1.02]"
          asChild
        >
          <a
            href={resource.token ? `/api/go/${resource.id}?token=${resource.token}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!resource.token) {
                e.preventDefault();
                // Optionally handle missing token (e.g. reload or fetch)
                console.error('Missing secure token for resource:', resource.name);
              }
            }}
          >
            <ExternalLink className="h-4 w-4" />
            访问官网
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
