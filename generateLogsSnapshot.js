// generateLogsSnapshot.js

import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import { format } from 'date-fns';

// 🌐 URL pública de la función getLogs
const GET_LOGS_URL = 'https://us-central1-falconcore-v2.cloudfunctions.net/getLogs';

// 📁 Ruta destino local (modifica si quieres moverlo a otro lado)
const outputFolder = './functions/logs_snapshots';

// 🕐 Fecha para el nombre del archivo
const today = format(new Date(), 'yyyy-MM-dd');
const outputFile = `${outputFolder}/logs_snapshot_${today}.json`;

async function generateLogsSnapshot() {
  try {
    console.log(`📡 Consultando logs desde: ${GET_LOGS_URL} ...`);
    const response = await fetch(GET_LOGS_URL);

    if (!response.ok) {
      throw new Error(`❌ Error al obtener logs: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 🧱 Crea la carpeta si no existe
    await mkdir(outputFolder, { recursive: true });

    await writeFile(outputFile, JSON.stringify(data, null, 2), 'utf8');

    console.log(`✅ Snapshot generado: ${outputFile}`);
  } catch (error) {
    console.error('❌ Error al generar snapshot:', error);
  }
}

generateLogsSnapshot();

