import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

// Use Supabase API locally (to avoid IPv6 issues), Prisma in production
const USE_SUPABASE_API = process.env.NODE_ENV !== 'production';

// Prisma setup (for production)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Supabase client setup (for local development)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Database abstraction layer
export const db = {
  resource: {
    findMany: async (params: any) => {
      if (USE_SUPABASE_API) {
        // Use Supabase API for local development
        const { where, orderBy, select } = params;

        let query = supabase
          .from('Resource')
          .select(select ? Object.keys(select).join(',') : '*');

        if (where?.status) {
          query = query.eq('status', where.status);
        }
        if (where?.category && where.category !== 'all') {
          query = query.eq('category', where.category);
        }
        if (where?.OR) {
          // Search logic
          const searchTerm = where.OR[0].name.contains;
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Handle ordering
        if (orderBy) {
          if (Array.isArray(orderBy)) {
            for (const order of orderBy) {
              const key = Object.keys(order)[0];
              const dir = order[key];
              query = query.order(key, { ascending: dir === 'asc' });
            }
          } else {
            const key = Object.keys(orderBy)[0];
            const dir = orderBy[key];
            query = query.order(key, { ascending: dir === 'asc' });
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
      } else {
        // Use Prisma in production
        return prisma.resource.findMany(params);
      }
    },

    findUnique: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        const { data, error } = await supabase
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

    update: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { where, data } = params;
        const { data: result, error } = await supabase
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

    create: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { data } = params;
        const { data: result, error } = await supabase
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

    count: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        let query = supabase
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

    findFirst: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        let query = supabase
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

    delete: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        const { error } = await supabase
          .from('Resource')
          .delete()
          .eq('id', where.id);

        if (error) throw error;
        return { id: where.id };
      } else {
        return prisma.resource.delete(params);
      }
    },
  },

  category: {
    findMany: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { where } = params;
        let query = supabase
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
    create: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { data } = params;
        const { error } = await supabase
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
    create: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { data } = params;
        const { error } = await supabase
          .from('AdminLog')
          .insert(data);

        if (error) throw error;
        return { id: data.id };
      } else {
        return prisma.adminLog.create(params);
      }
    },

    findMany: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { take, skip, orderBy } = params;
        let query = supabase
          .from('AdminLog')
          .select('*');

        if (take) query = query.limit(take);
        if (skip) query = query.range(skip, skip + take - 1);
        if (orderBy) {
          const key = Object.keys(orderBy)[0];
          const dir = orderBy[key];
          query = query.order(key, { ascending: dir === 'asc' });
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
      } else {
        return prisma.adminLog.findMany(params);
      }
    },

    count: async (params: any) => {
      if (USE_SUPABASE_API) {
        const { data, error } = await supabase
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
