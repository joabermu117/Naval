// stats-modal.js
class StatsModal {
    constructor() {
      this.modalId = 'statsModal';
      this.modalElement = null;
      this.statsData = {
        player: {
          hits: 0,
          misses: 0,
          nearHits: 0,
          shipsSunk: 0,
          accuracy: 0,
          score: 0
        },
        opponent: {
          hits: 0,
          misses: 0,
          nearHits: 0,
          shipsSunk: 0,
          accuracy: 0
        },
        gameInfo: {
          time: '0m 0s',
          location: 'Desconocida',
          weather: 'Desconocido',
          playerName: 'Anónimo',
          playerCountry: 'XX'
        }
      };
      
      this.init();
    }
    
    async init() {
        await this.loadModalHTML();
        this.modalElement = new bootstrap.Modal(document.getElementById(this.modalId));
    }

    async loadModalHTML() {

        if (!document.getElementById(this.modalId)) {
            try {
                const response = await fetch('stats-modal.html');
                if (!response.ok) {
                    throw new Error('Error al cargar el modal de estadísticas');
                }
                const html = await response.text();
                document.body.insertAdjacentHTML('beforeend', html);
            }catch (error) {
                console.error('Error al cargar el modal:', error);
            }
        }
    }


    updateStats(data) {
      // Actualizar datos internos
      this.statsData = {
        ...this.statsData,
        ...data
      };
      
      // Calcular precisiones si no vienen en los datos
      if (data.player) {
        const totalPlayerShots = (data.player.hits || this.statsData.player.hits) + 
                                 (data.player.misses || this.statsData.player.misses);
        this.statsData.player.accuracy = totalPlayerShots > 0 
          ? Math.round(((data.player.hits || this.statsData.player.hits) / totalPlayerShots) * 100)
          : 0;
      }
      
      if (data.opponent) {
        const totalOpponentShots = (data.opponent.hits || this.statsData.opponent.hits) + 
                                   (data.opponent.misses || this.statsData.opponent.misses);
        this.statsData.opponent.accuracy = totalOpponentShots > 0 
          ? Math.round(((data.opponent.hits || this.statsData.opponent.hits) / totalOpponentShots) * 100)
          : 0;
      }
      
      // Actualizar UI
      this.updateUI();
    }
    
    updateUI() {

      const contryElement = document.getElementById("statsPlayerCountryFlag");
      if (contryElement) {
        contryElement.innerHTML = `
          <img src="https://flagsapi.com/${this.statsData.gameInfo.playerCountry}/flat/24.png"
                alt="${this.statsData.gameInfo.playerCountry}"
                onerror="this.style.display='none'">
        `;
      }


      // Actualizar estadísticas del jugador
      document.getElementById("statsPlayerName").textContent = this.statsData.gameInfo.playerName;
      document.getElementById("statsPlayerCountry").textContent = this.statsData.gameInfo.playerCountry;
      document.getElementById("statsPlayerHits").textContent = this.statsData.player.hits;
      document.getElementById("statsPlayerMisses").textContent = this.statsData.player.misses;
      document.getElementById("statsPlayerNearHits").textContent = this.statsData.player.nearHits;
      document.getElementById("statsPlayerSunk").textContent = this.statsData.player.shipsSunk;
      document.getElementById("statsPlayerAccuracy").textContent = `${this.statsData.player.accuracy}%`;
      document.getElementById("statsPlayerScore").textContent = this.statsData.player.score;
      
      // Actualizar barra de progreso del jugador
      const playerAccuracyBar = document.getElementById("playerAccuracyBar");
      if (playerAccuracyBar) {
        playerAccuracyBar.style.width = `${this.statsData.player.accuracy}%`;
        playerAccuracyBar.setAttribute("aria-valuenow", this.statsData.player.accuracy);
      }
      
      // Actualizar estadísticas del oponente
      document.getElementById("statsOpponentHits").textContent = this.statsData.opponent.hits;
      document.getElementById("statsOpponentMisses").textContent = this.statsData.opponent.misses;
      document.getElementById("statsOpponentNearHits").textContent = this.statsData.opponent.nearHits;
      document.getElementById("statsOpponentSunk").textContent = this.statsData.opponent.shipsSunk;
      document.getElementById("statsOpponentAccuracy").textContent = `${this.statsData.opponent.accuracy}%`;
      
      // Actualizar barra de progreso del oponente
      const opponentAccuracyBar = document.getElementById("opponentAccuracyBar");
      if (opponentAccuracyBar) {
        opponentAccuracyBar.style.width = `${this.statsData.opponent.accuracy}%`;
        opponentAccuracyBar.setAttribute("aria-valuenow", this.statsData.opponent.accuracy);
      }
      
      // Actualizar información adicional
      document.getElementById("statsTime").textContent = this.statsData.gameInfo.time;
      document.getElementById("statsGameLocation").textContent = this.statsData.gameInfo.location;
      document.getElementById("statsWeatherCondition").textContent = this.statsData.gameInfo.weather;
    }
    
    open() {
      this.modalElement.show();
    }
    
    close() {
      this.modalElement.hide();
    }
  }
  
  // Crear instancia global
  window.StatsModal = new StatsModal();