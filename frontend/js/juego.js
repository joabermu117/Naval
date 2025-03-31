document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const gameData = JSON.parse(localStorage.getItem('currentGameData'));
    const playerBoardState = gameData.player.state;
    const opponentBoardState = gameData.opponent.state;
    const gameMessages = document.getElementById('gameMessages');
    const restartBtn = document.getElementById('restartBtn');
    const surrenderBtn = document.getElementById('surrenderBtn');
    const weatherInfo = document.getElementById('weatherInfo');
    const locationName = document.getElementById('locationName');
    const temperatureInfo = document.getElementById('temperatureInfo');
    const conditionInfo = document.getElementById('conditionInfo');

    // Variables de estado del juego
    let boardSize = 10;
    let gamePhase = 'setup';
    let gameLocation = null;
    let weatherData = null;

    // Inicialización del juego
    function initGame() {
        try {
            // Cargar datos del juego desde localStorage
            const gameData = JSON.parse(localStorage.getItem('currentGameData'));
            if (!gameData) {
                throw new Error('No se encontraron datos de configuración del juego.');
            }

            // Configurar datos del juego
            boardSize = playerBoardState.length;
            playerBoard.innerHTML = gameData.board;
            opponentBoard.innerHTML = gameData.opponentBoard;
            weatherData = gameData.weatherData;
            gameLocation = gameData.location;

            // Restaurar los eventos de las celdas
            restoreCellEvents();

            // Configurar información del jugador
            displayPlayerInfo('playerInfoContainer');
            
            // Mostrar información del clima
            displayWeatherInfo();
            
            // Comenzar juego
            gamePhase = 'player-turn';
            addGameMessage("¡Comienza la batalla! Es tu turno.");
            
        } catch (error) {
            console.error('Error al inicializar el juego:', error);
            gameMessages.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message}
                    <button onclick="window.location.href='personalizar.html'" 
                            class="btn btn-sm btn-warning mt-2">
                        Volver a configuración
                    </button>
                </div>
            `;
        }
    }

        // Mostrar información meteorológica
        function displayWeatherInfo() {
            if (!weatherData || !gameLocation) {
                weatherInfo.classList.add('d-none');
                return;
            }
    
            weatherInfo.classList.remove('d-none');
            locationName.textContent = gameLocation.name;
            
            const tempC = weatherData.main.temp;
            const tempF = (tempC * 9/5) + 32;
            const windSpeedKmh = (weatherData.wind.speed * 3.6).toFixed(1);
            
            temperatureInfo.innerHTML = `
                <strong>Temperatura:</strong> ${tempC.toFixed(1)}°C (${tempF.toFixed(1)}°F)<br>
                <strong>Sensación térmica:</strong> ${weatherData.main.feels_like.toFixed(1)}°C
            `;
            
            conditionInfo.innerHTML = `
                <strong>Condición:</strong> ${weatherData.weather[0].description}<br>
                <strong>Viento:</strong> ${windSpeedKmh} km/h<br>
                <strong>Dirección:</strong> ${getWindDirection(weatherData.wind.deg)}<br>
                <strong>Humedad:</strong> ${weatherData.main.humidity}%
            `;
        }
    
        // Convertir dirección del viento
        function getWindDirection(degrees) {
            const directions = ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
            const index = Math.round((degrees % 360) / 45) % 8;
            return directions[index];
        }
<<<<<<< HEAD
=======
        

// Restaurar eventos para las celdas del tablero
function restoreCellEvents() {
    const cells = playerBoard.querySelectorAll('.board-cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Limpiar eventos previos
        cell.replaceWith(cell.cloneNode(true));
        
        // Agregar nuevos eventos
        cell.addEventListener('click', () => handleCellClick(row, col));
    });
}
>>>>>>> 0b7156fe97810cb54357e4e20b55d5b523187e22

// Manejar clic en celdas
function handleCellClick(row, col) {
    if (gamePhase !== 'player-turn') return;
    
    const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
    
    // Verificar si hay un barco en esta celda
    if (cell.classList.contains('occupied')) {
        cell.innerHTML = '💥';
        cell.classList.add('hit');
        addGameMessage("¡Impacto! Has golpeado un barco.");
    } else {
        cell.innerHTML = '🌊';
        cell.classList.add('miss');
        addGameMessage("Agua. No has impactado ningún barco.");
    }
}

// Añadir mensaje al historial del juego
function addGameMessage(message, isImportant = false) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    if (isImportant) {
        messageElement.classList.add('fw-bold');
    }
    
    gameMessages.appendChild(messageElement);
    gameMessages.scrollTop = gameMessages.scrollHeight;
}

// Configurar event listeners
function setupEventListeners() {
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (confirm("¿Estás seguro de que quieres reiniciar el juego?")) {
                window.location.href = 'personalizar.html';
            }
        });
    }
    
    if (surrenderBtn) {
        surrenderBtn.addEventListener('click', () => {
            if (confirm("¿Estás seguro de que quieres rendirte?")) {
                addGameMessage("Te has rendido. ¡Mejor suerte la próxima vez!", true);
                gamePhase = 'game-over';
            }
        });
    }
}

initGame();
setupEventListeners();
});