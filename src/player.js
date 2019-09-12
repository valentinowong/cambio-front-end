class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        Player.all.push(this);
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