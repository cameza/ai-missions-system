import fs from "node:fs/promises";
import path from "node:path";
import { load, type Cheerio, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";

const BASE_URL =
  "https://www.transfermarkt.com/transfers/neuestetransfers/statistik/plus/plus/1/galerie/0/wettbewerb_id/alle/verein_land_id//selectedOptionInternalType/nothingSelected/land_id//minMarktwert/500.000/maxMarktwert/500.000.000/minAbloese/0/maxAbloese/500.000.000/yt0/Show";
const MAX_PAGE = 10;
const DEFAULT_PAGE_COUNT = 3;
const TOP10_SUFFIX = "/top10/Top%2010%20leagues";

const useTop10 = (process.env.TRANSFERMARKT_TOP10 ?? "false").toLowerCase() === "true";

const startPage = clamp(
  parseInt(process.env.TRANSFERMARKT_START_PAGE ?? "1", 10) || 1,
  1,
  MAX_PAGE,
);
const pageCount = clamp(
  parseInt(process.env.TRANSFERMARKT_PAGE_COUNT ?? `${DEFAULT_PAGE_COUNT}`, 10) ||
    DEFAULT_PAGE_COUNT,
  1,
  MAX_PAGE,
);
const endPage = clamp(startPage + pageCount - 1, startPage, MAX_PAGE);

interface TransferRow {
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

async function main() {
  console.log(
    `Scraping Transfermarkt latest transfers pages ${startPage}-${endPage}...`,
  );
  if (useTop10) {
    console.log("→ Applying Top 10 leagues filter");
  }

  const rows: TransferRow[] = [];

  for (let page = startPage; page <= endPage; page += 1) {
    const url = buildUrl(page);
    console.log(`→ Fetching page ${page}: ${url}`);
    const html = await fetchHtml(url);
    const pageRows = parseTable(html, page);
    console.log(`  Found ${pageRows.length} rows on page ${page}`);
    rows.push(...pageRows);

    // Be polite with a short pause to avoid hammering the site.
    await sleep(500);
  }

  if (rows.length === 0) {
    console.warn("No rows were parsed. Exiting without writing CSV.");
    return;
  }

  const outputDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(
    outputDir,
    `latest-transfers-pages-${startPage}-to-${endPage}.csv`,
  );
  await writeCsv(rows, outputPath);
  console.log(
    `✅ Wrote ${rows.length} rows to ${outputPath}. Inspect to validate before extending to all pages.`,
  );
}

function buildUrl(page: number) {
  const base = useTop10 ? `${BASE_URL}${TOP10_SUFFIX}` : BASE_URL;
  return page === 1 ? base : `${base}/page/${page}`;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseTable(html: string, page: number): TransferRow[] {
  const $ = load(html);
  const rows: TransferRow[] = [];

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

    rows.push({
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

  return rows;
}

function extractPlayerInfo($: CheerioAPI, cell: Cheerio<Element>) {
  const name = cleanText(cell.find("a").first().text());
  const position = cleanText(cell.find("tr").last().text());
  return { player: name, position };
}

function extractNationalities($: CheerioAPI, cell: Cheerio<Element>) {
  return cell
    .find("img")
    .map((_: number, img: Element) => $(img).attr("title") ?? $(img).attr("alt") ?? "")
    .get()
    .map(cleanText)
    .filter(Boolean)
    .join(", ");
}

function extractClubInfo($: CheerioAPI, cell: Cheerio<Element>) {
  const name = cell
    .find("a")
    .filter((_: number, anchor: Element) => cleanText($(anchor).text()).length > 0)
    .first()
    .text();

  const infoRow = cell.find("tr").last();
  const competition = cleanText(infoRow.find("a").last().text());
  const country = cleanText(infoRow.find("img").first().attr("title") ?? "");

  return {
    name: cleanText(name),
    competition,
    country,
  };
}

function extractFee($: CheerioAPI, cell: Cheerio<Element>) {
  const directText = cleanText(cell.text());
  if (directText) return directText;
  return cleanText(cell.find("a").text());
}

async function writeCsv(rows: TransferRow[], outputPath: string) {
  const header = [
    "page",
    "player",
    "position",
    "age",
    "nationality",
    "club_departed",
    "club_departed_country",
    "club_departed_competition",
    "club_joined",
    "club_joined_country",
    "club_joined_competition",
    "transfer_date",
    "market_value",
    "fee",
  ];

  const lines = [header.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.page,
        row.player,
        row.position,
        row.age,
        row.nationality,
        row.clubDeparted,
        row.clubDepartedCountry,
        row.clubDepartedCompetition,
        row.clubJoined,
        row.clubJoinedCountry,
        row.clubJoinedCompetition,
        row.transferDate,
        row.marketValue,
        row.fee,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  await fs.writeFile(outputPath, lines.join("\n"), "utf8");
}

function csvEscape(value: string | number) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function cleanText(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error("Transfermarkt scrape failed:", error);
  process.exitCode = 1;
});
