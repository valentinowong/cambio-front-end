class Game {
    constructor(id, name, status, phase) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.phase = phase;
        this.players = [];
        this.piles = [];
        Game.all.push(this);
    }

    openGameDetailsWebsocketConnection() {
        socket = new WebSocket('ws://localhost:3000/cable');

        socket.onopen = function(event) {
            console.log('WebSocket is connected.');

            const msg = {
                command: 'subscribe',
                identifier: JSON.stringify({
                    id: currentGame.id,
                    channel: 'GameDetailsChannel'
                }),
            };

            socket.send(JSON.stringify(msg));
        };
        
        socket.onclose = function(event) {
        console.log('WebSocket is closed.');
        };

        socket.onmessage = function(event) {            
            const response = event.data;
            const msg = JSON.parse(response);
            
            
            if (msg.type === "ping") {
                return;
            } 

            console.log("FROM RAILS: ", msg);

            if (msg.message) {
                
                if (msg.message.game) {
                    const gameObject = msg.message.game;
    
                    const game = new Game(gameObject.id, gameObject.name, gameObject.status, gameObject.phase);
                    gameObject.players.forEach(playerObject => {
                        const player = new Player(playerObject.id, playerObject.name);
                        game.players.push(player);
                    }) 
    
                    game.renderGameListCard();
                } else if (msg.message.game_player) {
                    var gamePlayerObject = msg.message.game_player;
                    
                    var game = Game.all.find(game => {
                        return game.id === gamePlayerObject.game_id
                    })
                    var player = new Player(gamePlayerObject.id, gamePlayerObject.player_name)
                    game.players.push(player);

                    var playersUl = document.querySelector("div#game-board div.card div.card-body ul")

                    var gamePlayerStatus

                    if (gamePlayerObject.status) {
                        gamePlayerStatus = "Ready"
                    } else {
                        gamePlayerStatus = "Not Ready"
                    }
                    
                    var playerLi = document.createElement('li');
                    playerLi.textContent = `${gamePlayerObject.player_name} - ${gamePlayerStatus}`;
                    playerLi.dataset.playerId = gamePlayerObject.player_id;
                    playerLi.dataset.gameId = gamePlayerObject.game_id;
                    playerLi.id = `game-id-${gamePlayerObject.game_id}-player-id-${gamePlayerObject.player_id}`

                    playersUl.appendChild(playerLi);
                } else if (msg.message.game_player_update) {

                    const gamePlayerObject = msg.message.game_player_update;
                    
                    const playerLi = document.getElementById(`game-id-${gamePlayerObject.game_id}-player-id-${gamePlayerObject.player_id}`)

                    let gamePlayerStatus

                    if (gamePlayerObject.status) {
                        gamePlayerStatus = "Ready"
                    } else {
                        gamePlayerStatus = "Not Ready"
                    }

                    playerLi.textContent = `${gamePlayerObject.player_name} - ${gamePlayerStatus}`;

                } else if (msg.message.begin_game) {

                    const gameObject = msg.message.begin_game;

                    // Update the front-end Pile Objects & assign them to the correct game
                    
                    // Update the front-end Game Object: status & pile objects

                    // const gameCardDiv = document.getElementsByClassName('game-board').firstChild;

                    

                    const gameBoardDiv = document.getElementById('game-board');

                    while (gameBoardDiv.children.length > 0) {
                        gameBoardDiv.removeChild(gameBoardDiv.lastChild);
                    }

                    const centralPilesDiv = document.createElement('div')
                    centralPilesDiv.id = "central-piles"

                    const playedPileDiv = document.createElement('div');
                    playedPileDiv.id = 'played-pile';
                    playedPileDiv.style.display = "inline";
                    const centralDeckDiv = document.createElement('div');
                    centralDeckDiv.id = 'central-deck';
                    centralDeckDiv.style.display = "inline";

                    const centralDeckImg = document.createElement('img');
                    centralDeckImg.id = "central-deck"
                    centralDeckImg.src = "https://cdn.shopify.com/s/files/1/0200/7616/products/playing-cards-bicycle-rider-back-1_grande.png?v=1535755695";
                    centralDeckImg.width="217";
                    centralDeckImg.height="312";

                    centralDeckDiv.appendChild(centralDeckImg);

                    centralPilesDiv.appendChild(playedPileDiv);
                    centralPilesDiv.appendChild(centralDeckDiv);

                    gameBoardDiv.appendChild(centralPilesDiv)

                }

            }
            
            
          };
          
        socket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
        };
    }

    static joinNewGame(gameObject) {

        // Add current player to the Game object players
        currentGame.players.push(currentPlayer);

        // Create Pile Objects
        gameObject.piles.forEach(pileObject => {
            const pile = new Pile(pileObject.id, pileObject.name, currentGame, currentPlayer);
            currentGame.piles.push(pile);
        })

        // Create Card Objects
        gameObject.cards.forEach(cardObject => {
            const pile = Pile.all.find( element => {
                return element.id === cardObject.pile_id;
            });
            
            const card = new Card(cardObject.image_url, cardObject.value, cardObject.suit, cardObject.code, cardObject.points, cardObject.position, pile);
            pile.cards.push(card);
        })

        // Render the created game on the page
        currentGame.renderGameDetailsOnGameBoard(gameObject);

        // Hide the New Game Form Div
        const newGameFormDiv = document.getElementById('new-game-form-div');
        newGameFormDiv.style.display = "none";

        // Hide the Game List
        const gameListDiv = document.getElementById('games-list');
        gameListDiv.style.display = "none";

        // Subscribe to game specific websocket connetion
        currentGame.openGameDetailsWebsocketConnection();


    }

    // Creates a new game on the back-end and front-end
    static createNewGame(event) {

        const configObject = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: event.target[0].value,
                game_players_attributes: {
                    "0": {player_id: currentPlayer.id}
                }
            })
          }
    
        // Create a new Game on the back-end
        fetch(`${apiUrl}/games`, configObject)
          .then(res => res.json())
          .then(gameObject => {

            console.log(gameObject)

            // Close the existing websocket connection to the games_channel
            socket.close();

            // Create a new Game object on the front-end based on the game info
            currentGame = new Game(gameObject.id, gameObject.name, gameObject.status, gameObject.phase);

            Game.joinNewGame(gameObject)
          })    
            
    }

    // Adds "Create New Game" form to the page
    static showCreateGameForm() {
        const newGameFormDiv = document.getElementById('new-game-form-div');
        newGameFormDiv.style.display = "";
    }

    // Open websocket connection with new games
    static createGamesWebsocketConnection() {
        socket = new WebSocket('ws://localhost:3000/cable');

        socket.onopen = function(event) {
            console.log('WebSocket is connected.');

            const msg = {
                command: 'subscribe',
                identifier: JSON.stringify({
                  channel: 'GamesChannel',
                }),
            };
    
            socket.send(JSON.stringify(msg));
        };
        
        socket.onclose = function(event) {
        console.log('WebSocket is closed.');
        };

        socket.onmessage = function(event) {            
            const response = event.data;
            const msg = JSON.parse(response);
            
            
            if (msg.type === "ping") {
                return;
            } 

            console.log("FROM RAILS: ", msg);

            if (msg.message) {

                if (msg.message.game) {
                    const gameObject = msg.message.game;
    
                    const game = new Game(gameObject.id, gameObject.name, gameObject.status, gameObject.phase);
                    gameObject.players.forEach(playerObject => {
                        const player = new Player(playerObject.id, playerObject.name);
                        game.players.push(player);
                    }) 
    
                    game.renderGameListCard();
                } else if (msg.message.game_player) {
                    const gamePlayerObject = msg.message.game_player;
                    
                    const game = Game.all.find(game => {
                        return game.id === gamePlayerObject.game_id
                    })
                    const player = new Player(gamePlayerObject.id, gamePlayerObject.player_name)
                    game.players.push(player);

                    const playersUl = document.getElementById(`${gamePlayerObject.game_id}-players-list`)

                    const playerLi = document.createElement('li');
                    playerLi.textContent = gamePlayerObject.player_name;
                    playerLi.dataset.playerId = gamePlayerObject.player_id;
                    playerLi.dataset.gameId = gamePlayerObject.game_id;
                    playerLi.id = `game-id-${gamePlayerObject.game_id}-player-id-${gamePlayerObject.player_id}`

                    playersUl.appendChild(playerLi);
                }

            }
            
            
          };
          
        socket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
        };
    }

    // Fetch & Render all games on the page
    static fetchAllGames(url) {
        fetch(url)
            .then(res => res.json())
            .then(gamesObjects => {

                // Show the "Create New Game" form on the page
                Game.showCreateGameForm();

                gamesObjects.forEach(gameObject => {
                    
                    

                    // Create a new Game object on the front-end
                    const game = new Game(gameObject.id, gameObject.name, gameObject.status, gameObject.phase)
                    gameObject.players.forEach(playerObject => {
                        const player = new Player(playerObject.id, playerObject.name);
                        game.players.push(player);
                    }) 
                    
                    // Renders a specific game on the page
                    game.renderGameListCard();

                })

                // Open websocket connection with new games
                Game.createGamesWebsocketConnection();

            })
    }

    // Renders a created game on the page
    renderGameDetailsOnGameBoard(gameObject) {
        //Remove all other games from the games list
        const gameListDiv = document.getElementById('games-list');

        while (gameListDiv.children.length > 0) {
            gameListDiv.removeChild(gameListDiv.lastChild);
        }

        const gameBoardDiv = document.getElementById('game-board');

        // const gameCardDiv = this.renderGameCard();

        const gameCardDiv = document.createElement('div');
        gameCardDiv.className = 'card border-secondary mb-3';
        gameCardDiv.dataset.gameId = this.id;

        const cardHeaderDiv = document.createElement('div');
        cardHeaderDiv.className = 'card-header';

        const gameNameH3 = document.createElement('h3');
        gameNameH3.textContent = `${this.name} - ${this.status}`;

        cardHeaderDiv.appendChild(gameNameH3);

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const playersH4 = document.createElement('h4');
        playersH4.textContent = "Players: ";

        const playersUl = document.createElement('ul');
        playersUl.className = "players-list";
        playersUl.id = `${this.id}-players-list`

        this.players.forEach(player => {
            if (player.id === currentPlayer.id){
                const playerLi = document.createElement('li');
                playerLi.textContent = player.name;
                playerLi.dataset.playerId = player.id;
                playerLi.dataset.gameId = this.id;
                playerLi.id = `game-id-${this.id}-player-id-${player.id}`

                // For the current player in this game, add a ready button next to the li
                const currentGamePlayer = gameObject.game_players.find(game_player => {
                    return game_player.player_id === currentPlayer.id
                })
                const readyButton = document.createElement('button');
                readyButton.id = "ready-button"
                readyButton.className = 'btn btn-secondary ready-button';
                readyButton.dataset.status = "Not Ready";
                readyButton.textContent = 'Ready';
                readyButton.dataset.gamePlayerId = currentGamePlayer.id

                playerLi.appendChild(readyButton);

                playersUl.appendChild(playerLi);

            } else {

                const gamePlayer = gameObject.game_players.find(game_player => {
                    return game_player.player_id === player.id
                })

                let gamePlayerStatus

                if (gamePlayer.status) {
                    gamePlayerStatus = "Ready"
                } else {
                    gamePlayerStatus = "Not Ready"
                }

                const playerLi = document.createElement('li');
                playerLi.textContent = `${player.name} - ${gamePlayerStatus}`
                playerLi.dataset.playerId = player.id;
                playerLi.dataset.gameId = this.id;
                playerLi.id = `game-id-${this.id}-player-id-${player.id}`

                playersUl.appendChild(playerLi);
            }

        })

        cardBodyDiv.appendChild(playersH4);
        cardBodyDiv.appendChild(playersUl);

        gameCardDiv.appendChild(cardHeaderDiv);
        gameCardDiv.appendChild(cardBodyDiv);

        //

        gameBoardDiv.appendChild(gameCardDiv);

        const configObject = {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
                status: true
                })
          }

        const readyButton = document.getElementById('ready-button')

        readyButton.addEventListener('click', event => {
            
            fetch(`${apiUrl}/game_players/${Number(event.target.dataset.gamePlayerId)}`, configObject)
                .then(res => res.json())
                .then(gamePlayerObject => console.log(gamePlayerObject))

                readyButton.className = "btn btn-success ready-button"
        })

    }

    // Renders a Game Card (div)
    renderGameCard() {

        const gameCardDiv = document.createElement('div');
        gameCardDiv.className = 'card border-secondary mb-3';
        gameCardDiv.dataset.gameId = this.id;

        const cardHeaderDiv = document.createElement('div');
        cardHeaderDiv.className = 'card-header';

        const gameNameH3 = document.createElement('h3');
        gameNameH3.textContent = `${this.name} - ${this.status}`;

        cardHeaderDiv.appendChild(gameNameH3);

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const playersH4 = document.createElement('h4');
        playersH4.textContent = "Players: ";

        const playersUl = document.createElement('ul');
        playersUl.className = "players-list";
        playersUl.id = `${this.id}-players-list`

        this.players.forEach(player => {

            const playerLi = document.createElement('li');
            playerLi.textContent = player.name;
            playerLi.dataset.playerId = player.id;
            playerLi.dataset.gameId = this.id;
            playerLi.id = `game-id-${this.id}-player-id-${player.id}`

            playersUl.appendChild(playerLi);

        })

        cardBodyDiv.appendChild(playersH4);
        cardBodyDiv.appendChild(playersUl);

        gameCardDiv.appendChild(cardHeaderDiv);
        gameCardDiv.appendChild(cardBodyDiv);

        return gameCardDiv;

    }

    // Renders a specific game card on the Game List on the page
    renderGameListCard() {
        const gamesListDiv = document.getElementById('games-list');

        const gameCardDiv = this.renderGameCard()
        
        const cardBodyBreak = document.createElement('hr');

        const joinGameButton = document.createElement('button');
        joinGameButton.className = 'btn btn-secondary join-game';
        joinGameButton.dataset.gameId = this.id;
        joinGameButton.textContent = 'Join This Game';

        gameCardDiv.lastChild.appendChild(cardBodyBreak);
        gameCardDiv.lastChild.appendChild(joinGameButton);

        gamesListDiv.prepend(gameCardDiv);
    }

}

Game.all = [];