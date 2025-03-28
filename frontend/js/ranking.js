// Variable para almacenar los datos del ranking
let rankingData = {};

// Función para obtener datos del backend (del primer código)
async function fetchRankingData() {
    try {
        const response = await fetch('http://localhost:5000/ranking');
        console.log(response);
        
        if (!response.ok) {
            throw new Error('Error al obtener los datos del ranking');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
}

// Función para renderizar el ranking (combinación de ambos)
function renderRanking(data) {
    const rankingList = document.getElementById('rankingList');
    const tablaRanking = document.getElementById('body-ranking');
    
    // Determinar qué elemento usar
    const targetElement = rankingList || tablaRanking;
    if (!targetElement) {
        console.error('No se encontró el elemento para mostrar el ranking');
        return;
    }
    
    // Limpiar contenido previo
    targetElement.innerHTML = '';
    
    // Verificar si hay datos
    if (!data || Object.keys(data).length === 0) {
        targetElement.innerHTML = '<div class="no-results">No hay datos de ranking disponibles</div>';
        return;
    }
    
    // Crear tabla
    const table = document.createElement('table');
    table.className = 'table table-striped ranking-table';
    
    // Cabecera de la tabla
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th scope="col">#</th>
            <th scope="col">Jugador</th>
            <th scope="col">Puntuación</th>
            <th scope="col">País</th>
        </tr>
    `;
    
    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    
    // Procesar datos (del primer código con mejoras del segundo)
    data.forEach((usuario, index) => {
        const row = document.createElement('tr');
        
        // Estilos especiales para los primeros puestos (del primer código)
        if (index === 0) {
            row.classList.add('table-warning');
        } else if (index === 1) {
            row.classList.add('table-secondary', 'text-white');
        } else if (index === 2) {
            row.classList.add('table-danger', 'text-white');
        } else {
            row.classList.add('bg-light');
        }
        
        // Usar nick_name del primer código o nickname del segundo
        const nickname = usuario.nick_name || usuario.nickname;
        const score = usuario.score;
        const countryCode = (usuario.country_code || 'unknown').toUpperCase();
        
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${nickname}</td>
            <td>${score} pts</td>
            <td>
                <img src="https://flagsapi.com/${countryCode}/flat/24.png" 
                     alt="${countryCode}" 
                     class="country-flag"
                     onerror="this.style.display='none'">
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    // Insertar en el contenedor apropiado
    if (rankingList) {
        rankingList.appendChild(table);
    } else {
        targetElement.appendChild(table);
    }
}

// Funciones para manejar el modal (del segundo código)
async function openModal() {
    // Cargar el contenido del modal si no está ya cargado
    const modalContainer = document.getElementById('rankingModalContainer');
    if (!document.getElementById('rankingModal')) {
        const response = await fetch('ranking.html');
        const html = await response.text();
        modalContainer.innerHTML = html;
        
        // Configurar event listeners
        document.querySelector('.close-modal').addEventListener('click', closeModal);
        document.getElementById('rankingModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('rankingModal')) {
                closeModal();
            }
        });
    }
    
    const modal = document.getElementById('rankingModal');
    
    // Mostrar mensaje de carga
    const rankingList = document.getElementById('rankingList');
    if (rankingList) {
        rankingList.innerHTML = '<div class="loading">Cargando ranking...</div>';
    }
    
    modal.style.display = 'flex';
    
    // Obtener datos actualizados
    try {
        const data = await fetchRankingData();
        rankingData = data;
        renderRanking(data);
    } catch (error) {
        if (rankingList) {
            rankingList.innerHTML = '<div class="error">Error al cargar el ranking</div>';
        }
        console.error('Error al abrir el modal:', error);
    }
}

function closeModal() {
    const modal = document.getElementById('rankingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cargar ranking automáticamente si estamos en la página de ranking
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en la página de ranking independiente
    if (window.location.pathname.includes('ranking.html')) {
        // Cargar y mostrar los datos inmediatamente
        (async () => {
            try {
                const data = await fetchRankingData();
                rankingData = data;
                renderRanking(data);
            } catch (error) {
                const rankingList = document.getElementById('rankingList') || 
                                 document.getElementById('body-ranking');
                if (rankingList) {
                    rankingList.innerHTML = '<div class="error">Error al cargar el ranking</div>';
                }
                console.error('Error:', error);
            }
        })();
        
        // Configurar botón de cerrar para redirigir
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    } else if (document.getElementById('body-ranking')) {
        // Cargar ranking en otras páginas donde exista el elemento body-ranking
        (async () => {
            try {
                const data = await fetchRankingData();
                renderRanking(data);
            } catch (error) {
                console.error('Error al cargar ranking:', error);
            }
        })();
    }
});

// Exportar funciones para que puedan ser llamadas desde otros archivos
window.RankingModal = {
    open: openModal,
    close: closeModal,
    refresh: async () => {
        const data = await fetchRankingData();
        rankingData = data;
        renderRanking(data);
        return data;
    },
    renderRanking: renderRanking // Exportar también la función de renderizado
};