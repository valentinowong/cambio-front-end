class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        Player.all.push(this);
    }

    static userLogin(event) {
    
        const configObject = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name: event.target[0].value
            })
          }
    
        // Create a new Player on the back-end
        fetch(`${apiUrl}/players`, configObject)
          .then(res => res.json())
          .then(playerObject => {
    
            // Add the Player's name to the Nav
            currentPlayer = new Player(playerObject.id, playerObject.name)
            currentPlayer.renderPlayerNameNav()
    
            // Hide the Login Form Div
            const loginFormDiv = document.getElementById('login-form-div');
            loginFormDiv.style.display = "none";
    
            // Fetch & Render all games on the page
            Game.fetchAllGames('http://localhost:3000/games')
            
            })
    
    }

    // Adds a player's name to nav bar
    renderPlayerNameNav() {
        
        const rightNavUl = document.getElementsByClassName('nav justify-content-end')[0];
        
        const playerNameLi = document.createElement('li');
        playerNameLi.className = 'nav-item';
        playerNameLi.textContent = this.name;

        rightNavUl.appendChild(playerNameLi);

    }

    // Adds a player to a game on the back-end & front-end and opens a websocket connection to that specific game channel
    join(game) {

    }
}

Player.all = []