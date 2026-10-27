# RetailPulse — DSS de ventas Walmart

Dashboard web estático para apoyar decisiones comerciales de una dirección regional. Permite comparar **45 tiendas**, segmentar por **año** y **semana festiva / no festiva**, explorar la evolución de la venta semanal promedio, una clasificación de tiendas, participación de periodos festivos, asociación entre temperatura y ventas, mapa de calor y tabla exportable.

## Vista y publicación

- **Dashboard:** `index.html` (funciona sin backend; abrir con un navegador moderno o servidor estático).
- **Repositorio público:** Pendiente de publicación. Agregar aquí la URL real después de crear el repositorio.
- **GitHub Pages:** Pendiente de publicación. Agregar aquí la URL real cuando el dashboard esté accesible.
- **Alumno:** Santiago Martin Picazo.
- **Carrera:** Administración de Negocios en Entornos Virtuales.
- **Materia:** Infraestructura Tecnológica.
- **Grupo:** Pendiente de especificar.
- **Reporte:** se entrega en Teams por separado; requiere actualizar las URLs y capturas reales tras la publicación.

## Fuente y reproducibilidad

- Dataset de referencia: **Walmart Dataset**, M Yasser H, Kaggle: https://www.kaggle.com/datasets/yasserh/walmart-dataset
- CSV equivalente utilizado para análisis y agregación el **10 de octubre de 2026**: https://github.com/GonzaloBP/Almacen-de-datos-Walmart/blob/main/Walmart.csv
- El archivo fue obtenido de un **espejo público de GitHub**, no directamente mediante una descarga autenticada de Kaggle. Para satisfacer la exigencia formal de descargar desde Kaggle, descarga la copia del dataset con tu propia cuenta, comprueba que contiene los mismos registros y ejecuta de nuevo el script de procesamiento.
- Fuente histórica: 6,435 registros, 8 variables, 45 tiendas, del **05-02-2010 al 26-10-2012**.
- **Datos incluidos en el repositorio:** `data.js`, tabla agregada exacta de ventas en centavos y temperatura por tienda/año/tipo de semana. No requiere conexión a Kaggle ni peticiones remotas en tiempo de ejecución.
- Generación: `python scripts/procesar_walmart.py Walmart.csv` (reconstruye `data.js` y guarda `resumen_validacion.json`).
- Verificación independiente: `python scripts/validar_dashboard.py`.

## Tecnologías

HTML5, CSS3 (diseño adaptable), JavaScript sin frameworks (filtrado, agregación, gráficos SVG, descarga CSV), Python de la biblioteca estándar (auditoría y procesamiento), Git/GitHub y GitHub Pages (publicación al completar). No requiere instalación de librerías frontend ni claves.

## Archivos

```text
index.html                   Página y estructura accesible
styles.css                   Interfaz adaptable
app.js                       Cálculos interactivos y gráficos SVG
data.js                      Datos procesados incrustados en repositorio
scripts/procesar_walmart.py  Análisis, calidad y regeneración
scripts/validar_dashboard.py Comprobación de indicadores
resumen_validacion.json      Resumen de revisión de datos
bitacora_ia.md               Seguimiento del uso de IA
CHECKLIST_ENTREGA.md         Actividades pendientes en GitHub
evidencias/                 Capturas de escritorio, filtros y móvil
```

## Interpretación de KPI

- Ventas totales = suma de `Weekly_Sales` (tienda-semana).
- Promedio semanal **por tienda** = ventas totales / número de observaciones **tienda-semana**. No significa ventas combinadas de toda la cadena en una semana.
- Líder = tienda con el mayor monto acumulado, dentro de los filtros.
- Diferencia festiva = `(promedio tienda-semana festiva / promedio tienda-semana no festiva - 1) × 100`. Si se filtra solo una categoría, no se muestra una diferencia que no sería posible calcular.
- Temperatura: promedio en °F. El gráfico de dispersión presenta **promedios por tienda** según el filtro; es una asociación descriptiva, no una demostración causal.
- El año 2010 contiene 48 semanas y 2012 solo 43; **no comparar totales anuales sin normalizar por semanas**, y recordar que el calendario estacional está incompleto en esos años.
- Atípicos altos: 34 por criterio IQR×1.5, conservados por posible relevancia comercial. Sin registros faltantes ni duplicados tienda-fecha.

## Publicar en GitHub Pages

1. Crear el repositorio **público** `dss-ventas-walmart` desde la cuenta del estudiante.
2. Subir toda esta carpeta, manteniendo `index.html`, `app.js`, `styles.css` y `data.js` en la **raíz del repositorio**. Puedes importar el repositorio Git local: `git remote add origin URL_REPO` y `git push -u origin main`.
3. En GitHub, abrir **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save**.
4. Visitar `https://USUARIO.github.io/dss-ventas-walmart/`, probar filtros y exportación en móvil e incógnito.
5. Actualizar las líneas pendientes de este README y el reporte; añadir capturas **reales** de la URL, historial de commits y configuración Pages.

**Estado de publicación:** el proyecto está probado en un navegador local e incluye commits Git locales. **No se ha creado ni publicado** un repositorio desde esta conversación. No deben describirse como completados los pasos de GitHub sin evidencia.

## Créditos

Proyecto académico elaborado con apoyo de OpenAI ChatGPT (GPT-6); los responsables de la entrega deben revisar, entender, personalizar y verificar los resultados antes de presentarlo.
