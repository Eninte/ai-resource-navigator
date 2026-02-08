'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { SearchBar } from '@/components/resources/SearchBar';
import { CategoryFilter } from '@/components/resources/CategoryFilter';
import { SortDropdown } from '@/components/resources/SortDropdown';
import { CategoryFeed } from '@/components/resources/CategoryFeed';
import { ResourceList } from '@/components/resources/ResourceList';
import { SubmitModal } from '@/components/submission/SubmitModal';
import { CATEGORY_SLUGS } from '@/config/categories';
import { toast } from 'sonner';

interface Resource {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  price: string;
  is_open_source: boolean;
  global_sticky_order: number;
  category_sticky_order: number;
  published_at: Date | string;
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'newest' | 'alphabetical' | 'random'>('default');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const isFiltering = !!(searchQuery || selectedCategory || sortBy !== 'default');

  const fetchResources = useCallback(async () => {
    if (!isFiltering) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      params.set('sort', sortBy);

      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResources(data.resources);
        
        // Calculate category counts
        const counts: Record<string, number> = {};
        data.resources.forEach((r: Resource) => {
          counts[r.category] = (counts[r.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      } else {
        toast.error('错误', {
          description: '获取资源列表失败',
        });
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('错误', {
        description: '获取资源列表失败',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, isFiltering]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSubmitSuccess = () => {
      toast.success('提交成功', {
      description: '您的资源已提交，等待审核',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-background to-muted/30">
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
      <main className="flex-1 py-8">
        <Container>
          {/* Hero Section */}
          <div className="relative text-center mb-16 py-8">
            {/* Background Decorations - Optimized with Radial Gradient instead of Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,var(--primary)_0%,transparent_70%)] opacity-10 -z-10 pointer-events-none" />
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-[Montserrat]">
              发现最佳 AI 工具
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              探索全球顶尖 AI 资源，一站式发现你需要的 AI 工具
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground/80 font-medium">
              <span className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                已收录 1,000+ 优质工具
              </span>
              <span className="hidden sm:inline-block">|</span>
              <span className="hidden sm:inline-block">每周持续更新</span>
              <span className="hidden sm:inline-block">|</span>
              <span className="hidden sm:inline-block">人工精选审核</span>
            </div>
            
            <div className="mt-10">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <CategoryFilter
              categories={CATEGORY_SLUGS}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              resourceCounts={categoryCounts}
            />
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {/* Resource Count */}
          {isFiltering && (
            <div className="mb-4 text-sm text-muted-foreground">
              共 {resources.length} 个资源
            </div>
          )}

          {/* Resource List or Category Feed */}
          {isFiltering ? (
            isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <ResourceList resources={resources} />
            )
          ) : (
            <CategoryFeed />
          )}
        </Container>
      </main>

      <Footer />

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </div>
  );
}
