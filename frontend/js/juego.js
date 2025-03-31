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
    initGame();
});