# 📘 Especificación Técnica y Funcional: Sistema de Relevamiento de Alumbrado Público y Medidores

**Cuenta de Google de Destino**: `relevamientocontrolgestion@gmail.com`  
**Destino de Datos**: Google Sheets (`Relevamiento_Alumbrado_Publico`)  
**Destino de Fotos**: Google Drive (`Fotos_Relevamiento_Alumbrado`)  
**Tecnología**: Google Apps Script Web App (HTML5 + CSS + JavaScript ES6 + Google Apps Script API)

---

## 🎯 1. Objetivo Operativo
Proveer a las cuadrillas de campo de una interfaz móvil fluida y ágil para relevar medidores de alumbrado público y la totalidad de postes y lámparas conectadas a dicho medidor.

---

## 📋 2. Estructura de Datos (Modelo Plano en Google Sheets)

Cada fila asentada en la hoja de cálculo representa un **Poste Relevado**, repitiendo los datos de cabecera del medidor para facilitar el análisis directo en Excel, Power BI o Qlik Sense sin necesidad de hacer `JOINs` complejos:

| Columna | Nombre de Campo | Tipo de Dato | Descripción / Regla |
| :---: | :--- | :--- | :--- |
| **A** | `ID_Registro` | UUID String | Identificador único unívoco por fila/poste. |
| **B** | `Timestamp_Carga` | Datetime | Fecha y hora exacta de recepción en el servidor (UTC-3). |
| **C** | `Fecha_Relevamiento` | Date (YYYY-MM-DD) | Fecha declarada de la visita técnica. |
| **D** | `Numero_Medidor` | String / Numérico | Identificador del medidor instalado (ej. 72677900). |
| **E** | `Lectura_E_Activa` | Decimal / Vacio | Energía Activa Total acumulada en kWh. |
| **F** | `Lectura_EAR_Resto` | Decimal / Vacio | Energía Activa Resto en kWh. |
| **G** | `Lectura_EAP_Pico` | Decimal / Vacio | Energía Activa Pico en kWh. |
| **H** | `Lectura_EAV_Valle` | Decimal / Vacio | Energía Activa Valle en kWh. |
| **I** | `Lectura_ERT_Reactiva` | Decimal / Vacio | Energía Reactiva Total acumulada en kVARh. |
| **J** | `Poste_Numero` | Entero ($\ge 1$) | Secuencia numérica del poste dentro del medidor (1, 2, ... N). |
| **K** | `Cantidad_Lamparas` | Entero ($\ge 1$) | Cantidad física de artefactos/lámparas instaladas en el poste. |
| **L** | `Tipo_Luminaria` | Categórico | LED, Sodio Alta Presión (SAP), Vapor de Mercurio, etc. |
| **M** | `Estado_Luminaria` | Categórico | Encienden Todas, Apagada/Fuera de Servicio, Parcial, Titilando. |
| **N** | `Latitud_GPS` | Decimal ($\pm 90$) | Coordenada satelital de latitud (ej. -31.420083). |
| **O** | `Longitud_GPS` | Decimal ($\pm 180$) | Coordenada satelital de longitud (ej. -64.188776). |
| **P** | `Precision_GPS_m` | Entero (metros) | Radio de incertidumbre satelital reportado por el GPS. |
| **Q** | `Nomenclatura_Catastral` | String | Distrito, Manzana, Parcela o Catastro Provincial/Municipal. |
| **R** | `Direccion_Referencia` | String | Calle y número aproximado o intersección. |
| **S** | `Foto_1_URL` | URL de Drive | Enlace directo para visualización de la primera foto. |
| **T** | `Foto_2_URL` | URL de Drive | Enlace directo para visualización de la segunda foto. |
| **U** | `Foto_3_URL` | URL de Drive | Enlace directo para visualización de la tercera foto. |
| **V** | `Observaciones_Poste` | Texto libre | Comentarios sobre estado físico del poste, cableado, ramas, etc. |
| **W** | `Total_Postes_Medidor` | Entero ($\ge 1$) | Conteo total de postes asociados a esa visita del medidor. |

---

## ⚡ 3. Optimizaciones Técnicas Críticas (Mobile-First)

1. **Compresión Client-Side de Fotos**:
   - Las cámaras móviles modernas generan imágenes de 4 MB a 12 MB. Si un relevamiento tiene 8 postes con 3 fotos cada uno, el volumen superaría los 200 MB, agotando la memoria de Apps Script y la cuota de datos 4G en la calle.
   - El script comprime cada imagen en el navegador mediante un elemento `<canvas>` a un ancho máximo de 1.280 píxeles y calidad JPEG 0.75, reduciendo cada foto a **~200 KB - 300 KB**.
2. **Escritura Atómica en Google Sheets**:
   - Se utiliza `LockService.getScriptLock()` para bloquear la hoja durante 30 segundos mientras se inserta el lote completo con `range.setValues(filasAInsertar)`, evitando condiciones de carrera si dos cuadrillas envían al mismo tiempo.
3. **Manejo de Permisos en Drive**:
   - Cada archivo creado en la carpeta `Fotos_Relevamiento_Alumbrado` recibe permisos `DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW`, permitiendo que cualquier persona autorizada con acceso a la planilla pueda hacer clic en el link de la foto y visualizarla de inmediato en su navegador sin errores de denegación de acceso.

