(() => {
  'use strict';
  const D = window.DSS_DATA;
  const money = new Intl.NumberFormat('en-US', { style:'currency',currency:'USD',maximumFractionDigits:2 });
  const num = new Intl.NumberFormat('es-MX');
  const abbrev = n => Math.abs(n)>=1e6 ? '$'+(n/1e6).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' M' : '$'+(n/1e3).toFixed(1)+' mil';
  const short = n => '$'+(n/1e6).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1})+' M';
  const byId = id => document.getElementById(id);
  function decode() {
    if(!D || D.data.length !== D.stores*D.years.length*2*11) throw Error('Longitud de datos agregados incorrecta');
    const rows=[];
    for(let s=1;s<=D.stores;s++) for(let yi=0;yi<D.years.length;yi++) for(let h=0;h<2;h++) {
      const gi=(s-1)*6+yi*2+h, k=gi*11, n=D.counts[yi*2+h];
      const cents=parseInt(D.data.slice(k,k+7),36);
      const tempShiftCenti=parseInt(D.data.slice(k+7,k+11),36);
      rows.push({store:s,year:D.years[yi],holiday:h,count:n,cents,tempShiftCenti});
    }
    if(rows.reduce((a,r)=>a+r.cents,0)!==673721898711) throw Error('Error de integridad: las ventas no cuadran con la suma original');
    if(rows.reduce((a,r)=>a+r.count,0)!==6435) throw Error('Error de integridad: cantidad de observaciones');
    return rows;
  }
  const source=decode();
  const color={purple:'#a39aff', mint:'#57d6ba', amber:'#f6bc7e', grid:'#283850',label:'#95a5bb'};
  const sum=(a,k)=>a.reduce((v,r)=>v+r[k],0);
  const average=g=>g.count ? g.cents/100/g.count : 0;
  const measure=rows=>({cents:sum(rows,'cents'),count:sum(rows,'count'),tempShiftCenti:sum(rows,'tempShiftCenti')});
  const avgTemp = g => g.count ? g.tempShiftCenti/(100*g.count)-10 : NaN;
  const filtered=()=>source.filter(r=>(byId('storeFilter').value==='all'||r.store===+byId('storeFilter').value) && (byId('yearFilter').value==='all'||r.year===+byId('yearFilter').value) && (byId('holidayFilter').value==='all'||r.holiday===+byId('holidayFilter').value));
  const fmt=p=>Math.round(p*100)/100;
  const svgns='http://www.w3.org/2000/svg';
  const svg=(w,h,body)=>`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" xmlns="${svgns}" role="presentation">${body}</svg>`;
  const text=(x,y,v,extra='')=>`<text x="${x}" y="${y}" fill="${color.label}" font-size="11" ${extra}>${v}</text>`;
  const line=(x1,y1,x2,y2,stroke=color.grid,width=1)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
  const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const groupBy=(rows,key)=>{let m=new Map;for(let r of rows){let k=key(r);if(!m.has(k))m.set(k,[]);m.get(k).push(r)}return m};
  function renderKpis(rows) {
    let m=measure(rows), byStore=groupBy(rows,r=>r.store);
    let stores=[...byStore].map(([s,rs])=>({s,...measure(rs)})).sort((a,b)=>b.cents-a.cents);
    byId('kpiSales').textContent=abbrev(m.cents/100);
    byId('kpiSalesSub').textContent=money.format(m.cents/100)+' en el periodo seleccionado';
    byId('kpiAverage').textContent=abbrev(average(m));
    byId('kpiAverageSub').textContent=num.format(m.count)+' registros tienda-semana';
    byId('kpiLeader').textContent=stores.length?'Tienda '+stores[0].s:'—';
    byId('kpiLeaderSub').textContent=stores.length?money.format(stores[0].cents/100)+' en ventas':'Sin registros';
    const hs=measure(rows.filter(r=>r.holiday===1)), ns=measure(rows.filter(r=>r.holiday===0));
    if(hs.count&&ns.count){let d=(average(hs)/average(ns)-1)*100;
      byId('kpiHoliday').textContent=(d>=0?'+':'')+d.toFixed(2)+'%';
      byId('kpiHolidaySub').textContent='Promedios: '+short(average(hs))+' vs '+short(average(ns));
      byId('kpiHolidayNote').textContent='Festivas vs. no festivas';
    } else {byId('kpiHoliday').textContent='—';byId('kpiHolidaySub').textContent='Selecciona «todas las semanas»';byId('kpiHolidayNote').textContent='Comparativa no disponible';}
    const top5=stores.slice(0,5).reduce((a,r)=>a+r.cents,0)/m.cents*100;
    byId('concentrationNote').textContent=stores.length>1?`Las primeras cinco tiendas reúnen el ${top5.toFixed(2)}% de las ventas del filtro activo. Haz clic en un punto de la dispersión para filtrar una tienda.`:'Visualización correspondiente a la tienda elegida.';
  }
  function renderTrend(rows){
    const w=670,h=270,left=82,right=24,top=24,bottom=42;
    const yrs=[...groupBy(rows,r=>r.year)].sort(([a],[b])=>a-b).map(([year,rs])=>({year,value:average(measure(rs)),n:sum(rs,'count')}));
    const allvals=yrs.map(r=>r.value),hi=Math.max(1,...allvals)*1.13,lo=0;
    const xp=i=>yrs.length===1?(left+w-right)/2:left+(w-left-right)*(i/(yrs.length-1));
    const yp=v=>top+(h-top-bottom)*(1-(v-lo)/(hi-lo));
    let out='';for(let i=0;i<5;i++){let val=hi*i/4,y=yp(val);out+=line(left,y,w-right,y)+text(left-12,y+4,'$'+(val/1e6).toFixed(1)+' M','text-anchor="end"');}
    if(yrs.length){let path=yrs.map((p,i)=>`${i===0?'M':'L'}${xp(i)},${yp(p.value)}`).join(' ');
      if(yrs.length>1){out+=`<path d="${path} L${xp(yrs.length-1)},${h-bottom} L${xp(0)},${h-bottom} Z" fill="#746efe" opacity=".08"/>`;
      out+=`<path d="${path}" stroke="${color.purple}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;}
      yrs.forEach((p,i)=>{let x=xp(i),y=yp(p.value);out+=`<circle cx="${x}" cy="${y}" r="7" fill="#101d32" stroke="${color.purple}" stroke-width="3" data-tip="${p.year}|Promedio ${money.format(p.value)} · ${num.format(p.n)} registros" class="chart-point"/>`+text(x,h-13,p.year,'text-anchor="middle"')+text(x,y-16,short(p.value),'text-anchor="middle" fill="#dcd9ff"');});
    }
    byId('trendChart').innerHTML=svg(w,h,out);
  }
  function renderDonut(rows){let total=sum(rows,'cents')||1,fe=sum(rows.filter(r=>r.holiday===1),'cents'),no=sum(rows.filter(r=>r.holiday===0),'cents');let share=100*fe/total;byId('holidayChart').innerHTML=`<div class="donut" style="background:conic-gradient(${color.purple} 0 ${share}%, ${color.mint} ${share}% 100%)"><div class="donut-label"><strong>${share.toFixed(1)}%</strong><span>ventas festivas</span></div></div><div class="legend"><div class="legend-item"><i class="legend-swatch" style="background:${color.purple}"></i><div>Semanas festivas<strong>${short(fe/100)}</strong></div></div><div class="legend-item"><i class="legend-swatch" style="background:${color.mint}"></i><div>Semanas normales<strong>${short(no/100)}</strong></div></div></div>`;}
  function renderBars(rows){let a=[...groupBy(rows,r=>r.store)].map(([s,rs])=>({s,cents:sum(rs,'cents')})).sort((a,b)=>b.cents-a.cents).slice(0,10);let max=a[0]?.cents||1;byId('storesChart').innerHTML=a.map(r=>`<div class="bar-row"><div class="bar-name">Tienda ${r.s}</div><div class="bar-track"><div class="bar-fill" style="width:${(r.cents/max*100).toFixed(2)}%"></div></div><div class="bar-amount">${short(r.cents/100)}</div></div>`).join('')||'<div class="no-data">No hay registros</div>';}
  function correlation(arr){if(arr.length<3)return NaN;let x=arr.map(v=>v.x),y=arr.map(v=>v.y);let mx=x.reduce((a,b)=>a+b,0)/x.length,my=y.reduce((a,b)=>a+b,0)/y.length;let n=0,dx=0,dy=0;for(let i=0;i<x.length;i++){let a=x[i]-mx,b=y[i]-my;n+=a*b;dx+=a*a;dy+=b*b;}return n/Math.sqrt(dx*dy);}
  function renderScatter(rows){const w=480,h=270,left=62,right=16,top=18,bottom=42;let g=[...groupBy(rows,r=>r.store)].map(([s,rs])=>{let m=measure(rs);return {s,x:avgTemp(m),y:average(m)}});if(!g.length){byId('scatterChart').innerHTML='<div class="no-data">Sin datos</div>';return;}
    let xs=g.map(r=>r.x),ys=g.map(r=>r.y),xmin=Math.min(...xs)-5,xmax=Math.max(...xs)+5,ymin=0,ymax=Math.max(...ys)*1.16;
    const xp=x=>left+(w-left-right)*(x-xmin)/(xmax-xmin),yp=y=>top+(h-top-bottom)*(1-y/ymax);
    let out='';for(let i=0;i<5;i++){let v=ymax*i/4,y=yp(v);out+=line(left,y,w-right,y)+text(left-8,y+4,'$'+(v/1e6).toFixed(1)+' M','text-anchor="end"');}for(let i=0;i<5;i++){let v=xmin+(xmax-xmin)*i/4,x=xp(v);out+=text(x,h-14,v.toFixed(0)+'°F','text-anchor="middle"');}
    g.forEach(r=>out+=`<circle cx="${xp(r.x)}" cy="${yp(r.y)}" r="6" fill="${r.s===20?color.mint:color.purple}" stroke="#c9c8ff" stroke-width=".5" opacity=".82" class="chart-point clickable" data-store="${r.s}" data-tip="Tienda ${r.s}|Temperatura ${r.x.toFixed(1)} °F · media ${money.format(r.y)}"/>`);
    byId('scatterChart').innerHTML=svg(w,h,out);
    let r=correlation(g),s=Number.isFinite(r)?r.toFixed(3):'n/d';byId('correlationNote').textContent=`Correlación entre promedios por tienda: r = ${s} (${g.length} tienda${g.length!==1?'s':''}). No significa causalidad ni equivale a correlación de los 6,435 registros originales.`;
  }
  function renderHeatmap(rows){const years=[...new Set(rows.map(r=>r.year))].sort(),byStore=groupBy(rows,r=>r.store),totals=[...byStore].map(([store,rr])=>({store,cents:sum(rr,'cents')})).sort((a,b)=>b.cents-a.cents);let vals=[];for(let {store} of totals)for(let year of years){let rr=rows.filter(r=>r.store===store&&r.year===year);if(rr.length)vals.push(average(measure(rr)));}let max=Math.max(...vals,1),min=Math.min(...vals,0),range=Math.max(1,max-min);
    let table=`<table class="heatmap"><thead><tr><th>TIENDA</th>${years.map(y=>`<th>${y}</th>`).join('')}</tr></thead><tbody>`;
    for(let {store} of totals){table+=`<tr><td class="heat-label">Tienda ${store}</td>`;for(let y of years){let rs=rows.filter(r=>r.store===store&&r.year===y),v=rs.length?average(measure(rs)):0,t=(v-min)/range;let alpha=.15+.68*t;table+=`<td style="background:rgba(132,121,247,${alpha.toFixed(3)});color:${t>.6?'#fff':'#d3daf5'}" title="${money.format(v)}">${short(v)}</td>`;}table+='</tr>';}table+='</tbody></table>';byId('heatmapChart').innerHTML=table;}
  function renderTable(rows){let m=sum(rows,'cents'),stats=[...groupBy(rows,r=>r.store)].map(([s,rs])=>{let a=measure(rs);return {s,...a}}).sort((a,b)=>b.cents-a.cents);byId('storeTable').innerHTML=stats.map((r,i)=>`<tr><td><span class="rank">#${i+1}</span></td><td>Tienda ${r.s}</td><td>${money.format(r.cents/100)}</td><td>${money.format(average(r))}</td><td>${(100*r.cents/m).toFixed(2)}%</td><td>${num.format(r.count)}</td></tr>`).join('');return stats;}
  let currentStats=[];
  function update(){const rows=filtered();renderKpis(rows);renderTrend(rows);renderDonut(rows);renderBars(rows);renderScatter(rows);renderHeatmap(rows);currentStats=renderTable(rows);}
  for(let s=1;s<=45;s++) byId('storeFilter').add(new Option('Tienda '+s,''+s));
  ['storeFilter','yearFilter','holidayFilter'].forEach(id=>byId(id).addEventListener('change',update));
  byId('resetFilters').addEventListener('click',()=>{['storeFilter','yearFilter','holidayFilter'].forEach(id=>byId(id).value='all');update();});
  byId('exportCSV').addEventListener('click',()=>{let lines=['Tienda,Ventas_USD,Promedio_semanal_USD,Observaciones'];for(let r of currentStats)lines.push([r.s,(r.cents/100).toFixed(2),average(r).toFixed(2),r.count].join(','));const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});let u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='resumen_dss_walmart.csv';a.click();URL.revokeObjectURL(u)});
  const tooltip=byId('tooltip');document.addEventListener('pointerover',e=>{let t=e.target.closest('[data-tip]');if(!t)return;const [title,detail]=t.dataset.tip.split('|');tooltip.innerHTML=`<strong>${title}</strong>${detail}`;tooltip.hidden=false;});document.addEventListener('pointermove',e=>{if(!tooltip.hidden){let x=e.clientX+14,y=e.clientY+14;tooltip.style.left=Math.min(x,window.innerWidth-215)+'px';tooltip.style.top=Math.min(y,window.innerHeight-85)+'px';}});document.addEventListener('pointerout',e=>{if(e.target.closest?.('[data-tip]'))tooltip.hidden=true;});document.addEventListener('click',e=>{let c=e.target.closest('[data-store]');if(c){byId('storeFilter').value=c.dataset.store;update();window.scrollTo({top:0,behavior:'smooth'})}});
  update();
})();
