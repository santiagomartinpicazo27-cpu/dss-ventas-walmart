#!/usr/bin/env python3
"""Análisis y reconstrucción de data.js a partir de Walmart.csv descargado de Kaggle.
Uso: python scripts/procesar_walmart.py Walmart.csv
Fuente: https://www.kaggle.com/datasets/yasserh/walmart-dataset
No se eliminan las semanas atípicas; se muestran como parte del fenómeno comercial.
"""
import csv, datetime as dt, json, math, pathlib, statistics, sys
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
P = pathlib.Path(__file__).resolve().parents[1]

def cents(x):
    return int((Decimal(str(x)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
def enc(n, k):
    digits='0123456789abcdefghijklmnopqrstuvwxyz'
    if n==0: return '0'.rjust(k,'0')
    s=''
    while n:
        n,r=divmod(n,36); s=digits[r]+s
    if len(s)>k: raise ValueError('El número excede el formato de compresión')
    return s.rjust(k,'0')
def main(csvpath):
    with open(csvpath,encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
    expected=['Store','Date','Weekly_Sales','Holiday_Flag','Temperature','Fuel_Price','CPI','Unemployment']
    assert list(rows[0])==expected, 'Columnas inesperadas; revisa la versión del dataset'
    missing=sum(any(not str(row[k]).strip() for k in expected) for row in rows)
    seen=set();dup=0;invalid=0;group=defaultdict(lambda:[0,0,0]); vals=[]; parsed=[]
    for row in rows:
        s=int(row['Store']); d=dt.datetime.strptime(row['Date'],'%d-%m-%Y');h=int(row['Holiday_Flag'])
        key=(s,d)
        if key in seen: dup+=1
        seen.add(key)
        v=cents(row['Weekly_Sales']); t=cents(Decimal(row['Temperature'])+10)
        vals.append(v); parsed.append((s,d,h,v,t))
        idx=(s,d.year,h);g=group[idx];g[0]+=1;g[1]+=v;g[2]+=t
    assert len(rows)==6435 and len(seen)==6435, 'La versión descargada no coincide con los 6,435 registros esperados'
    counts=[44,4,48,4,41,2]
    data=''
    for s in range(1,46):
        for year in (2010,2011,2012):
            for h in (0,1):
                c,sale,t=group[(s,year,h)]
                assert c==counts[(year-2010)*2+h], f'Conteo inesperado: tienda {s}, año {year}, holiday {h}'
                data+=enc(sale,7)+enc(t,4)
    assert len(data)==2970 and sum(vals)==673721898711
    script=("// Agregación verificada de Walmart.csv: 45 tiendas, 3 años y bandera festiva.\n"
            "window.DSS_DATA={years:[2010,2011,2012],stores:45,counts:[44,4,48,4,41,2],"
            "source:'https://www.kaggle.com/datasets/yasserh/walmart-dataset',data:'"+data+"'};\n")
    (P/'data.js').write_text(script,encoding='utf-8')
    ss=sorted(vals);q1=ss[int(len(ss)*.25)];q3=ss[int(len(ss)*.75)];thr=q3+Decimal('1.5')*(q3-q1)
    out={
        'archivo':str(csvpath),'registros':len(rows),'columnas':len(expected),'faltantes':missing,'duplicados_tienda_fecha':dup,
        'fechas_invalidas':invalid,'periodo':['2010-02-05','2012-10-26'],'tiendas':45,
        'ventas_totales_USD':str(Decimal(sum(vals))/100),'media_tienda_semana_USD':str(Decimal(sum(vals))/100/len(vals)),
        'atipicos_IQR_1_5':sum(x>thr for x in vals),'registros_conservados':len(rows),
        'grupos_exportados':len(group),'archivo_publicable':'data.js',
    }
    (P/'resumen_validacion.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(out,indent=2,ensure_ascii=False))
if __name__=='__main__':
    if len(sys.argv)<2: sys.exit('Uso: python scripts/procesar_walmart.py ruta/Walmart.csv')
    main(sys.argv[1])
