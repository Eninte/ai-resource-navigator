import { db } from '@/lib/supabase-db';
import { generateToken } from '@/lib/url-security';
import { CATEGORIES } from '@/config/categories';
import HomeClient from './HomeClient';

// Revalidate every hour
export const revalidate = 3600; 

export default async function Home() {
  // Fetch initial data for each category
  const categoryData: Record<string, any> = {};

  // We can run these in parallel
  await Promise.all(CATEGORIES.map(async (cat) => {
    try {
      const resources = await db.resource.findMany({
        where: {
          status: 'published',
          category: cat.slug,
        },
        orderBy: [
          { global_sticky_order: 'desc' },
          { category_sticky_order: 'desc' },
          { published_at: 'desc' }
        ],
        take: 12, // Match the LIMIT in CategorySection
      });
      
      const total = await db.resource.count({
        where: {
          status: 'published',
          category: cat.slug,
        }
      });

      // Add tokens and serialize dates
      const resourcesWithTokens = await Promise.all(resources.map(async (res) => ({
        id: res.id,
        name: res.name,
        description: res.description,
        url: res.url,
        category: res.category,
        price: res.price,
        is_open_source: res.is_open_source,
        global_sticky_order: res.global_sticky_order,
        category_sticky_order: res.category_sticky_order,
        published_at: res.published_at ? res.published_at.toISOString() : new Date().toISOString(),
        token: await generateToken(res.id),
      })));

      categoryData[cat.slug] = {
        resources: resourcesWithTokens,
        total
      };
    } catch (error) {
      console.error(`Error fetching initial data for category ${cat.slug}:`, error);
      // Fallback to empty if DB fails
      categoryData[cat.slug] = { resources: [], total: 0 };
    }
  }));

  return <HomeClient initialCategoryData={categoryData} />;
}
