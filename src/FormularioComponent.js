// client/src/FormularioComponent.js

import React, { useState, useEffect } from 'react';
import './FormularioComponent.css'; // Asegúrate de que la ruta sea correcta

const FormularioComponent = () => {
  const initialFormState = {
    nombre: '',
    apellido: '',
    deporteFavorito: '',
    genero: '', // Mantendremos 'genero' como string para el valor seleccionado
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

  // Datos de ejemplo para los selects (Asegúrate que coincidan con tus datos reales)
  const deportes = [
    { value: '', label: 'Selecciona un deporte' },
    { value: 'futbol americano', label: 'Fútbol Americano' },
    { value: 'baloncesto', label: 'Baloncesto' },
    { value: 'beisbol', label: 'Béisbol' },
    { value: 'futbol', label: 'Futbol' },
    { value: 'otro', label: 'Otro' },
  ];

  // Datos de ejemplo para los departamentos/estados
  const departamentos = [
    { value: '', label: 'Seleccione un lugar' },
    { value: 'jutiapa', label: 'Jutiapa' },
    { value: 'jalapa', label: 'Jalapa' },
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
      // Manejar los checkboxes de modelos de coches
      const carModel = name.replace('car', '').toLowerCase(); // 'carVado' -> 'vado'
      setFormData((prev) => ({
        ...prev,
        modelosCoches: {
          ...prev.modelosCoches,
          [carModel]: checked,
        },
      }));
    } else if (name === 'genero') { // *** Lógica específica para el género (ahora checkboxes) ***
      setFormData((prev) => ({
        ...prev,
        // Si el checkbox actual está siendo marcado, establece su valor.
        // Si el checkbox actual está siendo desmarcado Y era el género previamente seleccionado,
        // entonces deselecciona el género (establece a cadena vacía).
        // Si otro género está siendo marcado, simplemente lo establece.
        [name]: checked ? value : (prev.genero === value ? '' : prev.genero),
      }));
    }
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error for the field being changed
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

  const guardarCambios = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitted(true); // Para mostrar errores en el primer intento
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/guardar-en-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Mostrar mensaje de éxito
        // Opcional: limpiar el formulario después de guardar
        setFormData({
            nombre: '',
            apellido: '',
            deporteFavorito: '',
            genero: '',
            departamentoResidente: '',
            mas21Anos: false,
            modelosCoches: {
              vado: false,
              chrysler: false,
              toyota: false,
              nissan: false,
            },
        });
        setErrors({});
        setIsSubmitted(false);
      } else {
        alert('Error al guardar: ' + data.message); // Mostrar mensaje de error del servidor
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando en http://localhost:5000');
    }
  };

  // Efecto para mostrar errores solo después del primer intento de envío
  useEffect(() => {
    if (isSubmitted) {
      setErrors(validate());
    }
  }, [formData, isSubmitted]);

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
          {/* *** CAMBIADO: type="radio" a type="checkbox" y añadido clase "radio-like" *** */}
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

      <button type="button" className="save-button" onClick={guardarCambios}>
        Guardar cambios
      </button>
    </div>
  );
};

export default FormularioComponent;