'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ExternalLink, Check, X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

interface PendingResourcesProps {
  resources: Resource[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function PendingResources({ resources, onRefresh, isLoading }: PendingResourcesProps) {
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleApprove = async (resource: Resource) => {
    const category = selectedCategory || resource.category;
    
    try {
      setIsProcessing(resource.id);
      const response = await fetch('/api/admin/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resource.id,
          status: 'published',
          category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve');
      }

      toast.success('已通过审核');
      setEditingResource(null);
      onRefresh();
    } catch {
      toast.error('操作失败');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (resource: Resource) => {
    try {
      setIsProcessing(resource.id);
      const response = await fetch('/api/admin/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resource.id,
          status: 'rejected',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject');
      }

      toast.success('已拒绝');
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

  if (resources.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">暂无待审核资源</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold truncate">{resource.name}</h3>
                <Badge variant="outline">{resource.price}</Badge>
                {resource.is_open_source && (
                  <Badge variant="secondary">开源</Badge>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {resource.description || '暂无描述'}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  访问链接
                </a>
                <span>分类: {CATEGORIES.find(c => c.slug === resource.category)?.name || resource.category}</span>
                <span>提交时间: {new Date(resource.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedCategory(resource.category);
                  setEditingResource(resource);
                }}
                disabled={isProcessing === resource.id}
              >
                <Check className="w-4 h-4 mr-1" />
                通过
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(resource)}
                disabled={isProcessing === resource.id}
              >
                <X className="w-4 h-4 mr-1" />
                拒绝
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(resource)}
                disabled={isProcessing === resource.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Dialog open={!!editingResource} onOpenChange={() => setEditingResource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核通过</DialogTitle>
            <DialogDescription>
              请确认分类设置后通过审核
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">分类</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingResource(null)}>
              取消
            </Button>
            <Button 
              onClick={() => editingResource && handleApprove(editingResource)}
              disabled={!selectedCategory}
            >
              确认通过
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
