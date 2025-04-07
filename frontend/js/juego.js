document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const gameData = JSON.parse(localStorage.getItem("currentGameData"));
  const playerBoardState = gameData.player.state;
  const opponentBoardState = gameData.opponent.state;
  const gameMessages = document.getElementById("gameMessages");
  const restartBtn = document.getElementById("restartBtn");
  const surrenderBtn = document.getElementById("surrenderBtn");
  const weatherInfo = document.getElementById("weatherInfo");
  const locationName = document.getElementById("locationName");
  const temperatureInfo = document.getElementById("temperatureInfo");
  const conditionInfo = document.getElementById("conditionInfo");
  const playerBoard = document.getElementById("playerBoard");
  const opponentBoard = document.getElementById("opponentBoard");
  const exportMaps = document.getElementById("exportMaps")
  const player = getPlayerData() || "Anónimo";
  const BACKEND_URL = "http://localhost:5000";

  //Nombres de oponentes aleatorios
  const opponentNames = [
    "Jack Sparrow",
    "Capitán Nemo",
    "Calico Jack",
    "Destructor",
    "Barba Negra",
    "William Kidd",
  ];
  // Lista de códigos de país válidos (ejemplo)
const countryCodes = ['us', 'gb', 'ca', 'au', 'br', 'fr', 'de', 'es', 'it', 'jp', 'cn', 'in', 'mx'];

  // Variables de estado del juego
  let boardSize = 10;
  let gamePhase = "setup";
  let gameLocation = null;
  let weatherData = null;
  let gameStartTime = Date.now();

  // Estadísticas del juego
  const gameStats = {
    player: {
      hits: 0,
      misses: 0,
      nearHits: 0,
      shipsSunk: 0,
    },
    opponent: {
      hits: 0,
      misses: 0,
      nearHits: 0,
      shipsSunk: 0,
    },
  };

  // Inicialización del juego
  function initGame() {
    try {
      // Cargar datos del juego desde localStorage
      const gameData = JSON.parse(localStorage.getItem("currentGameData"));
      if (!gameData) {
        throw new Error("No se encontraron datos de configuración del juego.");
      }

      // Verificar que los estados del tablero existen
      if (
        !gameData.player ||
        !gameData.player.state ||
        !gameData.opponent ||
        !gameData.opponent.state
      ) {
        throw new Error("Datos del tablero no encontrados.");
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

      displayPlayerInfo("playerInfoContainer");

      createOpponent();

      // Comenzar juego
      gamePhase = "player-turn";
      addGameMessage("¡Comienza la batalla! Es tu turno.");
    } catch (error) {
      console.error("Error al inicializar el juego:", error);
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
      weatherInfo.classList.add("d-none");
      return;
    }

    weatherInfo.classList.remove("d-none");
    locationName.textContent = gameLocation.name;

    const tempC = weatherData.main.temp;
    const tempF = (tempC * 9) / 5 + 32;
    const windSpeedKmh = (weatherData.wind.speed * 3.6).toFixed(1);
    const weatherCondition = weatherData.weather[0].main.toLowerCase();

    temperatureInfo.innerHTML = `
            <strong>Temperatura:</strong> ${tempC.toFixed(
              1
            )}°C (${tempF.toFixed(1)}°F)<br>
            <strong>Sensación térmica:</strong> ${weatherData.main.feels_like.toFixed(
              1
            )}°C
        `;

    conditionInfo.innerHTML = `
            <strong>Condición:</strong> ${
              weatherData.weather[0].description
            }<br>
            <strong>Viento:</strong> ${windSpeedKmh} km/h<br>
            <strong>Dirección:</strong> ${getWindDirection(
              weatherData.wind.deg
            )}<br>
            <strong>Humedad:</strong> ${weatherData.main.humidity}%
        `;

    setWeatherBackground(weatherCondition);
  }

  function setWeatherBackground(condition) {
    const weatherCard = document.getElementById("weatherInfo");
    const playerBoard = document.getElementById("playerBoard");
    const opponentBoard = document.getElementById("opponentBoard");

    const elements = [weatherCard, playerBoard, opponentBoard];
    elements.forEach((el) => {
      el.classList.remove(
        "weather-sunny",
        "weather-rainy",
        "weather-cloudy",
        "weather-snowy",
        "weather-stormy",
        "weather-foggy",
        "weather-night"
      );
    });

    switch (condition) {
      case "clear":
        weatherCard.classList.add("weather-sunny");
        playerBoard.classList.add("weather-sunny");
        opponentBoard.classList.add("weather-sunny");
        break;
      case "rain":
      case "drizzle":
        weatherCard.classList.add("weather-rainy");
        playerBoard.classList.add("weather-rainy");
        opponentBoard.classList.add("weather-rainy");
        break;
      case "clouds":
        weatherCard.classList.add("weather-cloudy");
        playerBoard.classList.add("weather-cloudy");
        opponentBoard.classList.add("weather-cloudy");
        break;
      case "thunderstorm":
        weatherCard.classList.add("weather-stormy");
        playerBoard.classList.add("weather-stormy");
        opponentBoard.classList.add("weather-stormy");
        break;
      case "tornado":
        weatherCard.classList.add("weather-foggy");
        playerBoard.classList.add("weather-foggy");
        opponentBoard.classList.add("weather-foggy");
        break;
      default:
        weatherCard.style.background = "#f8f9fa";
    }
  }

  function getWindDirection(degrees) {
    const directions = [
      "Norte",
      "Noreste",
      "Este",
      "Sureste",
      "Sur",
      "Suroeste",
      "Oeste",
      "Noroeste",
    ];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
  }

  // Restaurar eventos para las celdas del tablero
  function restoreCellEvents() {
    // Restaurar eventos para el tablero del oponente
    const opponentCells = opponentBoard.querySelectorAll(".board-cell");
    opponentCells.forEach((cell) => {
      // Eliminar el evento anterior si existe
      cell.replaceWith(cell.cloneNode(true));
      const newCell = opponentBoard.querySelector(
        `.board-cell[data-row="${cell.dataset.row}"][data-col="${cell.dataset.col}"]`
      );

      // Agregar evento de click solo al tablero del oponente
      newCell.addEventListener("click", function () {
        const row = parseInt(this.dataset.row);
        const col = parseInt(this.dataset.col);
        if (gamePhase === "player-turn") {
          handleCellClick(row, col);
        }
      });
    });
  }

  // Manejar clic en celdas del jugador
  function handleCellClick(row, col) {
    // Verificar que sea el turno del jugador
    if (gamePhase !== "player-turn") {
      addGameMessage("Espera tu turno para atacar.");
      return;
    }

    // Obtener referencia a la celda clickeada
    const cell = opponentBoard.querySelector(
      `.board-cell[data-row="${row}"][data-col="${col}"]`
    );

    // Verificar que la celda existe
    if (!cell) {
      console.error("Celda no encontrada:", row, col);
      return;
    }

    // Verificar que no se haya disparado aquí antes
    if (
      cell.classList.contains("miss") ||
      cell.classList.contains("hit") ||
      cell.classList.contains("sunk") ||
      cell.classList.contains("near-hit")
    ) {
      addGameMessage(
        "Ya has disparado aquí. No puedes volver a atacar esta celda."
      );
      return;
    }

    // Verificar si hay un barco en esta celda (usando opponentBoardState)
    // Dentro de handleCellClick, modificar la parte de impacto:
    if (opponentBoardState[row] && opponentBoardState[row][col] !== 0) {
      // Impacto en barco
      cell.innerHTML = "💥";
      cell.classList.add("hit");

      // Obtener ID del barco
      const shipId = opponentBoardState[row][col].toString();

      // Verificar si el barco fue hundido
      if (isShipSunk(shipId, "opponent")) {
        const shipName = getShipName(shipId);
        addGameMessage(`¡Has hundido un ${shipName}!`);
        markSunkShip(shipId, "opponent");
        // No incrementar shipsSunk aquí, ya se hace en markSunkShip
      } else {
        addGameMessage("¡Impacto! Has golpeado un barco.");
      }
      gameStats.player.hits++;
      return;
    }
    // Verificar si el disparo estuvo cerca de un barco
    else if (isNearShip(row, col, "opponent")) {
      cell.innerHTML = "⚠️";
      cell.classList.add("near-hit");
      addGameMessage("¡Estuvo cerca! El disparo cayó al lado de un barco.");
      gameStats.player.nearHits++;
    }
    // Disparo al agua
    else {
      cell.innerHTML = "💧";
      cell.classList.add("miss");
      addGameMessage("Agua. No has impactado ningún barco.");
      gameStats.player.misses++;
    }

    // Actualizar estadísticas visuales
    updateStatsDisplay();

    // Cambiar turno después del disparo
    gamePhase = "opponent-turn";

    // Pequeño delay para mejor experiencia de usuario
    setTimeout(() => {
      opponentTurn();
    }, 1000);
  }

  // Función auxiliar para actualizar el display de estadísticas
  function updateStatsDisplay() {
    const statsElement = document.getElementById("playerStats");
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
  function isShipSunk(shipId, player = "opponent") {
    const boardState =
      player === "opponent" ? opponentBoardState : playerBoardState;
    const boardElement = player === "opponent" ? opponentBoard : playerBoard;
    let allHit = true;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (boardState[row][col] == shipId) {
          const cell = boardElement.querySelector(
            `.board-cell[data-row="${row}"][data-col="${col}"]`
          );
          if (!cell || !cell.classList.contains("hit")) {
            allHit = false;
            break;
          }
        }
      }
      if (!allHit) break;
    }
    return allHit;
  }

  // Marcar un barco como hundido
  function markSunkShip(shipId, player = "opponent") {
    const boardState = player === "opponent" ? opponentBoardState : playerBoardState;
    const boardElement = player === "opponent" ? opponentBoard : playerBoard;
    
    // Verificar primero si el barco existe
    let shipExists = false;
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (boardState[row][col] == shipId) {
                shipExists = true;
                break;
            }
        }
        if (shipExists) break;
    }
    
    if (!shipExists) return;

    // Marcar todas las celdas del barco como hundidas
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (boardState[row][col] == shipId) {
                const cell = boardElement.querySelector(
                    `.board-cell[data-row="${row}"][data-col="${col}"]`
                );
                if (cell) {
                    cell.innerHTML = "🌊";
                    cell.classList.add("sunk");
                    cell.classList.remove("hit", "near-hit");
                }
            }
        }
    }
    
    // Actualizar estadísticas
    if (shipId >= 1 && shipId <= 6) {
        if (player === "opponent") {
            gameStats.player.shipsSunk = Math.min(gameStats.player.shipsSunk + 1, 6);
        } else {
            gameStats.opponent.shipsSunk = Math.min(gameStats.opponent.shipsSunk + 1, 6);
        }
        updateStatsDisplay();
    }
    
    // Verificar fin del juego después de hundir un barco
    checkGameEnd();
}

// Turno de la IA (oponente)
function opponentTurn() {
  if (gamePhase !== "opponent-turn") return;

  setTimeout(() => {
      let row, col;
      let attempts = 0;
      const maxAttempts = boardSize * boardSize;
      
      do {
          row = Math.floor(Math.random() * boardSize);
          col = Math.floor(Math.random() * boardSize);
          attempts++;
          
          if (attempts > maxAttempts) {
              addGameMessage("La IA no encontró celdas válidas para atacar");
              gamePhase = "player-turn";
              return;
          }
          
          const cell = playerBoard.querySelector(
              `.board-cell[data-row="${row}"][data-col="${col}"]`
          );
          
          if (cell && !cell.classList.contains("hit") && 
              !cell.classList.contains("miss") && 
              !cell.classList.contains("sunk")) {
              break;
          }
      } while (true);
      
      // Realizar el ataque y verificar si debe continuar
      const shouldContinueTurn = attackPlayerCell(row, col);
      
      // Cambiar de turno solo si no hubo impacto
      if (!shouldContinueTurn) {
          setTimeout(() => {
              gamePhase = "player-turn";
              addGameMessage("¡Tu turno!");
          }, 800);
      } else {
          // Si hubo impacto, la IA sigue jugando
          setTimeout(opponentTurn, 800);
      }
  }, 500);
}

// Función para que la IA ataque una celda del jugador
function attackPlayerCell(row, col) {
  const cell = playerBoard.querySelector(
    `.board-cell[data-row="${row}"][data-col="${col}"]`
  );
  
  if (!cell) return false;

  // Verificar si hay un barco en esta celda
  if (playerBoardState[row][col] !== 0) {
      // Impacto en barco
      cell.innerHTML = "💥";
      cell.classList.add("hit");
      
      // Obtener ID del barco
      const shipId = playerBoardState[row][col].toString();
      
      // Verificar si el barco fue hundido
      if (isShipSunk(shipId, "player")) {
          const shipName = getShipName(shipId);
          addGameMessage(`¡La IA ha hundido tu ${shipName}!`);
          markSunkShip(shipId, "player");
      } else {
          addGameMessage("La IA ha golpeado uno de tus barcos.");
      }
      gameStats.opponent.hits++;
      return true; // Indica que la IA debe seguir jugando
  } 
  // Verificar si el disparo estuvo cerca de un barco
  else if (isNearShip(row, col, "player")) {
      cell.innerHTML = "⚠️";
      cell.classList.add("near-hit");
      addGameMessage("¡Casi! La IA disparó cerca de uno de tus barcos.");
      gameStats.opponent.nearHits++;
  }
  // Disparo al agua
  else {
      cell.innerHTML = "💧";
      cell.classList.add("miss");
      addGameMessage("La IA ha disparado al agua.");
      gameStats.opponent.misses++;
  }
  
  // Actualizar estadísticas visuales
  updateStatsDisplay();
  return false; // Indica que el turno debe cambiar
}


  // Obtener nombre del barco
  function getShipName(shipId) {
    const ships = [
      { id: "1", name: "Submarino", length: 2 },
      { id: "2", name: "Submarino", length: 2 },
      { id: "3", name: "Crucero", length: 3 },
      { id: "4", name: "Crucero", length: 3 },
      { id: "5", name: "Acorazado", length: 4 },
      { id: "6", name: "Portaaviones", length: 5 },
    ];
    return ships.find((ship) => ship.id === shipId)?.name || "barco";
  }
  // Verificar si una celda está adyacente a un barco
  function isNearShip(row, col, player = "opponent") {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    const boardToCheck = player === "opponent" ? opponentBoard : playerBoard;

    return directions.some(([r, c]) => {
      const newRow = row + r;
      const newCol = col + c;

      if (
        newRow >= 0 &&
        newRow < boardSize &&
        newCol >= 0 &&
        newCol < boardSize
      ) {
        const adjacentCell = boardToCheck.querySelector(
          `.board-cell[data-row="${newRow}"][data-col="${newCol}"]`
        );
        return (
          (adjacentCell && adjacentCell.classList.contains("occupied")) ||
          adjacentCell.classList.contains("hit")
        );
      }
      return false;
    });
  }


// Modificar la función checkGameEnd() para usar el nuevo modal:
function checkGameEnd() {
  if (gamePhase === "game-over") return;

  const playerWins = areAllShipsSunk("opponent");
  const opponentWins = areAllShipsSunk("player");

  if (playerWins || opponentWins) {
      gamePhase = "game-over";
      const winner = playerWins ? "player" : "opponent";

      // Deshabilitar interacciones
      opponentBoard.querySelectorAll(".board-cell").forEach(cell => {
          cell.style.pointerEvents = "none";
      });

      // Mensaje final
      addGameMessage(playerWins 
          ? "¡Felicidades! Has hundido los 6 barcos enemigos." 
          : "¡Derrota! El oponente hundió tus 6 barcos.", 
      true);

      // Mostrar pantalla de victoria
      setTimeout(() => showVictoryScreen(winner), 1500);


          updateFinalStats(winner);
          sendGameStatsToBackend(winner);
  }
}
function updateFinalStats() {
  // Calcular tiempo de juego
  const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
  const minutes = Math.floor(gameDuration / 60);
  const seconds = gameDuration % 60;
  
  // Calcular puntaje
  const score = gameStats.player.hits * 10 - 
                gameStats.player.nearHits * 3 - 
                gameStats.player.misses * 1;

  // Actualizar el modal de estadísticas
  window.StatsModal.updateStats({
    player: {
      ...gameStats.player,
      score: score
    },
    opponent: gameStats.opponent,
    gameInfo: {
      time: `${minutes}m ${seconds}s`,
      location: gameLocation?.name || "Ubicación desconocida",
      weather: weatherData?.weather[0]?.description || "Condición desconocida",
      playerName: player.nick_name || "Anónimo",
      playerCountry: player.country_code || "XX"
    }
  });
}


  // Verificar si todos los barcos de un jugador han sido hundidos
  function areAllShipsSunk(player) {
    // Para el jugador o el oponente, siempre son 6 barcos (IDs del 1 al 6)
    const shipsSunk = player === "player" ? gameStats.opponent.shipsSunk : gameStats.player.shipsSunk;
    return shipsSunk === 6; // 6 barcos hundidos = victoria
}

function showVictoryScreen(winner) {
  const victoryOverlay = document.createElement("div");
  victoryOverlay.id = "victoryOverlay";
  victoryOverlay.style.position = "fixed";
  victoryOverlay.style.top = "0";
  victoryOverlay.style.left = "0";
  victoryOverlay.style.width = "100%";
  victoryOverlay.style.height = "100%";
  victoryOverlay.style.backgroundColor = "rgba(0,0,0,0.8)";
  victoryOverlay.style.display = "flex";
  victoryOverlay.style.flexDirection = "column";
  victoryOverlay.style.justifyContent = "center";
  victoryOverlay.style.alignItems = "center";
  victoryOverlay.style.zIndex = "1000";
  victoryOverlay.style.color = "white";

  victoryOverlay.innerHTML = `
    <h1>¡${winner === "player" ? "GANASTE" : "PERDISTE"}!</h1>
    <p>${winner === "player"
      ? "Has hundido toda la flota enemiga"
      : "Tu flota ha sido destruida"}</p>
    <div class="d-flex flex-column" style="width: 200px;">
      <button id="showStatsBtn" class="btn btn-primary mb-2">Ver Estadísticas</button>
      <button id="playAgainBtn" class="btn btn-success mb-2">Jugar de Nuevo</button>
      <button id="exportMaps" class="btn btn-info">Exportar mapas</button>
    </div>
  `;

  document.body.appendChild(victoryOverlay);

  

  victoryOverlay.addEventListener("click", function (e) {
    if (e.target.id === "showStatsBtn") {
      window.StatsModal.open();
    } else if (e.target.id === "playAgainBtn") {
      e.preventDefault();
      localStorage.removeItem("currentGameData");
      window.location.href = "personalizar.html";
    } else if (e.target.id === "exportMaps") {
      exportBoards();
    }
  });
}






  // Enviar estadísticas al backend
  function sendGameStatsToBackend(winner) {
    const nickName = player.nick_name || "Anónimo";
    const countryCode = player.country_code || "XX";

    const score = gameStats.player.hits * 10 - 
                gameStats.player.nearHits * 3 - 
                gameStats.player.misses * 1;

    console.log("Puntaje:", score);

    const postData = {
      nick_name: nickName,
      score: score,
      country_code: countryCode,
    };

    // Añadir return para encadenar promesas correctamente
    return fetch(`${BACKEND_URL}/score-recorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Puntaje enviado:", data);
        return data; // Retornar los datos para manejo posterior
      })
      .catch((error) => {
        console.error("Error al enviar puntaje:", error);
        throw error; // Relanzar el error para manejo superior
      });
  }

  // Añadir mensaje al historial del juego

function addGameMessage(message, isImportant = false) {
  // Limitar a 100 mensajes (elimina los más antiguos si hay más)
  const maxMessages = 400;
  const currentMessages = gameMessages.querySelectorAll("p");
  
  if (currentMessages.length >= maxMessages) {
      gameMessages.removeChild(currentMessages[0]);
  }
  
  // Crear el elemento del mensaje
  const messageElement = document.createElement("p");
  const messageCount = gameMessages.querySelectorAll("p").length + 1;
  messageElement.innerHTML = `<span class="message-counter">${messageCount}.</span> ${message}`;
  
  if (isImportant) {
      messageElement.classList.add("fw-bold", "text-primary");
  }

  gameMessages.appendChild(messageElement);
  gameMessages.scrollTop = gameMessages.scrollHeight;
}

  // Configurar event listeners
  // Mejora en la configuración de eventos iniciales
  function setupEventListeners() {
    // Configurar el botón de estadísticas en el navbar
    const navStatsBtn = document.getElementById("showStatsBtn");
    if (navStatsBtn) {
      navStatsBtn.addEventListener("click", function (e) {
        updateFinalStats();
        window.StatsModal.open();
      });
    }

    // Configurar botones de reinicio y rendición con prevención de eventos
    if (restartBtn) {
      restartBtn.addEventListener("click", function (e) {
        if (confirm("¿Estás seguro de que quieres reiniciar el juego?")) {
          localStorage.removeItem("currentGameData");
          window.location.href = "personalizar.html";
        }
      });
    }

    if (surrenderBtn) {
      surrenderBtn.addEventListener("click", function (e) {
          if (confirm("¿Estás seguro de que quieres rendirte?")) {
              addGameMessage("Te has rendido. ¡Mejor suerte la próxima vez!", true);
              gamePhase = "game-over";
                  sendGameStatsToBackend("player").then(() => {
                      showVictoryScreen("opponent");
                  });
  
          }
      });
  }
    if (exportMaps){
      exportMaps.addEventListener("click", function (e) {
        exportBoards()
      });
    }

    document
      .getElementById("btnOpenRanking")
      .addEventListener("click", function (e) {
        window.RankingModal.open();
      });
  }




  function exportBoards() {
    function createAsciiBoard(matrix, title) {
      // Ancho fijo de celda: 4 caracteres (exactos)
      const cellWidth = 4;
      
      // Líneas horizontales
      const horizontalLine = `┌${'────'.repeat(matrix[0].length)}┐\n`;
      const dividerLine = `├${'────'.repeat(matrix[0].length)}┤\n`;
      const bottomLine = `└${'────'.repeat(matrix[0].length)}┘`;
      
      let boardStr = `${title}\n${horizontalLine}`;
      
      matrix.forEach((row, rowIndex) => {
          let rowStr = '│';
          row.forEach(cell => {
              //.padEnd(cellWidth) rellena la celda con espacios hasta que tenga el tamaño de la celda
              const paddedContent = String(cell).padEnd(cellWidth).substring(0, cellWidth);
              rowStr += `${paddedContent}│`;
          });
          boardStr += `${rowStr}\n`;
          
          // Añadir divisor entre filas (excepto última)
          if (rowIndex !== matrix.length - 1) {
              boardStr += dividerLine;
          }
      });
      
      boardStr += bottomLine;
      return boardStr;
  }

    // Convertir tablero HTML a matriz
    function boardToMatrix(boardElement, who) {
        const matrix = [];
        for (let row = 0; row < boardSize; row++) {
            const rowArray = [];
            for (let col = 0; col < boardSize; col++) {
                const cell = boardElement.querySelector(
                    `.board-cell[data-row="${row}"][data-col="${col}"]`
                );
                
                let char = 'a';
                
                if (cell) {
                    if (cell.classList.contains('sunk')) {
                      if (who === "player") {
                        char = 'p1-h';
                      }
                      else {
                        char = 'p2-h'
                      }
                    } else if (cell.classList.contains('hit')) {
                      if (who === "player") {
                        char = 'p1-h';
                      }
                      else {
                        char = 'p2-h'
                      }
                    } else if (cell.classList.contains('near-hit')) {
                        char = 'b';
                    } else if (cell.classList.contains('miss')) {
                        char = 'b';
                    } else if (cell.classList.contains('occupied')) {
                        if (who === "player") {
                          char = 'p1';
                        }
                        else {
                          char = 'p2'
                        }
                    }
                }
                
                rowArray.push(char);
            }
            matrix.push(rowArray);
        }
        return matrix;
    }

    // Procesar ambos tableros
    const playerMatrix = boardToMatrix(playerBoard, "player");
    const opponentMatrix = boardToMatrix(opponentBoard, "opponent");

    // Crear contenido del archivo
    const textContent = `
╔══════════════════════════════╗
║        BATALLA NAVAL         ║
╠══════════════════════════════╣
║ Jugador: ${player.nick_name || "Anónimo"}
║ Fecha: ${new Date().toLocaleString()}
║ Ubicación: ${gameLocation?.name || "Desconocida"}
╚══════════════════════════════╝

${createAsciiBoard(playerMatrix, "TU FLOTA")}

${createAsciiBoard(opponentMatrix, "FLOTA ENEMIGA")}

╔══════════════════════════════╗
║          LEYENDA             ║
╠══════════════════════════════╣
║ p1 → Barco jugador           ║
║ p2 → Barco maquina           ║
║ p1-h → Barco jugador herido  ║
║ p2-h → Barco máquina herida  ║
║ a → Agua                     ║
║ b → Disparo fallido          ║
╚══════════════════════════════╝

ESTADÍSTICAS:
- Tus barcos hundidos: ${gameStats.opponent.shipsSunk}
- Barcos enemigos hundidos: ${gameStats.player.shipsSunk}
- Precisión: ${Math.round((gameStats.player.hits / (gameStats.player.hits + gameStats.player.misses || 1)) * 100)}%
`;

    // Crear y descargar archivo
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batalla-naval-${player.nick_name || "anonimo"}-${new Date().toISOString().slice(0,10)}.txt`;
    
    // Agregar temporalmente al documento y simular click
    document.body.appendChild(link);
    link.click();
    
    // Limpiar después de la descarga
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

//Crear oponentes aleatorios, con bandera y nombre aleatoria
function createOpponent() {
  const randomNameIndex = Math.floor(Math.random() * opponentNames.length);
  const randomName = opponentNames[randomNameIndex];
  
  const randomCountryIndex = Math.floor(Math.random() * countryCodes.length);
  const randomCountryCode = countryCodes[randomCountryIndex];
  
  // Actualizar el texto
  document.querySelector("#opponentInfo span").textContent = `${randomName}`;
  
  // Actualizar la bandera
  const flagImg = document.getElementById("opponentFlag");
  flagImg.src = `https://flagcdn.com/w20/${randomCountryCode}.png`;
  flagImg.alt = `Bandera ${randomCountryCode}`;
}

  // Iniciar el juego
  initGame();
  setupEventListeners();
});
