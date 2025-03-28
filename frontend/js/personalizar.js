document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const boardSizeRange = document.getElementById('boardSizeRange');
    const boardSizeText = document.getElementById('boardSizeText');
    const gameBoard = document.getElementById('gameBoard');
    const shipSelectors = document.querySelectorAll('.ship');
    const rotateBtn = document.getElementById('rotateBtn');
    const selectLocationBtn = document.getElementById('selectLocationBtn');
    const locationSelect = document.getElementById('locationSelect');
    const weatherInfo = document.getElementById('weatherInfo');
    const weatherLoading = document.getElementById('weatherLoading');
    const temperatureInfo = document.getElementById('temperatureInfo');
    const conditionInfo = document.getElementById('conditionInfo');
    const locationName = document.getElementById('locationName');
    const startGameBtn = document.getElementById('startGameBtn');
    
    // Variables de estado
    let currentBoardSize = 10;
    let isHorizontal = true;
    let selectedLocation = null;
    
    // Configuración de barcos
    const shipsToPlace = [
        { name: "Portaaviones", length: 5, emoji: "🚢", placed: false },
        { name: "Acorazado", length: 4, emoji: "⛴", placed: false },
        { name: "Crucero", length: 3, emoji: "🛳", placed: false },
        { name: "Submarino", length: 2, emoji: "🚤", placed: false },
        { name: "Destructor", length: 1, emoji: "⚓", placed: false }
    ];
    
    let currentShipIndex = 0;
    let boardState = [];
    let hoverPreview = [];

    // Lista de ubicaciones estratégicas
    const navalLocations = [
        { name: "Estrecho de Gibraltar", lat: 36.1408, lng: -5.3536 },
        { name: "Golfo de Aden", lat: 12.4634, lng: 47.9475 },
        { name: "Estrecho de Malaca", lat: 2.3483, lng: 102.2405 },
        { name: "Mar de la China Meridional", lat: 12.8810, lng: 113.9213 },
        { name: "Mar del Norte", lat: 56.0000, lng: 3.0000 },
        { name: "Canal de la Mancha", lat: 50.2000, lng: -0.5000 },
        { name: "Golfo Pérsico", lat: 27.0000, lng: 51.0000 },
        { name: "Mar Caribe", lat: 15.0000, lng: -73.0000 },
        { name: "Mar Mediterráneo", lat: 37.0000, lng: 18.0000 },
        { name: "Mar Báltico", lat: 58.0000, lng: 20.0000 }
    ];

    // Clave API de OpenWeatherMap
    const OPENWEATHER_API_KEY = 'b752608a2ed1cae0333957838e4407e1';

    // Inicialización
    function init() {
        currentBoardSize = parseInt(boardSizeRange.value);
        boardSizeText.textContent = `${currentBoardSize} x ${currentBoardSize}`;
        generateBoardState();
        generateGameBoard();
        setupShipSelection();
        loadLocationOptions();
        updateUI();
    }

    // Cargar opciones de ubicación en el select
    function loadLocationOptions() {
        navalLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = JSON.stringify(location);
            option.textContent = location.name;
            locationSelect.appendChild(option);
        });
    }

    // Generar el estado del tablero
    function generateBoardState() {
        boardState = Array(currentBoardSize).fill().map(() => Array(currentBoardSize).fill(0));
    }

    // Generar el tablero visual
    function generateGameBoard() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${currentBoardSize}, 40px)`;
        
        for (let row = 0; row < currentBoardSize; row++) {
            for (let col = 0; col < currentBoardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('board-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('mouseover', () => handleCellHover(row, col));
                cell.addEventListener('mouseout', clearHoverPreview);
                cell.addEventListener('click', () => handleCellClick(row, col));
                
                gameBoard.appendChild(cell);
            }
        }
    }

    // Configurar la selección de barcos
    function setupShipSelection() {
        shipSelectors.forEach((ship, index) => {
            ship.addEventListener('click', () => {
                if (!shipsToPlace[index].placed) {
                    currentShipIndex = index;
                    updateUI();
                }
            });
        });
    }

    // Manejar hover sobre celdas
    function handleCellHover(row, col) {
        if (currentShipIndex >= shipsToPlace.length) return;
        
        clearHoverPreview();
        const ship = shipsToPlace[currentShipIndex];
        hoverPreview = [];
        let isValid = true;
        
        for (let i = 0; i < ship.length; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            
            if (r >= currentBoardSize || c >= currentBoardSize || boardState[r][c] !== 0) {
                isValid = false;
                break;
            }
            
            hoverPreview.push({ row: r, col: c });
        }
        
        if (isValid) {
            hoverPreview.forEach(pos => {
                const cell = document.querySelector(`.board-cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
                cell.textContent = ship.emoji;
                cell.classList.add('highlight', isValid ? 'valid' : 'invalid');
            });
        }
    }

    // Limpiar vista previa
    function clearHoverPreview() {
        hoverPreview.forEach(pos => {
            const cell = document.querySelector(`.board-cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
            if (cell && !cell.classList.contains('occupied')) {
                cell.textContent = '';
                cell.classList.remove('highlight', 'valid', 'invalid');
            }
        });
        hoverPreview = [];
    }

    // Manejar clic en celdas
    function handleCellClick(row, col) {
        if (currentShipIndex >= shipsToPlace.length) return;
        
        const ship = shipsToPlace[currentShipIndex];
        let isValid = true;
        
        for (let i = 0; i < ship.length; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            
            if (r >= currentBoardSize || c >= currentBoardSize || boardState[r][c] !== 0) {
                isValid = false;
                break;
            }
        }
        
        if (isValid) {
            for (let i = 0; i < ship.length; i++) {
                const r = isHorizontal ? row : row + i;
                const c = isHorizontal ? col + i : col;
                
                boardState[r][c] = currentShipIndex + 1;
                const cell = document.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`);
                
                cell.innerHTML = '';
                const emoji = document.createElement('div');
                emoji.className = 'ship-emoji';
                emoji.textContent = ship.emoji;
                cell.appendChild(emoji);
                
                cell.setAttribute('data-ship', currentShipIndex + 1);
                cell.classList.add('occupied');
                cell.classList.remove('highlight', 'valid', 'invalid');
            }
            
            shipsToPlace[currentShipIndex].placed = true;
            const nextShipIndex = shipsToPlace.findIndex((ship, idx) => idx >= currentShipIndex && !ship.placed);
            currentShipIndex = nextShipIndex !== -1 ? nextShipIndex : shipsToPlace.length;
            
            updateUI();
            clearHoverPreview();
        } else {
            alert("No puedes colocar el barco aquí. Hay superposición o está fuera de límites.");
        }
    }

    // Obtener datos meteorológicos
    async function fetchWeatherData(lat, lng) {
        try {
            weatherLoading.classList.remove('d-none');
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error al obtener datos meteorológicos:", error);
            throw error;
        } finally {
            weatherLoading.classList.add('d-none');
        }
    }

    // Mostrar información meteorológica
    function displayWeatherInfo(location, weatherData) {
        weatherInfo.classList.remove('d-none');
        locationName.textContent = location.name;
        
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

    // Rotar barco
    rotateBtn.addEventListener('click', () => {
        isHorizontal = !isHorizontal;
        rotateBtn.textContent = isHorizontal ? 'Rotar a Vertical' : 'Rotar a Horizontal';
        clearHoverPreview();
    });

    // Seleccionar ubicación
    selectLocationBtn.addEventListener('click', async () => {
        const selectedOption = locationSelect.value;
        
        if (!selectedOption) {
            alert("Por favor selecciona una ubicación de la lista");
            return;
        }
        
        try {
            selectedLocation = JSON.parse(selectedOption);
            const weatherData = await fetchWeatherData(selectedLocation.lat, selectedLocation.lng);
            displayWeatherInfo(selectedLocation, weatherData);
            startGameBtn.disabled = !shipsToPlace.every(ship => ship.placed);
        } catch (error) {
            alert("Error al obtener datos climáticos: " + error.message);
        }
    });

    // Iniciar juego
    startGameBtn.addEventListener('click', () => {
        if (shipsToPlace.some(ship => !ship.placed)) {
            alert("Debes colocar todos los barcos antes de iniciar el juego.");
            return;
        }
        
        if (!selectedLocation) {
            alert("Debes seleccionar una ubicación para la batalla.");
            return;
        }
        
        const gameData = {
            boardSize: currentBoardSize,
            ships: shipsToPlace.map(ship => ({
                name: ship.name,
                length: ship.length,
                positions: []
            })),
            boardState: boardState,
            location: selectedLocation
        };
        
        console.log("Juego iniciado con datos:", gameData);
        alert(`¡Batalla naval iniciada en ${selectedLocation.name}!`);
    });

    // Cambiar tamaño del tablero
    boardSizeRange.addEventListener('input', () => {
        currentBoardSize = parseInt(boardSizeRange.value);
        boardSizeText.textContent = `${currentBoardSize} x ${currentBoardSize}`;
        generateBoardState();
        generateGameBoard();
        resetShips();
        updateUI();
    });

    // Reiniciar barcos
    function resetShips() {
        shipsToPlace.forEach(ship => ship.placed = false);
        currentShipIndex = 0;
    }

    // Actualizar UI
    function updateUI() {
        shipSelectors.forEach((shipElement, index) => {
            const ship = shipsToPlace[index];
            shipElement.classList.toggle('selected', index === currentShipIndex);
            shipElement.classList.toggle('placed', ship.placed);
            
            if (ship.placed) {
                shipElement.innerHTML = `${ship.name} (${ship.length} casillas) <span class="checkmark">✓</span>`;
            } else {
                shipElement.textContent = `${ship.name} (${ship.length} casillas)`;
            }
        });
        
        startGameBtn.disabled = !shipsToPlace.every(ship => ship.placed) || !selectedLocation;
    }

    // Inicializar la aplicación
    init();
    
    if (typeof displayPlayerInfo === 'function') {
        displayPlayerInfo('playerInfoContainer');
    }
});