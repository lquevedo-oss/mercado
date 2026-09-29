// The public edition is synthetic by default; a provider key is never bundled.
export const symbolPattern = /^[A-Z][A-Z0-9.\-]{0,11}$/;
const cache = new Map<string, { value: unknown; expires: number }>();
const running = new Map<string, Promise<any>>();
const symbols: Record<string, string> = { AAPL: 'Apple', MSFT: 'Microsoft', NVDA: 'NVIDIA', AMZN: 'Amazon', GOOGL: 'Alphabet', META: 'Meta Platforms', SPY: 'S&P 500 ETF', QQQ: 'Nasdaq 100 ETF', DIA: 'Dow Jones ETF', IWM: 'Russell 2000 ETF' };

function demo(path: string): any {
  const url = new URL(path, 'https://example.com/');
  const symbol = url.searchParams.get('symbol') || 'AAPL';
  const seed = [...symbol].reduce((total, char) => total + char.charCodeAt(0), 0);
  const close = 80 + seed % 200;
  const fixedDate = '2026-09-01';
  if (url.pathname === '/quote') return { c: close, pc: close - 2, d: 2, dp: 2 / (close - 2) * 100, h: close + 3, l: close - 4, o: close - 1, t: 1788264000, demo: true };
  if (url.pathname === '/stock/profile2') return { name: symbols[symbol] || symbol + ' Demo', ticker: symbol, country: 'US', currency: 'USD', exchange: 'DEMO', marketCapitalization: 250000, shareOutstanding: 1500, finnhubIndustry: 'Datos ficticios', weburl: 'https://example.com', logo: '' };
  if (url.pathname === '/stock/metric') return { metric: { peTTM: 24, pbAnnual: 6, epsTTM: 5.4, dividendYieldIndicatedAnnual: 0.8, beta: 1.2, '52WeekHigh': close + 30, '52WeekLow': close - 40, roeTTM: 18, revenueGrowthTTMYoy: 12, netProfitMarginTTM: 20, marketCapitalization: 250000 } };
  if (url.pathname === '/stock/earnings') return [0, 1, 2, 3].map(index => ({ period: `2026-${String(9 - index * 2).padStart(2, '0')}-01`, actual: 1.5 + index * 0.1, estimate: 1.4 + index * 0.1, surprise: 0.1, surprisePercent: 7 }));
  if (url.pathname === '/calendar/earnings') return { earningsCalendar: Object.keys(symbols).slice(0, 6).map((ticker, index) => ({ symbol: ticker, date: url.searchParams.get('from') || fixedDate, hour: 'amc', epsEstimate: 1.5 + index, revenueEstimate: 9000000000 + index * 1000000000, quarter: 3, year: 2026, demo: true })) };
  if (url.pathname === '/news' || url.pathname === '/company-news') return [1, 2, 3, 4].map(index => ({ id: index, headline: `${symbol}: ejemplo ficticio de investigación ${index}`, summary: 'Contenido sintético para explorar la interfaz. No describe un acontecimiento real.', source: 'Dataset de demostración', datetime: 1788264000 - index * 86400, url: 'https://example.com', image: '', related: symbol, category: 'demo' }));
  throw new Error('Consulta de demostración no disponible.');
}

export async function financial(path: string, ttl = 300): Promise<any> {
  if (process.env.MARKET_DATA_MODE !== 'live') return demo(path);
  const saved = cache.get(path);
  if (saved && saved.expires > Date.now()) return saved.value;
  if (running.has(path)) return running.get(path);
  const task = (async () => {
    const key = process.env.FINNHUB_API_KEY;
    if (!key) throw new Error('Configura tu clave local de Finnhub para usar el modo live.');
    const response = await fetch('https://finnhub.io/api/v1/' + path, { headers: { 'X-Finnhub-Token': key }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(response.status === 429 ? 'Límite temporal del proveedor.' : 'El proveedor no pudo entregar este dato.');
    const value = await response.json();
    if (value?.error) throw new Error('El proveedor rechazó la consulta.');
    cache.set(path, { value, expires: Date.now() + ttl * 1000 });
    if (cache.size > 1000) cache.delete(cache.keys().next().value!);
    return value;
  })();
  running.set(path, task);
  try { return await task; } finally { running.delete(path); }
}

export function errorResponse(error: unknown) {
  return Response.json({ error: error instanceof Error ? error.message : 'No se pudo completar la operación.' }, { status: 503 });
}
