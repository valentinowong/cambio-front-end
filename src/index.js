function userLogin(event) {
    
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
    fetch('http://localhost:3000//players', configObject)
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

let currentPlayer = ""

document.addEventListener('DOMContentLoaded', event => {
    
    const playerLoginForm = document.getElementById('login-form');
    const gameListDiv = document.getElementById('games-list');

    playerLoginForm.addEventListener('submit', event => {
        event.preventDefault();
        userLogin(event);

    })

    gameListDiv.addEventListener('click', event => {
        if (event.target.tagName === 'BUTTON' && event.target.tagName === 'btn btn-secondary join-game') {

        }
    })

    

})