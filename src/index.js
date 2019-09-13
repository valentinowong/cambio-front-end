let currentPlayer = ""
let currentGame = ""
let socket = ""
let apiUrl = 'http://localhost:3000'

document.addEventListener('DOMContentLoaded', event => {
    
    const playerLoginForm = document.getElementById('login-form');
    const gameListDiv = document.getElementById('games-list');
    const newGameForm = document.getElementById('new-game-form');

    playerLoginForm.addEventListener('submit', event => {
        event.preventDefault();
        Player.userLogin(event);

    })

    gameListDiv.addEventListener('click', event => {
        if (event.target.tagName === 'BUTTON' && event.target.className === 'btn btn-secondary join-game') {
            
            // Close the existing websocket connection to the games_channel
            socket.close();

            const configObject = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                    player_id: currentPlayer.id,
                    game_id: event.target.dataset.gameId
                })
              }
        
            // Create a new GamePlayer on the back-end
            fetch(`${apiUrl}/game_players`, configObject)
              .then(res => res.json())
              .then(gameObject => {
                console.log(gameObject);

                currentGame = Game.all.find(game => {
                    return game.id === gameObject.id
                })

                Game.joinNewGame(gameObject);
              })
        }
    })

    newGameForm.addEventListener('submit', event => {
        event.preventDefault();

        Game.createNewGame(event);

    })
    
})