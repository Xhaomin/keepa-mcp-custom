#!/usr/bin/env node

/**
 * Keepa MCP Server — HTTP + stdio dual-mode
 * 
 * MODE 1 (HTTP): When PORT env var is set, starts an HTTP server
 *   that accepts POST /tool with {tool, input, metadata} body.
 *   This is the mode used by Easypanel + Supabase Edge Functions.
 * 
 * MODE 2 (stdio): When no PORT is set, falls back to classic
 *   MCP stdio transport for Claude Desktop compatibility.
 * 
 * The HTTP mode reuses all existing KeepaTools logic unchanged.
 */

import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { KeepaClient } from './keepa-client.js';
import {
  KeepaTools,
  ProductLookupSchema,
  BatchProductLookupSchema,
  DealSearchSchema,
  SellerLookupSchema,
  BestSellersSchema,
  PriceHistorySchema,
  ProductFinderSchema,
  CategoryAnalysisSchema,
  SalesVelocitySchema,
  InventoryAnalysisSchema,
  TokenStatusSchema,
} from './tools.js';

// ─── Shared tool definitions ────────────────────────────────────────────
// Used by both HTTP and stdio modes

const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'keepa_product_lookup',
    description: 'Look up detailed information for a single Amazon product by ASIN',
    inputSchema: {
      type: 'object',
      properties: {
        asin: { type: 'string', description: 'Amazon ASIN (product identifier)' },
        code: { type: 'string', description: 'Product code (EAN, UPC, ISBN-13) - alternative to ASIN' },
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, 4=FR, 5=JP, 6=CA, 8=IT, 9=ES, 10=IN, 11=MX)' },
        days: { type: 'number', minimum: 1, maximum: 365, description: 'Number of days of price history to include' },
        history: { type: 'boolean', default: false, description: 'Include full price history' },
        offers: { type: 'number', minimum: 0, maximum: 100, description: 'Number of marketplace offers to include' },
        variations: { type: 'boolean', default: false, description: 'Include product variations' },
        rating: { type: 'boolean', default: false, description: 'Include product rating data' },
      },
      required: [],
    },
  },
  {
    name: 'keepa_batch_product_lookup',
    description: 'Look up information for multiple Amazon products by ASIN (up to 100)',
    inputSchema: {
      type: 'object',
      properties: {
        asins: { type: 'array', items: { type: 'string' }, maxItems: 100, description: 'Array of Amazon ASINs (max 100)' },
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        days: { type: 'number', minimum: 1, maximum: 365, description: 'Number of days of price history to include' },
        history: { type: 'boolean', default: false, description: 'Include full price history' },
      },
      required: ['asins'],
    },
  },
  {
    name: 'keepa_search_deals',
    description: 'Search for current Amazon deals with filtering options',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        categoryId: { type: 'number', description: 'Amazon category ID to filter by' },
        minPrice: { type: 'number', minimum: 0, description: 'Minimum price in cents' },
        maxPrice: { type: 'number', minimum: 0, description: 'Maximum price in cents' },
        minDiscount: { type: 'number', minimum: 0, maximum: 100, description: 'Minimum discount percentage' },
        minRating: { type: 'number', minimum: 1, maximum: 5, description: 'Minimum product rating (1-5 stars)' },
        isPrime: { type: 'boolean', description: 'Filter for Prime eligible deals only' },
        sortType: { type: 'number', minimum: 0, maximum: 4, default: 0, description: 'Sort (0=deal score, 1=price, 2=discount, 3=rating, 4=reviews)' },
        page: { type: 'number', minimum: 0, default: 0, description: 'Page number for pagination' },
        perPage: { type: 'number', minimum: 1, maximum: 50, default: 25, description: 'Results per page (max 50)' },
      },
      required: [],
    },
  },
  {
    name: 'keepa_seller_lookup',
    description: 'Look up seller information and performance metrics',
    inputSchema: {
      type: 'object',
      properties: {
        seller: { type: 'string', description: 'Seller ID or name' },
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        storefront: { type: 'number', minimum: 0, maximum: 100000, description: 'Number of storefront ASINs to retrieve' },
      },
      required: ['seller'],
    },
  },
  {
    name: 'keepa_best_sellers',
    description: 'Get best seller rankings for an Amazon category',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        category: { type: 'number', description: 'Amazon category ID' },
        page: { type: 'number', minimum: 0, default: 0, description: 'Page number (each page = 100 products)' },
      },
      required: ['category'],
    },
  },
  {
    name: 'keepa_price_history',
    description: 'Get detailed price history for an Amazon product',
    inputSchema: {
      type: 'object',
      properties: {
        asin: { type: 'string', description: 'Amazon ASIN' },
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        dataType: { type: 'number', minimum: 0, maximum: 30, description: 'Data type (0=Amazon, 1=New, 2=Used, 3=Sales Rank, etc.)' },
        days: { type: 'number', minimum: 1, maximum: 365, default: 30, description: 'Number of days of history' },
      },
      required: ['asin', 'dataType'],
    },
  },
  {
    name: 'keepa_product_finder',
    description: 'Advanced product finder with filtering similar to Keepa Product Finder - find products by rating, price, sales, competition level',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        categoryId: { type: 'number', description: 'Amazon category ID to search within' },
        minPrice: { type: 'number', minimum: 0, description: 'Minimum current price in cents' },
        maxPrice: { type: 'number', minimum: 0, description: 'Maximum current price in cents' },
        minRating: { type: 'number', minimum: 0, maximum: 50, description: 'Minimum rating (0-50, multiply stars by 10)' },
        maxRating: { type: 'number', minimum: 0, maximum: 50, description: 'Maximum rating (0-50, multiply stars by 10)' },
        minReviewCount: { type: 'number', minimum: 0, description: 'Minimum number of reviews' },
        hasReviews: { type: 'boolean', description: 'Must have at least 1 review' },
        isPrime: { type: 'boolean', description: 'Filter for Prime eligible only' },
        minSalesRank: { type: 'number', description: 'Minimum sales rank (lower = better selling)' },
        maxSalesRank: { type: 'number', description: 'Maximum sales rank' },
        sortBy: { type: 'string', description: 'Sort field (monthlySold, current_SALES, etc.)' },
        sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Sort order' },
        page: { type: 'number', minimum: 0, default: 0, description: 'Page number' },
        perPage: { type: 'number', minimum: 1, maximum: 50, default: 25, description: 'Results per page' },
      },
      required: [],
    },
  },
  {
    name: 'keepa_category_analysis',
    description: 'Comprehensive market intelligence for an Amazon category with opportunity scoring',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        categoryId: { type: 'number', description: 'Amazon category ID to analyze' },
        sampleSize: { type: 'number', minimum: 10, maximum: 100, default: 50, description: 'Number of products to analyze' },
      },
      required: ['categoryId'],
    },
  },
  {
    name: 'keepa_sales_velocity',
    description: 'Analyze sales velocity and inventory turnover for products or categories',
    inputSchema: {
      type: 'object',
      properties: {
        asin: { type: 'string', description: 'Single ASIN to analyze' },
        asins: { type: 'array', items: { type: 'string' }, maxItems: 100, description: 'Multiple ASINs to analyze' },
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        categoryId: { type: 'number', description: 'Amazon category ID to analyze' },
        minVelocity: { type: 'number', description: 'Minimum daily sales velocity filter' },
        timeframe: { type: 'string', enum: ['week', 'month', 'quarter'], default: 'month', description: 'Analysis timeframe' },
      },
      required: [],
    },
  },
  {
    name: 'keepa_inventory_analysis',
    description: 'Portfolio inventory management with stockout risk assessment',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
        categoryId: { type: 'number', description: 'Amazon category ID to analyze' },
        asins: { type: 'array', items: { type: 'string' }, maxItems: 100, description: 'Specific ASINs to analyze (your current inventory)' },
        analysisType: { type: 'string', enum: ['overview', 'fast_movers', 'slow_movers', 'stockout_risks', 'seasonal'], default: 'overview', description: 'Type of inventory analysis' },
        timeframe: { type: 'string', enum: ['week', 'month', 'quarter'], default: 'month', description: 'Analysis timeframe' },
        targetTurnoverRate: { type: 'number', minimum: 1, maximum: 50, default: 12, description: 'Target inventory turns per year' },
      },
      required: [],
    },
  },
  {
    name: 'keepa_token_status',
    description: 'Check remaining Keepa API tokens and account status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// ─── Shared tool executor ───────────────────────────────────────────────

function initKeepa(): { client: KeepaClient; tools: KeepaTools } {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) {
    throw new Error('KEEPA_API_KEY environment variable is required.');
  }
  const client = new KeepaClient({
    apiKey,
    rateLimitDelay: parseInt(process.env.KEEPA_RATE_LIMIT_DELAY || '1000'),
    timeout: parseInt(process.env.KEEPA_TIMEOUT || '30000'),
  });
  return { client, tools: new KeepaTools(client) };
}

async function executeTool(
  keepaTools: KeepaTools,
  toolName: string,
  input: Record<string, any>,
): Promise<string> {
  switch (toolName) {
    case 'keepa_product_lookup':
      return keepaTools.lookupProduct(ProductLookupSchema.parse(input));
    case 'keepa_batch_product_lookup':
      return keepaTools.batchLookupProducts(BatchProductLookupSchema.parse(input));
    case 'keepa_search_deals':
      return keepaTools.searchDeals(DealSearchSchema.parse(input));
    case 'keepa_seller_lookup':
      return keepaTools.lookupSeller(SellerLookupSchema.parse(input));
    case 'keepa_best_sellers':
      return keepaTools.getBestSellers(BestSellersSchema.parse(input));
    case 'keepa_price_history':
      return keepaTools.getPriceHistory(PriceHistorySchema.parse(input));
    case 'keepa_product_finder':
      return keepaTools.findProducts(ProductFinderSchema.parse(input));
    case 'keepa_category_analysis':
      return keepaTools.analyzeCategory(CategoryAnalysisSchema.parse(input));
    case 'keepa_sales_velocity':
      return keepaTools.analyzeSalesVelocity(SalesVelocitySchema.parse(input));
    case 'keepa_inventory_analysis':
      return keepaTools.analyzeInventory(InventoryAnalysisSchema.parse(input));
    case 'keepa_token_status':
      return keepaTools.getTokenStatus(TokenStatusSchema.parse(input));
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MODE 1: HTTP SERVER (for Easypanel / Edge Functions)
// ═══════════════════════════════════════════════════════════════════════

function startHttpServer(port: number): void {
  const { tools: keepaTools } = initKeepa();
  const authSecret = process.env.MCP_AUTH_SECRET || '';

  function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  }

  function sendJson(res: ServerResponse, status: number, body: unknown): void {
    const json = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json),
    });
    res.end(json);
  }

  const server = createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      });
      res.end();
      return;
    }

    // Add CORS headers to all responses
    res.setHeader('Access-Control-Allow-Origin', '*');

    // ── Health check ──
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
      sendJson(res, 200, {
        status: 'ok',
        service: 'keepa-mcp-server',
        version: '2.0.0',
        mode: 'http',
        tools: TOOL_DEFINITIONS.map(t => t.name),
      });
      return;
    }

    // ── List tools ──
    if (req.method === 'GET' && req.url === '/tools') {
      sendJson(res, 200, { tools: TOOL_DEFINITIONS });
      return;
    }

    // ── Execute tool ──
    if (req.method === 'POST' && (req.url === '/tool' || req.url === '/mcp')) {
      // Auth check
      if (authSecret) {
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (token !== authSecret) {
          sendJson(res, 401, { error: 'Unauthorized', code: 'AUTH_FAILED' });
          return;
        }
      }

      try {
        const body = await readBody(req);
        const payload = JSON.parse(body);

        // Accept the Edge Function contract: {tool, input, metadata}
        const toolName = payload.tool || payload.name;
        const input = payload.input || payload.arguments || {};

        if (!toolName) {
          sendJson(res, 400, { error: 'Missing "tool" field', code: 'MISSING_TOOL' });
          return;
        }

        const startTime = Date.now();
        const result = await executeTool(keepaTools, toolName, input);
        const durationMs = Date.now() - startTime;

        console.log(
          `[MCP-HTTP] tool=${toolName} duration=${durationMs}ms size=${Buffer.byteLength(result)}b`
        );

        sendJson(res, 200, {
          result,
          tool: toolName,
          duration_ms: durationMs,
        });
      } catch (err: any) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[MCP-HTTP] Error: ${message}`);
        sendJson(res, 500, { error: message, code: 'TOOL_ERROR' });
      }
      return;
    }

    // ── 404 ──
    sendJson(res, 404, { error: 'Not found. Use POST /tool or GET /health' });
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[MCP-HTTP] Keepa MCP server listening on port ${port}`);
    console.log(`[MCP-HTTP] Endpoints:`);
    console.log(`  GET  /health  — Health check`);
    console.log(`  GET  /tools   — List available tools`);
    console.log(`  POST /tool    — Execute a tool {tool, input, metadata}`);
    console.log(`  POST /mcp     — Alias for /tool (backward compat)`);
    console.log(`[MCP-HTTP] Auth: ${authSecret ? 'ENABLED (MCP_AUTH_SECRET set)' : 'DISABLED (no MCP_AUTH_SECRET)'}`);
    console.log(`[MCP-HTTP] Tools available: ${TOOL_DEFINITIONS.length}`);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// MODE 2: STDIO MCP (for Claude Desktop)
// ═══════════════════════════════════════════════════════════════════════

class KeepaStdioServer {
  private server: Server;
  private keepaClient?: KeepaClient;
  private keepaTools?: KeepaTools;

  constructor() {
    this.server = new Server(
      { name: 'keepa-mcp-server', version: '2.0.0' },
      { capabilities: { tools: {} } },
    );
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private ensureInitialized(): void {
    if (!this.keepaClient || !this.keepaTools) {
      const { client, tools } = initKeepa();
      this.keepaClient = client;
      this.keepaTools = tools;
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: TOOL_DEFINITIONS };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        this.ensureInitialized();
        const result = await executeTool(this.keepaTools!, name, args || {});
        return { content: [{ type: 'text', text: result }] };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error: ${errorMessage}` }], isError: true };
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP-Stdio Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP-Stdio] Keepa MCP server running on stdio');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ENTRYPOINT — auto-detect mode based on PORT env var
// ═══════════════════════════════════════════════════════════════════════

const port = parseInt(process.env.PORT || '');

if (port > 0) {
  // Easypanel / Docker / production → HTTP mode
  startHttpServer(port);
} else {
  // Claude Desktop → stdio mode
  const server = new KeepaStdioServer();
  server.run().catch((error) => {
    console.error('Failed to start stdio server:', error);
    process.exit(1);
  });
}
