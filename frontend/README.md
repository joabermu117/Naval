# Batalla Naval

Este proyecto es una implementación de un juego de Batalla Naval que incluye un frontend interactivo y un backend para la gestión de datos. El juego permite a los usuarios personalizar su tablero, colocar barcos, jugar contra una IA, consultar estadísticas y ver rankings globales.

## Tabla de Contenidos
- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Endpoints del Backend](#endpoints-del-backend)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## Características

- **Personalización del Tablero**: Los jugadores pueden elegir el tamaño del tablero y colocar sus barcos estratégicamente.
- **Juego contra IA**: Una inteligencia artificial simula al oponente.
- **Estadísticas Detalladas**: Se muestran estadísticas como impactos, fallos, precisión y barcos hundidos.
- **Ranking Global**: Los puntajes de los jugadores se almacenan y se muestran en un ranking global.
- **Información Meteorológica**: El juego incluye datos climáticos basados en la ubicación seleccionada.
- **Exportación de Tableros**: Los jugadores pueden exportar sus tableros en formato ASCII.

---

## Estructura del Proyecto
Naval/ ├── backend/ │ ├── app.py # API en Flask para gestionar puntajes y países │ ├── database/ │ │ ├── scores.json # Datos de puntajes │ │ ├── countries.json # Lista de países │ ├── readme.md # Documentación del backend │ └── .gitignore # Archivos ignorados en el backend ├── frontend/ │ ├── css/ # Estilos CSS │ ├── html/ # Páginas HTML │ ├── js/ # Lógica del frontend en JavaScript │ ├── Mockups/ # Mockups del diseño │ ├── README.md # Documentación del frontend │ └── .gitignore # Archivos ignorados en el frontend ├── .vscode/ │ └── settings.json # Configuración de Visual Studio Code

---

## Requisitos

- **Backend**:
  - Python 3.8 o superior
  - Flask
  - Flask-CORS

- **Frontend**:
  - Navegador moderno compatible con HTML5, CSS3 y JavaScript.

---

## Instalación

### Backend
1. Clona el repositorio:
   ```sh
   git clone https://github.com/felipebuitragocarmona/backend-naval-battle
   cd backend
2. Instala las dependencias:
```pip install flask flask-cors```

3. Inicializa el servidor:
```python app.py```


### Frontend
1. Abre la carpeta `frontend` en un servidor local. Si usas Visual Studio Code, puedes usar la extensión **Live Server**.
2. Configura el archivo settings.json en `.vscode/settings.json` para evitar errores del liveServer:
   ```json
{
    "workbench.colorTheme": "Default Dark+",
    "gitlens.views.commitDetails.files.layout": "tree",
    "liveServer.settings.wait": 1000000,
    "liveServer.settings.reload": false,
    "liveServer.settings.ignoreFiles": [
    "/.html",
    "/.css",
    "/*.js"
],
}

   ```
3. Accede al frontend desde tu navegador en `http://127.0.0.1:5501/frontend/html/index.html`.

---

## Uso

1. Accede al frontend desde tu navegador en `http://127.0.0.1:5501/frontend/html/index.html`.
2. Ingresa tu nombre y selecciona tu país.
3. Personaliza tu tablero y comienza el juego.
4. Consulta estadísticas y rankings al finalizar.

---

## Endpoints del Backend

### **Registrar Puntaje**
**POST** `/score-recorder`  
Registra o actualiza el puntaje de un jugador.

Ejemplo de request:
```json
{
    "nick_name": "Jugador1",
    "score": 100,
    "country_code": "es"
}
```

### **Obtener Ranking**
**GET** `/ranking`  
Devuelve el ranking global de jugadores.

### **Obtener Lista de Países**
**GET** `/countries`  
Devuelve la lista de países disponibles.

---

## Tecnologías Utilizadas

- **Frontend**:
  - HTML5, CSS, JavaScript
  - Bootstrap 5.3
  - API de OpenWeatherMap (para datos meteorológicos)

- **Backend**:
  - Python
  - Flask
  - Flask-CORS

---

## Agradecimientos

Agradecemos a todos los desarrolladores y colaboradores que hicieron posible este proyecto. También agradecemos a las comunidades de código abierto por las herramientas y recursos utilizados.

---

¡Gracias por jugar Batalla Naval!