# Proyecto Formulario de Registro

Este proyecto es una aplicación web de dos partes (frontend y backend) diseñada para recopilar información de un formulario en línea y guardarla en un archivo Excel localmente.

## Estructura del Proyecto

El proyecto está organizado en una estructura de monorepo simple, lo que significa que la aplicación frontend y el servidor backend residen en la misma carpeta raíz, pero en directorios separados.

```

Formulario/
├── client/          \# Contiene la aplicación web (Frontend)
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── FormularioComponent.js
│   │   ├── FormularioComponent.css
│   │   └── ... (otros archivos de React)
│   ├── package.json
│   └── ... (otros archivos de configuración de React)
└── server/          \# Contiene el servidor (Backend)
├── index.js     \# Lógica principal del servidor
├── datos\_formulario.xlsx \# Este archivo se crea/actualiza aquí
├── package.json
└── ... (otros archivos de Node.js)

````

### **`client/` (El Frontend)**

* **Tecnología:** Desarrollado con **React.js**.
* **Función:** Es la interfaz de usuario que el usuario ve y con la que interactúa en el navegador. Se encarga de mostrar el formulario, manejar las entradas del usuario, realizar validaciones básicas y enviar los datos al backend.

### **`server/` (El Backend)**

* **Tecnología:** Desarrollado con **Node.js** y **Express.js**. Utiliza la librería `xlsx` para la manipulación de archivos Excel.
* **Función:** Es el servidor que se ejecuta en tu máquina local. Recibe los datos enviados por el frontend, los procesa y los guarda de forma estructurada en un archivo Excel (`datos_formulario.xlsx`) ubicado dentro de esta misma carpeta. También maneja la lógica para actualizar registros existentes o añadir nuevos.

## Cómo Clonar y Ejecutar el Proyecto Localmente

Sigue estos pasos para poner en marcha el proyecto en tu máquina local.

### **Requisitos Previos**

Asegúrate de tener instalado lo siguiente:

* **Node.js y npm:** Puedes descargarlo desde [nodejs.org](https://nodejs.org/). `npm` se instala junto con Node.js.
* **Git:** Para clonar el repositorio. Puedes descargarlo desde [git-scm.com](https://git-scm.com/).

### **Pasos de Configuración y Ejecución**

1.  **Clonar el Repositorio:**
    Abre tu terminal o línea de comandos y ejecuta el siguiente comando para clonar el repositorio en tu computadora:

    ```bash
    git clone [URL_DE_TU_REPOSITORIO]
    # Asegúrate de reemplazar [URL_DE_TU_REPOSITORIO] con la URL real de tu repositorio de GitHub.
    # Ejemplo: git clone [https://github.com/Aljulio/Formulario-.git](https://github.com/Aljulio/Formulario-.git)
    ```
    Luego, navega a la carpeta principal del proyecto:
    ```bash
    cd NombreDeTuCarpetaClonada
    ```

2.  **Configurar e Iniciar el Backend:**
    Primero, navega a la carpeta del servidor:

    ```bash
    cd server
    ```
    Instala las dependencias de Node.js:

    ```bash
    npm install
    ```
    Inicia el servidor backend. **Mantén esta terminal abierta y el servidor en ejecución.**

    ```bash
    node index.js
    ```
    Verás un mensaje indicando que el servidor está escuchando en `http://localhost:5000`.

3.  **Configurar e Iniciar el Frontend:**
    Abre **una nueva terminal o ventana de comandos**. Navega de vuelta a la raíz del proyecto y luego a la carpeta del cliente:

    ```bash
    cd .. # Esto te lleva de la carpeta 'server' a la raíz del proyecto.
    cd client
    ```
    Instala las dependencias de React:

    ```bash
    npm install
    ```
    Inicia la aplicación frontend:

    ```bash
    npm start
    ```
    Esto abrirá automáticamente tu navegador en `http://localhost:3000` (o un puerto similar) donde podrás ver y usar el formulario.

### **Uso y Verificación Local**

* Con el backend (`node index.js`) y el frontend (`npm start`) corriendo en sus respectivas terminales, puedes llenar el formulario en `http://localhost:3000`.
* Al hacer clic en el botón "Guardar cambios", los datos se enviarán a tu backend local.
* El backend procesará los datos y los guardará en el archivo `datos_formulario.xlsx` ubicado en la carpeta `server/` de tu proyecto. Puedes abrir este archivo con Microsoft Excel o un programa compatible para verificar los datos.
````





