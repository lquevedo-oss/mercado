'use client';

export function MiniChart({symbol,theme,change}:{symbol:string;theme:'light'|'dark';change?:number}) {
 const color=typeof change!=='number'?(theme==='dark'?'#78a9ff':'#285dce'):change<0?(theme==='dark'?'#ff4f60':'#cd3448'):(theme==='dark'?'#00d7a0':'#007c60');
 const config={symbol,width:'100%',height:'100%',locale:'es',dateRange:'1D',colorTheme:theme,isTransparent:true,autosize:true,chartOnly:true,noTimeScale:true,trendLineColor:color,underLineColor:'rgba(80,130,220,0)',underLineBottomColor:'rgba(80,130,220,0)',largeChartUrl:''};
 return <div className="mini-chart"><iframe key={symbol+theme+color} title={`${symbol}: gráfico del último día, TradingView`} src={'https://www.tradingview-widget.com/embed-widget/mini-symbol-overview/?locale=es#'+encodeURIComponent(JSON.stringify(config))} style={{border:0,width:'100%',height:'100%'}}/></div>;
}
