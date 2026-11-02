"""
==============================================================================
Test Determinista de Validación de Datos y Payload (QA Instancia 1)
Sistema: Relevamiento de Alumbrado Público y Medidores
Cuenta: relevamientocontrolgestion@gmail.com
==============================================================================
"""

import unittest
import json
import re
from datetime import datetime

class TestRelevamientoPayload(unittest.TestCase):

    def setUp(self):
        # Mock de payload completo generado por el frontend
        self.sample_payload = {
            "fecha": "2026-11-02",
            "medidor": "72677900",
            "lecturas": {
                "E": "12540.5",
                "EAR": "8200.0",
                "EAP": "2140.2",
                "EAV": "2200.3",
                "ERT": "1450.8"
            },
            "postes": [
                {
                    "numeroPoste": 1,
                    "cantidadLamparas": 2,
                    "tipoLuminaria": "LED",
                    "estadoLuminaria": "Todas Encienden",
                    "latitud": -31.420083,
                    "longitud": -64.188776,
                    "precision": 8,
                    "nomenclaturaCatastral": "Distrito 1, Manzana 14, Parcela 08",
                    "direccionReferencia": "Av. Colón 1250",
                    "fotos": [
                        {"base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg==", "mimeType": "image/jpeg"},
                        {"base64": "/9j/4AAQSkZJRg==", "mimeType": "image/jpeg"}
                    ],
                    "observaciones": "Poste de hormigón en buen estado"
                },
                {
                    "numeroPoste": 2,
                    "cantidadLamparas": 1,
                    "tipoLuminaria": "Sodio Alta Presion (SAP)",
                    "estadoLuminaria": "Apagada / Fuera de Servicio",
                    "latitud": -31.420450,
                    "longitud": -64.189100,
                    "precision": 12,
                    "nomenclaturaCatastral": "Distrito 1, Manzana 14, Parcela 10",
                    "direccionReferencia": "Av. Colón 1280",
                    "fotos": [
                        {"base64": "/9j/4AAQSkZJRg==", "mimeType": "image/jpeg"}
                    ],
                    "observaciones": "Lámpara quemada, requiere recambio a LED"
                }
            ]
        }

        # Lista de 23 columnas de la estructura plana en Google Sheets
        self.expected_columns = [
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
        ]

    def test_cabecera_medidor(self):
        """Verifica que el número de medidor y la fecha sean válidos."""
        self.assertTrue(bool(self.sample_payload.get("medidor")), "El número de medidor no debe estar vacío")
        fecha = self.sample_payload.get("fecha")
        try:
            datetime.strptime(fecha, "%Y-%m-%d")
        except ValueError:
            self.fail(f"La fecha '{fecha}' no tiene formato ISO válido YYYY-MM-DD")

    def test_lecturas_electricas(self):
        """Verifica que los campos de lecturas E, EAR, EAP, EAV, ERT existan y sean convertibles a float o vacíos."""
        lecturas = self.sample_payload.get("lecturas", {})
        for campo in ["E", "EAR", "EAP", "EAV", "ERT"]:
            val = lecturas.get(campo)
            if val is not None and val != "":
                try:
                    num = float(val)
                    self.assertGreaterEqual(num, 0, f"La lectura {campo} debe ser >= 0")
                except ValueError:
                    self.fail(f"El campo {campo} ('{val}') no es numérico válido")

    def test_postes_relevamiento(self):
        """Verifica la integridad de cada poste relevado."""
        postes = self.sample_payload.get("postes", [])
        self.assertGreater(len(postes), 0, "Debe existir al menos 1 poste relevado")
        
        for idx, p in enumerate(postes, start=1):
            self.assertEqual(p.get("numeroPoste"), idx, f"El número de poste debe ser secuencial {idx}")
            self.assertGreaterEqual(p.get("cantidadLamparas", 0), 1, "Cada poste debe tener al menos 1 lámpara")
            self.assertIn(p.get("tipoLuminaria"), [
                "LED", "Sodio Alta Presion (SAP)", "Vapor de Mercurio", "Mezcladora", "Otro"
            ])
            self.assertIn(p.get("estadoLuminaria"), [
                "Todas Encienden", "Apagada / Fuera de Servicio", "Enciende Parcialmente",
                "Titilando / Falla Balasto", "Tulipa / Artefacto Roto"
            ])
            # Fotos: hasta 3 fotos
            fotos = p.get("fotos", [])
            self.assertLessEqual(len(fotos), 3, "No se permiten más de 3 fotos por poste")
            
            # Coordenadas geográficas válidas para Argentina si están presentes
            lat = p.get("latitud")
            lng = p.get("longitud")
            if lat is not None and lng is not None:
                self.assertTrue(-55.0 <= lat <= -20.0, f"Latitud {lat} fuera del rango argentino")
                self.assertTrue(-75.0 <= lng <= -50.0, f"Longitud {lng} fuera del rango argentino")

    def test_serializacion_plana_google_sheets(self):
        """Simula la serialización de filas planas hacia Google Sheets y comprueba coincidencia de 23 columnas."""
        payload = self.sample_payload
        total_postes = len(payload["postes"])
        filas = []

        for p in payload["postes"]:
            # Simular URLs de Drive para hasta 3 fotos
            fotos_urls = ["", "", ""]
            for i, f in enumerate(p.get("fotos", [])):
                if i < 3:
                    fotos_urls[i] = f"https://drive.google.com/file/d/mock_{i+1}/view"

            fila = [
                "mock-uuid-1234",
                "2026-11-02 12:30:00",
                payload["fecha"],
                str(payload["medidor"]),
                payload["lecturas"].get("E", ""),
                payload["lecturas"].get("EAR", ""),
                payload["lecturas"].get("EAP", ""),
                payload["lecturas"].get("EAV", ""),
                payload["lecturas"].get("ERT", ""),
                p["numeroPoste"],
                p["cantidadLamparas"],
                p["tipoLuminaria"],
                p["estadoLuminaria"],
                p.get("latitud", ""),
                p.get("longitud", ""),
                p.get("precision", ""),
                p.get("nomenclaturaCatastral", ""),
                p.get("direccionReferencia", ""),
                fotos_urls[0],
                fotos_urls[1],
                fotos_urls[2],
                p.get("observaciones", ""),
                total_postes
            ]
            self.assertEqual(len(fila), len(self.expected_columns), 
                             f"La fila debe tener exactamente {len(self.expected_columns)} columnas")
            filas.append(fila)

        self.assertEqual(len(filas), 2, "Deben generarse 2 filas planas para 2 postes relevados")

if __name__ == "__main__":
    unittest.main()

