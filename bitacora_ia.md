# Bitácora de uso de IA — RetailPulse DSS

**Fecha de inicio:** 10/10/2026. **Herramienta:** ChatGPT (GPT-6). **Nota metodológica:** el usuario proporcionó una consigna extensa en un único mensaje; las cinco instrucciones siguientes son una *descomposición temática documentada* de esa consigna para hacer trazable el proyecto, **no cinco mensajes independientes que el estudiante haya enviado**. Agrega tus prompts reales y sus horas conforme continúes el proyecto.

| Momento / instrucción de trabajo derivada del encargo | Respuesta o resultado de la IA | Decisión tomada y verificación | Estado |
|---|---|---|---|
| 10/10/26, 1. «Busca un dataset de Walmart con tiendas, ventas semanales, festivos y factores externos; identifica autor y enlace». | Localizó Walmart Dataset de M Yasser H y un espejo GitHub de Walmart.csv. | Se registran ambos enlaces y se declara que el archivo realmente consultado fue un espejo. Descarga directa Kaggle aún pendiente del estudiante. | Parcial |
| 10/10/26, 2. «Revisa estructura, fechas, faltantes, duplicados y atípicos antes de construir la interfaz». | 6,435 filas, 8 columnas, 45 tiendas y 143 semanas; 0 faltantes; 0 duplicados tienda-fecha; 34 valores superiores al umbral IQR. | Conservar valores extremos como posibles picos comerciales; no reemplazarlos por promedios. Revisión replicable con script. | Completado |
| 10/10/26, 3. «Calcula ventas por tienda, evolución anual normalizada, festivos y temperatura». | Ventas $6,737,218,987.11; líder tienda 20; diferencial festivo +7.84%; correlación fila a fila temperatura–ventas r≈−0.064. | Validar con suma en centavos y promedios con denominadores correctos. Aclarar que correlación no significa causalidad. | Completado |
| 10/10/26, 4. «Diseña un dashboard HTML/CSS/JavaScript adaptable y estático con filtros y cinco visualizaciones». | Generó RetailPulse con KPIs, línea, barras, dona, dispersión, mapa de calor y tabla. | Se modificaron unidades de las abreviaturas, se usaron datos locales procesados y se separó la asociación a nivel de tienda de la correlación original fila a fila. | Completado |
| 10/10/26, 5. «Comprueba tres cifras, captura interfaz y documenta GitHub Pages». | Script de validación, capturas de pantalla de escritorio/móvil y guía para publicar. | Se comprobaron cuatro cifras y filtros locales; la creación de repositorio público, publicación Pages y capturas de GitHub siguen pendientes y **no se presentan como realizadas**. | Parcial |

## Limitaciones y correcciones observadas

1. **Cálculo de correlación (error de análisis corregido).** Un primer cálculo programático devolvió valores nulos porque la función de suma no propagaba el índice. Se sustituyó por la suma explícita de productos centrados. Resultado fila a fila con temperatura: **r = −0.063810**. No usar la correlación entre promedios de tienda como si fuera la correlación entre observaciones originales.
2. **Escalas abreviadas.** La interfaz inicial expresaba los miles de millones con una notación poco clara; se uniformó a **millones de USD (M)**.
3. **Sesgo temporal.** El año 2012 está incompleto. La curva usa promedio por observación para comparar, y el texto advierte que subsisten diferencias estacionales.
4. **Dependencia de internet.** No se utilizó una biblioteca de gráficos cargada desde CDN; los gráficos SVG y los datos procesados están dentro del repositorio.
5. **Validación web.** El navegador automatizado restringía la navegación `file://` y `http://127.0.0.1`. Se inyectaron los mismos HTML/CSS/JS en una página de prueba aislada para renderizar y probar filtros; no equivale a comprobar GitHub Pages en internet.

## Reflexión editable por los integrantes

La IA ayudó a organizar la estructura del dashboard, escribir componentes, crear el script de validación y convertir hallazgos en visualizaciones con mayor rapidez. No debe delegarse a la IA la interpretación comercial, la revisión de la fuente, la comprobación matemática, la decisión de excluir registros, el manejo de datos sensibles ni la responsabilidad de entregar evidencias auténticas. Los integrantes deberán adaptar esta reflexión a su experiencia real y añadir decisiones propias.

**Seguimiento pendiente:** pegar URLs reales, registrar prompts adicionales con fecha/hora, describir al menos un problema de publicación y adjuntar capturas verídicas.
