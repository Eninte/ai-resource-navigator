'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SORT_OPTIONS = [
  { value: 'default', label: '默认排序' },
  { value: 'newest', label: '最新添加' },
  { value: 'alphabetical', label: '名称字母' },
  { value: 'random', label: '随机展示' },
];

interface SortDropdownProps {
  value: 'default' | 'newest' | 'alphabetical' | 'random';
  onChange: (value: 'default' | 'newest' | 'alphabetical' | 'random') => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="排序方式" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
