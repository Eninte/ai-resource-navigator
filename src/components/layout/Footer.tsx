import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 AI资源导航. 探索AI的无限可能
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              隐私政策
            </Link>
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              管理后台
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
