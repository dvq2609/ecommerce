import { QUICK_CATEGORIES, type QuickCategory } from './mockHomeData';

export const categoryService = {
  /**
   * Lấy danh sách danh mục từ backend API (/api/category),
   * nếu lỗi hoặc server chưa chạy thì tự động fallback về mock categories.
   */
  async getCategories(): Promise<QuickCategory[]> {
    try {
      const response = await fetch('/api/category');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const json = await response.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        // Icon mapper theo tên danh mục
        const getIconForCategory = (name: string): string => {
          const lower = name.toLowerCase();
          if (lower.includes('áo') || lower.includes('blazer') || lower.includes('quần')) return 'apparel';
          if (lower.includes('đầm') || lower.includes('váy')) return 'styler';
          if (lower.includes('túi')) return 'shopping_bag';
          if (lower.includes('giày') || lower.includes('dép')) return 'steps';
          if (lower.includes('phụ kiện') || lower.includes('kính')) return 'watch';
          return 'category';
        };

        const serverCategories: QuickCategory[] = [
          { id: 'cat-all', name: 'Tất cả', slug: 'all', icon: 'apps' },
          ...json.data.map((c: any) => ({
            id: `cat-${c.categoryId}`,
            name: c.categoryName,
            slug: c.slug || `cat-${c.categoryId}`,
            icon: getIconForCategory(c.categoryName),
            badge: c.productCount > 10 ? 'Hot' : undefined,
          })),
        ];

        return serverCategories;
      }
    } catch {
      // Backend chưa chạy -> Fallback mock data
    }

    return QUICK_CATEGORIES;
  },
};
