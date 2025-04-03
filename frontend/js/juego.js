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
    const playerBoard = document.getElementById('playerBoard');
    const opponentBoard = document.getElementById('opponentBoard');
    const player = getPlayerData() || 'Anónimo';
    const BACKEND_URL = "http://localhost:5000"; 
<<<<<<< HEAD
    
    // Variables de estado para la IA del Oponente
    let opponentMode = 'random'; // Modos: 'random', 'hunting', 'near_hit_search'
    let targetQueue = []; // Cola de coordenadas {row, col} a priorizar
    let huntingInfo = null;
=======

    // Configuración de Gemini AI (agregar al inicio del código)
    
>>>>>>> 2b2d4edfe0efdd7f6d850b98f171b6baf1144836

    // Variables de estado del juego
    let boardSize = 10;
    let gamePhase = 'setup';
    let gameLocation = null;
    let weatherData = null;
    let gameStartTime = Date.now();

    // Estadísticas del juego
    const gameStats = {
        player: {
            hits: 0,
            misses: 0,
            nearHits: 0,
            shipsSunk: 0
        },
        opponent: {
            hits: 0,
            misses: 0,
            nearHits: 0,
            shipsSunk: 0
        }
    };

    // Inicialización del juego
    function initGame() {
        try {
            // Cargar datos del juego desde localStorage
            const gameData = JSON.parse(localStorage.getItem('currentGameData'));
            if (!gameData) {
                throw new Error('No se encontraron datos de configuración del juego.');
            }

        // Verificar que los estados del tablero existen
        if (!gameData.player || !gameData.player.state || !gameData.opponent || !gameData.opponent.state) {
            throw new Error('Datos del tablero no encontrados.');
        }

            console.log(player);
            
            // Configurar datos del juego
            boardSize = playerBoardState.length;
            playerBoard.innerHTML = gameData.board;
            opponentBoard.innerHTML = gameData.opponentBoard;
            weatherData = gameData.weatherData;
            gameLocation = gameData.location;

            // Restaurar los eventos de las celdas
            restoreCellEvents();

            // Mostrar información del clima
            displayWeatherInfo();

            displayPlayerInfo('playerInfoContainer');
            
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
        const weatherCondition = weatherData.weather[0].main.toLowerCase();
        
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
        
        setWeatherBackground(weatherCondition);
    }

    function setWeatherBackground(condition) {
        const weatherCard = document.getElementById('weatherInfo');
        const playerBoard = document.getElementById('playerBoard');
        const opponentBoard = document.getElementById('opponentBoard');
        
        const elements = [weatherCard, playerBoard, opponentBoard];
        elements.forEach(el => {
            el.classList.remove(
                'weather-sunny', 'weather-rainy', 'weather-cloudy', 
                'weather-snowy', 'weather-stormy', 'weather-foggy',
                'weather-night'
            );
        });
    
        switch(condition) {
            case 'clear':
                weatherCard.classList.add('weather-sunny');
                playerBoard.classList.add('weather-sunny');
                opponentBoard.classList.add('weather-sunny');
                break;
            case 'rain':
            case 'drizzle':
                weatherCard.classList.add('weather-rainy');
                playerBoard.classList.add('weather-rainy');
                opponentBoard.classList.add('weather-rainy');
                break;
            case 'clouds':
                weatherCard.classList.add('weather-cloudy');
                playerBoard.classList.add('weather-cloudy');
                opponentBoard.classList.add('weather-cloudy');
                break;
            case 'thunderstorm':
                weatherCard.classList.add('weather-stormy');
                playerBoard.classList.add('weather-stormy');
                opponentBoard.classList.add('weather-stormy');
                break;
            case 'tornado':
                weatherCard.classList.add('weather-foggy');
                playerBoard.classList.add('weather-foggy');
                opponentBoard.classList.add('weather-foggy');
                break;
            default:
                weatherCard.style.background = '#f8f9fa';
        }
    }

    function getWindDirection(degrees) {
        const directions = ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
        const index = Math.round((degrees % 360) / 45) % 8;
        return directions[index];
    }

    // Restaurar eventos para las celdas del tablero
    function restoreCellEvents() {
        // Restaurar eventos para el tablero del oponente
        const opponentCells = opponentBoard.querySelectorAll('.board-cell');
        opponentCells.forEach(cell => {
            // Eliminar el evento anterior si existe
            cell.replaceWith(cell.cloneNode(true));
            const newCell = opponentBoard.querySelector(`.board-cell[data-row="${cell.dataset.row}"][data-col="${cell.dataset.col}"]`);
            
            // Agregar evento de click solo al tablero del oponente
            newCell.addEventListener('click', function() {
                const row = parseInt(this.dataset.row);
                const col = parseInt(this.dataset.col);
                if (gamePhase === 'player-turn') {
                    handleCellClick(row, col);
                }
            });
        });
    }

    // Manejar clic en celdas del jugador
function handleCellClick(row, col) {
    // Verificar que sea el turno del jugador
    if (gamePhase !== 'player-turn') {
        addGameMessage("Espera tu turno para atacar.");
        return;
    }

    // Obtener referencia a la celda clickeada
    const cell = opponentBoard.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
    
    // Verificar que la celda existe
    if (!cell) {
        console.error("Celda no encontrada:", row, col);
        return;
    }

    // Verificar que no se haya disparado aquí antes
    if (cell.classList.contains('miss') || cell.classList.contains('hit') || cell.classList.contains('sunk')) {
        addGameMessage("Ya has disparado aquí. No puedes volver a atacar esta celda.");
        return;
    }
    
    // Verificar si hay un barco en esta celda (usando opponentBoardState)
    if (opponentBoardState[row] && opponentBoardState[row][col] !== 0) {
        // Impacto en barco
        cell.innerHTML = '💥';
        cell.classList.add('hit');
        
        // Obtener ID del barco (asegurando que sea string para comparaciones)
        const shipId = opponentBoardState[row][col].toString();
        
        // Verificar si el barco fue hundido
        if (isShipSunk(shipId, 'opponent')) {
            const shipName = getShipName(shipId);
            addGameMessage(`¡Has hundido un ${shipName}!`);
            markSunkShip(shipId, 'opponent');
            gameStats.player.shipsSunk++;
            
            // Actualizar estadísticas visuales
            updateStatsDisplay();
        } else {
            addGameMessage("¡Impacto! Has golpeado un barco.");
        }
        gameStats.player.hits++;
    }
    // Verificar si el disparo estuvo cerca de un barco
    else if (isNearShip(row, col, 'opponent')) {
        cell.innerHTML = '⚠️';
        cell.classList.add('near-hit');
        addGameMessage("¡Estuvo cerca! El disparo cayó al lado de un barco.");
        gameStats.player.nearHits++;
    }
    // Disparo al agua
    else {
        cell.innerHTML = '💧';
        cell.classList.add('miss');
        addGameMessage("Agua. No has impactado ningún barco.");
        gameStats.player.misses++;
    }
    
    // Actualizar estadísticas visuales
    updateStatsDisplay();
    
    // Cambiar turno después del disparo
    gamePhase = 'opponent-turn';
    
    // Pequeño delay para mejor experiencia de usuario
    setTimeout(() => {
        opponentTurn();
        checkGameEnd();
    }, 1000);
}

// Función auxiliar para actualizar el display de estadísticas
function updateStatsDisplay() {
    const statsElement = document.getElementById('playerStats');
    if (statsElement) {
        statsElement.innerHTML = `
            <p>Impactos: ${gameStats.player.hits}</p>
            <p>Fallos: ${gameStats.player.misses}</p>
            <p>Cercanos: ${gameStats.player.nearHits}</p>
            <p>Barcos hundidos: ${gameStats.player.shipsSunk}</p>
        `;
    }
}
    
    // Verificar si un barco ha sido hundido
   
function isShipSunk(shipId, player = 'opponent') {
    const boardState = player === 'opponent' ? opponentBoardState : playerBoardState;
    const boardElement = player === 'opponent' ? opponentBoard : playerBoard;
    
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (boardState[row][col] === shipId) {
                const cell = boardElement.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
                if (!cell.classList.contains('hit')) {
                    return false;
                }
            }
        }
    }
    return true;
}


    // Marcar un barco como hundido
    function markSunkShip(shipId, player = 'opponent') {
        const boardState = player === 'opponent' ? opponentBoardState : playerBoardState;
        const boardElement = player === 'opponent' ? opponentBoard : playerBoard;
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (boardState[row][col] === shipId) {
                    const cell = boardElement.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        cell.innerHTML = '🌊';
                        cell.classList.add('sunk');
                    }
                }
            }
        }
    }

    // Obtener nombre del barco
    function getShipName(shipId) {
        const ships = [
            {id: "1", name: "Submarino"},
            {id: "2", name: "Submarino"},
            {id: "3", name: "Crucero"},
            {id: "4", name: "Crucero"},
            {id: "5", name: "Acorazado"},
            {id: "6", name: "Portaaviones"}
        ];
        return ships.find(ship => ship.id === shipId)?.name || "barco";
    }

    // Verificar si una celda está adyacente a un barco
    function isNearShip(row, col, player = 'opponent') {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        const boardToCheck = player === 'opponent' ? opponentBoard : playerBoard;
        
        return directions.some(([r, c]) => {
            const newRow = row + r;
            const newCol = col + c;
            
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                const adjacentCell = boardToCheck.querySelector(
                    `.board-cell[data-row="${newRow}"][data-col="${newCol}"]`
                );
                return adjacentCell && adjacentCell.classList.contains('occupied') ||
                       adjacentCell.classList.contains('hit');
            }
            return false;
        });
    }

    // Verificar si el juego ha terminado
    function checkGameEnd() {
        const playerShipsSunk = areAllShipsSunk('player');
        const opponentShipsSunk = areAllShipsSunk('opponent');

        if (playerShipsSunk || opponentShipsSunk) {
            gamePhase = 'game-over';
            const winner = opponentShipsSunk ? 'player' : 'opponent';
            showVictoryScreen(winner);
            sendGameStatsToBackend(winner);
        }
    }

    // Verificar si todos los barcos de un jugador han sido hundidos
    function areAllShipsSunk(player) {
        const boardState = player === 'player' ? playerBoardState : opponentBoardState;
        const boardElement = player === 'player' ? playerBoard : opponentBoard;
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (boardState[row][col] !== 0) {
                    const cell = boardElement.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
                    if (!cell.classList.contains('hit')) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Mostrar pantalla de victoria
    function showVictoryScreen(winner) {
        const victoryOverlay = document.createElement('div');
        victoryOverlay.id = 'victoryOverlay';
        victoryOverlay.style.position = 'fixed';
        victoryOverlay.style.top = '0';
        victoryOverlay.style.left = '0';
        victoryOverlay.style.width = '100%';
        victoryOverlay.style.height = '100%';
        victoryOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        victoryOverlay.style.display = 'flex';
        victoryOverlay.style.flexDirection = 'column';
        victoryOverlay.style.justifyContent = 'center';
        victoryOverlay.style.alignItems = 'center';
        victoryOverlay.style.zIndex = '1000';
        victoryOverlay.style.color = 'white';
        
        victoryOverlay.innerHTML = `
            <h1>¡${winner === 'player' ? 'GANASTE' : 'PERDISTE'}!</h1>
            <p>${winner === 'player' ? 'Has hundido toda la flota enemiga' : 'Tu flota ha sido destruida'}</p>
            <button id="showStatsBtn" class="btn btn-primary mt-3">Ver Estadísticas</button>
            <button id="playAgainBtn" class="btn btn-success mt-2">Jugar de Nuevo</button>
        `;
        
        document.body.appendChild(victoryOverlay);
        
        document.getElementById('showStatsBtn').addEventListener('click', sendGameStatsToBackend);
        document.getElementById('showStatsBtn').addEventListener('click', showStats);
        document.getElementById('showStatsBtn').addEventListener('click', () => {
            showStatsModal();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            window.location.href = 'personalizar.html';
        });
    }

    function showStats(params) {
        
    }
    // Función para mostrar el modal de estadísticas
function showStatsModal() {
    // Calcular precisión
    const totalShots = gameStats.player.hits + gameStats.player.misses;
    const accuracy = totalShots > 0 
        ? Math.round((gameStats.player.hits / totalShots) * 100) 
        : 0;
    
    // Calcular tiempo de juego
    const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(gameDuration / 60);
    const seconds = gameDuration % 60;
    
    // Actualizar elementos del modal
    document.getElementById('statsPlayerHits').textContent = gameStats.player.hits;
    document.getElementById('statsPlayerMisses').textContent = gameStats.player.misses;
    document.getElementById('statsPlayerNearHits').textContent = gameStats.player.nearHits;
    document.getElementById('statsPlayerSunk').textContent = gameStats.player.shipsSunk;
    
    document.getElementById('statsOpponentHits').textContent = gameStats.opponent.hits;
    document.getElementById('statsOpponentMisses').textContent = gameStats.opponent.misses;
    document.getElementById('statsOpponentNearHits').textContent = gameStats.opponent.nearHits;
    document.getElementById('statsOpponentSunk').textContent = gameStats.opponent.shipsSunk;
    
    document.getElementById('statsAccuracy').textContent = `Precisión: ${accuracy}%`;
    document.getElementById('statsTime').textContent = `Duración: ${minutes}m ${seconds}s`;
    
    // Mostrar el modal usando Bootstrap
    const statsModal = new bootstrap.Modal(document.getElementById('statsModal'));
    statsModal.show();
}



    // Enviar estadísticas al backend
    function sendGameStatsToBackend(winner) {
        const nickName = player.nick_name || 'Anónimo';
        const countryCode = player.country_code || 'XX';
        
        const score = gameStats.player.hits * 10 -
                     gameStats.player.nearHits * 3 - 
                     gameStats.player.misses * 1;
    
        const postData = {
            nick_name: nickName,
            score: score,
            country_code: countryCode,
        };
    
        fetch(`${BACKEND_URL}/score-recorder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            console.log('Puntaje enviado:', data);
            // Mostrar confirmación al usuario
        })
        .catch(error => {
            console.error('Error al enviar puntaje:', error);
            // Mostrar error al usuario (puedes usar un toast o alerta)
        });
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
        // En la función setupEventListeners:
        document.getElementById('showStatsBtn')?.addEventListener('click', showStatsModal);
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
                    sendGameStatsToBackend('opponent');
                }
            });
        }
    }

    function opponentTurn() {
        if (gamePhase !== 'opponent-turn') return;
    
        addGameMessage("Turno del oponente...", true);
    
        let targetRow, targetCol;
        let validMoveFound = false;
        let attempts = 0; // Contador para evitar bucles infinitos
        const maxAttempts = boardSize * boardSize * 2; // Un límite generoso
    
        // --- Estrategia de Selección de Objetivo ---
        while (!validMoveFound && attempts < maxAttempts) {
            attempts++;
            let potentialTarget = chooseNextTarget(); // Intenta obtener un objetivo de la cola/caza
    
            if (potentialTarget) {
                targetRow = potentialTarget.row;
                targetCol = potentialTarget.col;
            } else {
                // Si no hay objetivo prioritario (modo random o cola vacía), elige al azar
                opponentMode = 'random'; // Asegura estar en modo aleatorio
                huntingInfo = null;
                targetQueue = []; // Limpia la cola por si acaso
                targetRow = Math.floor(Math.random() * boardSize);
                targetCol = Math.floor(Math.random() * boardSize);
            }
    
            // Verifica si la celda elegida es válida y no ha sido atacada
            if (isValidAndUntouched(targetRow, targetCol)) {
                validMoveFound = true;
            } else if (potentialTarget) {
                 // Si el objetivo de la cola era inválido, simplemente lo ignoramos
                 // chooseNextTarget() ya lo habrá eliminado de la cola al hacer shift()
                 console.log(`AI: Target ${targetRow},${targetCol} from queue was invalid. Trying next.`);
            }
             // Si el intento aleatorio falla, el bucle while continuará
        }
        // --- Fin Selección de Objetivo ---
    
        if (!validMoveFound) {
            console.error("AI Error: No valid move found after max attempts. Skipping turn.");
            addGameMessage("Error de la IA. Omitiendo turno.", true);
             // Volver al turno del jugador para evitar bloqueo
             gamePhase = 'player-turn';
             addGameMessage("Es tu turno. ¡Elige una coordenada para atacar!");
             checkGameEnd();
            return; // Salir si no se encontró movimiento válido
        }
    
        // Pequeño retraso para simular pensamiento y ejecución
        setTimeout(() => {
            const cell = playerBoard.querySelector(`.board-cell[data-row="${targetRow}"][data-col="${targetCol}"]`);
            if (!cell) {
                console.error(`AI Error: Cell not found at ${targetRow},${targetCol}`);
                // Recuperarse volviendo al turno del jugador
                gamePhase = 'player-turn';
                addGameMessage("Error interno. Es tu turno.");
                checkGameEnd();
                return;
            }
    
            let shotResult = 'miss'; // Resultado por defecto
            let shipId = null; // ID del barco impactado
    
            // Evalúa el disparo
            if (cell.classList.contains('occupied')) { // ¡Impacto!
                cell.innerHTML = '💥';
                cell.classList.remove('occupied'); // Quita 'occupied' para evitar re-evaluaciones
                cell.classList.add('hit');
                gameStats.opponent.hits++;
                shipId = cell.dataset.ship; // Asegúrate que 'data-ship' se asigna al crear el tablero del jugador
                shotResult = 'hit';
    
                // Verifica si el barco se hundió
                if (isShipSunk(shipId, 'player')) { // Pasamos 'player' para chequear el tablero correcto
                    markSunkShip(shipId, 'player'); // Pasamos 'player'
                    addGameMessage(`¡El oponente ha hundido tu ${getShipName(shipId)}!`);
                    gameStats.opponent.shipsSunk++;
                    shotResult = 'sunk';
                } else {
                    addGameMessage("¡Impacto! El oponente golpeó uno de tus barcos.");
                }
    
            } else if (isNearShip(targetRow, targetCol, 'player')) { // ¡Cerca! (Pasamos 'player')
                cell.innerHTML = '⚠️';
                cell.classList.add('near-hit');
                addGameMessage("El oponente estuvo cerca de uno de tus barcos.");
                gameStats.opponent.nearHits++;
                shotResult = 'near-hit';
            } else { // ¡Agua!
                cell.innerHTML = '💧';
                cell.classList.add('miss');
                addGameMessage("El oponente ha disparado al agua.");
                gameStats.opponent.misses++;
                shotResult = 'miss';
            }
    
            // Actualiza el estado de la IA basado en el resultado
            updateAIState(targetRow, targetCol, shotResult, shipId);
    
            // Devuelve el turno al jugador y verifica fin de juego
            gamePhase = 'player-turn';
            // Solo mostrar mensaje de turno si el juego no ha terminado
            if (gamePhase !== 'game-over') {
                 addGameMessage("Es tu turno. ¡Elige una coordenada para atacar!");
            }
            checkGameEnd(); // Comprobar si el juego termina después del movimiento del oponente
    
        }, 1000 + Math.random() * 1000); // Delay entre 1 y 2 segundos
    }

    function isValidAndUntouched(row, col) {
        // Verifica límites del tablero
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
            return false;
        }
        // Verifica si la celda existe y no ha sido atacada en el tablero del JUGADOR
        const cell = playerBoard.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell || cell.classList.contains('miss') || cell.classList.contains('hit') || cell.classList.contains('sunk') || cell.classList.contains('near-hit')) {
            return false; // Ya atacada (miss, hit, sunk, near-hit) o no encontrada
        }
        return true; // Válida y no atacada
    }
    
    function getAdjacentCells(target, includeDiagonals = false) {
        const { row, col } = target;
        const neighbors = [];
        // Direcciones: Arriba, Abajo, Izquierda, Derecha (y diagonales si includeDiagonals es true)
        const directions = includeDiagonals
            ? [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]] // 8 Dirs
            : [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 4 Dirs (N, S, W, E)
    
        directions.forEach(([dr, dc]) => {
            const nr = row + dr;
            const nc = col + dc;
            // No necesitamos verificar validez aquí, solo generar coordenadas
            neighbors.push({ row: nr, col: nc });
        });
        return neighbors;
    }
    
    function addValidNeighborsToQueue(target, queue, includeDiagonals = false, specificDirections = null) {
        let potentialNeighbors = getAdjacentCells(target, includeDiagonals);
    
        // Filtrar por direcciones específicas si estamos cazando
        if (specificDirections && huntingInfo) {
            const lastKnownHit = huntingInfo.lastHit || huntingInfo.firstHit;
             potentialNeighbors = potentialNeighbors.filter(n => {
                const dr = n.row - lastKnownHit.row;
                const dc = n.col - lastKnownHit.col;
                 if (dr === -1 && dc === 0 && specificDirections.includes('up')) return true;
                 if (dr === 1 && dc === 0 && specificDirections.includes('down')) return true;
                 if (dr === 0 && dc === -1 && specificDirections.includes('left')) return true;
                 if (dr === 0 && dc === 1 && specificDirections.includes('right')) return true;
                 // No añadir diagonales cuando se caza en una dirección específica por defecto
                 return false;
            });
        }
    
        const currentQueueSet = new Set(queue.map(JSON.stringify)); // Para evitar duplicados rápidos
        const newTargets = [];
    
        potentialNeighbors.forEach(neighbor => {
            if (isValidAndUntouched(neighbor.row, neighbor.col)) {
                 const neighborStr = JSON.stringify(neighbor);
                 if (!currentQueueSet.has(neighborStr)) { // Evita añadir si ya está en la cola
                    newTargets.push(neighbor);
                    currentQueueSet.add(neighborStr); // Añade al set para futuras comprobaciones en este bucle
                }
            }
        });
    
        // Añadir los nuevos objetivos al PRINCIPIO de la cola para priorizarlos
        return [...newTargets, ...queue];
        // Alternativa: Añadir al final: return [...queue, ...newTargets];
    }
    
    
    function chooseNextTarget() {
        // Siempre prioriza la cola si no está vacía
        while (targetQueue.length > 0) {
            const nextTarget = targetQueue.shift(); // Obtiene y elimina el primer elemento
            if (isValidAndUntouched(nextTarget.row, nextTarget.col)) {
                 console.log(`AI: Choosing target from queue: ${nextTarget.row},${nextTarget.col}. Mode: ${opponentMode}`);
                return nextTarget; // Devuelve el primer objetivo válido encontrado
            }
             console.log(`AI: Target ${nextTarget.row},${nextTarget.col} from queue was invalid (already hit/missed). Discarding.`);
             // Si no era válido, el bucle while cogerá el siguiente de la cola
        }
    
        // Si la cola está vacía, cambia a modo aleatorio y devuelve null
         if (opponentMode !== 'random') {
            console.log("AI: Target queue empty or exhausted. Switching to random mode.");
            opponentMode = 'random';
            huntingInfo = null; // Limpia información de caza
        }
        return null; // Indica que se debe elegir un objetivo aleatorio
    }
    
    
    function updateAIState(row, col, result, hitShipId) {
        const currentTarget = { row, col };
    
        if (result === 'sunk') {
            addGameMessage(`AI: Barco ${getShipName(hitShipId)} hundido. Limpiando objetivos relacionados.`);
            huntingInfo = null; // Se acabó la caza de este barco
            // Limpiar la cola de objetivos adyacentes al barco recién hundido
            targetQueue = filterQueueAfterSinking(hitShipId, targetQueue);
            console.log(`AI: Queue after sinking ship ${hitShipId}:`, targetQueue.length);
    
            // Si la cola queda vacía, modo aleatorio. Si no, sigue con lo que haya.
            if (targetQueue.length === 0) {
                opponentMode = 'random';
                console.log("AI: Queue empty after sinking. Switching to random.");
            } else {
                // Si quedan objetivos, probablemente sean de 'near-hit' o de otra caza incompleta
                // Mantenemos el modo que sea ('hunting' o 'near_hit_search') hasta que la cola se vacíe
                 console.log(`AI: Targets remain in queue (${targetQueue.length}). Continuing in mode ${opponentMode}.`);
            }
    
        } else if (result === 'hit') {
            if (opponentMode !== 'hunting') {
                 // Primer impacto en este barco o transición desde 'near_hit_search'
                console.log("AI: First hit! Switching to hunting mode.");
                opponentMode = 'hunting';
                huntingInfo = {
                    firstHit: currentTarget,
                    lastHit: currentTarget,
                    possibleDirections: ['up', 'down', 'left', 'right'] // Inicialmente todo es posible
                };
                 // Añadir vecinos (solo ortogonales) a la cola
                targetQueue = addValidNeighborsToQueue(currentTarget, targetQueue, false); // false = no diagonales
            } else {
                // Impacto consecutivo mientras se cazaba
                 console.log("AI: Consecutive hit while hunting.");
                 refineHuntingDirection(currentTarget); // Intenta deducir la dirección
                 huntingInfo.lastHit = currentTarget; // Actualiza el último impacto
                 // Añadir vecinos en las direcciones posibles (si se han reducido)
                 targetQueue = addValidNeighborsToQueue(currentTarget, targetQueue, false, huntingInfo.possibleDirections);
            }
            // Asegurarse de que la celda recién golpeada no esté en la cola
            targetQueue = targetQueue.filter(t => !(t.row === row && t.col === col));
            console.log(`AI: Queue after hit at ${row},${col}:`, targetQueue.length, "Directions:", huntingInfo?.possibleDirections);
    
    
        } else if (result === 'near-hit') {
             console.log("AI: Near-hit detected.");
             // Añadir TODOS los vecinos (incluyendo diagonales) a la cola si no estamos ya cazando
             if (opponentMode !== 'hunting') {
                 targetQueue = addValidNeighborsToQueue(currentTarget, targetQueue, true); // true = incluye diagonales
                 if (opponentMode === 'random') {
                     opponentMode = 'near_hit_search'; // Cambia a buscar cerca si estaba en aleatorio
                      console.log("AI: Switching to near-hit search mode.");
                 }
             } else {
                 console.log("AI: Ignored near-hit queue add because already hunting.");
                  // Opcional: Podrías añadir vecinos de near-hit con menor prioridad si estás cazando
             }
             // Asegurarse de que la celda 'near-hit' no esté en la cola
             targetQueue = targetQueue.filter(t => !(t.row === row && t.col === col));
             console.log(`AI: Queue after near-hit at ${row},${col}:`, targetQueue.length);
    
    
        } else if (result === 'miss') {
             console.log("AI: Missed.");
             if (opponentMode === 'hunting') {
                // Un fallo mientras se caza ayuda a eliminar direcciones
                eliminateHuntingDirection(currentTarget);
                console.log(`AI: Miss while hunting. Possible directions left: ${huntingInfo?.possibleDirections?.join(', ')}`);
                 // Si después de eliminar dirección, la cola de caza se vacía Y no quedan direcciones
                 if (huntingInfo && huntingInfo.possibleDirections.length === 0 && targetQueue.length === 0) {
                     console.log("AI: Hunting failed (no more directions/targets). Switching to random.");
                     opponentMode = 'random';
                     huntingInfo = null;
                 }
            }
            // Asegurarse de que la celda fallida no esté en la cola
            targetQueue = targetQueue.filter(t => !(t.row === row && t.col === col));
             // Si la cola general se vacía, volver a aleatorio
             if (targetQueue.length === 0 && opponentMode !== 'random') {
                 console.log("AI: Queue empty after miss. Switching to random mode.");
                 opponentMode = 'random';
                 huntingInfo = null;
             }
        }
    
        // Opcional: Limitar tamaño de la cola para evitar que crezca demasiado
         if (targetQueue.length > boardSize * 2) {
             targetQueue = targetQueue.slice(0, boardSize * 2); // Mantén solo los primeros N objetivos
         }
        // console.log("AI Final State:", { opponentMode, huntingInfo, queueLength: targetQueue.length });
        // console.log("Queue:", targetQueue.map(t=>`[${t.row},${t.col}]`).join(' '));
    }
    
    
    function filterQueueAfterSinking(sunkShipId, queue) {
        const sunkCellsCoords = [];
        // Encuentra todas las celdas del barco hundido en el tablero del JUGADOR
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const cell = playerBoard.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`);
                // Comprueba si tiene la clase 'sunk' Y si su data-ship coincide
                if (cell && cell.classList.contains('sunk') && cell.dataset.ship === sunkShipId) {
                     sunkCellsCoords.push({ row: r, col: c });
                }
                 // Alternativa si playerBoardState está disponible y es fiable:
                 // if (playerBoardState[r][c] === parseInt(sunkShipId)) { // Cuidado con tipos string/number
                 //    sunkCellsCoords.push({ row: r, col: c });
                 // }
            }
        }
    
        // Crea un Set con las coordenadas adyacentes (incl. diagonales) a CUALQUIER parte del barco hundido
        const cellsNearSunkShip = new Set();
        sunkCellsCoords.forEach(sunkCell => {
            // Añadir la propia celda hundida (por si estaba en la cola)
            cellsNearSunkShip.add(JSON.stringify(sunkCell));
            // Añadir todas las vecinas
            const neighbors = getAdjacentCells(sunkCell, true); // true = incluye diagonales
            neighbors.forEach(n => cellsNearSunkShip.add(JSON.stringify(n)));
        });
    
        // Filtra la cola original, manteniendo solo los objetivos que NO están en el Set
        return queue.filter(target => !cellsNearSunkShip.has(JSON.stringify(target)));
    }
    
    
    function refineHuntingDirection(hitTarget) {
        // Esta función intenta deducir si el barco es horizontal o vertical
        if (!huntingInfo || !huntingInfo.firstHit || huntingInfo.firstHit.row === hitTarget.row && huntingInfo.firstHit.col === hitTarget.col) {
            // No hay suficiente información (es el primer o segundo hit)
            return;
        }
    
        const first = huntingInfo.firstHit;
        const current = hitTarget;
    
        if (first.row === current.row) { // Posiblemente horizontal
            console.log("AI Refine: Detected horizontal possibility.");
            huntingInfo.possibleDirections = huntingInfo.possibleDirections.filter(dir => dir === 'left' || dir === 'right');
        } else if (first.col === current.col) { // Posiblemente vertical
            console.log("AI Refine: Detected vertical possibility.");
            huntingInfo.possibleDirections = huntingInfo.possibleDirections.filter(dir => dir === 'up' || dir === 'down');
        }
        // Si no es ni horizontal ni vertical respecto al primer hit (¿imposible con 2+ hits?), no hacemos nada.
    
        // Eliminar direcciones bloqueadas por bordes basado en el ÚLTIMO hit
         if (current.col === 0) huntingInfo.possibleDirections = huntingInfo.possibleDirections.filter(d => d !== 'left');
         if (current.col === boardSize - 1) huntingInfo.possibleDirections = huntingInfo.possibleDirections.filter(d => d !== 'right');
         if (current.row === 0) huntingInfo.possibleDirections = huntingInfo.possibleDirections.filter(d => d !== 'up');
         if (current.row === boardSize - 1) huntingInfo.possibleDirections = huntingInfo.possibleDirections.filter(d => d !== 'down');
    }
    
    
    function eliminateHuntingDirection(missTarget) {
        // Elimina una dirección basada en dónde ocurrió el fallo relativo al último impacto
        if (!huntingInfo || !huntingInfo.lastHit) return;
    
        const lastHit = huntingInfo.lastHit;
        const miss = missTarget;
        let eliminatedDir = null;
    
        if (miss.row < lastHit.row && miss.col === lastHit.col) eliminatedDir = 'up';
        else if (miss.row > lastHit.row && miss.col === lastHit.col) eliminatedDir = 'down';
        else if (miss.col < lastHit.col && miss.row === lastHit.row) eliminatedDir = 'left';
        else if (miss.col > lastHit.col && miss.row === lastHit.row) eliminatedDir = 'right';
    
        if (eliminatedDir && huntingInfo.possibleDirections.includes(eliminatedDir)) {
             console.log(`AI Eliminate: Eliminating direction ${eliminatedDir} due to miss at ${miss.row},${miss.col}`);
            huntingInfo.possibleDirections = huntingInfo.possibleDirections.filter(dir => dir !== eliminatedDir);
    
            // Opcional: Si ahora solo queda una dirección, podríamos intentar añadir
            // la siguiente celda en esa dirección desde el firstHit o lastHit a la cola.
            // if (huntingInfo.possibleDirections.length === 1) { ... }
        }
    }
    document
    .getElementById("btnOpenRanking")
    .addEventListener("click", function () {
      window.RankingModal.open();
    });

    // Iniciar el juego
    initGame();
    setupEventListeners();
});