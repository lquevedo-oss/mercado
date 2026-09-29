import { financial,errorResponse,symbolPattern } from '../../../lib/market';
export async function GET(req:Request) {
  const p=new URL(req.url).searchParams,kind=p.get('kind')||'quotes',symbol=(p.get('symbol')||'AAPL').toUpperCase();
  if(!symbolPattern.test(symbol)) return Response.json({error:'Ticker no válido.'},{status:400});
  const today=new Date().toISOString().slice(0,10);
  try {
    if(kind==='quotes') {
      const symbols=[...new Set((p.get('symbols')||symbol).split(',').map(s=>s.trim().toUpperCase()))].slice(0,20);
      if(symbols.some(s=>!symbolPattern.test(s))) return Response.json({error:'Ticker no válido.'},{status:400});
      const results=await Promise.all(symbols.map(async s=>{try{const quote=await financial('quote?symbol='+encodeURIComponent(s),90);return quote.c>0?{symbol:s,...quote}:{symbol:s,error:'Sin cotización disponible. Revisa el ticker y la cobertura.'};}catch(e){return {symbol:s,error:e instanceof Error?e.message:'Dato no disponible'};}}));
      return Response.json({quotes:results,checkedAt:new Date().toISOString()});
    }
    if(kind==='detail') {
      const from=new Date(Date.now()-7*86400000).toISOString().slice(0,10);
      const sections=await Promise.allSettled([
        financial('stock/profile2?symbol='+symbol,86400), financial('stock/metric?symbol='+symbol+'&metric=all',21600),
        financial('stock/earnings?symbol='+symbol,21600), financial('company-news?symbol='+symbol+'&from='+from+'&to='+today,900)
      ]);
      const result:Record<string,unknown>={symbol,errors:{}};
      ['profile','metrics','surprises','news'].forEach((k,i)=>{const s=sections[i];if(s.status==='fulfilled') result[k]=k==='news'?s.value.slice(0,16):s.value;else (result.errors as any)[k]=s.reason?.message||'Dato no disponible';});
      return Response.json(result);
    }
    if(kind==='earnings') {
      const to=new Date(Date.now()+29*86400000).toISOString().slice(0,10);
      return Response.json({...await financial('calendar/earnings?from='+today+'&to='+to,3600),from:today,to});
    }
    if(kind==='news') return Response.json({news:(await financial('news?category=general',900)).slice(0,35)});
    return Response.json({error:'Consulta no válida.'},{status:400});
  } catch(e) {return errorResponse(e);}
}
