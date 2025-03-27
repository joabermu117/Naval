document.addEventListener("DOMContentLoaded", function () {
  const BACKEND_URL = "http://localhost:5000"; // Ajusta según tu backend

  // Elementos del select personalizado
  const selectedOption = document.getElementById("selectedOption");
  const selectedImg = document.getElementById("selectedImg");
  const selectedText = document.getElementById("selectedText");
  const optionsList = document.getElementById("optionsList");
  const playerCountry = document.getElementById("playerCountry");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const startForm = document.getElementById("startForm");

  // Cargar países desde el backend
  fetch(`${BACKEND_URL}/countries`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((countriesData) => {
      // Transformar los datos del backend al formato que necesitamos
      const countries = countriesData.map((countryObj) => {
        const code = Object.keys(countryObj)[0];
        return {
          code: code.toUpperCase(),
          name: countryObj[code],
        };
      });

      // Ordenar países alfabéticamente
      countries.sort((a, b) => a.name.localeCompare(b.name));

      // Llenar el select oculto (para el formulario)
      playerCountry.innerHTML = "";
      countries.forEach((country) => {
        let option = document.createElement("option");
        option.value = country.code;
        option.textContent = country.name;
        playerCountry.appendChild(option);
      });

      // Llenar el menú visual
      optionsList.innerHTML = "";
      countries.forEach((country) => {
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
        optionsList.style.display =
          optionsList.style.display === "block" ? "none" : "block";
      });

      // Cerrar al hacer clic fuera
      document.addEventListener("click", function () {
        optionsList.style.display = "none";
      });
    })
    .catch((error) => {
      console.error("Error al cargar países:", error);
      selectedText.textContent = "Error al cargar países";
    });

  // En la parte del submit del formulario
  startForm.addEventListener("submit", async function (e) {
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

    loadingIndicator.style.display = "block";

    try {
      // Verificar si el usuario existe
      const scoresResponse = await fetch(`${BACKEND_URL}/ranking`);
      if (!scoresResponse.ok) throw new Error("Error al verificar usuario");

      const scores = await scoresResponse.json();
      const userExists = scores.some((user) => user.nick_name === playerName);

      if (!userExists) {
        // Crear usuario nuevo
        const createResponse = await fetch(`${BACKEND_URL}/score-recorder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nick_name: playerName,
            score: 0,
            country_code: countryCode,
          }),
        });

        if (!createResponse.ok) throw new Error("Error al crear usuario");
      }

      // Guardar datos en sessionStorage (persisten hasta que se cierra la pestaña)
      sessionStorage.setItem(
        "playerData",
        JSON.stringify({
          nick_name: playerName,
          country_code: countryCode,
          country_name: selectedText.textContent.trim(),
        })
      );

      // Redirigir a personalización
      window.location.href = "personalizar.html";
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente."
      );
    } finally {
      loadingIndicator.style.display = "none";
    }}
    );
});

document
  .getElementById("btnOpenRanking")
  .addEventListener("click", function () {
    window.RankingModal.open();
  });
