document.addEventListener('DOMContentLoaded', () => {
    const boardSizeRange = document.getElementById('boardSizeRange');
    const boardSizeText = document.getElementById('boardSizeText');
    const gameBoard = document.getElementById('gameBoard');
    const shipSelectors = document.querySelectorAll('.ship');
    const rotateBtn = document.getElementById('rotateBtn');
    const selectLocationBtn = document.getElementById('selectLocationBtn');
    const weatherInfo = document.getElementById('weatherInfo');
    const temperatureInfo = document.getElementById('temperatureInfo');
    const conditionInfo = document.getElementById('conditionInfo');
    const startGameBtn = document.getElementById('startGameBtn');

    let currentBoardSize = 10;
    let selectedShip = null;
    let isHorizontal = true;
    let selectedLocation = null;

    // Board Size Handling
    boardSizeRange.addEventListener('input', () => {
        currentBoardSize = boardSizeRange.value;
        boardSizeText.textContent = `${currentBoardSize} x ${currentBoardSize}`;
        generateGameBoard();
    });

    // Generate Game Board
    function generateGameBoard() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${currentBoardSize}, 40px)`;

        for (let i = 0; i < currentBoardSize * currentBoardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('board-cell');
            cell.dataset.index = i;
            gameBoard.appendChild(cell);
        }
    }

    // Ship Selection
    shipSelectors.forEach(ship => {
        ship.addEventListener('click', () => {
            shipSelectors.forEach(s => s.classList.remove('selected'));
            ship.classList.add('selected');
            selectedShip = {
                length: parseInt(ship.dataset.length),
                name: ship.textContent.split(' ')[0]
            };
        });
    });

    // Rotation
    rotateBtn.addEventListener('click', () => {
        isHorizontal = !isHorizontal;
        rotateBtn.textContent = isHorizontal ? 'Rotar Vertical' : 'Rotar Horizontal';
    });

    // Location Selection (Mock Implementation)
    selectLocationBtn.addEventListener('click', async () => {
        console.log("Entre")
        window.initMap()
    });

    // Weather Data Fetching
    function fetchWeatherData(lat, lon) {
        const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                weatherInfo.classList.remove('d-none');
                temperatureInfo.textContent = `Temperatura: ${data.main.temp}°C`;
                conditionInfo.textContent = `Condición: ${data.weather[0].description}`;
            })
            .catch(error => {
                console.error('Error fetching weather:', error);
                weatherInfo.classList.add('d-none');
            });
    }

    // Start Game
    startGameBtn.addEventListener('click', () => {
        if (!selectedShip || !selectedLocation) {
            alert('Por favor, seleccione un barco y una ubicación.');
            return;
        }
        // Add game start logic here
        console.log('Iniciando juego', {
            boardSize: currentBoardSize,
            ship: selectedShip,
            location: selectedLocation
        });
    });

    // Initial board generation
    generateGameBoard();
});