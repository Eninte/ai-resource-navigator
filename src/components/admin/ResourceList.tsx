'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ExternalLink, Ban, RotateCcw, Trash2, Search } from 'lucide-react';
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

interface ResourceListProps {
  resources: Resource[];
  onRefresh: () => void;
  isLoading: boolean;
}

const statusLabels: Record<string, string> = {
  published: '已发布',
  pending: '待审核',
  rejected: '已拒绝',
  delisted: '已下架',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  published: 'default',
  pending: 'secondary',
  rejected: 'destructive',
  delisted: 'outline',
};

export function ResourceList({ resources, onRefresh, isLoading }: ResourceListProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(search.toLowerCase()) ||
      (resource.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelist = async (resource: Resource) => {
    try {
      setIsProcessing(resource.id);
      const response = await fetch('/api/admin/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resource.id,
          status: 'delisted',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delist');
      }

      toast.success('已下架');
      onRefresh();
    } catch {
      toast.error('操作失败');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRestore = async (resource: Resource) => {
    try {
      setIsProcessing(resource.id);
      const response = await fetch('/api/admin/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resource.id,
          status: 'published',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore');
      }

      toast.success('已恢复');
      onRefresh();
    } catch {
      toast.error('操作失败');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`确定要删除 "${resource.name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      setIsProcessing(resource.id);
      const response = await fetch(`/api/admin/resources?id=${resource.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('已删除');
      onRefresh();
    } catch {
      toast.error('删除失败');
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
            <SelectItem value="delisted">已下架</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">分类</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">发布时间</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-sm">{resource.name}</div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      访问链接
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {CATEGORIES.find(c => c.slug === resource.category)?.name || resource.category}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[resource.status] || 'default'}>
                    {statusLabels[resource.status] || resource.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {resource.published_at
                    ? new Date(resource.published_at).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {resource.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelist(resource)}
                        disabled={isProcessing === resource.id}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        下架
                      </Button>
                    )}
                    {resource.status === 'delisted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(resource)}
                        disabled={isProcessing === resource.id}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        恢复
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(resource)}
                      disabled={isProcessing === resource.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            没有找到匹配的资源
          </div>
        )}
      </div>
    </div>
  );
}
