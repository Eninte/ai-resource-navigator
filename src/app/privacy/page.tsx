import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 | AI资源导航',
  description: 'AI资源导航站的隐私政策，说明我们如何收集、使用和保护您的个人信息。',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">隐私政策</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最后更新日期：2025年1月
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. 概述</h2>
            <p className="text-gray-600">
              AI资源导航站（以下简称&quot;本网站&quot;）重视您的隐私。本隐私政策说明我们在您使用本网站时如何收集、使用和保护您的个人信息。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 信息收集</h2>
            <p className="text-gray-600 mb-4">
              我们可能收集以下信息：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Cookie 信息：</strong>我们使用 Cookie 来改善用户体验和分析网站流量。</li>
              <li><strong>点击统计：</strong>当您点击资源链接时，我们会在获得您同意的情况下记录点击数据（IP 地址会被哈希处理后存储）。</li>
              <li><strong>提交的资源：</strong>您通过表单提交的资源信息，包括名称、URL、描述等。</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 信息使用</h2>
            <p className="text-gray-600 mb-4">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>提供和维护网站服务</li>
              <li>分析网站使用情况，改进用户体验</li>
              <li>统计资源点击热度</li>
              <li>审核和处理用户提交的资源</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. 数据保护</h2>
            <p className="text-gray-600">
              我们采取以下措施保护您的数据：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>IP 地址经过 SHA-256 哈希处理后才存储，无法逆向还原</li>
              <li>使用 HTTPS 加密传输数据</li>
              <li>定期删除旧的访问日志</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Cookie 政策</h2>
            <p className="text-gray-600">
              我们使用以下类型的 Cookie：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>必要 Cookie：</strong>用于网站基本功能，无法关闭</li>
              <li><strong>统计 Cookie：</strong>用于分析网站流量和用户行为（需用户同意）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. 第三方链接</h2>
            <p className="text-gray-600">
              本网站包含指向第三方网站的链接。我们对这些网站的隐私实践不承担责任。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. 联系我们</h2>
            <p className="text-gray-600">
              如果您对本隐私政策有任何疑问，请联系我们。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
