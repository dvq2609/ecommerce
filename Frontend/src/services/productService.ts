import { MAIN_CATALOG_PRODUCTS, type ProductCatalogItem } from './mockHomeData';

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  sortByPrice?: 'asc' | 'desc';
}

export interface PagedProductResponse {
  items: ProductCatalogItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const productService = {
  /**
   * Lấy danh sách sản phẩm từ backend API (/api/product),
   * nếu lỗi hoặc server chưa chạy thì tự động fallback về mock data.
   */
  async getProducts(query: ProductQuery = {}): Promise<PagedProductResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.search) params.append('search', query.search);
    if (query.categoryId) params.append('categoryId', query.categoryId.toString());
    if (query.sortByPrice) params.append('sortByPrice', query.sortByPrice);

    try {
      const response = await fetch(`/api/product?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const json = await response.json();
      if (json && json.success && json.data && Array.isArray(json.data.items)) {
        // Map backend DTO sang giao diện ProductCatalogItem
        const items: ProductCatalogItem[] = json.data.items.map((item: any, idx: number) => {
          const primaryImg =
            item.images && item.images.length > 0
              ? item.images.find((img: any) => img.isPrimary)?.imageUrl || item.images[0].imageUrl
              : MAIN_CATALOG_PRODUCTS[idx % MAIN_CATALOG_PRODUCTS.length].imageUrl;

          const price = Number(item.price) || 0;
          const originalPrice = Math.round(price * 1.25);
          const discountPercent = 20;

          return {
            id: item.productId?.toString() || `prod-${idx}`,
            title: item.productName || 'Sản phẩm ShopVibe',
            category: item.categoryName || 'Thời trang',
            brandTag: item.brandName || 'ShopVibe Mall',
            price,
            originalPrice,
            discountPercent,
            rating: 4.9,
            reviewCount: 95 + (item.productId * 7) % 150,
            deliveryTag: idx % 2 === 0 ? 'Giao siêu tốc 2h' : 'Freeship Xtra',
            imageUrl: primaryImg,
          };
        });

        if (items.length > 0) {
          return {
            items,
            totalCount: json.data.totalCount || items.length,
            page: json.data.page || 1,
            pageSize: json.data.pageSize || 12,
          };
        }
      }
    } catch {
      // Backend chưa chạy hoặc lỗi mạng -> fallback sang mock data
    }

    // Fallback: Lọc từ mock data theo query
    let filtered = [...MAIN_CATALOG_PRODUCTS];
    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(s) || p.brandTag.toLowerCase().includes(s)
      );
    }
    if (query.sortByPrice === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (query.sortByPrice === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return {
      items: filtered,
      totalCount: filtered.length,
      page: query.page || 1,
      pageSize: query.pageSize || 12,
    };
  },
};
