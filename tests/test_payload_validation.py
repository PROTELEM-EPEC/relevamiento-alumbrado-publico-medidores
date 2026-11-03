"""
==============================================================================
Test Determinista de Validación de Datos y Payload (QA Instancia 1)
Sistema: Relevamiento de Alumbrado Público y Medidores
Cuenta: relevamientocontrolgestion@gmail.com
Versión: 2.1 (Persistencia de borrador en LocalStorage y Potencia de Luminaria)
==============================================================================
"""

import unittest
import json
from datetime import datetime

class TestRelevamientoPayload(unittest.TestCase):

    def setUp(self):
        # Payload estructurado generado por el formulario con nuevo campo potenciaLuminaria
        self.sample_payload = {
            "fecha": "2026-11-03",
            "medidor": "72677900",
            "postes": [
                {
                    "numeroPoste": 1,
                    "cantidadLamparas": 2,
                    "tipoLuminaria": "LED",
                    "potenciaLuminaria": "150W",
                    "estadoLuminaria": "Todas Encienden",
                    "latitud": -31.420083,
                    "longitud": -64.188776,
                    "precision": 8,
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
                    "potenciaLuminaria": "100W",
                    "estadoLuminaria": "Apagada / Fuera de Servicio",
                    "latitud": -31.420450,
                    "longitud": -64.189100,
                    "precision": 12,
                    "fotos": [
                        {"base64": "/9j/4AAQSkZJRg==", "mimeType": "image/jpeg"}
                    ],
                    "observaciones": "Lámpara quemada, requiere recambio a LED"
                }
            ]
        }

        # Lista de 17 columnas del Modelo Plano en Google Sheets (incluye Potencia_Luminaria)
        self.expected_columns = [
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
        ]

    def test_cabecera_medidor(self):
        """Verifica que el número de medidor y la fecha sean válidos."""
        self.assertTrue(bool(self.sample_payload.get("medidor")), "El número de medidor no debe estar vacío")
        fecha = self.sample_payload.get("fecha")
        try:
            datetime.strptime(fecha, "%Y-%m-%d")
        except ValueError:
            self.fail(f"La fecha '{fecha}' no tiene formato ISO válido YYYY-MM-DD")

    def test_ausencia_campos_removidos(self):
        """Verifica que no se requieran campos de lecturas ni catastro en el payload simplificado."""
        self.assertNotIn("lecturas", self.sample_payload)
        for p in self.sample_payload.get("postes", []):
            self.assertNotIn("nomenclaturaCatastral", p)
            self.assertNotIn("direccionReferencia", p)

    def test_postes_relevamiento(self):
        """Verifica la integridad de cada poste relevado y valida campo potenciaLuminaria."""
        postes = self.sample_payload.get("postes", [])
        self.assertGreater(len(postes), 0, "Debe existir al menos 1 poste relevado")
        
        for idx, p in enumerate(postes, start=1):
            self.assertEqual(p.get("numeroPoste"), idx, f"El número de poste debe ser secuencial {idx}")
            self.assertGreaterEqual(p.get("cantidadLamparas", 0), 1, "Cada poste debe tener al menos 1 lámpara")
            self.assertIn(p.get("tipoLuminaria"), [
                "LED", "Sodio Alta Presion (SAP)", "Vapor de Mercurio", "Mezcladora", "Otro"
            ])
            # Validación de potencia (opcional o dentro de valores admitidos)
            potencia = p.get("potenciaLuminaria", "")
            self.assertIn(potencia, ["", "50W", "100W", "150W", "200W", "250W"],
                          f"Potencia '{potencia}' no reconocida en catálogo")
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
        """Simula la serialización de filas planas hacia Google Sheets y comprueba coincidencia de 17 columnas."""
        payload = self.sample_payload
        total_postes = len(payload["postes"])
        filas = []

        for p in payload["postes"]:
            fotos_urls = ["", "", ""]
            for i, f in enumerate(p.get("fotos", [])):
                if i < 3:
                    fotos_urls[i] = f"https://drive.google.com/file/d/mock_{i+1}/view"

            fila = [
                "mock-uuid-1234",
                "2026-11-03 12:30:00",
                payload["fecha"],
                str(payload["medidor"]),
                p["numeroPoste"],
                p["cantidadLamparas"],
                p["tipoLuminaria"],
                p.get("potenciaLuminaria", ""),
                p["estadoLuminaria"],
                p.get("latitud", ""),
                p.get("longitud", ""),
                p.get("precision", ""),
                fotos_urls[0],
                fotos_urls[1],
                fotos_urls[2],
                p.get("observaciones", ""),
                total_postes
            ]
            self.assertEqual(len(fila), len(self.expected_columns), 
                             f"La fila debe tener exactamente {len(self.expected_columns)} columnas (obtenidas: {len(fila)})")
            filas.append(fila)

        self.assertEqual(len(filas), 2, "Deben generarse 2 filas planas para 2 postes relevados")

    def test_schema_borrador_local_storage(self):
        """Valida que la estructura del borrador para LocalStorage contenga todos los campos para restaurar la sesión."""
        borrador = {
            "fecha": "2026-11-03",
            "medidor": "72677900",
            "postes": [
                {
                    "id": "pole-1730640000000-123",
                    "numero": 1,
                    "cantidadLamparas": 2,
                    "tipoLuminaria": "LED",
                    "potenciaLuminaria": "150W",
                    "estadoLuminaria": "Todas Encienden",
                    "geo": {"lat": -31.420083, "lng": -64.188776, "acc": 8},
                    "fotos": [
                        {"base64": "data:image/jpeg;base64,...", "mimeType": "image/jpeg"},
                        None,
                        None
                    ],
                    "observaciones": "Poste restaurado desde borrador"
                }
            ],
            "timestamp": 1730640000000
        }
        self.assertIn("fecha", borrador)
        self.assertIn("medidor", borrador)
        self.assertIn("postes", borrador)
        self.assertEqual(len(borrador["postes"]), 1)
        p = borrador["postes"][0]
        self.assertEqual(p["potenciaLuminaria"], "150W")
        self.assertIsNotNone(p["geo"]["lat"])
        self.assertEqual(len(p["fotos"]), 3)

if __name__ == "__main__":
    unittest.main()
