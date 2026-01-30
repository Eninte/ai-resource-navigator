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
  Free: 'bg-green-500/10 text-green-600 border-green-500/20',
  Freemium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  Paid: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const isSticky = resource.global_sticky_order > 0 || resource.category_sticky_order > 0;

  return (
    <Card className={cn(
      'group relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      isSticky && 'ring-1 ring-primary/20'
    )}>
      {isSticky && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            置顶
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1">
            {resource.name}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant="outline" className={cn('text-xs', PRICE_COLORS[resource.price])}>
            {resource.price === 'Free' ? '免费' : resource.price === 'Freemium' ? '免费增值' : '付费'}
          </Badge>
          
          {resource.is_open_source && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
              开源
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {getCategoryName(resource.category)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
          {resource.description || '暂无描述'}
        </p>
        
        <Button
          variant="default"
          size="sm"
          className="w-full gap-2"
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
