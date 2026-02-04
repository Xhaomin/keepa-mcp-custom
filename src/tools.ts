import { z } from 'zod';
import { KeepaClient } from './keepa-client.js';
import { KeepaDomain, KeepaDataType, ProductFinderResult, CategoryInsights, SalesVelocityData, InventoryAnalysis } from './types.js';

// ============================================
// MODIFIED: Added optional 'code' parameter for EAN/UPC search
// ============================================
export const ProductLookupSchema = z.object({
  asin: z.string().optional().describe('Amazon ASIN (product identifier)'),
  code: z.string().optional().describe('Product code (EAN, UPC, ISBN-13) - alternative to ASIN'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, 4=FR, 5=JP, 6=CA, 7=CN, 8=IT, 9=ES, 10=IN, 11=MX)'),
  days: z.number().min(1).max(365).optional().describe('Number of days of price history to include'),
  history: z.boolean().default(false).describe('Include full price history'),
  offers: z.number().min(0).max(100).optional().describe('Number of marketplace offers to include'),
  variations: z.boolean().default(false).describe('Include product variations'),
  rating: z.boolean().default(false).describe('Include product rating data'),
});

export const BatchProductLookupSchema = z.object({
  asins: z.array(z.string()).max(100).describe('Array of Amazon ASINs (max 100)'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  days: z.number().min(1).max(365).optional().describe('Number of days of price history to include'),
  history: z.boolean().default(false).describe('Include full price history'),
});

export const DealSearchSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to filter by'),
  minPrice: z.number().min(0).optional().describe('Minimum price in cents'),
  maxPrice: z.number().min(0).optional().describe('Maximum price in cents'),
  minDiscount: z.number().min(0).max(100).optional().describe('Minimum discount percentage'),
  minRating: z.number().min(1).max(5).optional().describe('Minimum product rating (1-5 stars)'),
  isPrime: z.boolean().optional().describe('Filter for Prime eligible deals only'),
  sortType: z.number().min(0).max(4).default(0).describe('Sort type (0=deal score, 1=price, 2=discount, 3=rating, 4=reviews)'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
  perPage: z.number().min(1).max(50).default(25).describe('Results per page (max 50)'),
});

export const SellerLookupSchema = z.object({
  seller: z.string().describe('Seller ID or name'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  storefront: z.number().min(0).max(100000).optional().describe('Number of storefront ASINs to retrieve'),
});

export const BestSellersSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().describe('Amazon category ID'),
  range: z.number().min(1).max(10000).default(100).describe('Number of top products to retrieve'),
});

export const PriceHistorySchema = z.object({
  asin: z.string().describe('Amazon ASIN (product identifier)'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  dataType: z.number().min(0).max(30).describe('Data type (0=Amazon, 1=New, 2=Used, 3=Sales Rank, etc.)'),
  days: z.number().min(1).max(365).default(30).describe('Number of days of history'),
});

export const ProductFinderSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Root category ID to search within'),
  minPrice: z.number().min(0).optional().describe('Minimum current price in cents'),
  maxPrice: z.number().min(0).optional().describe('Maximum current price in cents'),
  minRating: z.number().min(1).max(5).optional().describe('Minimum product rating (1-5)'),
  maxRating: z.number().min(1).max(5).optional().describe('Maximum product rating (1-5)'),
  minReviewCount: z.number().min(0).optional().describe('Minimum number of reviews'),
  maxReviewCount: z.number().min(0).optional().describe('Maximum number of reviews'),
  minSalesRank: z.number().min(1).optional().describe('Minimum sales rank'),
  maxSalesRank: z.number().min(1).optional().describe('Maximum sales rank'),
  minMonthlySold: z.number().min(0).optional().describe('Minimum monthly units sold'),
  maxMonthlySold: z.number().min(0).optional().describe('Maximum monthly units sold'),
  minSellerCount: z.number().min(0).optional().describe('Minimum number of sellers'),
  maxSellerCount: z.number().min(0).optional().describe('Maximum number of sellers'),
  sellerCountTimeframe: z.enum(['current', '30day', '90day', '180day', '365day']).default('90day').describe('Timeframe for seller count analysis'),
  isPrime: z.boolean().optional().describe('Filter for Prime eligible products only'),
  isFBA: z.boolean().optional().describe('Filter for FBA products only'),
  hasAmazonOffer: z.boolean().optional().describe('Filter for products with Amazon as seller'),
  isOutOfStock: z.boolean().optional().describe('Filter for out of stock products'),
  isNew: z.boolean().optional().describe('Filter for new products only'),
  titleSearch: z.string().optional().describe('Search within product titles'),
  brandSearch: z.string().optional().describe('Search by brand name'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
  perPage: z.number().min(1).max(100).default(50).describe('Results per page (max 100)'),
  sortBy: z.enum(['salesRank', 'price', 'rating', 'reviews', 'monthlySold']).default('salesRank').describe('Sort results by'),
  sortOrder: z.enum(['asc', 'desc']).default('asc').describe('Sort order'),
});

export const CategoryAnalysisSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().describe('Category ID to analyze'),
  depth: z.enum(['shallow', 'medium', 'deep']).default('medium').describe('Analysis depth'),
  includeTopProducts: z.boolean().default(true).describe('Include top performing products'),
  includeCompetitorAnalysis: z.boolean().default(true).describe('Include competitor/seller analysis'),
  sellerCountTimeframe: z.enum(['current', '30day', '90day', '180day', '365day']).default('90day').describe('Timeframe for seller count analysis'),
});

export const SalesVelocitySchema = z.object({
  asins: z.array(z.string()).max(100).describe('Array of ASINs to analyze'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  days: z.number().min(7).max(365).default(30).describe('Number of days to analyze'),
});

export const InventoryAnalysisSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to analyze'),
  asins: z.array(z.string()).max(100).optional().describe('Specific ASINs to analyze (your inventory)'),
  analysisType: z.enum(['overview', 'fast_movers', 'slow_movers', 'stockout_risks', 'seasonal']).default('overview').describe('Type of inventory analysis'),
  timeframe: z.enum(['week', 'month', 'quarter']).default('month').describe('Analysis timeframe'),
  sellerCountTimeframe: z.enum(['current', '30day', '90day', '180day', '365day']).default('90day').describe('Timeframe for seller count analysis (current, 30day, 90day, 180day, 365day)'),
  targetTurnoverRate: z.number().min(1).max(50).default(12).describe('Target inventory turns per year'),
});

export const TokenStatusSchema = z.object({});

export class KeepaTools {
  constructor(private client: KeepaClient) {}

  // ============================================
  // ENHANCED: lookupProduct with Buy Box, Image, EAN, Fees support
  // ============================================
  async lookupProduct(params: z.infer<typeof ProductLookupSchema>): Promise<string> {
    try {
      // Validate: require either ASIN or code
      if (!params.asin && !params.code) {
        return 'Error: Either ASIN or code (EAN/UPC/ISBN) is required';
      }

      const queryParams = {
        days: params.days || 30,
        history: params.history !== false,
        offers: params.offers || 20,
        variations: params.variations,
        rating: params.rating !== false,
        buybox: true,
      };

      let product;
      if (params.code) {
        // Search by EAN/UPC/ISBN code
        const products = await this.client.getProduct({ 
          code: params.code, 
          domain: params.domain as KeepaDomain, 
          ...queryParams 
        });
        product = products?.[0];
      } else {
        // Search by ASIN
        product = await this.client.getProductByAsin(
          params.asin!,
          params.domain as KeepaDomain,
          queryParams
        );
      }

      if (!product) {
        return `Product not found for ${params.asin ? 'ASIN: ' + params.asin : 'Code: ' + params.code}`;
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      const asin = product.asin || params.asin || 'N/A';
      
      // Extract image URL
      const imageUrl = product.imagesCSV 
        ? `https://m.media-amazon.com/images/I/${product.imagesCSV.split(',')[0]}`
        : null;

      let result = `**Product Information for ${asin}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📦 **ASIN**: ${asin}\n`;
      if (imageUrl) result += `📷 **Imagen**: ${imageUrl}\n`;
      result += `🏷️ **Titulo**: ${product.title || 'N/A'}\n`;
      result += `🏢 **Marca**: ${product.brand || 'N/A'}\n`;
      result += `📊 **Categoria**: ${product.productGroup || 'N/A'}\n\n`;

      // Extract pricing data
      const buyBoxPrice = product.stats?.buyBoxPrice;
      const buyBoxUsedPrice = product.stats?.buyBoxUsedPrice;
      const avgPrice = product.stats?.avg?.[0];
      const minPrice = product.stats?.min?.[0];
      const maxPrice = product.stats?.max?.[0];
      const salesRank = product.stats?.salesRankReference;
      const monthlySold = (product as any).monthlySold || 0;
      const rating = product.stats?.current?.[16] ? product.stats.current[16] / 10 : null;
      const reviewCount = product.stats?.current?.[17] || 0;
      
      // Offers analysis
      const offerCount = product.offers?.length || 0;
      const amazonOffers = product.offers?.filter(o => o.isAmazon).length || 0;
      const fbaOffers = product.offers?.filter(o => o.isFBA && !o.isAmazon).length || 0;
      const fbmOffers = product.offers?.filter(o => !o.isFBA && !o.isAmazon).length || 0;
      
      // Buy Box info
      const buyBoxIsFBA = (product.stats as any)?.buyBoxIsFBA;
      const buyBoxIsAmazon = (product.stats as any)?.buyBoxIsAmazon;
      const buyBoxShippingCountry = (product.stats as any)?.buyBoxShippingCountry;
      
      // Amazon fees
      const referralFee = (product as any).referralFeePercentage;
      const pickAndPackFee = (product as any).fbaFees?.pickAndPackFee;

      // PRECIOS section
      result += `💰 **PRECIOS:**\n`;
      if (buyBoxPrice && buyBoxPrice > 0) {
        result += `   - Buy Box: ${this.client.formatPrice(buyBoxPrice, domain)} (Nuevo)\n`;
      } else if (buyBoxUsedPrice && buyBoxUsedPrice > 0) {
        result += `   - Buy Box: ${this.client.formatPrice(buyBoxUsedPrice, domain)} (⚠️ USADO)\n`;
      }
      if (avgPrice && avgPrice > 0) result += `   - Promedio 30d: ${this.client.formatPrice(avgPrice, domain)}\n`;
      if (minPrice && minPrice > 0) result += `   - Mínimo 30d: ${this.client.formatPrice(minPrice, domain)}\n`;
      if (maxPrice && maxPrice > 0) result += `   - Máximo 30d: ${this.client.formatPrice(maxPrice, domain)}\n`;
      if (minPrice && maxPrice && minPrice > 0 && maxPrice > 0 && minPrice !== maxPrice) {
        const variation = Math.round(((maxPrice - minPrice) / minPrice) * 100);
        result += `   - Variación: ${variation}%\n`;
      }

      // BUY BOX section
      result += `\n🏆 **BUY BOX:**\n`;
      let ganador = 'Sin Buy Box';
      if (buyBoxIsAmazon) ganador = 'Amazon';
      else if (buyBoxIsFBA) ganador = 'Vendedor 3P (FBA)';
      else if (buyBoxPrice && buyBoxPrice > 0) ganador = 'Vendedor 3P (FBM)';
      else if (buyBoxUsedPrice && buyBoxUsedPrice > 0) ganador = 'Vendedor 3P (Usado)';
      result += `   - Ganador: ${ganador}\n`;
      
      // Condición: Nuevo solo si buyBoxPrice > 0, Usado solo si buyBoxUsedPrice > 0 y no hay buyBoxPrice
      if (buyBoxPrice && buyBoxPrice > 0) {
        result += `   - Condición: Nuevo\n`;
      } else if (buyBoxUsedPrice && buyBoxUsedPrice > 0) {
        result += `   - Condición: ⚠️ USADO\n`;
      }
      if (buyBoxShippingCountry) result += `   - País envío: ${buyBoxShippingCountry}\n`;

      // Sales Rank
      if (salesRank) result += `\n📊 **Sales Rank**: #${salesRank.toLocaleString()}\n`;

      // RESEÑAS section
      result += `\n⭐ **RESEÑAS:**\n`;
      if (rating) result += `   - Rating: ${rating.toFixed(1)}/5.0\n`;
      result += `   - Total: ${reviewCount.toLocaleString()} reseñas\n`;

      // COMPETENCIA section
      result += `\n🏪 **COMPETENCIA:**\n`;
      result += `   - Total ofertas: ${offerCount}\n`;
      result += `   - Ofertas FBA: ${fbaOffers}\n`;
      result += `   - Ofertas FBM: ${fbmOffers}\n`;
      result += `   - Amazon vende: ${amazonOffers > 0 ? 'Sí' : 'No'}\n`;

      // VELOCIDAD DE VENTAS section
      if (monthlySold > 0) {
        result += `\n📈 **VELOCIDAD DE VENTAS (30 días):**\n`;
        result += `   - Mensuales: ${monthlySold} unidades\n`;
        result += `   - Diarias: ${(monthlySold / 30).toFixed(1)} unidades\n`;
        result += `   - Semanales: ${(monthlySold / 4.3).toFixed(1)} unidades\n`;
      }

      // COSTES AMAZON section
      result += `\n💶 **COSTES AMAZON:**\n`;
      if (referralFee) result += `   - Comisión referral: ${referralFee}%\n`;
      if (pickAndPackFee) result += `   - Tarifa FBA: ${this.client.formatPrice(pickAndPackFee, domain)}\n`;

      // VARIACIONES section
      if (params.variations && product.variations && product.variations.length > 0) {
        result += `\n🔄 **VARIACIONES**: ${product.variations.length} disponibles\n`;
      }

      return result;
    } catch (error) {
      return `Error looking up product: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async batchLookupProducts(params: z.infer<typeof BatchProductLookupSchema>): Promise<string> {
    try {
      const products = await this.client.getProductsBatch(
        params.asins,
        params.domain as KeepaDomain,
        {
          days: params.days,
          history: params.history,
        }
      );

      if (!products || products.length === 0) {
        return `No products found for the provided ASINs`;
      }

      const domain = params.domain as KeepaDomain;
      let result = `**Batch Product Lookup Results**\n\n`;
      result += `Found ${products.length} of ${params.asins.length} products\n\n`;

      products.forEach((product, index) => {
        result += `---\n`;
        result += `**${index + 1}. ${product.title || 'N/A'}**\n`;
        result += `ASIN: ${product.asin}\n`;
        result += `Brand: ${product.brand || 'N/A'}\n`;
        
        if (product.stats) {
          const currentPrice = product.stats.current[0];
          if (currentPrice && currentPrice !== -1) {
            result += `Price: ${this.client.formatPrice(currentPrice, domain)}\n`;
          }
          if (product.stats.salesRankReference) {
            result += `Rank: #${product.stats.salesRankReference.toLocaleString()}\n`;
          }
        }
        result += `\n`;
      });

      return result;
    } catch (error) {
      return `Error in batch lookup: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async searchDeals(params: z.infer<typeof DealSearchSchema>): Promise<string> {
    try {
      const deals = await this.client.searchDeals({
        domainId: params.domain as KeepaDomain,
        categoryIds: params.categoryId ? [params.categoryId] : undefined,
        priceRange: params.minPrice || params.maxPrice ? {
          min: params.minPrice,
          max: params.maxPrice,
        } : undefined,
        deltaPercentRange: params.minDiscount ? {
          min: params.minDiscount,
        } : undefined,
        productRatingRange: params.minRating ? {
          min: params.minRating * 10,
        } : undefined,
        isPrimeExclusive: params.isPrime,
        sortType: params.sortType,
        page: params.page,
        perPage: params.perPage,
      });

      if (!deals || deals.length === 0) {
        return 'No deals found matching your criteria';
      }

      const domain = params.domain as KeepaDomain;
      let result = `**Deal Search Results**\n\n`;
      result += `Found ${deals.length} deals\n\n`;

      deals.forEach((deal, index) => {
        result += `---\n`;
        result += `**${index + 1}. ${deal.title || 'N/A'}**\n`;
        result += `ASIN: ${deal.asin}\n`;
        result += `Price: ${this.client.formatPrice(deal.price, domain)}\n`;
        
        // Handle deltaPercent - can be array or number
        const discount = Array.isArray(deal.deltaPercent) 
          ? deal.deltaPercent[0] 
          : deal.deltaPercent;
        if (discount) {
          result += `Discount: ${Math.abs(discount)}% off\n`;
        }
        
        if (deal.isLightningDeal) {
          result += `⚡ Lightning Deal\n`;
        }
        if (deal.isPrimeExclusive) {
          result += `🅿️ Prime Exclusive\n`;
        }
        result += `\n`;
      });

      return result;
    } catch (error) {
      return `Error searching deals: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async lookupSeller(params: z.infer<typeof SellerLookupSchema>): Promise<string> {
    try {
      const seller = await this.client.lookupSeller(
        params.seller,
        params.domain as KeepaDomain,
        params.storefront
      );

      if (!seller) {
        return `Seller not found: ${params.seller}`;
      }

      let result = `**Seller Information**\n\n`;
      result += `Seller ID: ${seller.sellerId || params.seller}\n`;
      result += `Name: ${seller.sellerName || 'N/A'}\n`;
      
      if (seller.rating) {
        result += `Rating: ${(seller.rating / 10).toFixed(1)}/5.0\n`;
      }
      if (seller.ratingCount) {
        result += `Reviews: ${seller.ratingCount.toLocaleString()}\n`;
      }
      if (seller.asinCount) {
        result += `Products: ${seller.asinCount.toLocaleString()}\n`;
      }

      if (seller.storefront && seller.storefront.length > 0) {
        result += `\n**Top Storefront Products**:\n`;
        seller.storefront.slice(0, 10).forEach((asin, index) => {
          result += `${index + 1}. ${asin}\n`;
        });
      }

      return result;
    } catch (error) {
      return `Error looking up seller: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getBestSellers(params: z.infer<typeof BestSellersSchema>): Promise<string> {
    try {
      const bestSellers = await this.client.getBestSellers(
        params.categoryId,
        params.domain as KeepaDomain,
        params.range
      );

      if (!bestSellers || bestSellers.length === 0) {
        return 'No best sellers found for this category';
      }

      let result = `**Best Sellers in Category ${params.categoryId}**\n\n`;
      result += `Found ${bestSellers.length} products\n\n`;

      bestSellers.forEach((asin, index) => {
        result += `${index + 1}. ${asin}\n`;
      });

      result += `\n*Use product lookup to get details for specific ASINs*`;

      return result;
    } catch (error) {
      return `Error getting best sellers: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getPriceHistory(params: z.infer<typeof PriceHistorySchema>): Promise<string> {
    try {
      const history = await this.client.getPriceHistory(
        params.asin,
        params.domain as KeepaDomain,
        params.dataType as KeepaDataType,
        params.days
      );

      if (!history || history.length === 0) {
        return `No price history found for ASIN: ${params.asin}`;
      }

      const domain = params.domain as KeepaDomain;
      const dataTypeName = this.getDataTypeName(params.dataType);
      
      let result = `**Price History for ${params.asin}**\n`;
      result += `Data Type: ${dataTypeName}\n`;
      result += `Period: Last ${params.days} days\n\n`;

      // Show last 10 data points
      const recentHistory = history.slice(-10);
      result += `**Recent ${dataTypeName} Prices:**\n`;
      
      recentHistory.forEach(([timestamp, value]) => {
        const date = this.keepaTimeToDate(timestamp);
        const formattedValue = params.dataType === 3 
          ? `#${value.toLocaleString()}` // Sales rank
          : this.client.formatPrice(value, domain);
        result += `${date.toLocaleDateString()}: ${formattedValue}\n`;
      });

      // Calculate statistics
      const values = history.map(([, v]) => v).filter(v => v > 0);
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        result += `\n**Statistics:**\n`;
        if (params.dataType === 3) {
          result += `Average Rank: #${Math.round(avg).toLocaleString()}\n`;
          result += `Best Rank: #${min.toLocaleString()}\n`;
          result += `Worst Rank: #${max.toLocaleString()}\n`;
        } else {
          result += `Average: ${this.client.formatPrice(Math.round(avg), domain)}\n`;
          result += `Lowest: ${this.client.formatPrice(min, domain)}\n`;
          result += `Highest: ${this.client.formatPrice(max, domain)}\n`;
        }
      }

      return result;
    } catch (error) {
      return `Error getting price history: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async findProducts(params: z.infer<typeof ProductFinderSchema>): Promise<string> {
    try {
      const results = await this.client.findProducts({
        domainId: params.domain as KeepaDomain,
        rootCategory: params.categoryId,
        currentPriceRange: params.minPrice || params.maxPrice ? {
          min: params.minPrice,
          max: params.maxPrice,
        } : undefined,
        productRatingRange: params.minRating || params.maxRating ? {
          min: params.minRating ? params.minRating * 10 : undefined,
          max: params.maxRating ? params.maxRating * 10 : undefined,
        } : undefined,
        reviewCountRange: params.minReviewCount || params.maxReviewCount ? {
          min: params.minReviewCount,
          max: params.maxReviewCount,
        } : undefined,
        salesRankRange: params.minSalesRank || params.maxSalesRank ? {
          min: params.minSalesRank,
          max: params.maxSalesRank,
        } : undefined,
        monthlySoldRange: params.minMonthlySold || params.maxMonthlySold ? {
          min: params.minMonthlySold,
          max: params.maxMonthlySold,
        } : undefined,
        sellerCountRange: params.minSellerCount || params.maxSellerCount ? {
          min: params.minSellerCount,
          max: params.maxSellerCount,
        } : undefined,
        sellerCountTimeframe: params.sellerCountTimeframe,
        isPrimeExclusive: params.isPrime,
        isFBA: params.isFBA,
        hasAmazonOffer: params.hasAmazonOffer,
        isOutOfStock: params.isOutOfStock,
        isNew: params.isNew,
        titleSearch: params.titleSearch,
        brandSearch: params.brandSearch,
        page: params.page,
        perPage: params.perPage,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      });

      if (!results || results.products.length === 0) {
        return 'No products found matching your criteria. Try adjusting your filters.';
      }

      const domain = params.domain as KeepaDomain;
      let result = `**Product Finder Results**\n\n`;
      result += `Found ${results.totalCount} products (showing ${results.products.length})\n`;
      result += `Page ${params.page + 1}\n\n`;

      results.products.forEach((product: ProductFinderResult, index: number) => {
        result += `---\n`;
        result += `**${index + 1}. ${product.title || 'N/A'}**\n`;
        result += `ASIN: ${product.asin}\n`;
        if (product.brand) result += `Brand: ${product.brand}\n`;
        if (product.currentPrice && product.currentPrice > 0) {
          result += `Price: ${this.client.formatPrice(product.currentPrice, domain)}\n`;
        }
        if (product.salesRank) {
          result += `Sales Rank: #${product.salesRank.toLocaleString()}\n`;
        }
        if (product.rating) {
          result += `Rating: ${(product.rating / 10).toFixed(1)}/5.0 (${product.reviewCount || 0} reviews)\n`;
        }
        if (product.monthlySold) {
          result += `Monthly Sales: ~${product.monthlySold.toLocaleString()} units\n`;
        }
        if (product.sellerCount) {
          result += `Sellers: ${product.sellerCount}\n`;
        }
        result += `\n`;
      });

      if (results.totalCount > results.products.length) {
        result += `\n*Use page parameter to see more results*`;
      }

      return result;
    } catch (error) {
      return `Error finding products: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async analyzeCategory(params: z.infer<typeof CategoryAnalysisSchema>): Promise<string> {
    try {
      const analysis = await this.client.analyzeCategory({
        categoryId: params.categoryId,
        domainId: params.domain as KeepaDomain,
        depth: params.depth,
        includeTopProducts: params.includeTopProducts,
        includeCompetitorAnalysis: params.includeCompetitorAnalysis,
        sellerCountTimeframe: params.sellerCountTimeframe,
      });

      if (!analysis) {
        return `Unable to analyze category ${params.categoryId}`;
      }

      const domain = params.domain as KeepaDomain;
      let result = `**Category Analysis: ${analysis.categoryName || params.categoryId}**\n\n`;

      // Market overview
      result += `📊 **Market Overview**\n`;
      result += `Total Products: ${analysis.totalProducts?.toLocaleString() || 'N/A'}\n`;
      if (analysis.avgPrice) {
        result += `Average Price: ${this.client.formatPrice(analysis.avgPrice, domain)}\n`;
      }
      if (analysis.avgSalesRank) {
        result += `Average Sales Rank: #${Math.round(analysis.avgSalesRank).toLocaleString()}\n`;
      }
      if (analysis.avgRating) {
        result += `Average Rating: ${(analysis.avgRating / 10).toFixed(1)}/5.0\n`;
      }

      // Competition analysis
      if (analysis.competitionLevel) {
        result += `\n🏪 **Competition Analysis**\n`;
        result += `Competition Level: ${analysis.competitionLevel}\n`;
        if (analysis.avgSellerCount) {
          result += `Average Sellers per Product: ${analysis.avgSellerCount.toFixed(1)}\n`;
        }
        if (analysis.fbaPercentage) {
          result += `FBA Percentage: ${analysis.fbaPercentage.toFixed(1)}%\n`;
        }
        if (analysis.amazonPercentage) {
          result += `Amazon as Seller: ${analysis.amazonPercentage.toFixed(1)}%\n`;
        }
      }

      // Opportunity score
      if (analysis.opportunityScore !== undefined) {
        result += `\n🎯 **Opportunity Score**: ${analysis.opportunityScore}/100\n`;
        if (analysis.opportunityScore >= 70) {
          result += `💡 High opportunity - Low competition, good demand\n`;
        } else if (analysis.opportunityScore >= 40) {
          result += `💡 Moderate opportunity - Balanced market\n`;
        } else {
          result += `💡 Challenging market - High competition or low demand\n`;
        }
      }

      // Top products
      if (analysis.topProducts && analysis.topProducts.length > 0) {
        result += `\n🏆 **Top Products**\n`;
        analysis.topProducts.slice(0, 5).forEach((product: any, index: number) => {
          result += `${index + 1}. ${product.title || product.asin}\n`;
          if (product.salesRank) result += `   Rank: #${product.salesRank.toLocaleString()}\n`;
        });
      }

      return result;
    } catch (error) {
      return `Error analyzing category: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async analyzeSalesVelocity(params: z.infer<typeof SalesVelocitySchema>): Promise<string> {
    try {
      const velocityData = await this.client.analyzeSalesVelocity({
        asins: params.asins,
        domainId: params.domain as KeepaDomain,
        days: params.days,
      });

      if (!velocityData || velocityData.length === 0) {
        return 'No velocity data available for the provided ASINs';
      }

      let result = `**Sales Velocity Analysis**\n`;
      result += `Period: Last ${params.days} days\n`;
      result += `Products Analyzed: ${velocityData.length}\n\n`;

      // Categorize products
      const fastMovers = velocityData.filter((v: SalesVelocityData) => v.dailyVelocity >= 10);
      const moderateMovers = velocityData.filter((v: SalesVelocityData) => v.dailyVelocity >= 1 && v.dailyVelocity < 10);
      const slowMovers = velocityData.filter((v: SalesVelocityData) => v.dailyVelocity < 1);

      result += `🚀 **Fast Movers** (10+ units/day): ${fastMovers.length}\n`;
      result += `📊 **Moderate Movers** (1-10 units/day): ${moderateMovers.length}\n`;
      result += `🐌 **Slow Movers** (<1 unit/day): ${slowMovers.length}\n\n`;

      // Show details for each product
      result += `**Product Details:**\n`;
      velocityData.slice(0, 10).forEach((v: SalesVelocityData, index: number) => {
        result += `\n${index + 1}. ${v.asin}\n`;
        result += `   Daily: ${v.dailyVelocity.toFixed(1)} units\n`;
        result += `   Weekly: ${v.weeklyVelocity.toFixed(1)} units\n`;
        result += `   Monthly: ${v.monthlyVelocity.toFixed(0)} units\n`;
        if (v.velocityTrend) {
          const trendIcon = v.velocityTrend > 0 ? '📈' : v.velocityTrend < 0 ? '📉' : '➡️';
          result += `   Trend: ${trendIcon} ${v.velocityTrend > 0 ? '+' : ''}${v.velocityTrend.toFixed(1)}%\n`;
        }
      });

      if (velocityData.length > 10) {
        result += `\n*Showing 10 of ${velocityData.length} products*`;
      }

      return result;
    } catch (error) {
      return `Error analyzing sales velocity: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async analyzeInventory(params: z.infer<typeof InventoryAnalysisSchema>): Promise<string> {
    try {
      const analysis = await this.client.analyzeInventory({
        domainId: params.domain as KeepaDomain,
        categoryId: params.categoryId,
        asins: params.asins,
        analysisType: params.analysisType,
        timeframe: params.timeframe,
        sellerCountTimeframe: params.sellerCountTimeframe,
        targetTurnoverRate: params.targetTurnoverRate,
      });

      if (!analysis) {
        return 'Unable to perform inventory analysis';
      }

      const domain = params.domain as KeepaDomain;
      let result = `**Inventory Analysis**\n`;
      result += `Type: ${params.analysisType}\n`;
      result += `Timeframe: ${params.timeframe}\n\n`;

      // Summary stats
      if (analysis.summary) {
        result += `📊 **Summary**\n`;
        result += `Total Products: ${analysis.summary.totalProducts}\n`;
        result += `Average Turnover: ${analysis.summary.avgTurnoverRate?.toFixed(1) || 'N/A'} times/year\n`;
        result += `Target Turnover: ${params.targetTurnoverRate} times/year\n`;
        
        if (analysis.summary.inventoryHealth) {
          const healthIcon = analysis.summary.inventoryHealth === 'healthy' ? '✅' : 
                            analysis.summary.inventoryHealth === 'warning' ? '⚠️' : '🔴';
          result += `Inventory Health: ${healthIcon} ${analysis.summary.inventoryHealth}\n`;
        }
      }

      // Specific analysis based on type
      switch (params.analysisType) {
        case 'fast_movers':
          if (analysis.fastMovers && analysis.fastMovers.length > 0) {
            result += `\n🚀 **Fast Moving Products**\n`;
            analysis.fastMovers.slice(0, 10).forEach((p: any, i: number) => {
              result += `${i + 1}. ${p.asin}: ${p.monthlyVelocity || 'N/A'} units/month\n`;
            });
          }
          break;

        case 'slow_movers':
          if (analysis.slowMovers && analysis.slowMovers.length > 0) {
            result += `\n🐌 **Slow Moving Products**\n`;
            analysis.slowMovers.slice(0, 10).forEach((p: any, i: number) => {
              result += `${i + 1}. ${p.asin}: ${p.monthlyVelocity || 'N/A'} units/month\n`;
            });
            result += `\n💡 Consider: clearance pricing, bundling, or discontinuation\n`;
          }
          break;

        case 'stockout_risks':
          if (analysis.stockoutRisks && analysis.stockoutRisks.length > 0) {
            result += `\n⚠️ **Stockout Risk Products**\n`;
            analysis.stockoutRisks.slice(0, 10).forEach((p: any, i: number) => {
              result += `${i + 1}. ${p.asin}\n`;
              result += `   Days Until Stockout: ${p.daysUntilStockout || 'N/A'}\n`;
              result += `   Recommended Reorder: ${p.recommendedReorderQty || 'N/A'} units\n`;
            });
          }
          break;

        case 'seasonal':
          if (analysis.seasonalPatterns) {
            result += `\n📅 **Seasonal Patterns**\n`;
            result += `Peak Season: ${analysis.seasonalPatterns.peakSeason || 'N/A'}\n`;
            result += `Low Season: ${analysis.seasonalPatterns.lowSeason || 'N/A'}\n`;
            if (analysis.seasonalPatterns.seasonalityScore) {
              result += `Seasonality Score: ${analysis.seasonalPatterns.seasonalityScore}/10\n`;
            }
          }
          break;

        default: // overview
          if (analysis.overview) {
            result += `\n📋 **Overview**\n`;
            result += `Products Meeting Target: ${analysis.overview.meetingTarget || 0}\n`;
            result += `Products Below Target: ${analysis.overview.belowTarget || 0}\n`;
            result += `Products Above Target: ${analysis.overview.aboveTarget || 0}\n`;
          }
      }

      return result;
    } catch (error) {
      return `Error analyzing inventory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getTokenStatus(): Promise<string> {
    try {
      const status = await this.client.getTokenStatus();

      let result = `**Keepa API Token Status**\n\n`;
      result += `🪙 Tokens Remaining: ${status.tokensLeft.toLocaleString()}\n`;
      result += `⏰ Refill Rate: ${status.refillRate.toLocaleString()} tokens/minute\n`;
      result += `📊 Refill In: ${status.refillIn} seconds\n`;

      if (status.tokensLeft < 10) {
        result += `\n⚠️ **Warning**: Low token count! Consider waiting for refill.\n`;
      } else if (status.tokensLeft < 50) {
        result += `\n💡 Token count is getting low. Use queries efficiently.\n`;
      } else {
        result += `\n✅ Token status is healthy.\n`;
      }

      return result;
    } catch (error) {
      return `Error getting token status: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Helper methods
  private getDataTypeName(dataType: number): string {
    const types: Record<number, string> = {
      0: 'Amazon Price',
      1: 'New Price',
      2: 'Used Price',
      3: 'Sales Rank',
      4: 'List Price',
      5: 'Collectible Price',
      6: 'Refurbished Price',
      7: 'New FBM Shipping',
      8: 'Lightning Deal',
      9: 'Warehouse Deal',
      10: 'New FBA Price',
      11: 'Count New',
      12: 'Count Used',
      13: 'Count Refurbished',
      14: 'Count Collectible',
      15: 'Extra Info Lastupdate',
      16: 'Rating',
      17: 'Count Reviews',
      18: 'Buy Box Price',
      19: 'Used New Shipping',
      20: 'Used Very Good Price',
      21: 'Used Good Price',
      22: 'Used Acceptable Price',
      23: 'Collectible New Price',
      24: 'Collectible Very Good Price',
      25: 'Collectible Good Price',
      26: 'Collectible Acceptable Price',
      27: 'Count New FBA',
      28: 'Count New FBM',
      29: 'Trade-In Price',
      30: 'Rent Price',
    };
    return types[dataType] || `Type ${dataType}`;
  }

  private keepaTimeToDate(keepaMinutes: number): Date {
    // Keepa time is minutes since 21.01.2011
    const keepaEpoch = new Date('2011-01-21T00:00:00Z').getTime();
    return new Date(keepaEpoch + keepaMinutes * 60 * 1000);
  }
}
