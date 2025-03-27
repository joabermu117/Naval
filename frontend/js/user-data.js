// user-data.js
function getPlayerData() {
    const playerData = sessionStorage.getItem('playerData');
    return playerData ? JSON.parse(playerData) : null;
}

function displayPlayerInfo(containerId) {
    const playerData = getPlayerData();
    if (!playerData) {
        console.warn('No hay datos de jugador');
        return;
    }

    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="player-info">
                <img src="https://flagsapi.com/${playerData.country_code}/flat/24.png" 
                     alt="${playerData.country_name}" 
                     onerror="this.style.display='none'">
                <span>${playerData.nick_name}</span>
            </div>
        `;
    }
}

function clearPlayerData() {
    sessionStorage.removeItem('playerData');
}