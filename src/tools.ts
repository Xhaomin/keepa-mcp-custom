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
  asin: z.string().describe('Amazon ASIN'),
  domain: z.number().min(1).max(11).default(9).describe('Amazon domain (9=ES)'),
  days: z.number().min(1).max(365).default(90).describe('Days of history (1-365)'),
  dataType: z.number().optional().describe('Specific CsvType index (0=Amazon, 1=New, 2=Used, 3=SalesRank, 18=BuyBox). If omitted, shows all relevant types.'),
  includeOffers: z.boolean().default(false).describe('Include Buy Box history (costs 6+ extra tokens). Set true for BB winner history.'),
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

// ============================================================
// lookupProduct() v5 — REEMPLAZAR COMPLETO en src/tools.ts
// Basado en documentación oficial de Keepa:
// - Statistics Object: min/max son int[][] (arrays 2D)
// - stock=true → stats.stockBuyBox (simple int)
// - buybox ignorado con offers
// - rating redundante con offers
// - only-live-offers reduce respuesta sin coste
// ============================================================

  async lookupProduct(params: z.infer<typeof ProductLookupSchema>): Promise<string> {
    try {
      if (!params.asin && !params.code) {
        return 'Error: Either ASIN or code (EAN/UPC) is required';
      }

      // ── Parámetros optimizados según documentación Keepa ──
      const queryOptions: any = {
        stats: 90,                // FREE: avg/min/max/OOS sobre 90 días
        days: params.days || 1,   // Solo datos recientes para offers (reduce respuesta)
        history: false,           // No parseamos csv[] aquí → reduce respuesta ~80%
        offers: params.offers || 20, // 6-12 tokens: ofertas, BB, rating, reviews actualizados
        stock: 1,              // 2 tokens: stats.stockBuyBox + stats.stockAmazon
        'only-live-offers': 1, // FREE: excluye ofertas históricas → reduce respuesta
        // rating: ELIMINADO — redundante cuando se usa offers (doc: "use offers for up-to-date data")
        // buybox: ELIMINADO — ignorado cuando se usa offers (doc: "buybox parameter is ignored")
        variations: params.variations,
      };

      let product;
      if (params.code) {
        const products = await this.client.getProduct({
          code: params.code,
          domain: params.domain as KeepaDomain,
          ...queryOptions,
        });
        product = products?.[0];
      } else {
        product = await this.client.getProductByAsin(
          params.asin!,
          params.domain as KeepaDomain,
          queryOptions
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

      const stats = product.stats as any; // Cast para acceder a campos completos

      // ── Información Básica ──
      let result = `**Product Information for ${asin}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📦 **ASIN**: ${asin}\n`;
      if (imageUrl) result += `📷 **Imagen**: ${imageUrl}\n`;
      result += `🏷️ **Titulo**: ${product.title || 'N/A'}\n`;
      result += `🏢 **Marca**: ${product.brand || 'N/A'}\n`;
      result += `📊 **Categoria**: ${product.productGroup || 'N/A'}\n`;
      if ((product as any).parentAsin) {
        result += `🔗 **Parent ASIN**: ${(product as any).parentAsin}\n`;
      }
      result += `\n`;

      // ── PRECIOS (con fix de min/max — son arrays 2D [keepaTime, value]) ──
      if (stats) {
        const buyBoxPrice = stats.buyBoxPrice;
        const buyBoxShipping = stats.buyBoxShipping;
        const buyBoxUsedPrice = stats.buyBoxUsedPrice;
        const amazonPrice = stats.current?.[0]; // AMAZON = index 0
        const avgPrice = stats.avg?.[0]; // Media del intervalo stats=90

        // FIX: min y max son int[][] → min[csvType] = [keepaTime, value] o null
        const minRaw = stats.minInInterval?.[0]; // minInInterval = dentro del periodo stats
        const minPrice = Array.isArray(minRaw) ? minRaw[1] : minRaw;
        const maxRaw = stats.maxInInterval?.[0];
        const maxPrice = Array.isArray(maxRaw) ? maxRaw[1] : maxRaw;

        // Medias por periodo (siempre disponibles, FREE)
        const avg30 = stats.avg30?.[0];
        const avg90 = stats.avg90?.[0];
        const avg180 = stats.avg180?.[0];

        result += `💰 **PRECIOS:**\n`;

        // Buy Box principal
        if (buyBoxPrice && buyBoxPrice > 0) {
          let bbText = `   • Buy Box: ${this.client.formatPrice(buyBoxPrice, domain)}`;
          if (buyBoxShipping && buyBoxShipping > 0) {
            bbText += ` (+${this.client.formatPrice(buyBoxShipping, domain)} envío)`;
          }
          result += bbText + `\n`;
        }
        if (amazonPrice && amazonPrice > 0 && amazonPrice !== buyBoxPrice) {
          result += `   • Amazon: ${this.client.formatPrice(amazonPrice, domain)}\n`;
        }

        // Estadísticas de precio (FREE con stats=90)
        if (avg90 && avg90 > 0) {
          result += `   • Promedio 90d: ${this.client.formatPrice(avg90, domain)}`;
          // Tendencia: comparar avg30 vs avg90
          if (avg30 && avg30 > 0 && avg90 > 0) {
            const diff = ((avg30 - avg90) / avg90) * 100;
            if (Math.abs(diff) >= 1) {
              result += diff > 0 ? ` (📈 +${diff.toFixed(1)}% vs 30d)` : ` (📉 ${diff.toFixed(1)}% vs 30d)`;
            }
          }
          result += `\n`;
        }
        if (minPrice && minPrice > 0) {
          result += `   • Mínimo 90d: ${this.client.formatPrice(minPrice, domain)}\n`;
        }
        if (maxPrice && maxPrice > 0) {
          result += `   • Máximo 90d: ${this.client.formatPrice(maxPrice, domain)}\n`;
        }

        // Descuento/Saving (si hay precio tachado)
        if (stats.buyBoxSavingBasis && stats.buyBoxSavingBasis > 0) {
          const savingType = stats.buyBoxSavingBasisType === 'WAS_PRICE' ? 'Precio anterior' : 'PVP';
          result += `   • ${savingType}: ${this.client.formatPrice(stats.buyBoxSavingBasis, domain)}`;
          if (stats.buyBoxSavingPercentage) {
            result += ` (-${stats.buyBoxSavingPercentage}%)`;
          }
          result += `\n`;
        }

        // Cupones activos
        const coupon = (product as any).coupon;
        if (coupon && Array.isArray(coupon)) {
          const [oneTime, sns] = coupon;
          if (oneTime > 0) result += `   • 🎟️ Cupón: -${this.client.formatPrice(oneTime, domain)}\n`;
          else if (oneTime < 0) result += `   • 🎟️ Cupón: -${Math.abs(oneTime)}%\n`;
          if (sns > 0) result += `   • 🎟️ Cupón S&S: -${this.client.formatPrice(sns, domain)}\n`;
          else if (sns < 0) result += `   • 🎟️ Cupón S&S: -${Math.abs(sns)}%\n`;
        }

        result += `\n`;

        // ── BUY BOX (con condición correcta via buyBoxCondition) ──
        result += `🏆 **BUY BOX:**\n`;
        const hasBuyBoxNew = buyBoxPrice && buyBoxPrice > 0;
        const hasBuyBoxUsed = buyBoxUsedPrice && buyBoxUsedPrice > 0;

        if (hasBuyBoxNew || hasBuyBoxUsed) {
          // Condición del Buy Box principal (buyBoxCondition del Statistics Object)
          const buyBoxCondition = stats.buyBoxCondition;
          const conditionMap: Record<number, string> = {
            1: 'Nuevo', 2: 'Usado-Como Nuevo', 3: 'Usado-Muy Bueno',
            4: 'Usado-Bueno', 5: 'Usado-Aceptable',
          };

          if (hasBuyBoxNew) {
            const mainCondition = conditionMap[buyBoxCondition] || 'Nuevo';
            result += `   • Precio: ${this.client.formatPrice(buyBoxPrice, domain)} (${mainCondition})\n`;

            // Ganador
            let ganador = 'Vendedor FBM 3P';
            if (stats.buyBoxIsAmazon) ganador = 'Amazon';
            else if (stats.buyBoxIsFBA) ganador = 'Vendedor FBA 3P';
            result += `   • Ganador: ${ganador}\n`;

            // Fulfillment / Prime
            if (stats.buyBoxIsFBA) result += `   • Fulfillment: FBA ✓\n`;
            if (stats.buyBoxIsPrimeEligible) result += `   • Prime: ✅\n`;
          }

          if (hasBuyBoxUsed) {
            const usedCondition = conditionMap[stats.buyBoxUsedCondition] || 'Usado';
            if (hasBuyBoxNew) {
              result += `   • BB Usado: ${this.client.formatPrice(buyBoxUsedPrice, domain)} (${usedCondition})\n`;
            } else {
              result += `   • Precio: ${this.client.formatPrice(buyBoxUsedPrice, domain)} (${usedCondition})\n`;
              if (stats.buyBoxUsedIsFBA) result += `   • Fulfillment: FBA ✓\n`;
            }
          }

          // Mensaje de disponibilidad
          if (stats.buyBoxAvailabilityMessage) {
            result += `   • Disponibilidad: ${stats.buyBoxAvailabilityMessage}\n`;
          }

          // Subscribe & Save
          if ((product as any).isSNS) {
            result += `   • 🔄 Subscribe & Save: Disponible\n`;
          }

          // Min/Max order quantity
          if (stats.buyBoxMinOrderQuantity && stats.buyBoxMinOrderQuantity > 1) {
            result += `   • Cantidad mínima: ${stats.buyBoxMinOrderQuantity}\n`;
          }
          if (stats.buyBoxMaxOrderQuantity && stats.buyBoxMaxOrderQuantity > 0) {
            result += `   • Cantidad máxima: ${stats.buyBoxMaxOrderQuantity}\n`;
          }

          // País de envío
          if (stats.buyBoxShippingCountry) {
            result += `   • País envío: ${stats.buyBoxShippingCountry}\n`;
          }
        } else {
          result += `   • Ganador: Sin Buy Box\n`;
          if (stats.buyBoxIsUnqualified) {
            result += `   • Nota: Ningún vendedor calificado para BB\n`;
          }
        }
        result += `\n`;

        // ── STOCK (stats.stockBuyBox / stats.stockAmazon — requiere stock=true) ──
        const stockBuyBox = stats.stockBuyBox;
        const stockAmazon = stats.stockAmazon;
        if ((stockBuyBox !== undefined && stockBuyBox > 0) || (stockAmazon !== undefined && stockAmazon > 0)) {
          result += `📦 **STOCK:**\n`;
          if (stockBuyBox !== undefined && stockBuyBox > 0) {
            result += `   • Buy Box: ${stockBuyBox} unidades\n`;
          }
          if (stockAmazon !== undefined && stockAmazon > 0 && stockAmazon !== stockBuyBox) {
            result += `   • Amazon: ${stockAmazon} unidades\n`;
          }
          result += `\n`;
        }

        // ── SALES RANK ──
        const currentSalesRank = stats.current?.[3]; // SALES = index 3
        if (currentSalesRank && currentSalesRank > 0) {
          result += `📊 **Sales Rank**: #${currentSalesRank.toLocaleString()}\n`;
          // Drops = proxy de ventas
          if (stats.salesRankDrops30 !== undefined && stats.salesRankDrops30 >= 0) {
            result += `   • Drops 30d: ${stats.salesRankDrops30} (≈ ventas estimadas)\n`;
          }
          if (stats.salesRankDrops90 !== undefined && stats.salesRankDrops90 >= 0) {
            result += `   • Drops 90d: ${stats.salesRankDrops90}\n`;
          }
          result += `\n`;
        }

        // ── VENTAS MENSUALES (dato real de Amazon, no estimación) ──
        const monthlySold = (product as any).monthlySold;
        if (monthlySold && monthlySold > 0) {
          const dailySold = Math.round((monthlySold / 30) * 10) / 10;
          const weeklySold = Math.round((monthlySold / 4.3) * 10) / 10;
          result += `📈 **VELOCIDAD DE VENTAS (30 días):**\n`;
          result += `   • Mensuales: ${monthlySold.toLocaleString()} unidades\n`;
          result += `   • Diarias: ${dailySold} unidades\n`;
          result += `   • Semanales: ${weeklySold} unidades\n`;
          result += `\n`;
        }

        // ── RESEÑAS ──
        const rating = stats.current?.[16]; // RATING index 16 (0-50)
        const reviewCount = stats.current?.[17]; // COUNT_REVIEWS index 17
        if (rating && rating > 0) {
          result += `⭐ **RESEÑAS:**\n`;
          result += `   • Rating: ${(rating / 10).toFixed(1)}/5.0\n`;
          if (reviewCount && reviewCount > 0) {
            result += `   • Total: ${reviewCount.toLocaleString()} reseñas\n`;
          }
          result += `\n`;
        }

        // ── COMPETENCIA ──
        result += `🏪 **COMPETENCIA:**\n`;
        if (stats.totalOfferCount !== undefined) {
          result += `   • Total ofertas: ${stats.totalOfferCount}\n`;
        }
        if (stats.offerCountFBA !== undefined && stats.offerCountFBA >= 0) {
          result += `   • Ofertas FBA: ${stats.offerCountFBA}\n`;
        }
        if (stats.offerCountFBM !== undefined && stats.offerCountFBM >= 0) {
          result += `   • Ofertas FBM: ${stats.offerCountFBM}\n`;
        }
        if (stats.buyBoxIsAmazon) {
          result += `   • Amazon vende: Sí\n`;
        }
        // Seller IDs del FBA/FBM más barato
        if (stats.sellerIdsLowestFBA && stats.sellerIdsLowestFBA.length > 0) {
          result += `   • Vendedor FBA más barato: ${stats.sellerIdsLowestFBA[0]}\n`;
        }
        result += `\n`;

        // ── OUT OF STOCK % ──
        const oosAmazon90 = stats.outOfStockPercentage90?.[0]; // AMAZON = index 0
        if (oosAmazon90 !== undefined && oosAmazon90 >= 0) {
          result += `📉 **OUT OF STOCK:**\n`;
          result += `   • Amazon OOS 90d: ${oosAmazon90}%\n`;
          const oosNew90 = stats.outOfStockPercentage90?.[1]; // NEW = index 1
          if (oosNew90 !== undefined && oosNew90 >= 0) {
            result += `   • Marketplace OOS 90d: ${oosNew90}%\n`;
          }
          result += `\n`;
        }

        // ── DEALS ACTIVOS ──
        const deals = (product as any).deals;
        if (deals && Array.isArray(deals) && deals.length > 0) {
          result += `🔥 **DEALS ACTIVOS:**\n`;
          for (const deal of deals) {
            result += `   • ${deal.badge || deal.dealType}`;
            if (deal.percentClaimed > 0) result += ` (${deal.percentClaimed}% reclamado)`;
            if (deal.accessType === 'PRIME_EXCLUSIVE') result += ` [Prime]`;
            result += `\n`;
          }
          result += `\n`;
        }

        // ── BB STATS (quién gana el BB y con qué %) ──
        if (stats.buyBoxStats && typeof stats.buyBoxStats === 'object') {
          const bbEntries = Object.entries(stats.buyBoxStats) as [string, any][];
          if (bbEntries.length > 0) {
            result += `🏆 **BB SHARE (90d):**\n`;
            // Ordenar por % ganado
            bbEntries.sort((a, b) => (b[1]?.percentageWon || 0) - (a[1]?.percentageWon || 0));
            for (const [sellerId, data] of bbEntries.slice(0, 5)) {
              const name = sellerId === 'ATVPDKIKX0DER' ? 'Amazon' : sellerId;
              const pct = data?.percentageWon?.toFixed(1) || '?';
              const isFBA = data?.isFBA ? ' (FBA)' : ' (FBM)';
              result += `   • ${name}${isFBA}: ${pct}%\n`;
            }
            result += `\n`;
          }
        }

        // ── COSTES AMAZON (si disponibles) ──
        const fbaFees = (product as any).fbaFees;
        const referralFee = (product as any).referralFeePercentage;
        const competitivePrice = (product as any).competitivePriceThreshold;
        if (fbaFees || referralFee || competitivePrice) {
          result += `💶 **COSTES AMAZON:**\n`;
          if (referralFee) {
            result += `   • Comisión referral: ${referralFee}%\n`;
          }
          if (fbaFees?.pickAndPackFee) {
            result += `   • Tarifa FBA: ${this.client.formatPrice(fbaFees.pickAndPackFee, domain)}\n`;
          }
          if (competitivePrice && competitivePrice > 0) {
            result += `   • Precio competitivo (máx para BB): ${this.client.formatPrice(competitivePrice, domain)}\n`;
          }
          const suggestedLower = (product as any).suggestedLowerPrice;
          if (suggestedLower && suggestedLower > 0) {
            result += `   • Precio sugerido Amazon: ${this.client.formatPrice(suggestedLower, domain)}\n`;
          }
          result += `\n`;
        }

        // ── INFO ADICIONAL ──
        const additionalInfo: string[] = [];
        if ((product as any).isAdultProduct) additionalInfo.push('🔞 Producto adulto');
        if (stats.isAddonItem) additionalInfo.push('📎 Add-on Item');
        if ((product as any).isEligibleForSuperSaverShipping) additionalInfo.push('🚚 Envío gratis elegible');
        if ((product as any).isEligibleForTradeIn) additionalInfo.push('♻️ Trade-in elegible');
        const returnRate = (product as any).returnRate;
        if (returnRate === 1) additionalInfo.push('✅ Tasa devolución baja');
        else if (returnRate === 2) additionalInfo.push('⚠️ Tasa devolución alta');
        if ((product as any).newPriceIsMAP) additionalInfo.push('🔒 Precio MAP');

        if (additionalInfo.length > 0) {
          result += `ℹ️ **INFO ADICIONAL:** ${additionalInfo.join(' | ')}\n\n`;
        }

      } else {
        result += `⚠️ No hay datos estadísticos disponibles para este producto.\n`;
      }

      return result;
    } catch (error) {
      return `Error looking up product: ${error instanceof Error ? error.message : String(error)}`;
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
      const queryOptions: any = {
        days: params.days,
        history: 1,           // IMPORTANTE: 1 no true (Keepa requiere 0/1)
        stats: 90,            // FREE: min/max/avg para el resumen
      };

      // Solo añadir offers si se pide BB history (coste extra 6-12 tokens)
      if (params.includeOffers) {
        queryOptions.offers = 20;
        queryOptions['only-live-offers'] = 1;
      }

      const product = await this.client.getProductByAsin(
        params.asin,
        params.domain as KeepaDomain,
        queryOptions
      );

      if (!product) {
        return `Producto no encontrado: ${params.asin}`;
      }

      if (!product.csv) {
        return `No hay historial de precios para ASIN: ${params.asin}`;
      }

      const domain = params.domain as KeepaDomain;
      const stats = product.stats as any;

      // ── Header compacto (siempre) ──
      const titleShort = product.title
        ? (product.title.length > 60 ? product.title.substring(0, 57) + '...' : product.title)
        : 'N/A';
      const currentPrice = stats?.buyBoxPrice > 0
        ? stats.buyBoxPrice
        : stats?.current?.[0] > 0
          ? stats.current[0]
          : null;
      const bbPrice = currentPrice
        ? this.client.formatPrice(currentPrice, domain)
        : 'N/A';

      let result = `📦 **${params.asin}** — ${titleShort} | 🏷️ BB: ${bbPrice}\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      result += `📅 **Periodo**: Últimos ${params.days} días\n\n`;

      // ── Tipos de datos a mostrar ──
      const csvTypeConfig: Array<{
        index: number;
        name: string;
        emoji: string;
        isPrice: boolean;
        requiresOffers: boolean;
      }> = [
        { index: 0, name: 'Amazon', emoji: '🟠', isPrice: true, requiresOffers: false },
        { index: 1, name: 'Marketplace (Nuevo)', emoji: '🟢', isPrice: true, requiresOffers: false },
        { index: 2, name: 'Usado', emoji: '🔵', isPrice: true, requiresOffers: false },
        { index: 3, name: 'Sales Rank', emoji: '📊', isPrice: false, requiresOffers: false },
        { index: 18, name: 'Buy Box (con envío)', emoji: '🏆', isPrice: true, requiresOffers: true },
      ];

      // Si el usuario pidió un tipo específico, solo mostrar ese
      const typesToShow = params.dataType !== undefined
        ? csvTypeConfig.filter(t => t.index === params.dataType)
        : csvTypeConfig.filter(t => !t.requiresOffers || params.includeOffers);

      let anyDataShown = false;

      for (const csvType of typesToShow) {
        const rawData = this.client.parseCSVData(product.csv, csvType.index);

        // Filtrar valores -1 (sin stock/oferta) para precios
        const data = csvType.isPrice
          ? rawData.filter(d => d.value > 0)
          : rawData.filter(d => d.value >= 0);

        if (data.length === 0) continue;
        anyDataShown = true;

        result += `${csvType.emoji} **${csvType.name}:**\n`;

        // ── Estadísticas del periodo (desde stats object, FREE) ──
        if (stats) {
          const avg90 = stats.avg90?.[csvType.index];
          const minRaw = stats.minInInterval?.[csvType.index];
          const maxRaw = stats.maxInInterval?.[csvType.index];
          const minVal = Array.isArray(minRaw) ? minRaw[1] : minRaw;
          const maxVal = Array.isArray(maxRaw) ? maxRaw[1] : maxRaw;
          const minTime = Array.isArray(minRaw) ? minRaw[0] : null;
          const maxTime = Array.isArray(maxRaw) ? maxRaw[0] : null;

          if (csvType.isPrice) {
            const parts: string[] = [];
            if (avg90 && avg90 > 0) parts.push(`Media: ${this.client.formatPrice(avg90, domain)}`);
            if (minVal && minVal > 0) {
              let minStr = `Mín: ${this.client.formatPrice(minVal, domain)}`;
              if (minTime) minStr += ` (${this.formatKeepaDate(minTime)})`;
              parts.push(minStr);
            }
            if (maxVal && maxVal > 0) {
              let maxStr = `Máx: ${this.client.formatPrice(maxVal, domain)}`;
              if (maxTime) maxStr += ` (${this.formatKeepaDate(maxTime)})`;
              parts.push(maxStr);
            }
            if (parts.length > 0) {
              result += `   📐 ${parts.join(' | ')}\n`;
            }
          } else if (csvType.index === 3) {
            // Sales Rank stats
            const parts: string[] = [];
            if (avg90 && avg90 > 0) parts.push(`Media: #${avg90.toLocaleString()}`);
            if (minVal && minVal > 0) parts.push(`Mejor: #${minVal.toLocaleString()}`);
            if (maxVal && maxVal > 0) parts.push(`Peor: #${maxVal.toLocaleString()}`);
            if (parts.length > 0) {
              result += `   📐 ${parts.join(' | ')}\n`;
            }
          }
        }

        // ── Tendencia ──
        if (data.length >= 2) {
          const first = data[0].value;
          const last = data[data.length - 1].value;
          if (first > 0 && last > 0) {
            const change = ((last - first) / first) * 100;
            let trend = '→ Estable';
            if (change > 3) trend = `📈 Subida +${change.toFixed(1)}%`;
            else if (change < -3) trend = `📉 Bajada ${change.toFixed(1)}%`;
            result += `   🔄 Tendencia: ${trend} (${this.formatValue(first, csvType.isPrice, domain)} → ${this.formatValue(last, csvType.isPrice, domain)})\n`;
          }
        }

        // ── Historial de puntos ──
        if (data.length <= 15) {
          // Pocos puntos → mostrar todos
          result += `   📋 Historial (${data.length} cambios):\n`;
          for (const point of data) {
            const date = new Date(point.timestamp).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short', year: 'numeric'
            });
            result += `      ${date}: ${this.formatValue(point.value, csvType.isPrice, domain)}\n`;
          }
        } else {
          // Muchos puntos → resumen mensual + últimos 5 cambios recientes
          result += `   📋 Resumen mensual (${data.length} cambios totales):\n`;
          const monthly = this.aggregateMonthly(data, csvType.isPrice, domain);
          for (const month of monthly) {
            result += `      ${month}\n`;
          }
          result += `   📋 Últimos cambios:\n`;
          const recent = data.slice(-5);
          for (const point of recent) {
            const date = new Date(point.timestamp).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short', year: 'numeric'
            });
            result += `      ${date}: ${this.formatValue(point.value, csvType.isPrice, domain)}\n`;
          }
        }

        result += `\n`;
      }

      if (!anyDataShown) {
        result += `⚠️ No hay datos de historial disponibles para el periodo solicitado.\n`;
      }

      // ── OOS % (contexto útil para el historial) ──
      if (stats) {
        const oosAmazon = stats.outOfStockPercentage90?.[0];
        const oosNew = stats.outOfStockPercentage90?.[1];
        if ((oosAmazon !== undefined && oosAmazon > 0) || (oosNew !== undefined && oosNew > 0)) {
          result += `📉 **OUT OF STOCK (90d):**`;
          if (oosAmazon > 0) result += ` Amazon: ${oosAmazon}%`;
          if (oosNew > 0) result += ` | Marketplace: ${oosNew}%`;
          result += `\n`;
        }
      }

      return result;
    } catch (error) {
      return `Error obteniendo historial: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // ── Helpers para getPriceHistory ──

  private formatKeepaDate(keepaTime: number): string {
    const unixMs = (keepaTime + 21564000) * 60000;
    return new Date(unixMs).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short'
    });
  }

  private formatValue(value: number, isPrice: boolean, domain: KeepaDomain): string {
    if (isPrice) {
      return this.client.formatPrice(value, domain);
    }
    return `#${value.toLocaleString()}`;
  }

  private aggregateMonthly(
    data: Array<{ timestamp: number; value: number }>,
    isPrice: boolean,
    domain: KeepaDomain
  ): string[] {
    const months: Record<string, number[]> = {};

    for (const point of data) {
      const d = new Date(point.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = [];
      months[key].push(point.value);
    }

    const result: string[] = [];
    for (const [key, values] of Object.entries(months).sort()) {
      const [year, month] = key.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthName = monthNames[parseInt(month) - 1];
      const positiveValues = values.filter(v => v > 0);

      if (positiveValues.length === 0) {
        result.push(`${monthName} ${year}: Sin datos`);
        continue;
      }

      const min = Math.min(...positiveValues);
      const max = Math.max(...positiveValues);
      const avg = Math.round(positiveValues.reduce((s, v) => s + v, 0) / positiveValues.length);

      if (isPrice) {
        if (min === max) {
          result.push(`${monthName} ${year}: ${this.client.formatPrice(avg, domain)} (${positiveValues.length} cambios)`);
        } else {
          result.push(`${monthName} ${year}: ${this.client.formatPrice(min, domain)} — ${this.client.formatPrice(max, domain)} (media: ${this.client.formatPrice(avg, domain)}, ${positiveValues.length} cambios)`);
        }
      } else {
        if (min === max) {
          result.push(`${monthName} ${year}: #${avg.toLocaleString()} (${positiveValues.length} cambios)`);
        } else {
          result.push(`${monthName} ${year}: #${min.toLocaleString()} — #${max.toLocaleString()} (${positiveValues.length} cambios)`);
        }
      }
    }

    return result;
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
