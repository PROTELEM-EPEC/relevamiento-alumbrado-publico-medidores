/**
 * ==============================================================================
 * SISTEMA DE RELEVAMIENTO DE ALUMBRADO PUBLICO VINCULADO A MEDIDORES
 * Google Apps Script Web App - Backend
 * Cuenta: relevamientocontrolgestion@gmail.com
 * Organizacion: PROTELEM-EPEC
 * ==============================================================================
 */

// Constantes de configuracion
const NOMBRE_HOJA_CALCULO = "Relevamiento_Alumbrado_Publico";
const NOMBRE_PESTANA = "Relevamientos_Plano";
const NOMBRE_CARPETA_DRIVE = "Fotos_Relevamiento_Alumbrado";

/**
 * Punto de entrada HTTP GET: Sirve la aplicacion web responsiva para moviles.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Relevamiento de Alumbrado Publico - EPEC")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Funcion auxiliar para incluir archivos HTML parciales si se utiliza estructura modular.
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
    // Eliminar Sheet1 por defecto si existe y no es la unica
    const sheets = spreadsheet.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() === "Hoja 1" || sheets[i].getName() === "Sheet1") {
        if (spreadsheet.getSheets().length > 1) {
          spreadsheet.deleteSheet(sheets[i]);
        }
      }
    }

  }

  // Encabezados del Modelo Plano Simplificado (1 fila por poste relevado - 17 columnas)
  const encabezados = [
    "ID_Registro",
    "Timestamp_Carga",
    "Fecha_Relevamiento",
    "Numero_Medidor",
    "Poste_Numero",
    "Cantidad_Lamparas",
    "Tipo_Luminaria",
    "Potencia_Luminaria",
    "Estado_Luminaria",
    "Latitud_GPS",
    "Longitud_GPS",
    "Precision_GPS_m",
    "Foto_1_URL",
    "Foto_2_URL",
    "Foto_3_URL",
    "Observaciones_Poste",
    "Total_Postes_Medidor"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(encabezados);
    const headerRange = sheet.getRange(1, 1, 1, encabezados.length);
    headerRange.setBackground("#1a365d");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  } else if (sheet.getLastColumn() === 16) {
    // Migracion automatica transparente si la hoja existia previamente con 16 columnas
    try {
      const col8Header = sheet.getRange(1, 8).getValue();
      if (col8Header === "Estado_Luminaria") {
        sheet.insertColumnAfter(7);
        const hCell = sheet.getRange(1, 8);
        hCell.setValue("Potencia_Luminaria");
        hCell.setBackground("#1a365d");
        hCell.setFontColor("#ffffff");
        hCell.setFontWeight("bold");
        hCell.setHorizontalAlignment("center");
      }
    } catch (eCols) {
      Logger.log("Aviso migracion columna Potencia_Luminaria: " + eCols.toString());
    }
  }

  return { spreadsheet: spreadsheet, sheet: sheet };
}

/**
 * Obtiene o crea la carpeta raiz en Google Drive para almacenar las fotos.
 */
function obtenerOCrearCarpetaDrive() {
  const folders = DriveApp.getFoldersByName(NOMBRE_CARPETA_DRIVE);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(NOMBRE_CARPETA_DRIVE);
}

/**
 * Obtiene o crea una subcarpeta especifica para el relevamiento del medidor.
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
 * @returns {Object} Respuesta con estado de exito o error.
 */
function procesarRelevamiento(data) {
  try {
    if (!data || !data.medidor || !data.postes || !Array.isArray(data.postes) || data.postes.length === 0) {
      throw new Error("Datos incompletos: se requiere numero de medidor y al menos un poste relevado.");
    }

    const lock = LockService.getScriptLock();
    // Esperar hasta 30 segundos para evitar colisiones de escritura simultanea
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

      // Procesamiento y guardado de imagenes en Google Drive
      const fotoUrls = ["", "", ""];
      if (p.fotos && Array.isArray(p.fotos)) {
        for (let j = 0; j < Math.min(p.fotos.length, 3); j++) {
          const f = p.fotos[j];
          if (f && f.base64) {
            try {
              let base64Data = f.base64;
              if (base64Data.indexOf("base64,") !== -1) {
                base64Data = base64Data.split("base64,")[1];
              }

              const contentType = f.mimeType || "image/jpeg";
              const decodedBytes = Utilities.base64Decode(base64Data);
              const nombreArchivo = "Medidor_" + data.medidor + "_Poste_" + numPoste + "_Foto_" + (j + 1) + "_" + Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "HHmmss") + ".jpg";

              const blob = Utilities.newBlob(decodedBytes, contentType, nombreArchivo);
              const driveFile = subcarpeta.createFile(blob);
              
              // Habilitar visualizacion de la imagen por enlace
              driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              fotoUrls[j] = driveFile.getUrl();
            } catch (errFoto) {
              fotoUrls[j] = "Error al guardar foto: " + errFoto.toString();
            }
          }
        }
      }

      // Preparacion de fila plana (adaptable a 17 cols estandar, 16 cols previa o legado de 23 cols)
      let fila;
      const numCols = sheet.getLastColumn();
      if (numCols === 23) {
        fila = [
          idRegistro,
          timestampNow,
          data.fecha || Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd"),
          String(data.medidor).trim(),
          "", "", "", "", "", // Lecturas E, EAR, EAP, EAV, ERT (removidas)
          numPoste,
          p.cantidadLamparas || 1,
          p.tipoLuminaria || "No especificado",
          p.estadoLuminaria || "No especificado",
          p.latitud !== undefined && p.latitud !== null ? p.latitud : "",
          p.longitud !== undefined && p.longitud !== null ? p.longitud : "",
          p.precision !== undefined && p.precision !== null ? p.precision : "",
          "", "", // Nomenclatura catastral y direccion (removidas)
          fotoUrls[0],
          fotoUrls[1],
          fotoUrls[2],
          p.observaciones || "",
          totalPostes
        ];
      } else if (numCols === 16) {
        fila = [
          idRegistro,
          timestampNow,
          data.fecha || Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd"),
          String(data.medidor).trim(),
          numPoste,
          p.cantidadLamparas || 1,
          p.tipoLuminaria || "No especificado",
          p.estadoLuminaria || "No especificado",
          p.latitud !== undefined && p.latitud !== null ? p.latitud : "",
          p.longitud !== undefined && p.longitud !== null ? p.longitud : "",
          p.precision !== undefined && p.precision !== null ? p.precision : "",
          fotoUrls[0],
          fotoUrls[1],
          fotoUrls[2],
          p.observaciones || "",
          totalPostes
        ];
      } else {
        // Modelo estandar actualizado de 17 columnas con Potencia_Luminaria
        fila = [
          idRegistro,
          timestampNow,
          data.fecha || Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd"),
          String(data.medidor).trim(),
          numPoste,
          p.cantidadLamparas || 1,
          p.tipoLuminaria || "No especificado",
          p.potenciaLuminaria || "",
          p.estadoLuminaria || "No especificado",
          p.latitud !== undefined && p.latitud !== null ? p.latitud : "",
          p.longitud !== undefined && p.longitud !== null ? p.longitud : "",
          p.precision !== undefined && p.precision !== null ? p.precision : "",
          fotoUrls[0],
          fotoUrls[1],
          fotoUrls[2],
          p.observaciones || "",
          totalPostes
        ];
      }

      filasAInsertar.push(fila);
    }

    // Escritura masiva en una sola operacion atomica
    if (filasAInsertar.length > 0) {
      const nextRow = sheet.getLastRow() + 1;
      const range = sheet.getRange(nextRow, 1, filasAInsertar.length, filasAInsertar[0].length);
      range.setValues(filasAInsertar);
    }

    lock.releaseLock();

    return {
      success: true,
      message: "Relevamiento registrado con exito. Se cargaron " + totalPostes + " poste(s).",
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
 * Funcion de prueba para verificar conectividad y creacion de componentes.
 */
function testCrearEstructura() {
  const sheetContext = obtenerOCrearHojaCalculo();
  const folder = obtenerOCrearCarpetaDrive();
  Logger.log("Planilla creada en: " + sheetContext.spreadsheet.getUrl());
  Logger.log("Carpeta de Drive: " + folder.getUrl());
}

/**
 * Punto de entrada HTTP POST: Permite envios via API REST o fetch desde cualquier origen.
 */
function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else {
      data = e.parameter;
    }
    var result = procesarRelevamiento(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Error en doPost: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Funcion utilitaria para actualizar los encabezados de la planilla al modelo limpio de 16 columnas.
 * Puede ejecutarse manualmente desde el editor de Apps Script si se desea resetear la cabecera.
 */
function actualizarEncabezadosANuevoModelo() {
  const sheetContext = obtenerOCrearHojaCalculo();
  const sheet = sheetContext.sheet;
  const encabezados = [
    "ID_Registro",
    "Timestamp_Carga",
    "Fecha_Relevamiento",
    "Numero_Medidor",
    "Poste_Numero",
    "Cantidad_Lamparas",
    "Tipo_Luminaria",
    "Estado_Luminaria",
    "Latitud_GPS",
    "Longitud_GPS",
    "Precision_GPS_m",
    "Foto_1_URL",
    "Foto_2_URL",
    "Foto_3_URL",
    "Observaciones_Poste",
    "Total_Postes_Medidor"
  ];
  sheet.clear();
  sheet.appendRow(encabezados);
  const headerRange = sheet.getRange(1, 1, 1, encabezados.length);
  headerRange.setBackground("#1a365d");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  Logger.log("Encabezados actualizados a 16 columnas con exito.");
}
