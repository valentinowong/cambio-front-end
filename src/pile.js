class Pile {
    constructor(id, name, game, player) {
        this.id = id;
        this.name = name;
        this.game = game;
        this.player = player;
        this.cards = [];
        Pile.all.push(this);
    }
}

Pile.all = []