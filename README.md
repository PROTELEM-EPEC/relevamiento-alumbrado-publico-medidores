# ⚡ Relevamiento de Alumbrado Público Conectado a Medidores

Aplicación web móvil progresiva basada en **Google Apps Script Web App**, vinculada a la cuenta corporativa `relevamientocontrolgestion@gmail.com`. Permite a cuadrillas operativas en la calle relevar en tiempo real el medidor instalado y la totalidad de postes y artefactos de alumbrado público asociados.

---

## 📌 Datos de la Cuenta y Destinos
- **Estado**: ✅ **100% Operativo y Validado en Campo**
- **Cuenta de Google**: `relevamientocontrolgestion@gmail.com`
- **Enlace Web App (Google Apps Script)**: [https://script.google.com/macros/s/AKfycbxVGx8m5z6aRxQG7CJBp403RGS4e7jhpi__3OMvVQkZ3a8guJDd5CUlf7uI53R4N3qB/exec](https://script.google.com/macros/s/AKfycbxVGx8m5z6aRxQG7CJBp403RGS4e7jhpi__3OMvVQkZ3a8guJDd5CUlf7uI53R4N3qB/exec)
- **Enlace Web App (GitHub Pages - Sin inicio de sesión Google)**: [https://protelem-epec.github.io/relevamiento-alumbrado-publico-medidores/](https://protelem-epec.github.io/relevamiento-alumbrado-publico-medidores/)
- **Base de Datos Tabular**: Google Sheets (`Relevamiento_Alumbrado_Publico` - Pestaña `Relevamientos_Plano`, 17 columnas)
- **Almacenamiento Fotográfico**: Google Drive (`Fotos_Relevamiento_Alumbrado/Medidor_<id>_<fecha>/`)
- **Protocolo de QA**: Triple QA (Técnico, Dominio EPEC/Regulación, UX Mobile)

> [!NOTE]
> **Resolución de Error Multi-cuenta Google (`/u/1/`)**:  
> Al abrir en navegadores móviles con varias cuentas de Google, debe usarse siempre el enlace limpio canónico sin el prefijo `/u/1/` o `/u/6/`, o directamente la URL de **GitHub Pages**, evitando redireccionamientos y errores 404 de Google Drive.

---

## 🚀 Funcionalidades Principales

1. **Cabecera Ágil del Medidor**:
   - Registro de fecha de relevamiento y número de medidor instalado.
   - Formulario directo sin carga de lecturas numéricas complejas para máxima velocidad en calle.
2. **Módulo Dinámico y Secuencial de Postes**:
   - Botón interactivo: **`[➕ Agregar Relevamiento de Poste de Alumbrado]`**.
   - Generación en tiempo real: `Poste #1`, `Poste #2`, ... `Poste #N`.
   - Posibilidad de eliminar postes individuales y renumeración automática.
3. **Detalle por Poste de Luminaria**:
   - Selector ergonómico de cantidad de lámparas (botones `+` y `-`).
   - Tipificación técnica: LED, Sodio Alta Presión (SAP), Vapor de Mercurio, Mezcladora, etc.
   - **Potencia de la Luminaria (Opcional)**: Selector desplegable con valores `50W`, `100W`, `150W`, `200W`, `250W`.
   - Estado operativo: Todas encienden, Apagada/Fuera de servicio, Parcial, Titilando/Falla balasto, Tulipa rota.
   - **Geolocalización GPS Nativa**: Botón `[📡 Capturar GPS Actual]` con indicación de precisión en metros ($\pm X$ m), latitud y longitud.
   - **Fotografías Integradas (Hasta 3 imágenes por poste)**:
     - Disparo directo de cámara móvil trasera (`capture="environment"`).
     - Compresión automática en el navegador (Canvas HTML5 a 1.280px, 0.75 JPEG, ~250 KB) para ahorro de cuota y envío ultrarrápido en redes móviles 3G/4G.
     - Vista previa interactiva en miniatura y opción de eliminación/reemplazo.
   - Observaciones técnicas libres por poste.
4. **Protección Anti-Pérdida por Recarga (LocalStorage Auto-Save)**:
   - Guardado automático en tiempo real en la memoria local del navegador.
   - Si la página se actualiza accidentalmente o el celular cierra la app, al abrirla se restaura automáticamente todo el relevamiento en curso (datos, GPS y fotos) con aviso visual y opción de descarte.
   - El borrador se purga de forma segura tras el envío exitoso o al iniciar un nuevo relevamiento.
5. **Base de Datos Plana en Google Sheets (17 Columnas)**:
   - 17 columnas normalizadas con una fila por cada poste relevado, repitiendo datos del medidor para facilitar analítica y cruces directos en Power BI o Qlik Sense.

---

## 📂 Estructura del Proyecto

```text
D:\Proyectos\relevamiento-alumbrado-publico-medidores\
├── README.md                                  # Documentación técnica general
├── INSTRUCTIVO_DESPLIEGUE_GOOGLE.md           # Guía paso a paso para desplegar en 5 minutos
├── index.html                                 # Web App para GitHub Pages (sin login)
├── docs\
│   ├── especificacion_funcional.md           # Diccionario de campos, 17 columnas y reglas
│   ├── guia_operativa_paso_a_paso.md         # Guía ilustrada en Markdown
│   ├── Guia_Paso_a_Paso_Relevamiento_Alumbrado_Publico.docx # Guía oficial en Word
│   ├── Mensaje_Email_Relevamiento_Alumbrado.txt # Mensaje para cuadrillas
│   └── img_guia\                             # Capturas de la Web App
├── src\
│   ├── Code.gs                               # Backend en Apps Script (Sheets + Drive API)
│   ├── Index.html                            # Frontend principal
│   ├── Styles.html                           # Estilos responsive mobile-first
│   ├── JavaScript.html                       # Lógica client-side (clonación, GPS, auto-save)
│   └── Bundle_Standalone_AppsScript.html     # Versión todo-en-uno lista para pegar en Apps Script
└── tests\
    └── test_payload_validation.py            # Suite de pruebas unitarias deterministas
```

---

## 🛠️ Despliegue Rápido
Consulte el documento [`INSTRUCTIVO_DESPLIEGUE_GOOGLE.md`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/INSTRUCTIVO_DESPLIEGUE_GOOGLE.md) para habilitar o actualizar la aplicación en la cuenta `relevamientocontrolgestion@gmail.com`.
