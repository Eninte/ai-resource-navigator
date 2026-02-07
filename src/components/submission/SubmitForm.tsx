'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '@/config/categories';

interface FormData {
  name: string;
  url: string;
  category: string;
  price: 'Free' | 'Freemium' | 'Paid';
  is_open_source: boolean;
  description: string;
}

interface SubmitFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
}

const PRICE_OPTIONS = [
  { value: 'Free', label: '免费' },
  { value: 'Freemium', label: '免费增值' },
  { value: 'Paid', label: '付费' },
];

export function SubmitForm({ onSubmit, isSubmitting }: SubmitFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      url: '',
      category: 'uncategorized',
      price: 'Freemium',
      is_open_source: false,
      description: '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setError(null);
      await onSubmit(data);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                名称 <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="例如：ChatGPT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                链接 <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>分类</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="uncategorized">未分类</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>选填，默认为&quot;未分类&quot;</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>价格</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择价格类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRICE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>选填，默认为&quot;免费增值&quot;</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_open_source"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>开源项目</FormLabel>
                <FormDescription>选填，默认未选中</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="简短描述这个AI工具的功能..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>选填，最多500字符</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交资源'}
        </Button>
      </form>
    </Form>
  );
}
