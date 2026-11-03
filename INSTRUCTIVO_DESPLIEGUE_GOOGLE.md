# 🚀 Guía de Despliegue y Actualización en Google Apps Script (Paso a Paso)

**Cuenta de Destino**: `relevamientocontrolgestion@gmail.com`  
**Versión Actual**: `2.1` (Persistencia LocalStorage Anti-Pérdida por Recarga + Potencia en Watts)  
**Tiempo estimado de despliegue**: Menos de 3 minutos  
**Archivos a utilizar**:
- [`src/Code.gs`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Code.gs) (Lógica de Backend - 17 columnas con auto-migración)
- [`src/Bundle_Standalone_AppsScript.html`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Bundle_Standalone_AppsScript.html) (Frontend completo todo-en-uno)

---

## 📋 Modalidad 1: Actualizar un Proyecto Existente a la Versión 2.1 (Recomendado)

Si ya desplegaste previamente la aplicación en Apps Script, sigue estos pasos para actualizarla sin cambiar el enlace `/exec`:

### Paso 1: Iniciar Sesión e Ingresar al Proyecto
1. Ingrese a: [https://script.google.com/home](https://script.google.com/home) con la cuenta `relevamientocontrolgestion@gmail.com`.
2. Abra el proyecto existente **`Relevamiento Alumbrado Publico`**.

### Paso 2: Actualizar el Backend (`Código.gs`)
1. En el menú de archivos de la izquierda, seleccione `Código.gs` (o `Code.gs`).
2. Seleccione todo (`Ctrl + A`), bórrelo y pegue el contenido completo de [`src/Code.gs`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Code.gs).
3. Presione `Ctrl + S` para guardar.

### Paso 3: Actualizar el Frontend (`Index.html`)
1. En el menú de archivos de la izquierda, seleccione `Index.html`.
2. Seleccione todo (`Ctrl + A`), bórrelo y pegue el contenido completo de [`src/Bundle_Standalone_AppsScript.html`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Bundle_Standalone_AppsScript.html).
3. Presione `Ctrl + S` para guardar.

### Paso 4: Publicar la Nueva Versión
1. En la esquina superior derecha, haga clic en el botón azul **`Implementar`** (o *Deploy*).
2. Seleccione **`Administrar implementaciones`** (o *Manage deployments*).
3. Seleccione la implementación activa y haga clic en el ícono del lápiz ✏️ (**Editar**).
4. En el desplegable **Versión**, seleccione **`Nueva versión`** (New version).
5. En la descripción coloque: `v2.1 - Persistencia y Potencia de Luminaria`.
6. Haga clic en **`Implementar`** y luego en **`Listo`**.

*(¡Listo! La URL pública existente `/exec` queda actualizada inmediatamente para todos los celulares de las cuadrillas).*

---

## 📋 Modalidad 2: Despliegue Inicial Desde Cero

Si es la primera vez que se crea el proyecto en una cuenta nueva de Google:

### Paso 1: Iniciar Sesión en la Cuenta de Google
1. Abra su navegador en la cuenta:
   - **Correo**: `relevamientocontrolgestion@gmail.com`
   - **Contraseña**: `CONTROLgestion2026`

### Paso 2: Crear el Proyecto en Google Apps Script
1. Ingrese a: [https://script.google.com](https://script.google.com)
2. Haga clic en **`+ Nuevo proyecto`**.
3. Cambie *"Proyecto sin título"* por: **`Relevamiento Alumbrado Publico`**.

### Paso 3: Pegar el Código del Backend (`Code.gs`)
1. Borre el contenido de `Código.gs`.
2. Pegue todo el contenido del archivo local [`src/Code.gs`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Code.gs).
3. Guarde con `Ctrl + S`.

### Paso 4: Crear el Archivo HTML (`Index.html`)
1. Haga clic en el botón **`+`** junto a *"Archivos"* y elija **`HTML`**.
2. Nombre del archivo: **`Index`** (sin `.html`).
3. Borre el contenido por defecto y pegue todo el contenido del archivo local [`src/Bundle_Standalone_AppsScript.html`](file:///D:/Proyectos/relevamiento-alumbrado-publico-medidores/src/Bundle_Standalone_AppsScript.html).
4. Guarde con `Ctrl + S`.

### Paso 5: Implementar como Aplicación Web (Deploy)
1. En la esquina superior derecha, haga clic en **`Implementar`** -> **`Nueva implementación`**.
2. En el engranaje ⚙️ seleccione **`Aplicación web`**.
3. Complete:
   - **Descripción**: `v2.1 - Formulario Relevamiento Alumbrado Móvil`
   - **Ejecutar como**: `Yo (relevamientocontrolgestion@gmail.com)`
   - **Quién tiene acceso**: `Cualquiera` (o *Anyone*) *(Permite carga en campo sin obligar inicio de sesión Google)*.
4. Haga clic en **`Implementar`**.

### Paso 6: Autorizar Permisos (Primera Vez)
1. En la ventana *"Autorizar acceso"*, haga clic en **`Revisar permisos`**.
2. Seleccione `relevamientocontrolgestion@gmail.com`.
3. Haga clic en **`Configuración avanzada`** -> **`Ir a Relevamiento Alumbrado Publico (no seguro)`** -> **`Permitir`**.

---

## 📊 ¿Dónde se Guardan los Datos Automáticamente?

1. **Google Sheets**:
   - Planilla automática en Drive: 📄 **`Relevamiento_Alumbrado_Publico`**
   - Pestaña: **`Relevamientos_Plano`** con **17 columnas** normalizadas (incluyendo `Potencia_Luminaria` en columna 8).
2. **Google Drive**:
   - Carpeta automática: 📁 **`Fotos_Relevamiento_Alumbrado/`**
   - Organizada en subcarpetas por medidor y fecha (ej. `Medidor_72677900_20261103/`), fotos comprimidas optimizadas y con enlaces directos en la planilla.
