'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingResources } from '@/components/admin/PendingResources';
import { ResourceList } from '@/components/admin/ResourceList';
import { StickyManager } from '@/components/admin/StickyManager';
import { AdminLogs } from '@/components/admin/AdminLogs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

interface Log {
  id: string;
  action: string;
  ip_hash: string;
  created_at: string;
  resource_id: string | null;
  details: unknown;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pendingRes, allRes, logsRes] = await Promise.all([
        fetch('/api/admin/resources?status=pending').then(r => r.json()),
        fetch('/api/admin/resources?status=all').then(r => r.json()),
        fetch('/api/admin/logs').then(r => r.json()),
      ]);
      
      setPendingResources(pendingRes.resources || []);
      setAllResources(allRes.resources || []);
      setLogs(logsRes.logs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('已退出登录');
      router.push('/admin/login');
    } catch {
      toast.error('退出失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">管理后台</h1>
          <Button variant="outline" onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="pending">
              待审核 {pendingResources.length > 0 && `(${pendingResources.length})`}
            </TabsTrigger>
            <TabsTrigger value="resources">资源列表</TabsTrigger>
            <TabsTrigger value="sticky">置顶管理</TabsTrigger>
            <TabsTrigger value="logs">操作日志</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <PendingResources 
              resources={pendingResources} 
              onRefresh={fetchData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ResourceList 
              resources={allResources} 
              onRefresh={fetchData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="sticky" className="space-y-4">
            <StickyManager 
              resources={allResources.filter(r => r.status === 'published')}
              onRefresh={fetchData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <AdminLogs logs={logs} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
