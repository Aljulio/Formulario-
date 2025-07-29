// server/index.js (Usando xlsx - SheetJS con corrección de duplicados, sin Firebase)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx'); // Importa la librería xlsx (SheetJS)
const path = require('path');
const fs = require('fs'); // Usamos el fs normal aquí, xlsx maneja la lectura/escritura directamente

const app = express();
const PORT = process.env.PORT || 5000; // Puerto para el servidor local

// Middlewares
app.use(cors());
app.use(bodyParser.json());

const EXCEL_FILE_PATH = path.join(__dirname, 'datos_formulario.xlsx');

// Definir los encabezados de las columnas para el archivo Excel
const EXCEL_HEADERS = [
    'First Name', 'Last Name', 'Favorite Sport', 'Gender',
    'Departamento Residente', '21 or Older', 'Car: Vado',
    'Car: Chrysler', 'Car: Toyota',
    'Car: Nissan', 'Last Updated' // Añadido 'Last Updated' para consistencia
];

// ************ RUTAS DE LA API ************

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('¡Servidor Node.js con Express funcionando para Excel local!');
});

// Ruta para guardar los datos del formulario en el archivo Excel
// ¡CAMBIO DE ENDPOINT A /guardar-y-descargar-excel para consistencia con el backend de Firebase!
app.post('/guardar-y-descargar-excel', (req, res) => {
    const formData = req.body;
    console.log('\n--- Solicitud de guardado recibida ---');
    console.log('Datos del formulario:', formData);

    let workbook;
    let worksheet;
    let existingData = []; // Esto contendrá el array de arrays de todas las filas

    // Mapear los datos del formulario a un formato de fila para Excel (array de valores)
    const newRow = [
        formData.nombre ? formData.nombre.trim() : '',
        formData.apellido ? formData.apellido.trim() : '',
        formData.deporteFavorito || '',
        formData.genero || '',
        formData.departamentoResidente ? formData.departamentoResidente.trim() : '',
        formData.mas21Anos ? 'Sí' : 'No',
        formData.modelosCoches.vado ? 'X' : '',
        formData.modelosCoches.chrysler ? 'X' : '',
        formData.modelosCoches.toyota ? 'X' : '',
        formData.modelosCoches.nissan ? 'X' : '',
        new Date().toLocaleString() // Marca de tiempo de la última actualización
    ];

    try {
        // Verificar si el archivo existe
        if (fs.existsSync(EXCEL_FILE_PATH)) {
            try {
                // Si el archivo existe, leerlo
                workbook = XLSX.readFile(EXCEL_FILE_PATH);
                const sheetName = 'Datos del Formulario';
                worksheet = workbook.Sheets[sheetName];

                if (worksheet) {
                    // Convertir la hoja existente a JSON (array de arrays)
                    existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    console.log(`[DEBUG] Archivo existente leído. Filas actuales (incluyendo encabezado): ${existingData.length}`);

                    // Asegurarse de que los encabezados sean correctos o añadirlos si la hoja estaba vacía
                    if (existingData.length === 0 || JSON.stringify(existingData[0]) !== JSON.stringify(EXCEL_HEADERS)) {
                        console.warn('[WARN] Encabezados no encontrados o no coinciden. Se añadirán los encabezados definidos.');
                        existingData.unshift(EXCEL_HEADERS); // Añadir encabezados al principio
                    }
                } else {
                    // Si la hoja no existe en un archivo existente, crear una nueva hoja
                    console.log('[DEBUG] Hoja "Datos del Formulario" no encontrada en archivo existente, creando una nueva.');
                    workbook.SheetNames.push(sheetName);
                    workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]); // Crear hoja con encabezados
                    existingData.push(EXCEL_HEADERS); // Añadir encabezados a los datos en memoria
                }
            } catch (readError) {
                console.error(`[ERROR] Error al leer el archivo Excel existente (${EXCEL_FILE_PATH}):`, readError.message);
                // Si hay un error de lectura (ej. archivo corrupto o bloqueado),
                // tratamos como si el archivo no existiera para crear uno nuevo.
                console.log('[DEBUG] Fallo al leer el archivo existente, creando un nuevo libro.');
                workbook = XLSX.utils.book_new();
                worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]);
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos del Formulario');
                existingData.push(EXCEL_HEADERS); // Añadir encabezados a los datos en memoria
            }
        } else {
            // Si el archivo no existe, crear un nuevo libro y hoja con encabezados
            console.log('[DEBUG] Archivo Excel no encontrado, creando uno nuevo.');
            workbook = XLSX.utils.book_new();
            worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos del Formulario');
            existingData.push(EXCEL_HEADERS); // Añadir encabezados a los datos en memoria
        }

        // *** Lógica para ACTUALIZAR o AÑADIR el registro ***
        let recordUpdated = false;
        // Iterar sobre los datos existentes (saltando los encabezados)
        // Empezamos desde 1 porque existingData[0] son los encabezados
        for (let i = 1; i < existingData.length; i++) {
            const currentRow = existingData[i];
            
            // Criterio de unicidad: firstName (índice 0), lastName (índice 1), departamentoResidente (índice 4)
            // Comparación insensible a mayúsculas y minúsculas y con .trim()
            const currentFirstName = currentRow[0] ? currentRow[0].toString().trim().toLowerCase() : '';
            const currentLastName = currentRow[1] ? currentRow[1].toString().trim().toLowerCase() : '';
            const currentDepartamento = currentRow[4] ? currentRow[4].toString().trim().toLowerCase() : '';

            const newFirstName = formData.nombre ? formData.nombre.trim().toLowerCase() : '';
            const newLastName = formData.apellido ? formData.apellido.trim().toLowerCase() : '';
            const newDepartamento = formData.departamentoResidente ? formData.departamentoResidente.trim().toLowerCase() : '';

            console.log(`[DEBUG] Comparando fila ${i}:`);
            console.log(`   Existente: Nombre='${currentFirstName}', Apellido='${currentLastName}', Depto='${currentDepartamento}'`);
            console.log(`   Nuevo:    Nombre='${newFirstName}', Apellido='${newLastName}', Depto='${newDepartamento}'`);

            const isDuplicate = 
                currentFirstName === newFirstName &&
                currentLastName === newLastName &&
                currentDepartamento === newDepartamento;

            if (isDuplicate) {
                console.log(`[DEBUG] Duplicado encontrado en la fila ${i} para ${formData.nombre} ${formData.apellido}. Actualizando registro existente.`);
                existingData[i] = newRow; // Reemplazar la fila existente con los nuevos datos
                recordUpdated = true;
                break; // Salir del bucle una vez que se encuentra y actualiza el duplicado
            }
        }

        if (!recordUpdated) {
            console.log('[DEBUG] No se encontró duplicado. Añadiendo nueva fila.');
            existingData.push(newRow); // Si no es un duplicado, añadir la nueva fila
        }
        
        console.log(`[DEBUG] Total de filas en memoria (incluyendo encabezado) después de procesar: ${existingData.length}`);

        // Recrear la hoja de trabajo con todos los datos (encabezados + existentes + nuevos/actualizados)
        worksheet = XLSX.utils.aoa_to_sheet(existingData);
        workbook.Sheets['Datos del Formulario'] = worksheet;

        // Escribir el libro de trabajo actualizado en el archivo Excel
        console.log('[DEBUG] Intentando escribir en el archivo Excel...');
        XLSX.writeFile(workbook, EXCEL_FILE_PATH);
        console.log('Datos guardados en Excel con éxito.');
        
        // Enviar el archivo Excel para descarga
        res.setHeader('Content-Disposition', 'attachment; filename=datos_formulario_actualizado.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

    } catch (error) {
        console.error('[ERROR] Error final al procesar/escribir en el archivo Excel:', error);
        let errorMessage = 'Error al guardar los datos en Excel.';
        // xlsx puede lanzar errores de sistema de archivos si el archivo está bloqueado
        if (error.code === 'EBUSY' || error.code === 'EPERM' || error.code === 'EACCES') {
            errorMessage = 'Error: El archivo Excel "datos_formulario.xlsx" está abierto o bloqueado. Por favor, ciérrelo antes de guardar los datos.';
        }
        res.status(500).json({ message: errorMessage });
    }
});

// ************ INICIO DEL SERVIDOR ************

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log('Para probar el backend, puedes visitar http://localhost:5000/ en tu navegador.');
  console.log('El frontend correrá en http://localhost:3000/');
  console.log(`El archivo Excel se guardará en: ${EXCEL_FILE_PATH}`);
});