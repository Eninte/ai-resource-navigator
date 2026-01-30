'use client';

import { Badge } from '@/components/ui/badge';

interface Log {
  id: string;
  action: string;
  ip_hash: string;
  created_at: string;
  resource_id: string | null;
  details: unknown;
}

interface AdminLogsProps {
  logs: Log[];
  isLoading: boolean;
}

const actionLabels: Record<string, string> = {
  LOGIN: '登录',
  LOGOUT: '登出',
  APPROVE_RESOURCE: '通过资源',
  REJECT_RESOURCE: '拒绝资源',
  DELIST_RESOURCE: '下架资源',
  UPDATE_RESOURCE: '更新资源',
  DELETE_RESOURCE: '删除资源',
};

const actionVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  LOGIN: 'default',
  LOGOUT: 'secondary',
  APPROVE_RESOURCE: 'default',
  REJECT_RESOURCE: 'destructive',
  DELIST_RESOURCE: 'destructive',
  UPDATE_RESOURCE: 'secondary',
  DELETE_RESOURCE: 'destructive',
};

export function AdminLogs({ logs, isLoading }: AdminLogsProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">加载中...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">暂无操作日志</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">时间</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">IP</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">详情</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Badge variant={actionVariants[log.action] || 'default'}>
                  {actionLabels[log.action] || log.action}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm font-mono text-gray-600">
                {log.ip_hash.slice(0, 16)}...
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {log.resource_id && (
                  <span className="text-xs text-gray-500 block">
                    资源ID: {log.resource_id.slice(0, 8)}...
                  </span>
                )}
                {(() => {
                  if (!log.details || typeof log.details !== 'object') return null;
                  const detailsStr = JSON.stringify(log.details as Record<string, unknown>);
                  return (
                    <span className="text-xs text-gray-500">
                      {detailsStr.slice(0, 50)}
                      {detailsStr.length > 50 ? '...' : ''}
                    </span>
                  );
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
