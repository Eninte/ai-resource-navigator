'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { SearchBar } from '@/components/resources/SearchBar';
import { CategoryFilter } from '@/components/resources/CategoryFilter';
import { SortDropdown } from '@/components/resources/SortDropdown';
import { ResourceList } from '@/components/resources/ResourceList';
import { SubmitModal } from '@/components/submission/SubmitModal';
import { CATEGORY_SLUGS } from '@/config/categories';
import { useToast } from '@/hooks/useToast';

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
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'newest' | 'alphabetical' | 'random'>('default');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const fetchResources = useCallback(async () => {
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
        toast({
          title: '错误',
          description: '获取资源列表失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: '错误',
        description: '获取资源列表失败',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSubmitSuccess = () => {
    toast({
      title: '提交成功',
      description: '您的资源已提交，等待审核',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
      <main className="flex-1 py-8">
        <Container>
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              发现最佳AI工具
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              探索全球顶尖AI资源，一站式发现你需要的AI工具
            </p>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
          <div className="mb-4 text-sm text-muted-foreground">
            共 {resources.length} 个资源
          </div>

          {/* Resource List */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <ResourceList resources={resources} />
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
