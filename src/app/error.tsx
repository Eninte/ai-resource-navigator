'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">出错了</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">系统遇到了问题</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        抱歉，系统遇到了意外错误。请稍后重试或联系管理员。
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>重试</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
