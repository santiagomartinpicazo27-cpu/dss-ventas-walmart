"""Validación independiente de las cifras del archivo procesado sin librerías externas."""
import pathlib,re
from collections import defaultdict
s=(pathlib.Path(__file__).resolve().parents[1]/'data.js').read_text()
a=re.search(r"data:'([0-9a-z]+)'",s).group(1)
assert len(a)==2970, f'Longitud errónea de data.js: {len(a)}'
cnts=[44,4,48,4,41,2]
sales=0;observaciones=0;stores=defaultdict(int);holiday=defaultdict(lambda:[0,0]);years=defaultdict(lambda:[0,0]);temps=0
for store in range(1,46):
 for yi,year in enumerate((2010,2011,2012)):
  for flag in (0,1):
   i=((store-1)*6+yi*2+flag)*11
   cents=int(a[i:i+7],36);c=cnts[yi*2+flag];temp=int(a[i+7:i+11],36)
   sales+=cents;observaciones+=c;stores[store]+=cents;holiday[flag][0]+=cents;holiday[flag][1]+=c;years[year][0]+=cents;years[year][1]+=c;temps+=temp
assert sales==673721898711 and observaciones==6435
assert max(stores,key=stores.get)==20
assert stores[20]==30139779246
uplift=100*((holiday[1][0]/holiday[1][1])/(holiday[0][0]/holiday[0][1])-1)
assert abs(uplift-7.83971303305)<1e-8
print('VALIDACIÓN EXITOSA')
print(f'1. Ventas totales: ${sales/100:,.2f}')
print(f'2. Promedio tienda-semana: ${sales/100/observaciones:,.2f}')
print(f'3. Tienda líder: 20 (${stores[20]/100:,.2f})')
print(f'4. Diferencia festiva: +{uplift:.2f}%')
print(f'5. Registros: {observaciones}; tiendas: {len(stores)}')
print(f'6. Ventas 2011: ${years[2011][0]/100:,.2f}')
