import { z } from 'zod';
import { KeepaClient } from './keepa-client.js';
import { KeepaDomain, KeepaDataType, ProductFinderResult, CategoryInsights, SalesVelocityData, InventoryAnalysis } from './types.js';

export const ProductLookupSchema = z.object({
  asin: z.string().optional().describe('Amazon ASIN (product identifier)'),
  code: z.string().optional().describe('Product code (EAN, UPC, ISBN-13) - alternative to ASIN'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  days: z.number().min(1).max(365).optional().describe('Number of days of price history to include'),
  history: z.boolean().default(false).describe('Include full price history'),
  offers: z.number().min(20).max(100).optional().describe('Number of marketplace offers to retrieve (min 20, max 100). Cost: 6 extra Keepa tokens per 10 offer pages found. Includes buybox, FBA/FBM prices, shipping, rating history, and live seller data.'),
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
  category: z.number().describe('Amazon category ID'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
});

export const PriceHistorySchema = z.object({
  asin: z.string().describe('Amazon ASIN (product identifier)'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  dataType: z.number().min(0).max(30).describe('Data type (0=Amazon, 1=New, 2=Used, 3=Sales Rank, etc.)'),
  days: z.number().min(1).max(365).default(30).describe('Number of days of history'),
});

export const ProductFinderSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to search within'),
  minRating: z.number().min(1).max(5).optional().describe('Minimum product rating (1-5 stars)'),
  maxRating: z.number().min(1).max(5).optional().describe('Maximum product rating (1-5 stars)'),
  minPrice: z.number().min(0).optional().describe('Minimum price in cents'),
  maxPrice: z.number().min(0).optional().describe('Maximum price in cents'),
  minShipping: z.number().min(0).optional().describe('Minimum shipping cost in cents'),
  maxShipping: z.number().min(0).optional().describe('Maximum shipping cost in cents'),
  minMonthlySales: z.number().min(0).optional().describe('Minimum estimated monthly sales'),
  maxMonthlySales: z.number().min(0).optional().describe('Maximum estimated monthly sales'),
  minSellerCount: z.number().min(0).optional().describe('Minimum number of sellers'),
  maxSellerCount: z.number().min(0).optional().describe('Maximum number of sellers'),
  sellerCountTimeframe: z.enum(['current', '30day', '90day', '180day', '365day']).default('90day').describe('Timeframe for seller count (current, 30day, 90day, 180day, 365day)'),
  isPrime: z.boolean().optional().describe('Filter for Prime eligible products only'),
  hasReviews: z.boolean().optional().describe('Filter for products with reviews only'),
  productType: z.number().min(0).max(2).default(0).optional().describe('Product type (0=standard, 1=variation parent, 2=variation child)'),
  sortBy: z.enum(['monthlySold', 'price', 'rating', 'reviewCount', 'salesRank']).default('monthlySold').describe('Sort results by field'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort order (ascending or descending)'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
  perPage: z.number().min(1).max(50).default(25).describe('Results per page (max 50)'),
});

export const CategoryAnalysisSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().describe('Amazon category ID to analyze'),
  analysisType: z.enum(['overview', 'top_performers', 'opportunities', 'trends']).default('overview').describe('Type of analysis to perform'),
  priceRange: z.enum(['budget', 'mid', 'premium', 'luxury']).optional().describe('Focus on specific price range'),
  minRating: z.number().min(1).max(5).default(3.0).describe('Minimum rating for products to include'),
  includeSubcategories: z.boolean().default(false).describe('Include analysis of subcategories'),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month').describe('Timeframe for trend analysis'),
  sellerCountTimeframe: z.enum(['current', '30day', '90day', '180day', '365day']).default('90day').describe('Timeframe for seller count analysis (current, 30day, 90day, 180day, 365day)'),
});

export const SalesVelocitySchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to filter by'),
  asin: z.string().optional().describe('Single ASIN to analyze'),
  asins: z.array(z.string()).max(50).optional().describe('Array of ASINs to analyze (max 50)'),
  timeframe: z.enum(['week', 'month', 'quarter']).default('month').describe('Time period for velocity calculation'),
  minVelocity: z.number().min(0).optional().describe('Minimum daily sales velocity'),
  maxVelocity: z.number().min(0).optional().describe('Maximum daily sales velocity'),
  minPrice: z.number().min(0).optional().describe('Minimum price in cents'),
  maxPrice: z.number().min(0).optional().describe('Maximum price in cents'),
  minRating: z.number().min(1).max(5).default(3.0).describe('Minimum product rating'),
  sortBy: z.enum(['velocity', 'turnoverRate', 'revenueVelocity', 'trend']).default('velocity').describe('Sort results by metric'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort order'),
  sellerCountTimeframe: z.enum(['current', '30day', '90day', '180day', '365day']).default('90day').describe('Timeframe for seller count analysis (current, 30day, 90day, 180day, 365day)'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
  perPage: z.number().min(1).max(50).default(25).describe('Results per page (max 50)'),
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

  async lookupProduct(params: z.infer<typeof ProductLookupSchema>): Promise<string> {
    try {
      if (!params.asin && !params.code) {
        return 'Error: Se requiere ASIN o código EAN/UPC';
      }

      // Build query params for Keepa API
      const queryParams: Record<string, any> = {
        domain: params.domain,
        stats: params.days || 30,       // stats=N → price stats for last N days (free)
        offers: params.offers || 20,    // min 20 per Keepa API (6 tokens per 10 offer pages)
        rating: 1,                      // include rating/review history (up to 1 extra token)
      };

      // Optional params
      if (params.days) queryParams.days = params.days;
      if (params.history === false) queryParams.history = 0;
      // Note: when offers is used, buybox data is included automatically (no need for buybox param)

      let product;
      if (params.code) {
        const products = await this.client.getProduct({
          code: params.code,
          ...queryParams,
        });
        product = products?.[0] || null;
      } else {
        product = await this.client.getProductByAsin(
          params.asin!,
          params.domain as KeepaDomain,
          queryParams,
        );
      }

      if (!product) {
        return `Product not found for ${params.asin ? 'ASIN: ' + params.asin : 'Code: ' + params.code}`;
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      const asin = product.asin || params.asin || 'N/A';

      const imageUrl = product.imagesCSV
        ? `https://m.media-amazon.com/images/I/${product.imagesCSV.split(',')[0]}`
        : null;

      // Helper: Keepa uses -1 for "no data available"
      const kv = (v: number | undefined | null): number | null =>
        v !== undefined && v !== null && v !== -1 ? v : null;

      const stats = product.stats;

      // ========== HEADER ==========
      let result = `**Product Information for ${asin}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📦 **ASIN**: ${asin}\n`;
      if (imageUrl) result += `📷 **Imagen**: ${imageUrl}\n`;
      result += `🏷️ **Titulo**: ${product.title || 'N/A'}\n`;
      result += `🏢 **Marca**: ${product.brand || 'N/A'}\n`;
      result += `📊 **Categoria**: ${product.productGroup || 'N/A'}\n`;

      // ========== PRICES ==========
      if (stats) {
        const buyBoxPrice = kv(stats.buyBoxPrice);
        const avgAmazon = kv(stats.avg?.[0]);     // csv index 0 = AMAZON price
        const avgNew = kv(stats.avg?.[1]);         // csv index 1 = Marketplace New
        const avgUsed = kv(stats.avg?.[2]);        // csv index 2 = Marketplace Used
        const minAmazon = kv(stats.min?.[0]);
        const maxAmazon = kv(stats.max?.[0]);
        const minNew = kv(stats.min?.[1]);
        const maxNew = kv(stats.max?.[1]);
        const avgFBA = kv(stats.avg?.[10]);        // csv index 10 = NEW_FBA
        const avgWarehouse = kv(stats.avg?.[9]);   // csv index 9 = WAREHOUSE
        const listPrice = kv(stats.current?.[4]);  // csv index 4 = LIST PRICE (MSRP/PVP)

        result += `\n💰 **PRECIOS:**\n`;
        if (buyBoxPrice) {
          const condition = stats.buyBoxIsUsed ? '⚠️ USADO' : 'Nuevo';
          result += `   - Buy Box: ${this.client.formatPrice(buyBoxPrice, domain)} (${condition})\n`;
        }
        if (listPrice) result += `   - PVP/MSRP: ${this.client.formatPrice(listPrice, domain)}\n`;
        if (avgAmazon) {
          result += `   - Amazon: Promedio ${this.client.formatPrice(avgAmazon, domain)}`;
          if (minAmazon && maxAmazon && minAmazon !== maxAmazon) {
            result += ` (min ${this.client.formatPrice(minAmazon, domain)} / max ${this.client.formatPrice(maxAmazon, domain)})`;
          }
          result += '\n';
        }
        if (avgNew) {
          result += `   - New 3P: Promedio ${this.client.formatPrice(avgNew, domain)}`;
          if (minNew && maxNew && minNew !== maxNew) {
            result += ` (min ${this.client.formatPrice(minNew, domain)} / max ${this.client.formatPrice(maxNew, domain)})`;
          }
          result += '\n';
        }
        if (avgFBA) result += `   - New FBA 3P: Promedio ${this.client.formatPrice(avgFBA, domain)}\n`;
        if (avgWarehouse) result += `   - Warehouse Deals: Promedio ${this.client.formatPrice(avgWarehouse, domain)}\n`;
        if (avgUsed) result += `   - Usado: Promedio ${this.client.formatPrice(avgUsed, domain)}\n`;

        // ========== BUY BOX ==========
        result += `\n🏆 **BUY BOX:**\n`;
        let ganador = 'Sin Buy Box';
        if (stats.buyBoxIsAmazon) ganador = 'Amazon';
        else if (stats.buyBoxIsFBA) ganador = 'Vendedor FBA 3P';
        else if (buyBoxPrice) ganador = 'Vendedor FBM 3P';
        result += `   - Ganador: ${ganador}\n`;
        if (stats.buyBoxShippingCountry) result += `   - País envío: ${stats.buyBoxShippingCountry}\n`;

        // Buy Box seller info from history (last entry)
        if (product.buyBoxSellerIdHistory && product.buyBoxSellerIdHistory.length >= 2) {
          const lastSeller = product.buyBoxSellerIdHistory[product.buyBoxSellerIdHistory.length - 1];
          if (lastSeller && lastSeller !== '-1' && lastSeller !== '-2') {
            result += `   - Seller ID: ${lastSeller}\n`;
          }
        }

        // isSNS
        if (product.isSNS) result += `   - Subscribe & Save: ✅ Disponible\n`;

        // ========== SALES RANK ==========
        const salesRank = kv(stats.current?.[3]);  // csv index 3 = SALES RANK
        const salesRankRef = kv(stats.salesRankReference);
        if (salesRank) {
          result += `\n📊 **Sales Rank**: #${salesRank.toLocaleString()}`;
          if (salesRankRef && salesRankRef !== salesRank) result += ` (referencia: #${salesRankRef.toLocaleString()})`;
          result += '\n';
        }

        // ========== RATING & REVIEWS ==========
        const ratingRaw = kv(stats.current?.[16]);  // csv index 16 = RATING
        const reviewCount = kv(stats.current?.[17]); // csv index 17 = COUNT_REVIEWS
        if (ratingRaw || reviewCount) {
          result += `\n⭐ **RESEÑAS:**\n`;
          if (ratingRaw) result += `   - Rating: ${(ratingRaw / 10).toFixed(1)}/5.0\n`;
          if (reviewCount) result += `   - Total: ${reviewCount.toLocaleString()} reseñas\n`;
        }
      }

      // ========== MONTHLY SOLD ==========
      const monthlySold = kv(product.monthlySold) || kv(stats?.monthlySold);
      if (monthlySold && monthlySold > 0) {
        result += `\n📈 **VENTAS ESTIMADAS (bought past month):**\n`;
        result += `   - Mensuales: ${monthlySold.toLocaleString()}+ unidades\n`;
        result += `   - Diarias: ~${(monthlySold / 30).toFixed(1)} unidades\n`;
      }

      // ========== OFFERS / COMPETITION ==========
      if (product.offers && product.offers.length > 0) {
        // Use liveOffersOrder for currently active offers
        const liveIndexes = product.liveOffersOrder;
        let liveOffers: any[];

        if (liveIndexes && liveIndexes.length > 0) {
          // Deduplicate indexes (Keepa puts duplicates for identical offers)
          const uniqueIndexes = [...new Set(liveIndexes)] as number[];
          liveOffers = uniqueIndexes.map((idx: number) => product.offers[idx]).filter(Boolean);
        } else {
          // Fallback: filter by lastSeen recency (within last 24h)
          const oneDayAgo = Date.now() - 86400000;
          liveOffers = product.offers.filter((o: any) => o.lastSeen && o.lastSeen > oneDayAgo);
        }

        const totalLive = liveOffers.length;
        const amazonOffers = liveOffers.filter((o: any) => o.isAmazon).length;
        const fbaOffers = liveOffers.filter((o: any) => o.isFBA && !o.isAmazon).length;
        const fbmOffers = totalLive - amazonOffers - fbaOffers;

        result += `\n🏪 **COMPETENCIA (${totalLive} ofertas vivas):**\n`;
        result += `   - Amazon vende: ${amazonOffers > 0 ? `Sí (${amazonOffers} oferta${amazonOffers > 1 ? 's' : ''})` : 'No'}\n`;
        result += `   - Vendedores FBA: ${fbaOffers}\n`;
        result += `   - Vendedores FBM: ${fbmOffers}\n`;

        // New/Used offer counts from csv
        const countNew = kv(stats?.current?.[11]);
        const countUsed = kv(stats?.current?.[12]);
        if (countNew) result += `   - Total ofertas New (hist.): ${countNew}\n`;
        if (countUsed) result += `   - Total ofertas Used (hist.): ${countUsed}\n`;

        // Top 5 live offers detail
        if (totalLive > 0) {
          result += `\n   **Top ${Math.min(5, totalLive)} ofertas:**\n`;
          liveOffers.slice(0, 5).forEach((offer: any, i: number) => {
            // Get latest price from offerCSV (last value pair: [keepaTime, price, ...])
            const offerCSV = offer.offerCSV;
            const price = offerCSV && offerCSV.length >= 2 ? kv(offerCSV[offerCSV.length - 1]) : null;
            const shipping = offer.shippingCSV && offer.shippingCSV.length >= 2
              ? kv(offer.shippingCSV[offer.shippingCSV.length - 1])
              : null;

            const sellerType = offer.isAmazon ? 'Amazon' : offer.isFBA ? 'FBA' : 'FBM';
            const condition = offer.conditionComment
              ? offer.conditionComment.substring(0, 40)
              : (offer.isUsed ? 'Usado' : 'Nuevo');

            let line = `   ${i + 1}. [${sellerType}] ${condition}`;
            if (price) {
              line += ` — ${this.client.formatPrice(price, domain)}`;
              if (shipping && shipping > 0) line += ` + ${this.client.formatPrice(shipping, domain)} envío`;
            }
            if (offer.isPrime) line += ' 🟢 Prime';
            if (offer.sellerId) line += ` (${offer.sellerId.substring(0, 14)})`;
            result += line + '\n';
          });
        }

        // Offer data freshness
        if (product.offersSuccessful !== undefined) {
          result += `\n   _Datos de ofertas: ${product.offersSuccessful ? '✅ Actualizados' : '⚠️ No se pudieron actualizar, datos históricos'}_\n`;
        }
      } else {
        result += `\n🏪 **COMPETENCIA**: No se encontraron ofertas activas\n`;
      }

      // ========== FBA FEES ==========
      const referralFee = product.referralFeePercentage;
      const pickAndPackFee = product.fbaFees?.pickAndPackFee;
      if (referralFee || pickAndPackFee) {
        result += `\n💶 **COSTES AMAZON:**\n`;
        if (referralFee) result += `   - Comisión referral: ${referralFee}%\n`;
        if (pickAndPackFee) result += `   - Tarifa FBA (pick&pack): ${this.client.formatPrice(pickAndPackFee, domain)}\n`;
      }

      // ========== VARIATIONS ==========
      if (params.variations && product.variations && product.variations.length > 0) {
        result += `\n🔄 **VARIACIONES**: ${product.variations.length} disponibles\n`;
        product.variations.slice(0, 10).forEach((v: any) => {
          result += `   - ${v.asin}${v.attributes ? ': ' + Object.values(v.attributes).join(', ') : ''}\n`;
        });
        if (product.variations.length > 10) {
          result += `   ... y ${product.variations.length - 10} más\n`;
        }
      }

      // ========== ADDITIONAL DATA ==========
      if (product.parentAsin) result += `\n🔗 **Parent ASIN**: ${product.parentAsin}\n`;
      if (product.numberOfItems) result += `📦 **Unidades por pack**: ${product.numberOfItems}\n`;
      if (product.packageWeight) result += `⚖️ **Peso**: ${product.packageWeight}g\n`;
      if (product.ean) result += `🔢 **EAN**: ${product.ean}\n`;

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

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Batch Product Lookup Results (${products.length}/${params.asins.length} found)**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n\n`;

      products.forEach((product, i) => {
        result += `**${i + 1}. ${product.asin}**\n`;
        result += `📦 ${product.title || 'N/A'}\n`;
        result += `🏷️ ${product.brand || 'N/A'}\n`;
        
        if (product.stats?.current[0] && product.stats.current[0] !== -1) {
          result += `💰 ${this.client.formatPrice(product.stats.current[0], domain)}\n`;
        }
        
        if (product.stats?.salesRankReference) {
          result += `📊 Rank: #${product.stats.salesRankReference.toLocaleString()}\n`;
        }
        
        result += '\n';
      });

      const notFound = params.asins.filter(asin => 
        !products.some(product => product.asin === asin)
      );

      if (notFound.length > 0) {
        result += `**Not Found**: ${notFound.join(', ')}\n`;
      }

      return result;
    } catch (error) {
      return `Error in batch lookup: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async searchDeals(params: z.infer<typeof DealSearchSchema>): Promise<string> {
    try {
      const deals = await this.client.getDeals({
        domainId: params.domain,
        categoryId: params.categoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minDiscount: params.minDiscount,
        minRating: params.minRating,
        isPrime: params.isPrime,
        sortType: params.sortType,
        page: params.page,
        perPage: params.perPage,
      });

      if (deals.length === 0) {
        return 'No deals found matching your criteria.';
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Amazon Deals Found: ${deals.length}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n\n`;

      deals.forEach((deal, i) => {
        result += `**${i + 1}. ${deal.asin}**\n`;
        result += `📦 **${deal.title}**\n`;
        result += `🏷️ Brand: ${deal.brand || 'N/A'}\n`;
        result += `💰 **Price**: ${this.client.formatPrice(deal.price, domain)}`;
        
        if (deal.shipping > 0) {
          result += ` + ${this.client.formatPrice(deal.shipping, domain)} shipping`;
        }
        result += '\n';
        
        result += `📊 **Discount**: ${deal.deltaPercent}% (${this.client.formatPrice(Math.abs(deal.delta), domain)} off)\n`;
        result += `📈 **Avg Price**: ${this.client.formatPrice(deal.avgPrice, domain)}\n`;
        result += `🏆 **Deal Score**: ${deal.dealScore}\n`;
        
        if (deal.salesRank) {
          result += `📊 **Sales Rank**: #${deal.salesRank.toLocaleString()}\n`;
        }
        
        if (deal.isLightningDeal) {
          result += `⚡ **Lightning Deal**\n`;
        }
        
        if (deal.isPrimeExclusive) {
          result += `🔥 **Prime Exclusive**\n`;
        }
        
        if (deal.coupon) {
          result += `🎫 **Coupon**: ${deal.coupon}% additional discount\n`;
        }
        
        result += '\n';
      });

      return result;
    } catch (error) {
      return `Error searching deals: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async lookupSeller(params: z.infer<typeof SellerLookupSchema>): Promise<string> {
    try {
      const sellers = await this.client.getSeller({
        seller: params.seller,
        domain: params.domain,
        storefront: params.storefront,
      });

      if (sellers.length === 0) {
        return `Seller not found: ${params.seller}`;
      }

      const seller = sellers[0];
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Seller Information**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `🏷️ **Seller ID**: ${seller.sellerId}\n`;
      result += `📛 **Name**: ${seller.sellerName}\n`;
      result += `⭐ **Rating**: ${seller.avgRating ? `${seller.avgRating}/5.0` : 'N/A'}\n`;
      result += `📊 **Rating Count**: ${seller.ratingCount?.toLocaleString() || 'N/A'}\n`;
      result += `🚩 **Scammer Status**: ${seller.isScammer ? '⚠️ Flagged as scammer' : '✅ Clean'}\n`;
      result += `📦 **Amazon Seller**: ${seller.isAmazon ? 'Yes' : 'No'}\n`;
      result += `🚚 **FBA Available**: ${seller.hasFBA ? 'Yes' : 'No'}\n`;
      result += `📮 **FBM Available**: ${seller.hasFBM ? 'Yes' : 'No'}\n`;
      
      if (seller.totalStorefrontAsins) {
        result += `🏪 **Total Products**: ${seller.totalStorefrontAsins.toLocaleString()}\n`;
      }
      
      if (seller.startDate) {
        const startDate = new Date(this.client.keepaTimeToUnixTime(seller.startDate));
        result += `📅 **Started Selling**: ${startDate.toLocaleDateString()}\n`;
      }

      if (seller.storefront && seller.storefront.length > 0) {
        result += `\n**Sample Storefront Products**: ${Math.min(5, seller.storefront.length)} shown\n`;
        seller.storefront.slice(0, 5).forEach((asin, i) => {
          result += `${i + 1}. ${asin}\n`;
        });
        
        if (seller.storefront.length > 5) {
          result += `... and ${seller.storefront.length - 5} more\n`;
        }
      }

      return result;
    } catch (error) {
      return `Error looking up seller: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getBestSellers(params: z.infer<typeof BestSellersSchema>): Promise<string> {
    try {
      const bestSellers = await this.client.getBestSellers({
        domain: params.domain,
        category: params.category,
        page: params.page,
      });

      if (bestSellers.length === 0) {
        return `No best sellers found for category ${params.category}`;
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Best Sellers - Category ${params.category}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📊 **Found**: ${bestSellers.length} products\n\n`;

      bestSellers.forEach((product, i) => {
        const rank = params.page * 100 + i + 1;
        result += `**#${rank} - ${product.asin}**\n`;
        result += `📦 **${product.title}**\n`;
        result += `📊 **Sales Rank**: #${product.salesRank.toLocaleString()}\n`;
        
        if (product.price) {
          result += `💰 **Price**: ${this.client.formatPrice(product.price, domain)}\n`;
        }
        
        if (product.rating && product.reviewCount) {
          result += `⭐ **Rating**: ${product.rating}/5.0 (${product.reviewCount.toLocaleString()} reviews)\n`;
        }
        
        result += `🚚 **Prime**: ${product.isPrime ? 'Yes' : 'No'}\n`;
        result += '\n';
      });

      return result;
    } catch (error) {
      return `Error getting best sellers: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getPriceHistory(params: z.infer<typeof PriceHistorySchema>): Promise<string> {
    try {
      const product = await this.client.getProductByAsin(
        params.asin,
        params.domain as KeepaDomain,
        {
          days: params.days,
          history: true,
        }
      );

      if (!product || !product.csv) {
        return `No price history found for ASIN: ${params.asin}`;
      }

      const priceData = this.client.parseCSVData(product.csv, params.dataType);
      
      if (priceData.length === 0) {
        return `No data available for the specified data type (${params.dataType})`;
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      const dataTypeNames: Record<number, string> = {
        [KeepaDataType.AMAZON]: 'Amazon Price',
        [KeepaDataType.NEW]: 'New Price',
        [KeepaDataType.USED]: 'Used Price',
        [KeepaDataType.SALES_RANK]: 'Sales Rank',
        [KeepaDataType.RATING]: 'Rating',
        [KeepaDataType.COUNT_REVIEWS]: 'Review Count',
      };

      const dataTypeName = dataTypeNames[params.dataType] || `Data Type ${params.dataType}`;
      
      let result = `**Price History for ${params.asin}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📊 **Data Type**: ${dataTypeName}\n`;
      result += `📅 **Period**: Last ${params.days} days\n`;
      result += `📈 **Data Points**: ${priceData.length}\n\n`;

      if (priceData.length > 0) {
        const latest = priceData[priceData.length - 1];
        const oldest = priceData[0];
        
        result += `**Latest Value**: `;
        if (params.dataType <= 2 || params.dataType === 18) {
          result += `${this.client.formatPrice(latest.value, domain)}\n`;
        } else {
          result += `${latest.value.toLocaleString()}\n`;
        }
        
        result += `**Date**: ${new Date(latest.timestamp).toLocaleDateString()}\n\n`;
        
        if (params.dataType <= 2 || params.dataType === 18) {
          const prices = priceData.map(d => d.value).filter(v => v > 0);
          if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            
            result += `**Price Statistics**:\n`;
            result += `• Minimum: ${this.client.formatPrice(min, domain)}\n`;
            result += `• Maximum: ${this.client.formatPrice(max, domain)}\n`;
            result += `• Average: ${this.client.formatPrice(Math.round(avg), domain)}\n\n`;
          }
        }

        result += `**Recent History** (last 10 data points):\n`;
        const recentData = priceData.slice(-10);
        recentData.forEach((point, i) => {
          const date = new Date(point.timestamp).toLocaleDateString();
          let value: string;
          
          if (params.dataType <= 2 || params.dataType === 18) {
            value = this.client.formatPrice(point.value, domain);
          } else {
            value = point.value.toLocaleString();
          }
          
          result += `${recentData.length - i}. ${date}: ${value}\n`;
        });
      }

      return result;
    } catch (error) {
      return `Error getting price history: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async findProducts(params: z.infer<typeof ProductFinderSchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Amazon Product Finder Results**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `🔍 **Search Criteria**:\n`;
      
      if (params.categoryId) {
        result += `• Category: ${params.categoryId}\n`;
      }
      if (params.minRating || params.maxRating) {
        const min = params.minRating || 1;
        const max = params.maxRating || 5;
        result += `• Rating: ${min}-${max} stars\n`;
      }
      if (params.minPrice || params.maxPrice) {
        const min = params.minPrice ? this.client.formatPrice(params.minPrice, domain) : 'Any';
        const max = params.maxPrice ? this.client.formatPrice(params.maxPrice, domain) : 'Any';
        result += `• Price: ${min} - ${max}\n`;
      }
      if (params.minShipping || params.maxShipping) {
        const min = params.minShipping ? this.client.formatPrice(params.minShipping, domain) : 'Any';
        const max = params.maxShipping ? this.client.formatPrice(params.maxShipping, domain) : 'Any';
        result += `• Shipping: ${min} - ${max}\n`;
      }
      if (params.minMonthlySales || params.maxMonthlySales) {
        const min = params.minMonthlySales?.toLocaleString() || 'Any';
        const max = params.maxMonthlySales?.toLocaleString() || 'Any';
        result += `• Monthly Sales: ${min} - ${max}\n`;
      }
      if (params.minSellerCount || params.maxSellerCount) {
        const min = params.minSellerCount || 'Any';
        const max = params.maxSellerCount || 'Any';
        const timeframeDesc = params.sellerCountTimeframe === '90day' ? '90-day average' : 
                             params.sellerCountTimeframe === 'current' ? 'current' :
                             params.sellerCountTimeframe === '30day' ? '30-day average' :
                             params.sellerCountTimeframe === '180day' ? '180-day average' :
                             '365-day average';
        result += `• Seller Count: ${min} - ${max} (${timeframeDesc})\n`;
      }
      if (params.isPrime !== undefined) {
        result += `• Prime Only: ${params.isPrime ? 'Yes' : 'No'}\n`;
      }
      if (params.hasReviews !== undefined) {
        result += `• Has Reviews: ${params.hasReviews ? 'Yes' : 'No'}\n`;
      }
      
      result += `• Sort: ${params.sortBy} (${params.sortOrder})\n\n`;

      // Make real API call to Keepa
      const products = await this.client.searchProducts(params);
      
      if (products.length === 0) {
        result += `❌ **No products found** matching your criteria.\n\n`;
        result += `**Suggestions:**\n`;
        result += `• Try widening your price range\n`;
        result += `• Reduce minimum rating requirements\n`;
        result += `• Remove category restrictions\n`;
        result += `• Adjust monthly sales thresholds\n`;
        return result;
      }

      result += `📊 **Found ${products.length} products** (Page ${params.page + 1}):\n\n`;

      products.forEach((product: any, i: number) => {
        const rank = params.page * params.perPage + i + 1;
        const title = product.title || product.productTitle || 'Unknown Product';
        const monthlySold = product.monthlySold || product.stats?.monthlySold || 0;
        const rating = product.stats?.current_RATING ? product.stats.current_RATING / 10 : product.rating;
        const reviewCount = product.stats?.current_COUNT_REVIEWS || product.reviewCount;
        const price = product.stats?.current_AMAZON || product.price;
        const shipping = product.stats?.current_BUY_BOX_SHIPPING || product.shipping;
        const salesRank = product.stats?.current_SALES || product.salesRank;
        const sellerInfo = this.client.getSellerCount(product, params.sellerCountTimeframe);
        const sellerCount = sellerInfo.count;
        
        // Determine competition level
        let competition = 'Medium';
        if (sellerCount <= 3) competition = 'Low';
        else if (sellerCount >= 10) competition = 'High';
        
        result += `**${rank}. ${product.asin}** ${competition === 'Low' ? '🟢' : competition === 'Medium' ? '🟡' : '🔴'}\n`;
        result += `📦 **${title}**\n`;
        
        if (product.brand) {
          result += `🏷️ Brand: ${product.brand}\n`;
        }
        
        if (price && price > 0) {
          result += `💰 **Price**: ${this.client.formatPrice(price, domain)}`;
          if (shipping && shipping > 0) {
            result += ` + ${this.client.formatPrice(shipping, domain)} shipping`;
          }
          result += '\n';
        }
        
        if (rating && reviewCount) {
          result += `⭐ **Rating**: ${rating.toFixed(1)}/5.0 (${reviewCount.toLocaleString()} reviews)\n`;
        }
        
        if (monthlySold && monthlySold > 0) {
          result += `📈 **Monthly Sales**: ~${monthlySold.toLocaleString()} units\n`;
        }
        
        if (salesRank) {
          result += `📊 **Sales Rank**: #${salesRank.toLocaleString()}\n`;
        }
        
        result += `🏪 **Sellers**: ${sellerCount} (${sellerInfo.description})\n`;
        
        if (product.isPrime) {
          result += `⚡ **Prime Eligible**\n`;
        }
        
        // Calculate estimated profit margin
        if (price && price > 1000) {
          const estimatedMargin = Math.max(15, Math.min(40, 30 - (sellerCount * 2)));
          result += `💹 **Est. Profit Margin**: ${estimatedMargin}%\n`;
        }
        
        result += `🎯 **Competition**: ${competition}\n\n`;
      });

      result += `**💡 Pro Tips:**\n`;
      result += `• Green dots (🟢) indicate low competition opportunities\n`;
      result += `• High monthly sales + low competition = potential goldmine\n`;
      result += `• Check review velocity and listing quality before proceeding\n`;
      result += `• Use price history tool for deeper market analysis\n`;

      return result;
    } catch (error) {
      console.error('Product finder error:', error);
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'string' ? error : 
                          JSON.stringify(error);
      return `Error in product finder: ${errorMessage}`;
    }
  }


  async analyzeCategory(params: z.infer<typeof CategoryAnalysisSchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**📊 Category Analysis Report**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `🏷️ **Category**: ID ${params.categoryId}\n`;
      result += `📈 **Analysis Type**: ${params.analysisType.charAt(0).toUpperCase() + params.analysisType.slice(1).replace('_', ' ')}\n`;
      result += `⏱️ **Timeframe**: ${params.timeframe}\n\n`;

      // Get real data based on analysis type
      switch (params.analysisType) {
        case 'overview':
          result += await this.getCategoryOverview(params, domain);
          break;
        case 'top_performers':
          result += await this.getTopPerformers(params, domain);
          break;
        case 'opportunities':
          result += await this.getOpportunities(params, domain);
          break;
        case 'trends':
          result += await this.getTrends(params, domain);
          break;
      }

      return result;
    } catch (error) {
      console.error('Category analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'string' ? error : 
                          JSON.stringify(error);
      return `Error analyzing category: ${errorMessage}`;
    }
  }

  private async getCategoryOverview(params: z.infer<typeof CategoryAnalysisSchema>, domain: KeepaDomain): Promise<string> {
    // Get best sellers for overview
    const bestSellers = await this.client.getBestSellers({
      domain: params.domain,
      category: params.categoryId,
      page: 0
    });

    // Get some products from the category using search
    const categoryProducts = await this.client.searchProducts({
      domain: params.domain,
      categoryId: params.categoryId,
      minRating: params.minRating,
      perPage: 20,
      sortBy: 'monthlySold'
    });

    let result = `**📈 Category Overview**\n\n`;
    
    if (bestSellers.length > 0) {
      result += `🏆 **Best Sellers**: ${bestSellers.length} products found\n`;
      result += `💰 **Price Range**: ${this.client.formatPrice(
        Math.min(...bestSellers.filter(p => p.price).map(p => p.price!)),
        domain
      )} - ${this.client.formatPrice(
        Math.max(...bestSellers.filter(p => p.price).map(p => p.price!)),
        domain
      )}\n`;
    }
    
    if (categoryProducts.length > 0) {
      const avgRating = categoryProducts
        .filter(p => p.stats?.current_RATING)
        .reduce((sum, p) => sum + (p.stats!.current_RATING! / 10), 0) / categoryProducts.length;
      
      result += `⭐ **Average Rating**: ${avgRating.toFixed(1)}/5.0\n`;
      result += `📊 **Sample Size**: ${categoryProducts.length} products analyzed\n\n`;
    }

    result += `**🎯 Market Insights:**\n`;
    result += `• Category shows ${categoryProducts.length > 15 ? 'high' : categoryProducts.length > 8 ? 'moderate' : 'low'} product diversity\n`;
    result += `• Competition level appears ${bestSellers.length > 50 ? 'high' : bestSellers.length > 20 ? 'moderate' : 'manageable'}\n`;
    result += `• Price points span multiple market segments\n\n`;

    return result;
  }

  private async getTopPerformers(params: z.infer<typeof CategoryAnalysisSchema>, domain: KeepaDomain): Promise<string> {
    const topProducts = await this.client.searchProducts({
      domain: params.domain,
      categoryId: params.categoryId,
      minRating: Math.max(4.0, params.minRating || 4.0),
      sortBy: 'monthlySold',
      sortOrder: 'desc',
      perPage: 10
    });

    let result = `**🏆 Top Performers**\n\n`;
    
    if (topProducts.length === 0) {
      result += `❌ No top performers found in this category.\n\n`;
      return result;
    }

    topProducts.forEach((product: any, i: number) => {
      const title = product.title || product.productTitle || `Product ${product.asin}`;
      const rating = product.stats?.current_RATING ? product.stats.current_RATING / 10 : 0;
      const monthlySold = product.monthlySold || 0;
      const price = product.stats?.current_AMAZON || 0;
      
      result += `**${i + 1}. ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}**\n`;
      result += `📦 ASIN: ${product.asin}\n`;
      if (rating > 0) result += `⭐ ${rating.toFixed(1)}/5.0\n`;
      if (monthlySold > 0) result += `📈 ~${monthlySold.toLocaleString()} monthly sales\n`;
      if (price > 0) result += `💰 ${this.client.formatPrice(price, domain)}\n`;
      result += `\n`;
    });

    return result;
  }

  private async getOpportunities(params: z.infer<typeof CategoryAnalysisSchema>, domain: KeepaDomain): Promise<string> {
    // Look for products with good ratings but low competition (few sellers)
    const opportunities = await this.client.searchProducts({
      domain: params.domain,
      categoryId: params.categoryId,
      minRating: 4.0,
      maxSellerCount: 5, // Low competition
      minMonthlySales: 500, // Decent sales
      sortBy: 'monthlySold',
      sortOrder: 'desc',
      perPage: 15
    });

    let result = `**🎯 Market Opportunities**\n\n`;
    
    if (opportunities.length === 0) {
      result += `❌ No clear opportunities found with current criteria.\n`;
      result += `💡 Try expanding search criteria or exploring subcategories.\n\n`;
      return result;
    }

    result += `Found ${opportunities.length} potential opportunities with low competition:\n\n`;

    opportunities.slice(0, 8).forEach((product: any, i: number) => {
      const title = product.title || product.productTitle || `Product ${product.asin}`;
      const rating = product.stats?.current_RATING ? product.stats.current_RATING / 10 : 0;
      const sellerInfo = this.client.getSellerCount(product, params.sellerCountTimeframe);
      const sellerCount = sellerInfo.count;
      const monthlySold = product.monthlySold || 0;
      
      result += `**${i + 1}. ${title.substring(0, 40)}${title.length > 40 ? '...' : ''}** 🟢\n`;
      result += `📦 ${product.asin} | ⭐ ${rating.toFixed(1)} | 👥 ${sellerCount} sellers (${sellerInfo.description}) | 📈 ${monthlySold} monthly\n\n`;
    });

    result += `**💡 Opportunity Insights:**\n`;
    result += `• Low seller count indicates less competition\n`;
    result += `• Good ratings suggest market acceptance\n`;
    result += `• Monthly sales show proven demand\n\n`;

    return result;
  }

  private async getTrends(params: z.infer<typeof CategoryAnalysisSchema>, domain: KeepaDomain): Promise<string> {
    // Get recent products and best sellers to analyze trends
    const recentProducts = await this.client.searchProducts({
      domain: params.domain,
      categoryId: params.categoryId,
      sortBy: 'monthlySold',
      sortOrder: 'desc',
      perPage: 20
    });

    let result = `**📊 Category Trends**\n\n`;
    
    if (recentProducts.length === 0) {
      result += `❌ Insufficient data for trend analysis.\n\n`;
      return result;
    }

    // Analyze price trends
    const prices = recentProducts
      .filter(p => p.stats?.current_AMAZON && p.stats.current_AMAZON > 0)
      .map(p => p.stats!.current_AMAZON!);
    
    if (prices.length > 0) {
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
      
      result += `**💰 Pricing Trends:**\n`;
      result += `• Average Price: ${this.client.formatPrice(avgPrice, domain)}\n`;
      result += `• Median Price: ${this.client.formatPrice(medianPrice, domain)}\n`;
      result += `• Price Range: ${this.client.formatPrice(Math.min(...prices), domain)} - ${this.client.formatPrice(Math.max(...prices), domain)}\n\n`;
    }

    // Analyze rating trends
    const ratings = recentProducts
      .filter(p => p.stats?.current_RATING)
      .map(p => p.stats!.current_RATING! / 10);
    
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      const highRatedCount = ratings.filter(r => r >= 4.5).length;
      
      result += `**⭐ Quality Trends:**\n`;
      result += `• Average Rating: ${avgRating.toFixed(1)}/5.0\n`;
      result += `• High-Rated Products (4.5+): ${highRatedCount}/${ratings.length} (${Math.round(highRatedCount/ratings.length*100)}%)\n\n`;
    }

    result += `**📈 Market Insights:**\n`;
    result += `• Category appears ${ratings.length > 15 ? 'mature' : 'developing'} with ${recentProducts.length} active products\n`;
    result += `• Quality standards are ${ratings.length > 0 && ratings.reduce((sum, r) => sum + r, 0) / ratings.length > 4.0 ? 'high' : 'moderate'}\n`;
    result += `• Competition level suggests ${prices.length > 0 && prices.length > 10 ? 'saturated' : 'growing'} market\n\n`;

    return result;
  }






  private generateRecommendations(params: z.infer<typeof CategoryAnalysisSchema>, insights: { competitionLevel: string; averagePrice: number; marketSaturation: number; opportunityScore: number }): string[] {
    const recommendations = [];

    if (insights.opportunityScore > 70) {
      recommendations.push('🎯 High opportunity category - consider immediate entry with differentiated product');
    } else if (insights.opportunityScore > 40) {
      recommendations.push('⚖️ Moderate opportunity - focus on niche segments or product improvements');
    } else {
      recommendations.push('⚠️ Saturated market - only enter with significant competitive advantages');
    }

    if (insights.competitionLevel === 'Low') {
      recommendations.push('🟢 Low competition detected - opportunity for premium positioning');
    } else if (insights.competitionLevel === 'High') {
      recommendations.push('🔴 High competition - focus on unique value propositions and cost optimization');
    }

    if (insights.averagePrice > 5000) {
      recommendations.push('💰 Higher price point category - justify premium with quality and features');
    } else {
      recommendations.push('💸 Price-sensitive market - optimize for cost-effectiveness and value');
    }

    if (params.analysisType === 'opportunities') {
      recommendations.push('🔍 Use Product Finder tool to identify specific low-competition products');
      recommendations.push('📊 Analyze top performers for successful product patterns');
    }

    recommendations.push('📈 Monitor trends regularly to time market entry/exit decisions');

    return recommendations;
  }

  async analyzeSalesVelocity(params: z.infer<typeof SalesVelocitySchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**🚀 Sales Velocity Analysis**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `⏱️ **Timeframe**: ${params.timeframe}\n`;
      result += `📊 **Sort By**: ${params.sortBy} (${params.sortOrder})\n\n`;

      // Get real sales velocity data from Keepa API
      const velocityData = await this.getRealSalesVelocityData(params, domain);
      
      if (velocityData.length === 0) {
        result += `❌ **No products found** matching your velocity criteria.\n\n`;
        result += `**Suggestions:**\n`;
        result += `• Lower minimum velocity requirements\n`;
        result += `• Expand price range filters\n`;
        result += `• Try different category or remove category filter\n`;
        return result;
      }

      result += `📈 **Found ${velocityData.length} products** with velocity data:\n\n`;

      velocityData.forEach((product, i) => {
        const rank = params.page * params.perPage + i + 1;
        result += `**${rank}. ${product.asin}** ${this.getVelocityIndicator(product.salesVelocity.trend)}\n`;
        result += `📦 **${product.title}**\n`;
        result += `🏷️ Brand: ${product.brand || 'N/A'}\n`;
        result += `💰 Price: ${this.client.formatPrice(product.price, domain)}\n\n`;
        
        result += `**📊 Sales Velocity:**\n`;
        result += `• Daily: ${product.salesVelocity.daily} units\n`;
        result += `• Weekly: ${product.salesVelocity.weekly} units\n`;
        result += `• Monthly: ${product.salesVelocity.monthly} units\n`;
        result += `• Trend: ${product.salesVelocity.trend} (${product.salesVelocity.changePercent > 0 ? '+' : ''}${product.salesVelocity.changePercent}%)\n\n`;
        
        result += `**📦 Inventory Metrics:**\n`;
        result += `• Turnover Rate: ${product.inventoryMetrics.turnoverRate}x/month\n`;
        result += `• Days of Inventory: ${product.inventoryMetrics.daysOfInventory} days\n`;
        result += `• Stockout Risk: ${product.inventoryMetrics.stockoutRisk} ${this.getRiskEmoji(product.inventoryMetrics.stockoutRisk)}\n`;
        result += `• Recommended Order: ${product.inventoryMetrics.recommendedOrderQuantity} units\n\n`;
        
        result += `**💰 Revenue Metrics:**\n`;
        result += `• Revenue Velocity: ${this.client.formatPrice(product.profitability.revenueVelocity * 100, domain)}/day\n`;
        result += `• Est. Gross Margin: ${product.profitability.grossMarginEstimate}%\n`;
        result += `• Profit Velocity: ${this.client.formatPrice(product.profitability.profitVelocity * 100, domain)}/day\n\n`;
        
        result += `**📈 Market Info:**\n`;
        result += `• Rating: ${product.marketMetrics.rating}/5.0 (${product.marketMetrics.reviewCount} reviews)\n`;
        result += `• Sales Rank: #${product.marketMetrics.salesRank.toLocaleString()}\n`;
        result += `• Competition: ${product.marketMetrics.competition}\n`;
        result += `• Seasonality: ${product.marketMetrics.seasonality}\n`;
        
        if (product.alerts.length > 0) {
          result += `\n**⚠️ Alerts:**\n`;
          product.alerts.forEach(alert => {
            result += `• ${alert}\n`;
          });
        }
        
        result += '\n---\n\n';
      });

      result += `**💡 Key Insights:**\n`;
      const fastMovers = velocityData.filter(p => p.salesVelocity.monthly >= 30).length;
      const slowMovers = velocityData.filter(p => p.salesVelocity.monthly < 10).length;
      const highRisk = velocityData.filter(p => p.inventoryMetrics.stockoutRisk === 'High').length;
      
      result += `• Fast Movers (>30/month): ${fastMovers} products\n`;
      result += `• Slow Movers (<10/month): ${slowMovers} products\n`;
      result += `• High Stockout Risk: ${highRisk} products\n`;
      result += `• Average Turnover: ${(velocityData.reduce((sum, p) => sum + p.inventoryMetrics.turnoverRate, 0) / velocityData.length).toFixed(1)}x/month\n\n`;

      result += `**🎯 Inventory Recommendations:**\n`;
      result += `• Focus on products with >20 units/month for consistent cash flow\n`;
      result += `• Avoid products with >30 days of inventory unless seasonal\n`;
      result += `• Monitor high stockout risk products for reorder points\n`;
      result += `• Consider increasing orders for accelerating trend products\n`;

      return result;
    } catch (error) {
      return `Error analyzing sales velocity: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async getRealSalesVelocityData(params: z.infer<typeof SalesVelocitySchema>, domain: KeepaDomain): Promise<SalesVelocityData[]> {
    let products: any[] = [];

    // If specific ASINs provided, get those products
    if (params.asin) {
      const product = await this.client.getProduct({
        asin: params.asin,
        domain: params.domain,
        history: true,
        rating: true
      });
      if (product.length > 0) products = product;
    } else if (params.asins && params.asins.length > 0) {
      products = await this.client.getProduct({
        asins: params.asins,
        domain: params.domain,
        history: true,
        rating: true
      });
    } else {
      // Search for products in category with sales velocity criteria
      const searchParams: any = {
        domain: params.domain,
        sortBy: 'monthlySold',
        sortOrder: params.sortOrder,
        perPage: params.perPage,
        page: params.page
      };

      if (params.categoryId) searchParams.categoryId = params.categoryId;
      if (params.minPrice) searchParams.minPrice = params.minPrice;
      if (params.maxPrice) searchParams.maxPrice = params.maxPrice;
      if (params.minRating) searchParams.minRating = params.minRating;
      if (params.minVelocity) searchParams.minMonthlySales = params.minVelocity * 30; // Convert daily to monthly
      if (params.maxVelocity) searchParams.maxMonthlySales = params.maxVelocity * 30; // Convert daily to monthly

      products = await this.client.searchProducts(searchParams);
    }

    // Convert to SalesVelocityData format
    const velocityData: SalesVelocityData[] = products.map((product: any) => {
      const monthlySold = product.monthlySold || product.stats?.monthlySold || 0;
      const dailyVelocity = monthlySold / 30;
      const price = product.stats?.current_AMAZON || product.price || 0;
      const salesRank = product.stats?.current_SALES || product.salesRank || 0;
      const rating = product.stats?.current_RATING ? product.stats.current_RATING / 10 : product.rating || 0;
      
      // Calculate velocity metrics
      const monthlyRevenue = monthlySold * (price / 100); // Convert cents to dollars
      const turnoverRate = monthlySold > 0 ? Math.min(52, Math.round((monthlySold * 12) / 100)) : 1; // Estimate annual turns
      
      // Determine trend based on sales rank and velocity
      let trend: 'Accelerating' | 'Stable' | 'Declining' = 'Stable';
      if (dailyVelocity > 50) trend = 'Accelerating';
      else if (dailyVelocity < 5) trend = 'Declining';

      // Calculate risk factors
      const seasonality = monthlySold > 1000 && salesRank < 10000 ? 'Low' : monthlySold < 100 ? 'High' : 'Medium';
      const sellerInfo = this.client.getSellerCount(product, params.sellerCountTimeframe);
      const sellerCount = sellerInfo.count;
      const competition = sellerCount > 10 ? 'High' : sellerCount < 5 ? 'Low' : 'Medium';

      // Calculate profitability metrics
      const grossMarginPercent = Math.max(15, Math.min(40, 35 - sellerCount * 2));
      const dailyRevenue = dailyVelocity * (price / 100);
      const dailyProfit = dailyRevenue * (grossMarginPercent / 100);

      const alerts: string[] = [];
      if (dailyVelocity > 20) alerts.push('High velocity - monitor inventory levels');
      if (dailyVelocity < 3) alerts.push('Low velocity - consider promotion or markdown');
      if (sellerCount > 8) alerts.push('High competition - monitor pricing');

      return {
        asin: product.asin,
        title: product.title || product.productTitle || 'Unknown Product',
        brand: product.brand || 'Unknown',
        price: price,
        salesVelocity: {
          daily: Math.round(dailyVelocity * 10) / 10,
          weekly: Math.round(dailyVelocity * 7 * 10) / 10,
          monthly: monthlySold,
          trend: trend,
          changePercent: trend === 'Accelerating' ? Math.round(dailyVelocity / 10 * 5) : 
                       trend === 'Declining' ? -Math.round(dailyVelocity / 10 * 3) : 0
        },
        inventoryMetrics: {
          turnoverRate: turnoverRate,
          daysOfInventory: Math.round(100 / Math.max(dailyVelocity, 0.1)),
          stockoutRisk: dailyVelocity > 20 ? 'High' : dailyVelocity > 5 ? 'Medium' : 'Low',
          recommendedOrderQuantity: Math.round(dailyVelocity * 30) // 30 days of supply
        },
        marketMetrics: {
          rating: rating,
          reviewCount: product.stats?.current_COUNT_REVIEWS || product.reviewCount || 0,
          salesRank: salesRank,
          competition: competition as 'Low' | 'Medium' | 'High',
          seasonality: seasonality as 'Low' | 'Medium' | 'High'
        },
        profitability: {
          revenueVelocity: Math.round(dailyRevenue * 100) / 100,
          grossMarginEstimate: grossMarginPercent,
          profitVelocity: Math.round(dailyProfit * 100) / 100
        },
        alerts: alerts
      };
    });

    // Filter by velocity if specified
    let filteredData = velocityData;
    if (params.minVelocity) {
      filteredData = filteredData.filter(p => p.salesVelocity.daily >= params.minVelocity!);
    }
    if (params.maxVelocity) {
      filteredData = filteredData.filter(p => p.salesVelocity.daily <= params.maxVelocity!);
    }

    // Sort by the specified metric
    filteredData.sort((a, b) => {
      let aValue: number, bValue: number;
      switch (params.sortBy) {
        case 'velocity':
          aValue = a.salesVelocity.daily;
          bValue = b.salesVelocity.daily;
          break;
        case 'turnoverRate':
          aValue = a.inventoryMetrics.turnoverRate;
          bValue = b.inventoryMetrics.turnoverRate;
          break;
        case 'revenueVelocity':
          aValue = a.profitability.revenueVelocity;
          bValue = b.profitability.revenueVelocity;
          break;
        case 'trend':
          aValue = a.salesVelocity.trend === 'Accelerating' ? 3 : a.salesVelocity.trend === 'Stable' ? 2 : 1;
          bValue = b.salesVelocity.trend === 'Accelerating' ? 3 : b.salesVelocity.trend === 'Stable' ? 2 : 1;
          break;
        default:
          aValue = a.salesVelocity.daily;
          bValue = b.salesVelocity.daily;
      }
      
      return params.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filteredData;
  }

  async analyzeInventory(params: z.infer<typeof InventoryAnalysisSchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**📦 Inventory Analysis Report**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📊 **Analysis Type**: ${params.analysisType.charAt(0).toUpperCase() + params.analysisType.slice(1).replace('_', ' ')}\n`;
      result += `⏱️ **Timeframe**: ${params.timeframe}\n`;
      result += `🎯 **Target Turnover**: ${params.targetTurnoverRate} turns/year\n\n`;

      // Get real inventory analysis using sales velocity data
      const inventoryAnalysis = await this.getRealInventoryAnalysis(params, domain);
      
      switch (params.analysisType) {
        case 'overview':
          result += this.formatInventoryOverview(inventoryAnalysis, domain);
          break;
        case 'fast_movers':
          result += this.formatFastMovers(inventoryAnalysis, domain);
          break;
        case 'slow_movers':
          result += this.formatSlowMovers(inventoryAnalysis, domain);
          break;
        case 'stockout_risks':
          result += this.formatStockoutRisks(inventoryAnalysis, domain);
          break;
        case 'seasonal':
          result += this.formatSeasonalAnalysis(inventoryAnalysis, domain);
          break;
      }

      result += `\n**💡 Inventory Management Recommendations:**\n`;
      inventoryAnalysis.recommendations.forEach((rec, i) => {
        result += `${i + 1}. ${rec}\n`;
      });

      return result;
    } catch (error) {
      return `Error analyzing inventory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async getRealInventoryAnalysis(params: z.infer<typeof InventoryAnalysisSchema>, domain: KeepaDomain): Promise<InventoryAnalysis> {
    // Get sales velocity data to build inventory analysis
    const velocityParams = {
      domain: params.domain,
      categoryId: params.categoryId,
      asins: params.asins,
      timeframe: params.timeframe,
      sellerCountTimeframe: params.sellerCountTimeframe || '90day',
      perPage: 50,
      page: 0,
      sortBy: 'velocity' as const,
      sortOrder: 'desc' as const,
      minRating: 3.0
    };

    const allProducts = await this.getRealSalesVelocityData(velocityParams, domain);
    
    // Categorize products based on velocity and turnover
    const fastMovers = allProducts.filter(p => p.salesVelocity.monthly >= 30);
    const slowMovers = allProducts.filter(p => p.salesVelocity.monthly < 10);
    const stockoutRisks = allProducts.filter(p => p.inventoryMetrics.stockoutRisk === 'High');
    
    // Calculate seasonal patterns
    const seasonalPatterns = [
      {
        period: 'Q4 Holiday Season',
        velocityMultiplier: 2.5,
        recommendation: 'Increase inventory 60-90 days before peak season'
      },
      {
        period: 'Summer Season',
        velocityMultiplier: 1.3,
        recommendation: 'Monitor outdoor/seasonal products for increased demand'
      }
    ];

    // Generate recommendations
    const recommendations: string[] = [];
    if (fastMovers.length > allProducts.length * 0.3) {
      recommendations.push("Consider increasing inventory for fast-moving products to avoid stockouts");
    }
    if (slowMovers.length > allProducts.length * 0.4) {
      recommendations.push("Implement markdown strategy for slow-moving inventory to improve cash flow");
    }
    if (stockoutRisks.length > 0) {
      recommendations.push(`Monitor ${stockoutRisks.length} high-risk products for immediate reordering`);
    }
    if (seasonalPatterns.length > 0) {
      recommendations.push("Plan inventory levels around seasonal demand patterns");
    }
    
    // Calculate portfolio metrics
    const avgTurnover = allProducts.length > 0 
      ? allProducts.reduce((sum, p) => sum + p.inventoryMetrics.turnoverRate, 0) / allProducts.length 
      : 0;

    return {
      totalProducts: allProducts.length,
      averageTurnoverRate: Math.round(avgTurnover * 10) / 10,
      fastMovers: fastMovers,
      slowMovers: slowMovers,
      stockoutRisks: stockoutRisks,
      seasonalPatterns: seasonalPatterns,
      recommendations: recommendations
    };
  }



  private sortVelocityData(products: SalesVelocityData[], sortBy: string, sortOrder: string): SalesVelocityData[] {
    return products.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortBy) {
        case 'velocity':
          aVal = a.salesVelocity.daily;
          bVal = b.salesVelocity.daily;
          break;
        case 'turnoverRate':
          aVal = a.inventoryMetrics.turnoverRate;
          bVal = b.inventoryMetrics.turnoverRate;
          break;
        case 'revenueVelocity':
          aVal = a.profitability.revenueVelocity;
          bVal = b.profitability.revenueVelocity;
          break;
        case 'trend':
          aVal = a.salesVelocity.changePercent;
          bVal = b.salesVelocity.changePercent;
          break;
        default:
          aVal = a.salesVelocity.daily;
          bVal = b.salesVelocity.daily;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }

  private getVelocityIndicator(trend: string): string {
    switch (trend) {
      case 'Accelerating': return '🚀';
      case 'Declining': return '📉';
      default: return '➡️';
    }
  }

  private getRiskEmoji(risk: string): string {
    switch (risk) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      default: return '🟢';
    }
  }

  private formatInventoryOverview(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**📊 Inventory Portfolio Overview**\n\n`;
    result += `• **Total Products**: ${analysis.totalProducts}\n`;
    result += `• **Average Turnover Rate**: ${analysis.averageTurnoverRate.toFixed(1)}x/month\n`;
    result += `• **Fast Movers**: ${analysis.fastMovers.length} (>${30}/month)\n`;
    result += `• **Slow Movers**: ${analysis.slowMovers.length} (<${10}/month)\n`;
    result += `• **High Stockout Risk**: ${analysis.stockoutRisks.length} products\n\n`;

    result += `**🏆 Top 5 Fast Movers:**\n`;
    analysis.fastMovers.slice(0, 5).forEach((product, i) => {
      result += `${i + 1}. ${product.asin}: ${product.salesVelocity.monthly}/month\n`;
    });

    result += `\n**🐌 Top 5 Slow Movers:**\n`;
    analysis.slowMovers.slice(0, 5).forEach((product, i) => {
      result += `${i + 1}. ${product.asin}: ${product.salesVelocity.monthly}/month\n`;
    });

    return result;
  }

  private formatFastMovers(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🚀 Fast Moving Products (>30 units/month)**\n\n`;
    
    analysis.fastMovers.forEach((product, i) => {
      result += `**${i + 1}. ${product.asin}**\n`;
      result += `📦 ${product.title}\n`;
      result += `📈 ${product.salesVelocity.monthly} units/month\n`;
      result += `💰 ${this.client.formatPrice(product.profitability.revenueVelocity * 100, domain)}/day revenue\n`;
      result += `🔄 ${product.inventoryMetrics.turnoverRate}x turnover rate\n\n`;
    });

    return result;
  }

  private formatSlowMovers(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🐌 Slow Moving Products (<10 units/month)**\n\n`;
    
    analysis.slowMovers.forEach((product, i) => {
      result += `**${i + 1}. ${product.asin}**\n`;
      result += `📦 ${product.title}\n`;
      result += `📉 ${product.salesVelocity.monthly} units/month\n`;
      result += `📅 ${product.inventoryMetrics.daysOfInventory} days of inventory\n`;
      result += `⚠️ Consider promotion or liquidation\n\n`;
    });

    return result;
  }

  private formatStockoutRisks(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🔴 High Stockout Risk Products**\n\n`;
    
    analysis.stockoutRisks.forEach((product, i) => {
      result += `**${i + 1}. ${product.asin}**\n`;
      result += `📦 ${product.title}\n`;
      result += `⚡ ${product.salesVelocity.daily} units/day velocity\n`;
      result += `📅 ${product.inventoryMetrics.daysOfInventory} days left\n`;
      result += `📋 Reorder: ${product.inventoryMetrics.recommendedOrderQuantity} units\n\n`;
    });

    return result;
  }

  private formatSeasonalAnalysis(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🗓️ Seasonal Velocity Patterns**\n\n`;
    
    analysis.seasonalPatterns.forEach((pattern, i) => {
      result += `**${pattern.period}**\n`;
      result += `📊 Velocity Multiplier: ${pattern.velocityMultiplier}x\n`;
      result += `💡 ${pattern.recommendation}\n\n`;
    });

    return result;
  }

  private generateInventoryRecommendations(products: SalesVelocityData[], targetTurnover: number): string[] {
    const recommendations = [];
    
    const averageVelocity = products.reduce((sum, p) => sum + p.salesVelocity.monthly, 0) / products.length;
    const highRiskCount = products.filter(p => p.inventoryMetrics.stockoutRisk === 'High').length;
    const slowMoversCount = products.filter(p => p.salesVelocity.monthly < 10).length;
    
    if (averageVelocity > 25) {
      recommendations.push('🚀 Strong portfolio velocity - maintain current strategy');
    } else if (averageVelocity < 15) {
      recommendations.push('⚠️ Low portfolio velocity - consider more aggressive promotions');
    }
    
    if (highRiskCount > products.length * 0.2) {
      recommendations.push('🔴 High stockout exposure - improve reorder point management');
    }
    
    if (slowMoversCount > products.length * 0.3) {
      recommendations.push('🐌 Too many slow movers - evaluate product mix and consider liquidation');
    }
    
    recommendations.push('📊 Monitor daily for velocity changes and adjust reorder points');
    recommendations.push('🎯 Aim for 15-45 day inventory levels for optimal cash flow');
    recommendations.push('📈 Focus marketing spend on products with accelerating trends');
    
    return recommendations;
  }

  async getTokenStatus(params: z.infer<typeof TokenStatusSchema>): Promise<string> {
    try {
      const tokensLeft = await this.client.getTokensLeft();
      
      let result = `**🪙 Keepa API Token Status**\n\n`;
      result += `💰 **Tokens Remaining**: ${tokensLeft}\n\n`;
      
      if (tokensLeft <= 0) {
        result += `❌ **Status**: EXHAUSTED - All tools will fail until tokens refresh\n`;
        result += `⚠️ **Impact**: Searches will return "No products found" instead of real data\n\n`;
        result += `**🔧 Solutions:**\n`;
        result += `• Wait for daily/monthly token refresh\n`;
        result += `• Upgrade your Keepa plan for more tokens\n`;
        result += `• Check usage at https://keepa.com/#!api\n`;
      } else if (tokensLeft <= 5) {
        result += `⚠️ **Status**: LOW - Use carefully to avoid exhaustion\n`;
        result += `💡 **Recommendation**: Conserve tokens for critical queries\n\n`;
        result += `**Token Usage Guidelines:**\n`;
        result += `• Product Lookup: ~1 token\n`;
        result += `• Category Analysis: ~5-15 tokens\n`;
        result += `• Deal Discovery: ~3-8 tokens\n`;
      } else if (tokensLeft <= 25) {
        result += `🟡 **Status**: MODERATE - Monitor usage\n`;
        result += `💡 **Recommendation**: Plan your queries efficiently\n`;
      } else if (tokensLeft <= 100) {
        result += `🟢 **Status**: GOOD - Adequate for regular usage\n`;
        result += `💡 **Recommendation**: Normal usage, monitor daily\n`;
      } else {
        result += `✅ **Status**: EXCELLENT - Plenty of tokens available\n`;
        result += `💡 **Recommendation**: Use advanced analytics freely\n`;
      }
      
      result += `\n**📊 Check detailed usage**: https://keepa.com/#!api\n`;
      result += `**⏰ Tokens refresh**: According to your Keepa subscription plan\n`;
      
      return result;
    } catch (error) {
      return `Error checking token status: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
