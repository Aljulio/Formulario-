// client/src/App.js

import React from 'react';
import FormularioComponent from './FormularioComponent'; // Importa tu componente del formulario
import './App.css'; // Mantenemos el import de App.css, pero su contenido estará vacío

function App() {
  return (
    <div className="App">
      {/* Aquí renderizamos nuestro componente de formulario.
          Todo el contenido de la aplicación se mostrará a través de este componente. */}
      <FormularioComponent />
    </div>
  );
}

export default App;
