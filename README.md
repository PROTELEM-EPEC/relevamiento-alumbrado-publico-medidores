# ⚡ Relevamiento de Alumbrado Público Conectado a Medidores

Aplicación web móvil progresiva basada en **Google Apps Script Web App**, vinculada a la cuenta corporativa `relevamientocontrolgestion@gmail.com`. Permite a cuadrillas operativas en la calle relevar en tiempo real el estado de medidores de energía eléctrica y la totalidad de postes y artefactos de alumbrado público asociados.

---

## 📌 Datos de la Cuenta y Destinos
- **Cuenta de Google**: `relevamientocontrolgestion@gmail.com`
- **Base de Datos Tabular**: Google Sheets (`Relevamiento_Alumbrado_Publico` - Pestaña `Relevamientos_Plano`)
- **Almacenamiento Fotográfico**: Google Drive (`Fotos_Relevamiento_Alumbrado/Medidor_<id>_<fecha>/`)
- **Protocolo de QA**: Triple QA (Técnico, Dominio EPEC/Regulación, UX Mobile)

---

## 🚀 Funcionalidades Principales

1. **Cabecera del Medidor y Lecturas Multifunción**:
   - Registro de fecha y número de medidor instalado.
   - Campos de lecturas analíticas:
     - **E**: Energía Activa Total (kWh)
     - **EAR**: Energía Activa Resto (kWh)
     - **EAP**: Energía Activa Pico (kWh)
     - **EAV**: Energía Activa Valle (kWh)
     - **ERT**: Energía Reactiva Total (kVARh)
2. **Módulo Dinámico y Secuencial de Postes**:
   - Botón interactivo: **`[➕ Agregar Relevamiento de Poste de Alumbrado]`**.
   - Generación en tiempo real: `Poste #1`, `Poste #2`, ... `Poste #N`.
   - Posibilidad de eliminar postes individuales y renumeración automática.
3. **Detalle por Poste de Luminaria**:
   - Selector ergonómico de cantidad de lámparas (botones `+` y `-`).
   - Tipificación técnica: LED, Sodio Alta Presión (SAP), Vapor de Mercurio, Mezcladora, etc.
   - Estado operativo: Todas encienden, Apagada/Fuera de servicio, Parcial, Titilando/Falla balasto, Tulipa rota.
   - **Geolocalización GPS Nativa**: Botón `[📡 Capturar GPS Actual]` con indicación de precisión en metros ($\pm X$ m), latitud y longitud.
   - Nomenclatura catastral o referencia de calles/alturas.
   - **Fotografías Integradas (Hasta 3 imágenes por poste)**:
     - Disparo directo de cámara móvil trasera (`capture="environment"`).
     - Compresión automática en el navegador (Canvas HTML5 a 1.280px, 0.75 JPEG, ~250 KB) para ahorro de cuota y envío ultrarrápido en redes móviles 3G/4G.
     - Vista previa interactiva en miniatura y opción de eliminación/reemplazo.
4. **Base de Datos Plana en Google Sheets (Opción Seleccionada A2)**:
   - 23 columnas normalizadas con una fila por cada poste relevado, repitiendo datos del medidor para facilitar analítica y cruces directos en Power BI o Qlik Sense.

---

## 📂 Estructura del Proyecto

```text
D:\Proyectos\relevamiento-alumbrado-publico-medidores\
├── README.md                                  # Documentación técnica general
├── INSTRUCTIVO_DESPLIEGUE_GOOGLE.md           # Guía paso a paso para desplegar en 5 minutos
├── docs\
│   └── especificacion_funcional.md           # Diccionario de campos, 23 columnas y reglas
├── src\
│   ├── Code.gs                               # Backend en Apps Script (Sheets + Drive API)
│   ├── Index.html                            # Frontend principal
│   ├── Styles.html                           # Estilos responsive mobile-first
│   ├── JavaScript.html                       # Lógica client-side (clonación, GPS, compresión)
│   └── Bundle_Standalone_AppsScript.html     # Versión todo-en-uno lista para pegar en Apps Script
└── tests\
    └── test_payload_validation.py            # Suite de pruebas unitarias deterministas
```

---

## 🛠️ Despliegue Rápido
Consulte el documento [`INSTRUCTIVO_DESPLIEGUE_GOOGLE.md`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/INSTRUCTIVO_DESPLIEGUE_GOOGLE.md) para habilitar la aplicación en menos de 5 minutos en la cuenta `relevamientocontrolgestion@gmail.com`.

