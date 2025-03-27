document.addEventListener("DOMContentLoaded", function () {
    const BACKEND_URL = 'http://localhost:5000'; // Ajusta según tu backend
    
    // Elementos del select personalizado
    const selectedOption = document.getElementById("selectedOption");
    const selectedImg = document.getElementById("selectedImg");
    const selectedText = document.getElementById("selectedText");
    const optionsList = document.getElementById("optionsList");
    const playerCountry = document.getElementById("playerCountry");
    
    // Cargar países desde el backend
    fetch(`${BACKEND_URL}/countries`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(countriesData => {
            // Transformar los datos del backend al formato que necesitamos
            const countries = countriesData.map(countryObj => {
                const code = Object.keys(countryObj)[0];
                return {
                    code: code.toUpperCase(),
                    name: countryObj[code]
                };
            });
            
            // Ordenar países alfabéticamente
            countries.sort((a, b) => a.name.localeCompare(b.name));
            
            // Llenar el select oculto (para el formulario)
            playerCountry.innerHTML = '';
            countries.forEach(country => {
                let option = document.createElement("option");
                option.value = country.code;
                option.textContent = country.name;
                playerCountry.appendChild(option);
            });
            
            // Llenar el menú visual
            optionsList.innerHTML = '';
            countries.forEach(country => {
                let li = document.createElement("li");
                li.dataset.value = country.code;
                li.innerHTML = `<img src="https://flagsapi.com/${country.code}/flat/24.png" alt="${country.name}" onerror="this.style.display='none'"> ${country.name}`;
                li.addEventListener("click", function () {
                    selectedImg.src = `https://flagsapi.com/${this.dataset.value}/flat/24.png`;
                    selectedText.textContent = this.textContent.trim();
                    playerCountry.value = this.dataset.value;
                    optionsList.style.display = "none";
                });
                optionsList.appendChild(li);
            });
            
            // Mostrar opciones al hacer clic
            selectedOption.addEventListener("click", function (e) {
                e.stopPropagation();
                optionsList.style.display = optionsList.style.display === "block" ? "none" : "block";
            });
            
            // Cerrar al hacer clic fuera
            document.addEventListener("click", function () {
                optionsList.style.display = "none";
            });
        })
        .catch(error => {
            console.error('Error al cargar países:', error);
            selectedText.textContent = "Error al cargar países";
        });
    
    // Manejar el envío del formulario
    document.getElementById("startForm").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const playerName = document.getElementById("playerName").value.trim();
        const countryCode = playerCountry.value;
        
        if (!playerName || !countryCode) {
            alert("Por favor completa todos los campos");
            return;
        }
        
        if (playerName.length < 3) {
            alert("El nombre debe tener al menos 3 caracteres");
            return;
        }
        
        // Mostrar indicador de carga
        document.getElementById("loadingIndicator").style.display = "block";
        

        
        
        // Simular carga (remplazar con tu lógica real)
        setTimeout(() => {
            alert(`¡Bienvenido ${playerName} (${selectedText.textContent})! Preparando el juego...`);
            document.getElementById("loadingIndicator").style.display = "none";
            
            // Redirigir al juego (reemplaza con tu URL real)
            // window.location.href = "/juego.html?player=" + encodeURIComponent(playerName) + "&country=" + countryCode;
        }, 1500);
    });
});

const selectedOption = document.getElementById("selectedOption");
const selectedImg = document.getElementById("selectedImg");
const selectedText = document.getElementById("selectedText");
const optionsList = document.getElementById("optionsList");
const playerCountry = document.getElementById("playerCountry");
const rankingModal = document.getElementById("rankingModal");

document.getElementById('btnOpenRanking').addEventListener('click', function() {
    window.RankingModal.open();
});
