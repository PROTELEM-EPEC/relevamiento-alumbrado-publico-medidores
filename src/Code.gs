/**
 * ==============================================================================
 * SISTEMA DE RELEVAMIENTO DE ALUMBRADO PÚBLICO VINCULADO A MEDIDORES
 * Google Apps Script Web App - Backend
 * Cuenta: relevamientocontrolgestion@gmail.com
 * ==============================================================================
 */

// Constantes de configuración
const NOMBRE_HOJA_CALCULO = "Relevamiento_Alumbrado_Publico";
const NOMBRE_PESTANA = "Relevamientos_Plano";
const NOMBRE_CARPETA_DRIVE = "Fotos_Relevamiento_Alumbrado";

/**
 * Punto de entrada HTTP GET: Sirve la aplicación web responsiva para móviles.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Relevamiento de Alumbrado Público - EPEC")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Función auxiliar para incluir archivos HTML parciales si se utiliza estructura modular.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Obtiene o crea la planilla de Google Sheets centralizada.
 */
function obtenerOCrearHojaCalculo() {
  const files = DriveApp.getFilesByName(NOMBRE_HOJA_CALCULO);
  let spreadsheet;

  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    spreadsheet = SpreadsheetApp.create(NOMBRE_HOJA_CALCULO);
  }

  let sheet = spreadsheet.getSheetByName(NOMBRE_PESTANA);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(NOMBRE_PESTANA);
    // Eliminar Sheet1 por defecto si existe y no es la única
    const sheets = spreadsheet.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() === "Hoja 1" || sheets[i].getName() === "Sheet1") {
        if (spreadsheet.getSheets().length > 1) {
          spreadsheet.deleteSheet(sheets[i]);
        }
      }
    }

    // Encabezados del Modelo Plano (1 fila por poste relevado)
    const encabezados = [
      "ID_Registro",
      "Timestamp_Carga",
      "Fecha_Relevamiento",
      "Numero_Medidor",
      "Lectura_E_Activa",
      "Lectura_EAR_Resto",
      "Lectura_EAP_Pico",
      "Lectura_EAV_Valle",
      "Lectura_ERT_Reactiva",
      "Poste_Numero",
      "Cantidad_Lamparas",
      "Tipo_Luminaria",
      "Estado_Luminaria",
      "Latitud_GPS",
      "Longitud_GPS",
      "Precision_GPS_m",
      "Nomenclatura_Catastral",
      "Direccion_Referencia",
      "Foto_1_URL",
      "Foto_2_URL",
      "Foto_3_URL",
      "Observaciones_Poste",
      "Total_Postes_Medidor"
    ];

    sheet.appendRow(encabezados);
    const headerRange = sheet.getRange(1, 1, 1, encabezados.length);
    headerRange.setBackground("#1a365d");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  return { spreadsheet: spreadsheet, sheet: sheet };
}

/**
 * Obtiene o crea la carpeta raíz en Google Drive para almacenar las fotos.
 */
function obtenerOCrearCarpetaDrive() {
  const folders = DriveApp.getFoldersByName(NOMBRE_CARPETA_DRIVE);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(NOMBRE_CARPETA_DRIVE);
}

/**
 * Obtiene o crea una subcarpeta específica para el relevamiento del medidor.
 */
function obtenerSubcarpetaMedidor(carpetaRaiz, medidor, fecha) {
  const nombreSubcarpeta = "Medidor_" + medidor + "_" + fecha.replace(/-/g, "");
  const subfolders = carpetaRaiz.getFoldersByName(nombreSubcarpeta);
  if (subfolders.hasNext()) {
    return subfolders.next();
  }
  return carpetaRaiz.createFolder(nombreSubcarpeta);
}

/**
 * Procesa y registra el relevamiento completo enviado desde el formulario web.
 * @param {Object} data Datos estructurados con medidor, lecturas y array de postes.
 * @returns {Object} Respuesta con estado de éxito o error.
 */
function procesarRelevamiento(data) {
  try {
    if (!data || !data.medidor || !data.postes || !Array.isArray(data.postes) || data.postes.length === 0) {
      throw new Error("Datos incompletos: se requiere número de medidor y al menos un poste relevado.");
    }

    const lock = LockService.getScriptLock();
    // Esperar hasta 30 segundos para evitar colisiones de escritura simultánea
    lock.waitLock(30000);

    const sheetContext = obtenerOCrearHojaCalculo();
    const sheet = sheetContext.sheet;
    const carpetaRaiz = obtenerOCrearCarpetaDrive();
    const subcarpeta = obtenerSubcarpetaMedidor(carpetaRaiz, data.medidor, data.fecha || Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd"));

    const timestampNow = Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd HH:mm:ss");
    const totalPostes = data.postes.length;
    const filasAInsertar = [];

    for (let i = 0; i < data.postes.length; i++) {
      const p = data.postes[i];
      const idRegistro = Utilities.getUuid();
      const numPoste = p.numeroPoste || (i + 1);

      // Procesamiento y guardado de imágenes en Google Drive
      const fotoUrls = ["", "", ""];
      if (p.fotos && Array.isArray(p.fotos)) {
        for (let j = 0; j < Math.min(p.fotos.length, 3); j++) {
          const f = p.fotos[j];
          if (f && f.base64) {
            try {
              // Limpiar data URI si viene presente
              let base64Data = f.base64;
              if (base64Data.indexOf("base64,") !== -1) {
                base64Data = base64Data.split("base64,")[1];
              }

              const contentType = f.mimeType || "image/jpeg";
              const decodedBytes = Utilities.base64Decode(base64Data);
              const nombreArchivo = "Medidor_" + data.medidor + "_Poste_" + numPoste + "_Foto_" + (j + 1) + "_" + Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "HHmmss") + ".jpg";

              const blob = Utilities.newBlob(decodedBytes, contentType, nombreArchivo);
              const driveFile = subcarpeta.createFile(blob);
              
              // Habilitar visualización de la imagen por enlace
              driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              fotoUrls[j] = driveFile.getUrl();
            } catch (errFoto) {
              fotoUrls[j] = "Error al guardar foto: " + errFoto.toString();
            }
          }
        }
      }

      // Preparación de fila plana
      const fila = [
        idRegistro,
        timestampNow,
        data.fecha || Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd"),
        String(data.medidor).trim(),
        data.lecturas && data.lecturas.E !== undefined ? data.lecturas.E : "",
        data.lecturas && data.lecturas.EAR !== undefined ? data.lecturas.EAR : "",
        data.lecturas && data.lecturas.EAP !== undefined ? data.lecturas.EAP : "",
        data.lecturas && data.lecturas.EAV !== undefined ? data.lecturas.EAV : "",
        data.lecturas && data.lecturas.ERT !== undefined ? data.lecturas.ERT : "",
        numPoste,
        p.cantidadLamparas || 1,
        p.tipoLuminaria || "No especificado",
        p.estadoLuminaria || "No especificado",
        p.latitud !== undefined && p.latitud !== null ? p.latitud : "",
        p.longitud !== undefined && p.longitud !== null ? p.longitud : "",
        p.precision !== undefined && p.precision !== null ? p.precision : "",
        p.nomenclaturaCatastral || "",
        p.direccionReferencia || "",
        fotoUrls[0],
        fotoUrls[1],
        fotoUrls[2],
        p.observaciones || "",
        totalPostes
      ];

      filasAInsertar.push(fila);
    }

    // Escritura masiva en una sola operación atómica
    if (filasAInsertar.length > 0) {
      const nextRow = sheet.getLastRow() + 1;
      const range = sheet.getRange(nextRow, 1, filasAInsertar.length, filasAInsertar[0].length);
      range.setValues(filasAInsertar);
    }

    lock.releaseLock();

    return {
      success: true,
      message: "¡Relevamiento registrado con éxito! Se cargaron " + totalPostes + " poste(s).",
      totalPostes: totalPostes,
      sheetUrl: sheetContext.spreadsheet.getUrl(),
      folderUrl: subcarpeta.getUrl()
    };

  } catch (error) {
    return {
      success: false,
      message: "Error al procesar el relevamiento: " + error.toString()
    };
  }
}

/**
 * Función de prueba para verificar conectividad y creación de componentes.
 */
function testCrearEstructura() {
  const sheetContext = obtenerOCrearHojaCalculo();
  const folder = obtenerOCrearCarpetaDrive();
  Logger.log("Planilla creada en: " + sheetContext.spreadsheet.getUrl());
  Logger.log("Carpeta de Drive: " + folder.getUrl());
}

