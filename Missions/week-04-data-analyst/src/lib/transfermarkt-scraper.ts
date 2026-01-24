/**
 * Transfermarkt Scraper - Production Ready
 * 
 * Scrapes Transfermarkt website for latest transfer data
 * Adapted from scripts/transfermarkt-scrape.ts for production use
 * 
 * @version 1.0
 * @since 2026-01-24
 */

import { load, type CheerioAPI } from 'cheerio';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = "https://www.transfermarkt.com/transfers/neuestetransfers/statistik/plus/plus/1/galerie/0/wettbewerb_id/alle/verein_land_id//selectedOptionInternalType/nothingSelected/land_id//minMarktwert/500.000/maxMarktwert/500.000.000/minAbloese/0/maxAbloese/500.000.000/yt0/Show";
const TOP10_SUFFIX = "/top10/Top%2010%20leagues";
const MAX_PAGE = 10;
const DEFAULT_PAGE_COUNT = 3;

interface TransfermarktConfig {
  useTop10: boolean;
  startPage: number;
  pageCount: number;
  endPage: number;
}

interface TransfermarktRow {
  page: number;
  player: string;
  position: string;
  age: string;
  nationality: string;
  clubDeparted: string;
  clubDepartedCountry: string;
  clubDepartedCompetition: string;
  clubJoined: string;
  clubJoinedCountry: string;
  clubJoinedCompetition: string;
  transferDate: string;
  marketValue: string;
  fee: string;
}

// ============================================================================
// MAIN SCRAPING FUNCTION
// ============================================================================

export async function scrapeTransfermarktTransfers(config?: Partial<TransfermarktConfig>): Promise<{
  success: boolean;
  transfers: TransfermarktRow[];
  error?: string;
  pagesScraped: number;
  totalFound: number;
}> {
  try {
    const finalConfig: TransfermarktConfig = {
      useTop10: true, // Default to Top 10 for production
      startPage: 1,
      pageCount: DEFAULT_PAGE_COUNT,
      endPage: 3,
      ...config
    };

    // Calculate end page
    finalConfig.endPage = Math.min(
      finalConfig.startPage + finalConfig.pageCount - 1,
      MAX_PAGE
    );

    console.log(`🕷️ Scraping Transfermarkt pages ${finalConfig.startPage}-${finalConfig.endPage}...`);
    if (finalConfig.useTop10) {
      console.log("→ Applying Top 10 leagues filter");
    }

    const transfers: TransfermarktRow[] = [];

    // Scrape each page
    for (let page = finalConfig.startPage; page <= finalConfig.endPage; page++) {
      const url = buildUrl(page, finalConfig.useTop10);
      console.log(`→ Fetching page ${page}: ${url}`);
      
      const html = await fetchHtml(url);
      const pageTransfers = parseTable(html, page);
      
      console.log(`  Found ${pageTransfers.length} transfers on page ${page}`);
      transfers.push(...pageTransfers);

      // Be polite with rate limiting
      if (page < finalConfig.endPage) {
        await sleep(500);
      }
    }

    if (transfers.length === 0) {
      console.warn("⚠️ No transfers found. This might indicate a scraping issue.");
      return {
        success: true,
        transfers: [],
        pagesScraped: finalConfig.endPage - finalConfig.startPage + 1,
        totalFound: 0
      };
    }

    console.log(`✅ Successfully scraped ${transfers.length} transfers from ${finalConfig.endPage - finalConfig.startPage + 1} pages`);
    
    return {
      success: true,
      transfers,
      pagesScraped: finalConfig.endPage - finalConfig.startPage + 1,
      totalFound: transfers.length
    };

  } catch (error) {
    console.error('❌ Transfermarkt scraping failed:', error);
    return {
      success: false,
      transfers: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      pagesScraped: 0,
      totalFound: 0
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildUrl(page: number, useTop10: boolean): string {
  const base = useTop10 ? `${BASE_URL}${TOP10_SUFFIX}` : BASE_URL;
  return page === 1 ? base : `${base}/page/${page}`;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.5",
      "accept-encoding": "gzip, deflate, br",
      "dnt": "1",
      "connection": "keep-alive",
      "upgrade-insecure-requests": "1",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
  }

  return response.text();
}

function parseTable(html: string, page: number): TransfermarktRow[] {
  const $ = load(html);
  const transfers: TransfermarktRow[] = [];

  $("table.items tbody tr").each((_, row) => {
    const cells = $(row).children("td");
    if (cells.length < 8) return;

    const playerCell = cells.eq(0);
    const ageCell = cells.eq(1);
    const nationalityCell = cells.eq(2);
    const fromCell = cells.eq(3);
    const toCell = cells.eq(4);
    const dateCell = cells.eq(5);
    const marketValueCell = cells.eq(6);
    const feeCell = cells.eq(7);

    const { player, position } = extractPlayerInfo($, playerCell);
    if (!player) return;

    const fromClub = extractClubInfo($, fromCell);
    const toClub = extractClubInfo($, toCell);

    transfers.push({
      page,
      player,
      position,
      age: cleanText(ageCell.text()),
      nationality: extractNationalities($, nationalityCell),
      clubDeparted: fromClub.name,
      clubDepartedCountry: fromClub.country,
      clubDepartedCompetition: fromClub.competition,
      clubJoined: toClub.name,
      clubJoinedCountry: toClub.country,
      clubJoinedCompetition: toClub.competition,
      transferDate: cleanText(dateCell.text()),
      marketValue: cleanText(marketValueCell.text()),
      fee: extractFee($, feeCell),
    });
  });

  return transfers;
}

function extractPlayerInfo($: CheerioAPI, cell: any): { player: string; position: string } {
  const name = cleanText($(cell).find("a").first().text());
  const position = cleanText($(cell).find("tr").last().text());
  return { player: name, position };
}

function extractNationalities($: CheerioAPI, cell: any): string {
  return $(cell)
    .find("img")
    .map((_: number, img: any) => $(img).attr("title") ?? $(img).attr("alt") ?? "")
    .get()
    .map(cleanText)
    .filter(Boolean)
    .join(", ");
}

function extractClubInfo($: CheerioAPI, cell: any): { name: string; competition: string; country: string } {
  const name = $(cell)
    .find("a")
    .filter((_: number, anchor: any) => cleanText($(anchor).text()).length > 0)
    .first()
    .text();

  const infoRow = $(cell).find("tr").last();
  const competition = cleanText($(infoRow).find("a").last().text());
  const country = cleanText($(infoRow).find("img").first().attr("title") ?? "");

  return {
    name: cleanText(name),
    competition,
    country,
  };
}

function extractFee($: CheerioAPI, cell: any): string {
  const directText = cleanText($(cell).text());
  if (directText) return directText;
  return cleanText($(cell).find("a").text());
}

function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// TYPES EXPORT
// ============================================================================

export type { TransfermarktRow, TransfermarktConfig };
