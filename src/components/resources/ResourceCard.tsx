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
      'group relative transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50',
      'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]',
      'bg-card/80 hover:bg-card',
      isSticky && 'ring-1 ring-primary/20 bg-primary/5'
    )}>
      {isSticky && (
        <div className="absolute top-0 right-0 p-2">
          <Badge variant="secondary" className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm">
            置顶
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 pr-8">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {resource.name}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className={cn('text-xs font-medium border', PRICE_COLORS[resource.price])}>
            {resource.price === 'Free' ? '免费' : resource.price === 'Freemium' ? '免费增值' : '付费'}
          </Badge>
          
          {resource.is_open_source && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs font-medium">
              开源
            </Badge>
          )}
          
          <Badge variant="secondary" className="text-xs text-muted-foreground bg-muted/50">
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
          className="w-full gap-2 transition-all duration-300 shadow-sm hover:shadow-md bg-linear-to-r from-primary to-primary/90 hover:to-primary"
          asChild
        >
          <a
            href={`/api/go/${resource.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            访问官网
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
