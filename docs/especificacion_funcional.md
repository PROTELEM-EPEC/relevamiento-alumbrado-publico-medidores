# 📘 Especificación Técnica y Funcional: Sistema de Relevamiento de Alumbrado Público y Medidores

**Cuenta de Google de Destino**: `relevamientocontrolgestion@gmail.com`  
**Destino de Datos**: Google Sheets (`Relevamiento_Alumbrado_Publico` - Pestaña `Relevamientos_Plano`)  
**Destino de Fotos**: Google Drive (`Fotos_Relevamiento_Alumbrado`)  
**Tecnología**: Google Apps Script Web App (HTML5 + CSS + JavaScript + Google Apps Script API)

---

## 🎯 1. Objetivo Operativo
Proveer a las cuadrillas de campo de una interfaz móvil fluida y ágil para relevar medidores de alumbrado público y la totalidad de postes y lámparas conectadas a dicho medidor.

En esta versión optimizada:
- Se removieron los campos de lecturas de energía del medidor (E, EAR, EAP, EAV, ERT), agilizando el ingreso en campo solo a **Fecha** y **Número de Medidor**.
- En el módulo de postes se mantuvo la **geolocalización satelital precisa por GPS**, removiendo el campo manual de *Nomenclatura Catastral* para reducir tiempos de tipeo en calle.

---

## 📋 2. Estructura de Datos (Modelo Plano Simplificado en Google Sheets - 16 Columnas)

Cada fila asentada en la hoja de cálculo representa un **Poste Relevado**, repitiendo los datos de cabecera del medidor para facilitar el análisis directo en Excel, Power BI o Qlik Sense sin necesidad de hacer `JOINs` complejos:

| Columna | Nombre de Campo | Tipo de Dato | Descripción / Regla |
| :---: | :--- | :--- | :--- |
| **A** | `ID_Registro` | UUID String | Identificador único unívoco por fila/poste. |
| **B** | `Timestamp_Carga` | Datetime | Fecha y hora exacta de recepción en el servidor (UTC-3). |
| **C** | `Fecha_Relevamiento` | Date (YYYY-MM-DD) | Fecha declarada de la visita técnica. |
| **D** | `Numero_Medidor` | String / Numérico | Identificador del medidor instalado (ej. 72677900). |
| **E** | `Poste_Numero` | Entero ($\ge 1$) | Secuencia numérica del poste dentro del medidor (1, 2, ... N). |
| **F** | `Cantidad_Lamparas` | Entero ($\ge 1$) | Cantidad física de artefactos/lámparas instaladas en el poste. |
| **G** | `Tipo_Luminaria` | Categórico | LED, Sodio Alta Presión (SAP), Vapor de Mercurio, etc. |
| **H** | `Estado_Luminaria` | Categórico | Encienden Todas, Apagada/Fuera de Servicio, Parcial, Titilando. |
| **I** | `Latitud_GPS` | Decimal ($\pm 90$) | Coordenada satelital de latitud (ej. -31.420083). |
| **J** | `Longitud_GPS` | Decimal ($\pm 180$) | Coordenada satelital de longitud (ej. -64.188776). |
| **K** | `Precision_GPS_m` | Entero (metros) | Radio de incertidumbre satelital reportado por el GPS ($\pm X$ m). |
| **L** | `Foto_1_URL` | URL de Drive | Enlace directo para visualización de la primera foto. |
| **M** | `Foto_2_URL` | URL de Drive | Enlace directo para visualización de la segunda foto. |
| **N** | `Foto_3_URL` | URL de Drive | Enlace directo para visualización de la tercera foto. |
| **O** | `Observaciones_Poste` | Texto libre | Comentarios sobre estado físico del poste, cableado, ramas, etc. |
| **P** | `Total_Postes_Medidor` | Entero ($\ge 1$) | Conteo total de postes asociados a esa visita del medidor. |

---

## ⚡ 3. Optimizaciones Técnicas Críticas (Mobile-First)

1. **Compresión Client-Side de Fotos**:
   - Las cámaras móviles generan imágenes pesadas de 4 MB a 12 MB. Si un relevamiento tiene 8 postes con 3 fotos cada uno, el volumen superaría los 200 MB, agotando la memoria de Apps Script y la cuota de datos móviles.
   - El script comprime cada imagen en el navegador mediante un elemento `<canvas>` a un ancho máximo de 1.280 píxeles y calidad JPEG 0.75, reduciendo cada foto a **~200 KB - 300 KB**.
2. **Escritura Atómica en Google Sheets**:
   - Se utiliza `LockService.getScriptLock()` para bloquear la hoja durante 30 segundos mientras se inserta el lote completo con `range.setValues(filasAInsertar)`, evitando colisiones si dos cuadrillas envían al mismo tiempo.
3. **Manejo de Permisos en Drive**:
   - Cada archivo creado en la carpeta `Fotos_Relevamiento_Alumbrado` recibe permisos `DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW`, permitiendo que cualquier persona autorizada con acceso a la planilla pueda hacer clic en el link de la foto y visualizarla de inmediato en su navegador sin errores de permisos.
