# 🚀 Guía de Despliegue en Cuenta de Google (Paso a Paso)

**Cuenta de Destino**: `relevamientocontrolgestion@gmail.com`  
**Tiempo estimado de despliegue**: Menos de 5 minutos  
**Archivos a utilizar**:
- [`src/Code.gs`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Code.gs) (Lógica de Backend)
- [`src/Bundle_Standalone_AppsScript.html`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Bundle_Standalone_AppsScript.html) (Frontend completo todo-en-uno)

---

## 📋 Pasos para Desplegar la Web App

### Paso 1: Iniciar Sesión en la Cuenta de Google
1. Abra su navegador (Chrome preferentemente) en modo incógnito o en una ventana con la cuenta activa:
   - **Correo**: `relevamientocontrolgestion@gmail.com`
   - **Contraseña**: `CONTROLgestion2026`

---

### Paso 2: Crear el Proyecto en Google Apps Script
1. Ingrese a: [https://script.google.com](https://script.google.com)
2. Haga clic en el botón superior izquierdo: **`+ Nuevo proyecto`**.
3. En la parte superior, haga clic en *"Proyecto sin título"* y cámbielo a:  
   **`Relevamiento Alumbrado Publico`**.

---

### Paso 3: Pegar el Código del Backend (`Code.gs`)
1. En el editor de Apps Script, verá a la izquierda el archivo `Código.gs` (o `Code.gs`).
2. Borre todo el contenido existente dentro de `Código.gs`.
3. Abra el archivo local [`src/Code.gs`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Code.gs), copie **todo** su contenido y péguelo en el editor.
4. Presione el ícono de **Guardar** (Ctrl + S o el disquete).

---

### Paso 4: Crear el Archivo HTML (`Index.html`)
1. En el menú lateral izquierdo de Apps Script, haga clic en el botón **`+`** (al lado de *"Archivos"*).
2. Seleccione **`HTML`**.
3. Escriba exactamente el nombre: **`Index`** (sin la extensión `.html`) y presione Enter.
4. Borre el contenido que viene por defecto en `Index.html`.
5. Abra el archivo local [`src/Bundle_Standalone_AppsScript.html`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Bundle_Standalone_AppsScript.html), copie **todo** su contenido y péguelo dentro de `Index.html`.
6. Presione el ícono de **Guardar** (Ctrl + S).

---

### Paso 5: Implementar como Aplicación Web (Deploy)
1. En la esquina superior derecha de Apps Script, haga clic en el botón azul **`Implementar`** (o *Deploy*) y seleccione **`Nueva implementación`**.
2. En la ventana emergente, haga clic en el ícono de engranaje ⚙️ junto a *"Seleccionar tipo"* y elija **`Aplicación web`**.
3. Complete los siguientes campos:
   - **Descripción**: `Versión 1.0 - Formulario Relevamiento Alumbrado Móvil`
   - **Ejecutar como**: `Yo (relevamientocontrolgestion@gmail.com)`
   - **Quién tiene acceso**: `Cualquiera` (o *Anyone*) *(Permite que las personas en la calle carguen datos desde su celular sin obligarlos a iniciar sesión de Google)*.
4. Haga clic en el botón **`Implementar`**.

---

### Paso 6: Autorizar Permisos (Primera y Única Vez)
1. Google mostrará una ventana pidiendo **"Autorizar acceso"**. Haga clic en **`Revisar permisos`**.
2. Seleccione la cuenta `relevamientocontrolgestion@gmail.com`.
3. Si Google muestra una pantalla de *"Google no ha verificado esta aplicación"*, haga clic en **`Configuración avanzada`** (abajo a la izquierda) y luego en **`Ir a Relevamiento Alumbrado Publico (no seguro)`**.
4. En la siguiente pantalla, haga clic en **`Permitir`**. *(Esto otorga permiso a su script para crear la hoja de cálculo en su Google Drive y guardar las fotos en su carpeta)*.

---

### Paso 7: Obtener y Compartir el Enlace Web
1. Apps Script le proporcionará la **URL de la aplicación web** (termina en `/exec`).
2. ¡Ese es el enlace definitivo!
3. Puede abrirlo en el celular de la persona en la calle, enviarlo por WhatsApp o generar un código QR para acceso instantáneo.

---

## 📊 ¿Dónde se Guardan los Datos Automáticamente?

1. **Google Sheets**:
   - En el Google Drive de la cuenta aparecerá automáticamente la planilla:  
     📄 **`Relevamiento_Alumbrado_Publico`**  
     Pestaña: **`Relevamientos_Plano`** con las 23 columnas cargadas en tiempo real.
2. **Google Drive**:
   - En el Drive de la cuenta se creará la carpeta:  
     📁 **`Fotos_Relevamiento_Alumbrado/`**  
     Con subcarpetas ordenadas por número de medidor y fecha (ej. `Medidor_72677900_20261102/`), con todas las fotos JPG organizadas y con enlaces directos en la planilla.

