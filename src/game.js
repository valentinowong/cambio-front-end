class Game {
    constructor(id, name, status, phase) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.phase = phase;
        this.players = []
        Game.all.push(this);
    }

    // Fetch & Render all games on the page
    static fetchAllGames(url) {
        fetch(url)
            .then(res => res.json())
            .then(gamesObjects => {

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

                

            })
    }

    // Renders a specific game card on the page
    renderGameListCard() {
        const gamesListDiv = document.getElementById('games-list');
        
        const gamecardDiv = document.createElement('div');
        gamecardDiv.className = 'card border-secondary mb-3';
        gamecardDiv.dataset.gameId = this.id;

        const cardHeaderDiv = document.createElement('div');
        cardHeaderDiv.className = 'card-header';
        cardHeaderDiv.textContent = this.name;

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const playersH3 = document.createElement('h3');
        playersH3.textContent = "Players: ";

        const playersUl = document.createElement('ul');
        playersUl.className = "players-list";

        this.players.forEach(player => {

            const playerLi = document.createElement('li');
            playerLi.textContent = player.name;
            playerLi.dataset.playerId = player.id;

            playersUl.appendChild(playerLi);

        })

        const cardBodyBreak = document.createElement('hr');

        const joinGameButton = document.createElement('button');
        joinGameButton.className = 'btn btn-secondary join-game';
        joinGameButton.dataset.gameId = this.id;
        joinGameButton.textContent = 'Join This Game';

        cardBodyDiv.appendChild(playersH3);
        cardBodyDiv.appendChild(playersUl);
        cardBodyDiv.appendChild(cardBodyBreak);
        cardBodyDiv.appendChild(joinGameButton);

        gamecardDiv.appendChild(cardHeaderDiv);
        gamecardDiv.appendChild(cardBodyDiv);

        gamesListDiv.appendChild(gamecardDiv);

    }

}

Game.all = [];