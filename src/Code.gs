/**
 * ==============================================================================
 * SISTEMA DE RELEVAMIENTO DE ALUMBRADO PUBLICO VINCULADO A MEDIDORES
 * Google Apps Script Web App - Backend (Versión 2.1)
 * Cuenta: relevamientocontrolgestion@gmail.com
 * Organización: PROTELEM-EPEC
 * ==============================================================================
 */

// Constantes de configuración
const NOMBRE_HOJA_CALCULO = "Relevamiento_Alumbrado_Publico";
const NOMBRE_PESTANA = "Relevamientos_Plano";
const NOMBRE_CARPETA_DRIVE = "Fotos_Relevamiento_Alumbrado";

/**
 * ==============================================================================
 * 🚀 FUNCIÓN DE ACTUALIZACIÓN INMEDIATA: actualizarEstructuraColumnas()
 * ------------------------------------------------------------------------------
 * Para actualizar la planilla en Google Drive YA MISMO sin tener que esperar a
 * enviar un relevamiento desde el celular:
 * 1. Selecciona 'actualizarEstructuraColumnas' en la barra superior de Apps Script.
 * 2. Haz clic en 'Ejecutar' (Run).
 * 3. La columna 'Potencia_Luminaria' se insertará de inmediato con formato azul.
 * ==============================================================================
 */
function actualizarEstructuraColumnas() {
  Logger.log("=== INICIANDO ACTUALIZACION DE COLUMNAS EN GOOGLE SHEETS ===");
  const ctx = obtenerOCrearHojaCalculo();
  const totalCols = ctx.sheet.getLastColumn();
  const headers = ctx.sheet.getRange(1, 1, 1, totalCols).getValues()[0];
  
  Logger.log("Planilla detectada: " + ctx.spreadsheet.getName());
  Logger.log("Pestaña activa: " + ctx.sheet.getName());
  Logger.log("Total columnas actuales: " + totalCols);
  Logger.log("Encabezados presentes: " + JSON.stringify(headers));
  
  const tienePotencia = headers.indexOf("Potencia_Luminaria") !== -1;
  if (tienePotencia) {
    Logger.log("✅ La columna 'Potencia_Luminaria' ya se encuentra presente en la posición " + (headers.indexOf("Potencia_Luminaria") + 1));
  } else {
    Logger.log("⚠️ Columna 'Potencia_Luminaria' no detectada. Se procederá a insertarla.");
  }
  
  return {
    success: true,
    totalColumnas: totalCols,
    tienePotencia: tienePotencia,
    posicionPotencia: headers.indexOf("Potencia_Luminaria") + 1,
    url: ctx.spreadsheet.getUrl()
  };
}

/**
 * Punto de entrada HTTP GET: Sirve la aplicación web responsiva para móviles.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Relevamiento de Alumbrado Publico - EPEC")
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
 * Obtiene o crea la planilla de Google Sheets centralizada y garantiza la columna Potencia_Luminaria.
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
  }

  // Encabezados del Modelo Plano Oficial (17 columnas)
  const encabezadosOficiales = [
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
    // Si la hoja está totalmente vacía, creamos los 17 encabezados oficiales
    sheet.appendRow(encabezadosOficiales);
    const headerRange = sheet.getRange(1, 1, 1, encabezadosOficiales.length);
    headerRange.setBackground("#1a365d");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    Logger.log("Hoja creada desde cero con los 17 encabezados oficiales.");
  } else {
    // La hoja ya tiene datos o encabezados previos: migración transparente no destructiva
    try {
      const lastCol = sheet.getLastColumn();
      if (lastCol > 0) {
        const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        const tienePotencia = headers.indexOf("Potencia_Luminaria") !== -1;

        if (!tienePotencia) {
          Logger.log("Detectada hoja sin 'Potencia_Luminaria'. Procediendo a insertar columna...");
          const idxTipo = headers.indexOf("Tipo_Luminaria");
          const idxEstado = headers.indexOf("Estado_Luminaria");

          let colDestino = 8;
          if (idxTipo !== -1) {
            // Insertar inmediatamente después de Tipo_Luminaria
            sheet.insertColumnAfter(idxTipo + 1);
            colDestino = idxTipo + 2;
          } else if (idxEstado !== -1) {
            // O inmediatamente antes de Estado_Luminaria
            sheet.insertColumnBefore(idxEstado + 1);
            colDestino = idxEstado + 1;
          } else {
            // Al final de las columnas existentes
            sheet.insertColumnAfter(lastCol);
            colDestino = lastCol + 1;
          }

          const hCell = sheet.getRange(1, colDestino);
          hCell.setValue("Potencia_Luminaria");
          hCell.setBackground("#1a365d");
          hCell.setFontColor("#ffffff");
          hCell.setFontWeight("bold");
          hCell.setHorizontalAlignment("center");
          Logger.log("Migración completada con éxito. 'Potencia_Luminaria' insertada en columna " + colDestino);
        }
      }
    } catch (eCols) {
      Logger.log("Aviso en verificación de columnas: " + eCols.toString());
    }
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
 * Mapea los valores dinámicamente según el nombre exacto de cada columna en la hoja.
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

    // Encabezados actuales en la hoja para mapeo dinámico inmune a desfasajes
    const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    for (let i = 0; i < data.postes.length; i++) {
      const p = data.postes[i];
      const idRegistro = Utilities.getUuid();
      const numPoste = i + 1;

      // Procesamiento seguro de imágenes Base64 hacia Drive
      const fotoUrls = ["", "", ""];
      if (p.fotos && Array.isArray(p.fotos)) {
        for (let j = 0; j < Math.min(p.fotos.length, 3); j++) {
          const rawBase64 = p.fotos[j];
          if (rawBase64 && typeof rawBase64 === "string" && rawBase64.indexOf("base64,") !== -1) {
            try {
              const base64Data = rawBase64.split("base64,")[1];
              const decodedBytes = Utilities.base64Decode(base64Data);
              const nombreArchivo = "Poste" + numPoste + "_Foto" + (j + 1) + "_" + Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyyMMdd_HHmmss") + ".jpg";
              const blob = Utilities.newBlob(decodedBytes, "image/jpeg", nombreArchivo);
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

      // Mapa completo de campos por nombre de columna
      const mapValores = {
        "ID_Registro": idRegistro,
        "Timestamp_Carga": timestampNow,
        "Fecha_Relevamiento": data.fecha || Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd"),
        "Numero_Medidor": String(data.medidor).trim(),
        "Poste_Numero": numPoste,
        "Cantidad_Lamparas": p.cantidadLamparas || 1,
        "Tipo_Luminaria": p.tipoLuminaria || "No especificado",
        "Potencia_Luminaria": p.potenciaLuminaria || "",
        "Estado_Luminaria": p.estadoLuminaria || "No especificado",
        "Latitud_GPS": (p.latitud !== undefined && p.latitud !== null) ? p.latitud : "",
        "Longitud_GPS": (p.longitud !== undefined && p.longitud !== null) ? p.longitud : "",
        "Precision_GPS_m": (p.precision !== undefined && p.precision !== null) ? p.precision : "",
        "Foto_1_URL": fotoUrls[0] || "",
        "Foto_2_URL": fotoUrls[1] || "",
        "Foto_3_URL": fotoUrls[2] || "",
        "Observaciones_Poste": p.observaciones || "",
        "Total_Postes_Medidor": totalPostes,
        // Compatibilidad con legado v1.0 si estuvieran presentes
        "Lectura_Energia_Activa_kWh": "",
        "Lectura_Reactiva_kvarh": "",
        "Potencia_Contratada_kW": "",
        "Potencia_Leida_kW": "",
        "Factor_Potencia_CosPhi": "",
        "Nomenclatura_Catastral": "",
        "Direccion_Aproximada": ""
      };

      // Inserción posicional exacta por coincidencia de nombre de encabezado
      const fila = actualHeaders.map(function(headerName) {
        const key = String(headerName).trim();
        return mapValores.hasOwnProperty(key) ? mapValores[key] : "";
      });

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
      message: "Relevamiento registrado con éxito. Se cargaron " + totalPostes + " poste(s).",
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

/**
 * Punto de entrada HTTP POST: Permite envíos vía API REST o fetch desde cualquier origen.
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
 * Función utilitaria si se desea resetear los encabezados completamente al modelo de 17 columnas.
 * ATENCIÓN: Solo utilizar si se desea limpiar y reiniciar la planilla desde cero.
 */
function resetearEncabezadosA17Columnas() {
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
  sheet.clear();
  sheet.appendRow(encabezados);
  const headerRange = sheet.getRange(1, 1, 1, encabezados.length);
  headerRange.setBackground("#1a365d");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  Logger.log("Encabezados reiniciados a 17 columnas con éxito.");
}
