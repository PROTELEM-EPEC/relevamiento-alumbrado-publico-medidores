# -*- coding: utf-8 -*-
"""
Script para actualizar la Guía Oficial en Word (.docx) a la versión 2.1
Incorpora:
- Protección Anti-Pérdida por Recarga de Pantalla (Auto-Save en LocalStorage)
- Menú Desplegable Opcional de Potencia en Watts (50W, 100W, 150W, 200W, 250W)
- Respuestas a Preguntas Frecuentes sobre Recarga de Página y Uso Concurrente Multicelular
"""
import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

SRC_DOCX = r"D:\Proyectos\relevamiento-alumbrado-publico-medidores\docs\Guia_Paso_a_Paso_Relevamiento_Alumbrado_Publico.docx"
DST_DOCX = r"C:\Users\jidiaz\Downloads\Guia_Paso_a_Paso_Relevamiento_Alumbrado_Publico.docx"

doc = docx.Document(SRC_DOCX)

# Actualizar P[1] subtítulo
for p in doc.paragraphs:
    if "Instructivo Ilustrado para Cuadrillas" in p.text:
        p.text = "Instructivo Ilustrado para Cuadrillas Técnicas y Operadores de Campo - Versión 2.1"
        p.style = "Subtitle"
        break

# Encontrar P[9] (último item de características de sección 1) y agregar las 2 nuevas mejoras
for i, p in enumerate(doc.paragraphs):
    if "Centralizaci" in p.text and "Google Sheets" in p.text:
        # Insertar después de este párrafo
        p_auto = doc.paragraphs[i].insert_paragraph_before()
        p_auto.text = "• Protección Anti-Pérdida por Recarga (Auto-Save Local): Si la pantalla se refresca involuntariamente o el teléfono cierra el navegador para liberar memoria, la aplicación recupera de forma automática todos los datos y fotos cargados sin perder nada del relevamiento en curso."
        p_auto.style = "List Bullet"
        
        p_pot = doc.paragraphs[i].insert_paragraph_before()
        p_pot.text = "• Menú Opcional de Potencia en Watts: Selector desplegable para registrar la potencia del artefacto (50W, 100W, 150W, 200W, 250W)."
        p_pot.style = "List Bullet"
        break

# Actualizar Paso 1: agregar mención de restauración de borrador
for p in doc.paragraphs:
    if "En la tarjeta '1. Datos del Medidor Instalado':" in p.text:
        p.text = p.text + "\n3. Restauración Automática de Borrador: Si la pantalla se cerró o recargó accidentalmente mientras relevaba datos de postes, la aplicación mostrará automáticamente un aviso informativo celeste indicando que el relevamiento en curso fue recuperado íntegramente con todos sus datos y fotografías."
        break

# Actualizar Paso 2: agregar ítem de Potencia de Luminaria
for p in doc.paragraphs:
    if "Debajo de la cabecera se encuentra la tarjeta correspondiente al Poste #1" in p.text:
        nuevo_texto = (
            "Debajo de la cabecera se encuentra la tarjeta correspondiente al Poste #1. En esta sección debe tipificar las características físicas de las luminarias instaladas en el poste:\n\n"
            "1. Cantidad de Lámparas Conectadas: Utilice los botones ergonómicos [-] y [+] para sumar o restar lámparas rápidamente sin necesidad de tipear (ej. 1, 2, 3 o 4 brazos/luminarias).\n"
            "2. Tipo / Tecnología de Luminaria: Seleccione en el menú desplegable la tecnología instalada:\n"
            "   • LED (Eficiente - Luz blanca)\n"
            "   • Sodio Alta Presión (SAP - Luz naranja tradicional)\n"
            "   • Vapor de Mercurio (Luz blanca antigua)\n"
            "   • Lámpara Mezcladora / Otra\n"
            "3. Potencia de la Luminaria (Opcional): Despliegue el selector para indicar los Watts del artefacto:\n"
            "   • 50W\n"
            "   • 100W\n"
            "   • 150W\n"
            "   • 200W\n"
            "   • 250W\n"
            "   (Si no se visualiza con certeza en la tulipa, puede dejarse sin especificar).\n"
            "4. Estado Operativo de las Lámparas: Indique el diagnóstico visual:\n"
            "   • Todas Encienden Correctamente\n"
            "   • Apagada / Fuera de Servicio\n"
            "   • Enciende Parcialmente\n"
            "   • Titilando / Falla Balasto\n"
            "   • Tulipa o Carcasa Dañada"
        )
        p.text = nuevo_texto
        break

# Agregar preguntas frecuentes al final de la sección 4
p_faq1 = doc.add_paragraph()
p_faq1.add_run("• ¿Qué sucede si la persona actualiza la página o se cierra el navegador mientras carga datos de postes?").bold = True
p_faq1_ans = doc.add_paragraph(
    "En la versión 2.1 no se pierde ningún dato. Cada modificación en los datos del medidor, postes, tecnología, potencia, estado operativo, coordenadas GPS y fotografías se resguarda en tiempo real en la memoria local del teléfono (LocalStorage). Al reabrir o recargar la página, la aplicación detecta el borrador pendiente, restaura todos los postes y despliega un aviso celeste confirmando la recuperación."
)

p_faq2 = doc.add_paragraph()
p_faq2.add_run("• ¿Esta aplicación web se puede usar en varios celulares al mismo tiempo?").bold = True
p_faq2_ans = doc.add_paragraph(
    "¡Sí, totalmente! Cada cuadrilla o técnico opera desde su celular de forma 100% independiente. No existen sesiones compartidas ni bloqueos por concurrencia. Cada vez que una cuadrilla presiona [Guardar y Enviar], los datos de sus postes se insertan de forma atómica como filas individuales en la planilla central de Google Sheets ('Relevamientos_Plano') y sus fotografías se suben a la carpeta central de Google Drive sin interferir con las cargas de otros usuarios."
)

# Guardar en docs
doc.save(SRC_DOCX)
print("Actualizado exitosamente:", SRC_DOCX)

# Copiar a Descargas
shutil.copyfile(SRC_DOCX, DST_DOCX)
print("Copiado exitosamente a:", DST_DOCX)
