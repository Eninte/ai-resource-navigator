import { PrismaClient } from '@prisma/client';
import type { Prisma, Resource } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

// Prisma setup (for production)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Supabase client setup (for local development)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const canUseSupabase = Boolean(supabaseUrl && supabaseKey);
const USE_SUPABASE_API =
  process.env.NODE_ENV !== 'production' && canUseSupabase;
const supabase = canUseSupabase
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : null;
const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  return supabase;
};

// Database abstraction layer
export const db = {
  resource: {
    findMany: async (params: Prisma.ResourceFindManyArgs): Promise<Resource[]> => {
      if (USE_SUPABASE_API) {
        // Use Supabase API for local development
        const { where, orderBy, select } = params;

        const client = getSupabase();
        let query = client
          .from('Resource')
          .select(select ? Object.keys(select).join(',') : '*');

        if (where?.status) {
          query = query.eq('status', where.status);
        }
        if (where?.category && where.category !== 'all') {
          query = query.eq('category', where.category);
        }
        if (where?.OR && Array.isArray(where.OR)) {
          // Search logic
          const first = where.OR[0];
          const searchTerm =
            typeof first === 'object' &&
            first &&
            'name' in first &&
            typeof first.name === 'object' &&
            first.name &&
            'contains' in first.name
              ? String(first.name.contains)
              : '';
          if (searchTerm) {
            query = query.or(
              `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
            );
          }
        }

        // Handle ordering
        if (orderBy) {
          const applyOrder = (
            order: Prisma.ResourceOrderByWithRelationInput
          ) => {
            const [key, value] = Object.entries(order)[0] ?? [];
            if (
              typeof key === 'string' &&
              (value === 'asc' || value === 'desc')
            ) {
              query = query.order(key, { ascending: value === 'asc' });
            }
          };

          if (Array.isArray(orderBy)) {
            for (const order of orderBy) {
              applyOrder(order);
            }
          } else {
            applyOrder(orderBy);
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data || []) as unknown as Resource[];
      } else {
        // Use Prisma in production
        return prisma.resource.findMany(params);
      }
    },

    findUnique: async (params: Prisma.ResourceFindUniqueArgs) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        const { data, error } = await getSupabase()
          .from('Resource')
          .select('*')
          .eq('id', where.id)
          .single();

        if (error) throw error;
        return data;
      } else {
        return prisma.resource.findUnique(params);
      }
    },

    update: async (params: Prisma.ResourceUpdateArgs) => {
      if (USE_SUPABASE_API) {
        const { where, data } = params;
        const { data: result, error } = await getSupabase()
          .from('Resource')
          .update(data)
          .eq('id', where.id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        return prisma.resource.update(params);
      }
    },

    create: async (params: Prisma.ResourceCreateArgs) => {
      if (USE_SUPABASE_API) {
        const { data } = params;
        const { data: result, error } = await getSupabase()
          .from('Resource')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        return prisma.resource.create(params);
      }
    },

    count: async (params: Prisma.ResourceCountArgs) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        const client = getSupabase();
        let query = client
          .from('Resource')
          .select('*', { count: 'exact', head: true });

        if (where?.status) {
          query = query.eq('status', where.status);
        }
        if (where?.category && where.category !== 'all') {
          query = query.eq('category', where.category);
        }

        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
      } else {
        return prisma.resource.count(params);
      }
    },

    findFirst: async (params: Prisma.ResourceFindFirstArgs) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        const client = getSupabase();
        let query = client
          .from('Resource')
          .select('*')
          .limit(1);

        if (where?.url) {
          query = query.eq('url', where.url);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data?.[0] || null;
      } else {
        return prisma.resource.findFirst(params);
      }
    },

    delete: async (params: Prisma.ResourceDeleteArgs) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        const { error } = await getSupabase()
          .from('Resource')
          .delete()
          .eq('id', where.id);

        if (error) throw error;
        return { id: where.id };
      } else {
        return prisma.resource.delete(params);
      }
    },

    groupBy: async (params: { by: string[]; where?: { status?: string }; _count?: { _all: true } }) => {
      type GroupByResult = { category: string; _count: { _all: number } };

      if (USE_SUPABASE_API) {
        const { by, where } = params;
        const client = getSupabase();
        let query = client
          .from('Resource')
          .select(by?.[0] || '*', { count: 'exact' });

        if (where?.status) {
          query = query.eq('status', where.status);
        }

        const { data, error } = await query;

        if (error) throw error;

        const counts: Record<string, number> = {};

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.forEach((item: any) => {
          const key = item.category as string;
          counts[key] = (counts[key] || 0) + 1;
        });

        const result: GroupByResult[] = Object.entries(counts).map(([category, count]) => ({
          category,
          _count: { _all: count },
        }));

        return result;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return prisma.resource.groupBy(params as any) as unknown as GroupByResult[];
      }
    },
  },

  category: {
    findMany: async (params: Prisma.CategoryFindManyArgs) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        const client = getSupabase();
        let query = client
          .from('Category')
          .select('*');

        if (where?.is_active !== undefined) {
          query = query.eq('is_active', where.is_active);
        }

        const { data, error } = await query.order('display_order');

        if (error) throw error;
        return data;
      } else {
        return prisma.category.findMany(params);
      }
    },
  },

  click: {
    create: async (params: Prisma.ClickCreateArgs) => {
      if (USE_SUPABASE_API) {
        const { data } = params;
        const { error } = await getSupabase()
          .from('Click')
          .insert(data);

        if (error) throw error;
        return { id: data.id };
      } else {
        return prisma.click.create(params);
      }
    },
  },

  adminLog: {
    create: async (params: Prisma.AdminLogCreateArgs) => {
      if (USE_SUPABASE_API) {
        const { data } = params;
        const { error } = await getSupabase()
          .from('AdminLog')
          .insert(data);

        if (error) throw error;
        return { id: data.id };
      } else {
        return prisma.adminLog.create(params);
      }
    },

    findMany: async (params: Prisma.AdminLogFindManyArgs) => {
      if (USE_SUPABASE_API) {
        const { take, skip, orderBy } = params;
        const client = getSupabase();
        let query = client
          .from('AdminLog')
          .select('*');

        if (take !== undefined) query = query.limit(take);
        if (skip !== undefined) {
          if (take !== undefined) {
            query = query.range(skip, skip + take - 1);
          } else {
            query = query.range(skip, skip);
          }
        }
        if (orderBy) {
          const [key, value] = Object.entries(orderBy)[0] ?? [];
          if (
            typeof key === 'string' &&
            (value === 'asc' || value === 'desc')
          ) {
            query = query.order(key, { ascending: value === 'asc' });
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
      } else {
        return prisma.adminLog.findMany(params);
      }
    },

    count: async (params?: Prisma.AdminLogCountArgs) => {
      if (USE_SUPABASE_API) {
        const { data, error } = await getSupabase()
          .from('AdminLog')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return data || 0;
      } else {
        return prisma.adminLog.count(params);
      }
    },
  },
};
