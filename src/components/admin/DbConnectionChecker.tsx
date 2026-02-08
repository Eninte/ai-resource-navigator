'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface CheckResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  suggestion?: string;
}

interface DiagnosticReport {
  timestamp: string;
  environment: {
    nodeEnv: string;
    useSupabase: boolean;
  };
  checks: CheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    label: '正常',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    label: '错误',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    label: '警告',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    label: '信息',
  },
};

export function DbConnectionChecker() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/db-check');
      if (!response.ok) {
        throw new Error('检测请求失败');
      }
      const data = await response.json();
      setReport(data);
      
      if (data.summary.failed > 0) {
        toast.error(`检测到 ${data.summary.failed} 个错误`, {
          description: '请查看详细信息并修复问题',
        });
      } else if (data.summary.warnings > 0) {
        toast.warning(`检测到 ${data.summary.warnings} 个警告`, {
          description: '建议查看并优化配置',
        });
      } else {
        toast.success('所有检查通过', {
          description: '数据库连接配置正常',
        });
      }
    } catch (error) {
      console.error('检测失败:', error);
      toast.error('检测失败', {
        description: '无法连接到检测服务',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const getSummaryStatus = () => {
    if (!report) return null;
    if (report.summary.failed > 0) return 'error';
    if (report.summary.warnings > 0) return 'warning';
    return 'success';
  };

  const summaryStatus = getSummaryStatus();

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runCheck} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? '检测中...' : '重新检测'}
          </Button>
          {report && (
            <span className="text-sm text-muted-foreground">
              上次检测: {new Date(report.timestamp).toLocaleString('zh-CN')}
            </span>
          )}
        </div>
        
        {report && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              通过: {report.summary.passed}
            </Badge>
            {report.summary.warnings > 0 && (
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                警告: {report.summary.warnings}
              </Badge>
            )}
            {report.summary.failed > 0 && (
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3 text-red-600" />
                错误: {report.summary.failed}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* 总体状态卡片 */}
      {summaryStatus && (
        <Card className={`${statusConfig[summaryStatus].bgColor} ${statusConfig[summaryStatus].borderColor}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {(() => {
                const Icon = statusConfig[summaryStatus].icon;
                return <Icon className={`h-8 w-8 ${statusConfig[summaryStatus].color}`} />;
              })()}
              <div>
                <h3 className="text-lg font-semibold">
                  {summaryStatus === 'success' && '数据库连接正常'}
                  {summaryStatus === 'warning' && '数据库连接存在警告'}
                  {summaryStatus === 'error' && '数据库连接存在问题'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  环境: {report?.environment.nodeEnv === 'production' ? '生产环境' : '开发环境'}
                  {report?.environment.useSupabase && ' (使用 Supabase)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详细检查结果 */}
      <div className="grid gap-4">
        {isLoading && !report && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {report?.checks.map((check, index) => {
          const config = statusConfig[check.status];
          const Icon = config.icon;

          return (
            <Card key={index} className={`${config.bgColor} ${config.borderColor} overflow-hidden`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <CardTitle className="text-base font-medium">{check.name}</CardTitle>
                  </div>
                  <Badge className={config.badge}>{config.label}</Badge>
                </div>
                <CardDescription className="text-sm font-medium text-foreground mt-1">
                  {check.message}
                </CardDescription>
              </CardHeader>
              
              {(check.details || check.suggestion) && (
                <CardContent className="pt-0 space-y-3">
                  {check.details && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">详情: </span>
                      <span className="font-mono text-xs bg-white/50 px-2 py-1 rounded">
                        {check.details}
                      </span>
                    </div>
                  )}
                  {check.suggestion && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">建议: </span>
                      <span className="text-foreground">{check.suggestion}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* 帮助信息 */}
      {report && report.summary.failed > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">常见解决方案</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. 检查 <code className="bg-gray-200 px-1 rounded">.env</code> 文件中的数据库配置是否正确</p>
            <p>2. 确认 PostgreSQL 服务是否正在运行</p>
            <p>3. 检查数据库用户权限和网络连接</p>
            <p>4. 如果使用 Supabase，确认项目 URL 和 API Key 是否正确</p>
            <p>5. 运行 <code className="bg-gray-200 px-1 rounded">npx prisma db push</code> 确保数据库表结构已创建</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
