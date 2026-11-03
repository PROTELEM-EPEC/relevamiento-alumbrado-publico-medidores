# 📘 Especificación Técnica y Funcional: Sistema de Relevamiento de Alumbrado Público y Medidores

**Cuenta de Google de Destino**: `relevamientocontrolgestion@gmail.com`  
**Destino de Datos**: Google Sheets (`Relevamiento_Alumbrado_Publico` - Pestaña `Relevamientos_Plano`)  
**Destino de Fotos**: Google Drive (`Fotos_Relevamiento_Alumbrado`)  
**Tecnología**: Google Apps Script Web App (HTML5 + CSS + JavaScript + Google Apps Script API)  
**Versión**: 2.1 (Persistencia de Borrador en LocalStorage y Selector de Potencia de Luminaria)

---

## 🎯 1. Objetivo Operativo
Proveer a las cuadrillas de campo de una interfaz móvil fluida y ágil para relevar medidores de alumbrado público y la totalidad de postes y lámparas conectadas a dicho medidor.

En esta versión optimizada:
- Se removieron los campos de lecturas de energía del medidor (E, EAR, EAP, EAV, ERT), agilizando el ingreso en campo solo a **Fecha** y **Número de Medidor**.
- En el módulo de postes se mantuvo la **geolocalización satelital precisa por GPS**, removiendo el campo manual de *Nomenclatura Catastral* para reducir tiempos de tipeo en calle.
- **Nuevo campo de Potencia de Luminaria (Opcional)**: Selector desplegable para registrar la potencia del artefacto (`50W`, `100W`, `150W`, `200W`, `250W`).
- **Persistencia Continua Local (Anti-Pérdida de Datos)**: Guardado automático en `localStorage` en tiempo real para evitar que una recarga accidental de la página o cierre del navegador borre los postes y fotos ya cargados.

---

## 📋 2. Estructura de Datos (Modelo Plano Simplificado en Google Sheets - 17 Columnas)

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
| **H** | `Potencia_Luminaria` | Categórico (Opcional) | 50W, 100W, 150W, 200W, 250W (o vacío si no se especifica). |
| **I** | `Estado_Luminaria` | Categórico | Encienden Todas, Apagada/Fuera de Servicio, Parcial, Titilando. |
| **J** | `Latitud_GPS` | Decimal ($\pm 90$) | Coordenada satelital de latitud (ej. -31.420083). |
| **K** | `Longitud_GPS` | Decimal ($\pm 180$) | Coordenada satelital de longitud (ej. -64.188776). |
| **L** | `Precision_GPS_m` | Entero (metros) | Radio de incertidumbre satelital reportado por el GPS ($\pm X$ m). |
| **M** | `Foto_1_URL` | URL de Drive | Enlace directo para visualización de la primera foto. |
| **N** | `Foto_2_URL` | URL de Drive | Enlace directo para visualización de la segunda foto. |
| **O** | `Foto_3_URL` | URL de Drive | Enlace directo para visualización de la tercera foto. |
| **P** | `Observaciones_Poste` | Texto libre | Comentarios sobre estado físico del poste, cableado, ramas, etc. |
| **Q** | `Total_Postes_Medidor` | Entero ($\ge 1$) | Conteo total de postes asociados a esa visita del medidor. |

---

## ⚡ 3. Optimizaciones Técnicas Críticas (Mobile-First)

1. **Compresión Client-Side de Fotos**:
   - Las cámaras móviles generan imágenes pesadas de 4 MB a 12 MB. Si un relevamiento tiene 8 postes con 3 fotos cada uno, el volumen superaría los 200 MB, agotando la memoria de Apps Script y la cuota de datos móviles.
   - El script comprime cada imagen en el navegador mediante un elemento `<canvas>` a un ancho máximo de 1.280 píxeles y calidad JPEG 0.75, reduciendo cada foto a **~200 KB - 300 KB**.
2. **Escritura Atómica en Google Sheets**:
   - Se utiliza `LockService.getScriptLock()` para bloquear la hoja durante 30 segundos mientras se inserta el lote completo con `range.setValues(filasAInsertar)`, evitando colisiones si dos cuadrillas envían al mismo tiempo.
3. **Manejo de Permisos en Drive**:
   - Cada archivo creado en la carpeta `Fotos_Relevamiento_Alumbrado` recibe permisos `DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW`, permitiendo que cualquier persona autorizada con acceso a la planilla pueda hacer clic en el link de la foto y visualizarla de inmediato en su navegador sin errores de permisos.
4. **Persistencia Automática de Borrador en LocalStorage**:
   - Cada modificación en el formulario (cambio de inputs, agregado de postes, captura de GPS, fotos procesadas) dispara un guardado debounced en `localStorage` (`relevamiento_alumbrado_borrador_v1`).
   - Si el operador recarga la página por error o el sistema operativo del teléfono cierra el navegador para liberar memoria, al reabrir la aplicación se reconstruyen automáticamente todos los postes, valores seleccionados, coordenadas y fotos capturadas, mostrando un banner de confirmación con opción de descarte.
   - Al concretar la carga exitosa en el servidor o reiniciar el formulario, el borrador local se purga de forma segura.
