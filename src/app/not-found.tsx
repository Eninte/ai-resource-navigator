import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">页面未找到</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <Link href="/">
        <Button>返回首页</Button>
      </Link>
    </div>
  );
}
