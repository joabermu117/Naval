// Variable para almacenar los datos del ranking
let rankingData = {};

// Función para obtener datos del backend
async function fetchRankingData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/ranking'); // Reemplaza con tu endpoint
        console.log(response);
        
        if (!response.ok) {
            throw new Error('Error al obtener los datos del ranking');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
}

// Función para convertir los datos del backend a un array ordenado
function prepareRankingData(data) {
    return Object.values(data)
        .map(user => ({ 
            nickname: user.nickname ,// Usa el campo que corresponda
            score: user.score || 0,
            country_code: user.country_code || 'unknown'
        }))
        .sort((a, b) => b.score - a.score);
}

// Función para renderizar el ranking
function renderRanking(data) {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';
    
    const sortedUsers = prepareRankingData(data);
    
    // Mostrar máximo 10 resultados
    const usersToShow = sortedUsers.slice(0, 10);
    
    usersToShow.forEach((user, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        // Puedes agregar un indicador de posición si lo deseas
        const positionSpan = document.createElement('span');
        positionSpan.className = 'player-position';
        positionSpan.textContent = `${index + 1}.`;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-name';
        nameSpan.textContent = user.name;
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'player-score';
        scoreSpan.textContent = `${user.score} pts`;
        
        rankingItem.appendChild(positionSpan);
        rankingItem.appendChild(nameSpan);
        rankingItem.appendChild(scoreSpan);
        rankingList.appendChild(rankingItem);
    });
}

// Funciones para manejar el modal
async function openModal() {
    const modal = document.getElementById('rankingModal');
    
    // Mostrar mensaje de carga
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '<div class="loading">Cargando ranking...</div>';
    
    modal.style.display = 'flex';
    
    // Obtener datos actualizados
    try {
        const data = await fetchRankingData();
        rankingData = data;
        renderRanking(data);
    } catch (error) {
        rankingList.innerHTML = '<div class="error">Error al cargar el ranking</div>';
        console.error('Error al abrir el modal:', error);
    }
}

function closeModal() {
    const modal = document.getElementById('rankingModal');
    modal.style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modal al hacer clic en la X
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Cerrar modal al hacer clic fuera del contenido
    document.getElementById('rankingModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('rankingModal')) {
            closeModal();
        }
    });
});

// Exportar funciones para que puedan ser llamadas desde otros archivos
window.RankingModal = {
    open: openModal,
    close: closeModal,
    refresh: fetchRankingData // Opcional: para forzar actualización
};
