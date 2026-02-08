import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

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

export async function GET() {
  const checks: CheckResult[] = [];
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // 检查环境变量
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  const canUseSupabase = Boolean(supabaseUrl && supabaseKey);
  const useSupabase = nodeEnv !== 'production' && canUseSupabase;

  // 1. 检查 NODE_ENV
  checks.push({
    name: 'Node 环境',
    status: 'info',
    message: `当前环境: ${nodeEnv}`,
    details: useSupabase ? '开发模式：将使用 Supabase API' : '生产模式：将使用 Prisma + PostgreSQL',
  });

  // 2. 检查 DATABASE_URL
  if (!databaseUrl) {
    checks.push({
      name: 'DATABASE_URL',
      status: 'error',
      message: '环境变量未设置',
      details: 'DATABASE_URL 是连接 PostgreSQL 数据库必需的',
      suggestion: '请在 .env 文件中添加 DATABASE_URL=postgresql://user:password@host:port/database',
    });
  } else {
    // 解析 DATABASE_URL 但不暴露敏感信息
    try {
      const url = new URL(databaseUrl);
      const host = url.hostname;
      const port = url.port || '5432';
      const database = url.pathname.slice(1);
      
      checks.push({
        name: 'DATABASE_URL',
        status: 'success',
        message: '环境变量已设置',
        details: `目标数据库: ${database} @ ${host}:${port}`,
      });

      // 3. 测试 PostgreSQL 连接
      try {
        const pool = new Pool({
          connectionString: databaseUrl,
          connectionTimeoutMillis: 5000,
          ssl: { rejectUnauthorized: false },
        });

        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as now, version() as version');
        client.release();
        await pool.end();

        checks.push({
          name: 'PostgreSQL 连接',
          status: 'success',
          message: '连接成功',
          details: `服务器时间: ${result.rows[0].now}`,
        });
      } catch (error) {
        const err = error as Error;
        let suggestion = '请检查数据库服务是否运行，以及连接信息是否正确';
        
        if (err.message.includes('ECONNREFUSED')) {
          suggestion = '无法连接到数据库服务器，请确认：1) PostgreSQL 服务是否已启动 2) 主机地址和端口是否正确 3) 防火墙是否允许连接';
        } else if (err.message.includes('password authentication failed')) {
          suggestion = '认证失败，请检查 DATABASE_URL 中的用户名和密码是否正确';
        } else if (err.message.includes('database') && err.message.includes('does not exist')) {
          suggestion = '数据库不存在，请先创建数据库或使用 prisma db push 命令创建';
        } else if (err.message.includes('timeout')) {
          suggestion = '连接超时，可能是网络问题或数据库服务器负载过高';
        } else if (err.message.includes('SSL')) {
          suggestion = 'SSL 连接问题，请检查数据库 SSL 配置或尝试禁用 SSL';
        }

        checks.push({
          name: 'PostgreSQL 连接',
          status: 'error',
          message: '连接失败',
          details: err.message,
          suggestion,
        });
      }
    } catch {
      checks.push({
        name: 'DATABASE_URL',
        status: 'error',
        message: 'URL 格式无效',
        details: '无法解析 DATABASE_URL，请检查格式是否正确',
        suggestion: '格式应为: postgresql://user:password@host:port/database',
      });
    }
  }

  // 4. 检查 Supabase 配置（开发环境）
  if (nodeEnv !== 'production') {
    if (!supabaseUrl) {
      checks.push({
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        status: 'warning',
        message: '环境变量未设置',
        details: '开发模式下可选，用于使用 Supabase API 代替直接数据库连接',
        suggestion: '如需使用 Supabase，请在 .env 文件中添加 NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
      });
    } else {
      checks.push({
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        status: 'success',
        message: '环境变量已设置',
        details: `Supabase 项目: ${supabaseUrl}`,
      });
    }

    if (!supabaseKey) {
      checks.push({
        name: 'SUPABASE_ANON_KEY',
        status: useSupabase ? 'error' : 'warning',
        message: useSupabase ? '环境变量未设置' : '环境变量未设置',
        details: useSupabase ? '使用 Supabase API 必需的密钥' : '开发模式下可选',
        suggestion: '请在 .env 文件中添加 SUPABASE_ANON_KEY=your-anon-key',
      });
    } else {
      checks.push({
        name: 'SUPABASE_ANON_KEY',
        status: 'success',
        message: '环境变量已设置',
        details: `密钥长度: ${supabaseKey.length} 字符`,
      });

      // 5. 测试 Supabase 连接
      if (supabaseUrl && supabaseKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });

          const { data, error } = await supabase
            .from('Resource')
            .select('id', { count: 'exact', head: true });

          if (error) {
            throw error;
          }

          checks.push({
            name: 'Supabase 连接',
            status: 'success',
            message: '连接成功',
            details: '成功连接到 Supabase 项目',
          });
        } catch (error) {
          const err = error as Error;
          let suggestion = '请检查 Supabase 项目是否正常运行';

          if (err.message.includes('Invalid API key')) {
            suggestion = 'API 密钥无效，请检查 SUPABASE_ANON_KEY 是否正确';
          } else if (err.message.includes('404')) {
            suggestion = '项目不存在或 URL 错误，请检查 NEXT_PUBLIC_SUPABASE_URL';
          } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
            suggestion = '网络错误，请检查网络连接或代理设置';
          } else if (err.message.includes('Resource')) {
            suggestion = 'Resource 表不存在，请先运行数据库迁移';
          }

          checks.push({
            name: 'Supabase 连接',
            status: 'error',
            message: '连接失败',
            details: err.message,
            suggestion,
          });
        }
      }
    }
  }

  // 6. 检查 Prisma 配置
  checks.push({
    name: 'Prisma 配置',
    status: 'info',
    message: 'Prisma Client 已初始化',
    details: 'Prisma 使用 pg 适配器连接 PostgreSQL',
  });

  // 计算统计
  const passed = checks.filter(c => c.status === 'success').length;
  const failed = checks.filter(c => c.status === 'error').length;
  const warnings = checks.filter(c => c.status === 'warning').length;

  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv,
      useSupabase,
    },
    checks,
    summary: {
      total: checks.length,
      passed,
      failed,
      warnings,
    },
  };

  return NextResponse.json(report);
}
