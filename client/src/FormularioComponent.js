// client/src/FormularioComponent.js

import React, { useState, useEffect } from 'react';
import './FormularioComponent.css'; // Ensure the path is correct

const FormularioComponent = () => {
  const initialFormState = {
    nombre: '',
    apellido: '',
    deporteFavorito: '',
    genero: '', // 'genero' will be kept as a string for the selected value
    departamentoResidente: '',
    mas21Anos: false,
    modelosCoches: {
      vado: false,
      chrysler: false,
      toyota: false,
      nissan: false,
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Example data for selects (Ensure they match your real data)
  const deportes = [
    { value: '', label: 'Selecciona un deporte' },
    { value: 'futbol americano', label: 'Fútbol Americano' },
    { value: 'baloncesto', label: 'Baloncesto' },
    { value: 'beisbol', label: 'Béisbol' },
    { value: 'futbol', label: 'Futbol' },
    { value: 'otro', label: 'Otro' },
  ];

  // Example data for departments/states
  const departamentos = [
    { value: '', label: 'Seleccione un lugar' },
    { value: 'jutiapa', label: 'Jutiapa' },
    { value: 'jalapa', 'label': 'Jalapa' },
    { value: 'santa rosa', label: 'Santa Rosa' },
    { value: 'escuintla', label: 'Escuintla' },
    { value: 'otro', label: 'Otro' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'mas21Anos') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.startsWith('car')) {
      // Handle car model checkboxes
      const carModel = name.replace('car', '').toLowerCase(); // 'carVado' -> 'vado'
      setFormData((prev) => ({
        ...prev,
        modelosCoches: {
          ...prev.modelosCoches,
          [carModel]: checked,
        },
      }));
    } else if (name === 'genero') { // Specific logic for gender (now checkboxes)
      setFormData((prev) => ({
        ...prev,
        // If the current checkbox is being checked, set its value.
        // If the current checkbox is being unchecked AND it was the previously selected gender,
        // then deselect the gender (set to empty string).
        // If another gender is being checked, simply set it.
        [name]: checked ? value : (prev.genero === value ? '' : prev.genero),
      }));
    }
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear the error for the field being changed
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'Este campo es obligatorio.';
    if (!formData.apellido) newErrors.apellido = 'Este campo es obligatorio.';
    if (!formData.deporteFavorito) newErrors.deporteFavorito = 'Selecciona un deporte.';
    if (!formData.genero) newErrors.genero = 'Selecciona un género.';
    if (!formData.departamentoResidente) newErrors.departamentoResidente = 'Selecciona un departamento.';
    return newErrors;
  };

  // Function to determine the backend URL based on the environment (local vs. online)
  const getBackendUrl = (forDownload = false) => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Cuando se ejecuta localmente, usa el backend de Excel en el puerto 5000
      return 'http://localhost:5000';
    } else if (hostname === 'aljulio.github.io') {
      // Cuando se despliega en línea (GitHub Pages), usa el backend de Firebase en Render.com
      return 'https://formulario-firebase-api-prod.onrender.com';
    }
    // Fallback por si acaso
    return 'http://localhost:5000';
  };

  const guardarCambios = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitted(true); // To show errors on the first attempt
      return;
    }

    const backendUrl = getBackendUrl();
    // El endpoint es el mismo para ambos backends (Excel local y Firebase online)
    const endpoint = '/guardar-y-descargar-excel'; 

    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json(); // Espera un JSON de respuesta
        alert(data.message || 'Datos guardados exitosamente.'); // Muestra el mensaje del backend
        setFormData(initialFormState); // Reinicia el estado inicial
        setErrors({});
        setIsSubmitted(false);
      } else {
        const errorData = await response.json(); // Intenta leer el error como JSON
        alert('Error al guardar: ' + (errorData.message || 'Error desconocido del servidor.'));
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      // Mensaje de error actualizado para reflejar el backend que se está intentando conectar
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        alert('No se pudo conectar con el servidor local. Asegúrate de que tu backend de Excel esté corriendo en http://localhost:5000.');
      } else {
        alert('No se pudo conectar con el servidor en línea. Asegúrate de que el backend de Firebase esté funcionando en Render.com.');
      }
    }
  };

  // FUNCIÓN ACTUALIZADA: Para descargar el archivo Excel (funciona local y online)
  const handleDescargarExcel = async () => {
    const backendUrl = getBackendUrl(); // Obtiene la URL base del backend
    const downloadEndpoint = '/descargar-excel'; // Endpoint para la descarga de Excel

    try {
      const response = await fetch(`${backendUrl}${downloadEndpoint}`);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
          // Si es un archivo Excel, activa la descarga
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'datos_formulario_actualizado.xlsx'; // Nombre del archivo a descargar
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          alert('Archivo Excel descargado exitosamente.');
        } else {
          // Si no es un Excel (ej. error 404 o mensaje de texto)
          const errorText = await response.text();
          console.error('Error al descargar el archivo Excel (no es un archivo Excel):', errorText);
          alert('Error al descargar el archivo Excel: ' + errorText);
        }
      } else {
        const errorText = await response.text();
        console.error('Error del servidor al descargar el archivo Excel:', response.status, errorText);
        alert('Error del servidor al descargar el archivo Excel: ' + (errorText || response.statusText));
      }
    } catch (error) {
      console.error('Error de red al intentar descargar el archivo Excel:', error);
      alert('Error de red al intentar descargar el archivo Excel. Asegúrate de que el backend esté corriendo.');
    }
  };

  // Effect to show errors only after the first submission attempt
  useEffect(() => {
    if (isSubmitted) {
      setErrors(validate());
    }
  }, [formData, isSubmitted]); // Added 'validate' to dependencies to avoid ESLint warning

  return (
    <div className="form-container">
      <h2>Actualizar información</h2>
      <p>Utilice el formulario a continuación para editar su información.</p>

      <div className="form-group">
        <label htmlFor="nombre">Nombre de pila:</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={errors.nombre ? 'input-error' : ''}
          placeholder="Introduce tu nombre"
        />
        {errors.nombre && <p className="error-message">{errors.nombre}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="apellido">Apellido:</label>
        <input
          type="text"
          id="apellido"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          className={errors.apellido ? 'input-error' : ''}
          placeholder="Introduce tu apellido"
        />
        {errors.apellido && <p className="error-message">{errors.apellido}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="deporteFavorito">Deporte favorito:</label>
        <select
          id="deporteFavorito"
          name="deporteFavorito"
          value={formData.deporteFavorito}
          onChange={handleChange}
          className={errors.deporteFavorito ? 'input-error' : ''}
        >
          {deportes.map((deporte) => (
            <option key={deporte.value} value={deporte.value}>
              {deporte.label}
            </option>
          ))}
        </select>
        {errors.deporteFavorito && <p className="error-message">{errors.deporteFavorito}</p>}
      </div>

      <div className="form-group">
        <label>Género:</label>
        <div>
          <div className="custom-control radio-like">
            <input
              type="checkbox"
              id="masculino"
              name="genero"
              value="masculino"
              checked={formData.genero === 'masculino'}
              onChange={handleChange}
            />
            <label htmlFor="masculino">Masculino</label>
          </div>
          <div className="custom-control radio-like">
            <input
              type="checkbox"
              id="femenino"
              name="genero"
              value="femenino"
              checked={formData.genero === 'femenino'}
              onChange={handleChange}
            />
            <label htmlFor="femenino">Femenino</label>
          </div>
          <div className="custom-control radio-like">
            <input
              type="checkbox"
              id="noEstoySeguro"
              name="genero"
              value="No estoy seguro"
              checked={formData.genero === 'No estoy seguro'}
              onChange={handleChange}
            />
            <label htmlFor="noEstoySeguro">No estoy seguro</label>
          </div>
        </div>
        {errors.genero && <p className="error-message">{errors.genero}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="departamentoResidente">Residente del departamento:</label>
        <select
          id="departamentoResidente"
          name="departamentoResidente"
          value={formData.departamentoResidente}
          onChange={handleChange}
          className={errors.departamentoResidente ? 'input-error' : ''}
        >
          {departamentos.map((depto) => (
            <option key={depto.value} value={depto.value}>
              {depto.label}
            </option>
          ))}
        </select>
        {errors.departamentoResidente && <p className="error-message">{errors.departamentoResidente}</p>}
      </div>

      <div className="form-group">
        <div className="custom-control">
          <input
            type="checkbox"
            id="mas21Anos"
            name="mas21Anos"
            checked={formData.mas21Anos}
            onChange={handleChange}
          />
          <label htmlFor="mas21Anos">21 años o más</label>
        </div>
      </div>

      <div className="form-group">
        <label>Modelos de coches propios:</label>
        <div>
          <div className="custom-control">
            <input
              type="checkbox"
              id="carVado"
              name="carVado"
              checked={formData.modelosCoches.vado}
              onChange={handleChange}
            />
            <label htmlFor="carVado">Vado</label>
          </div>
          <div className="custom-control">
            <input
              type="checkbox"
              id="carChrysler"
              name="carChrysler"
              checked={formData.modelosCoches.chrysler}
              onChange={handleChange}
            />
            <label htmlFor="carChrysler">Chrysler</label>
          </div>
          <div className="custom-control">
            <input
              type="checkbox"
              id="carToyota"
              name="carToyota"
              checked={formData.modelosCoches.toyota}
              onChange={handleChange}
            />
            <label htmlFor="carToyota">Toyota</label>
          </div>
          <div className="custom-control">
            <input
              type="checkbox"
              id="carNissan"
              name="carNissan"
              checked={formData.modelosCoches.nissan}
              onChange={handleChange}
            />
            <label htmlFor="carNissan">Nissan</label>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="button-group">
        <button type="button" className="save-button" onClick={guardarCambios}>
          Guardar cambios
        </button>
        {/* Botón de Descargar Excel con la misma clase de estilo */}
        <button type="button" className="save-button" onClick={handleDescargarExcel}>
          Descargar Excel
        </button>
      </div>
    </div>
  );
};

export default FormularioComponent;