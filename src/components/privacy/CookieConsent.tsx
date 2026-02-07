'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('cookie-consent');
  });

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    toast.success('已接受 Cookie 使用');
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
    toast.info('已拒绝非必要 Cookie，部分功能可能受限');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-medium mb-1">Cookie 使用说明</h3>
            <p className="text-sm text-gray-600">
              我们使用 Cookie 来改善您的浏览体验、分析网站流量，并记录资源点击统计。
              点击&quot;接受&quot;即表示您同意我们的
              <a href="/privacy" className="text-blue-600 hover:underline ml-1">
                隐私政策
              </a>
              。
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDecline}>
              拒绝
            </Button>
            <Button size="sm" onClick={handleAccept}>
              接受
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
