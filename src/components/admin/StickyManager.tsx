'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, Search, Pin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '@/config/categories';

interface Resource {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  price: string;
  is_open_source: boolean;
  status: string;
  created_at: string;
  published_at: string | null;
  global_sticky_order: number;
  category_sticky_order: number;
}

interface StickyManagerProps {
  resources: Resource[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function StickyManager({ resources, onRefresh, isLoading }: StickyManagerProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort by sticky order
  const sortedResources = [...filteredResources].sort((a, b) => {
    const globalDiff = b.global_sticky_order - a.global_sticky_order;
    if (globalDiff !== 0) return globalDiff;
    return b.category_sticky_order - a.category_sticky_order;
  });

  const handleUpdateGlobalSticky = async (resource: Resource, order: number) => {
    try {
      setIsProcessing(resource.id);
      const response = await fetch('/api/admin/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resource.id,
          global_sticky_order: Math.max(0, order),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast.success('全局置顶顺序已更新');
      onRefresh();
    } catch {
      toast.error('更新失败');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateCategorySticky = async (resource: Resource, order: number) => {
    try {
      setIsProcessing(resource.id);
      const response = await fetch('/api/admin/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resource.id,
          category_sticky_order: Math.max(0, order),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast.success('分类置顶顺序已更新');
      onRefresh();
    } catch {
      toast.error('更新失败');
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索资源..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">分类</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <Pin className="w-3 h-3" />
                  全局置顶
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <Pin className="w-3 h-3" />
                  分类置顶
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{resource.name}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline">
                    {CATEGORIES.find(c => c.slug === resource.category)?.name || resource.category}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateGlobalSticky(resource, resource.global_sticky_order - 1)}
                      disabled={isProcessing === resource.id || resource.global_sticky_order === 0}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {resource.global_sticky_order}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateGlobalSticky(resource, resource.global_sticky_order + 1)}
                      disabled={isProcessing === resource.id}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateCategorySticky(resource, resource.category_sticky_order - 1)}
                      disabled={isProcessing === resource.id || resource.category_sticky_order === 0}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {resource.category_sticky_order}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateCategorySticky(resource, resource.category_sticky_order + 1)}
                      disabled={isProcessing === resource.id}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedResources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            没有找到匹配的资源
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-1">置顶规则说明：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>全局置顶：数值越大，在首页列表中排名越靠前（最高 100）</li>
          <li>分类置顶：数值越大，在对应分类列表中排名越靠前（最高 100）</li>
          <li>相同置顶值的资源按发布时间倒序排列</li>
        </ul>
      </div>
    </div>
  );
}
