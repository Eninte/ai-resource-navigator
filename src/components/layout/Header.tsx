'use client';

import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSubmitClick: () => void;
}

export function Header({ onSubmitClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full shadow-sm bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent font-[Montserrat]">
            AI资源导航
          </h1>
        </div>
        
        <Button onClick={onSubmitClick} className="gap-2 shadow-sm hover:shadow-md transition-all duration-300">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">提交资源</span>
        </Button>
      </div>
    </header>
  );
}
