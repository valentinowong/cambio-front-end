class Card {
    constructor(image_url, value, suit, code, points, position, pile) {
        this.image_url = image_url;
        this.value = value;
        this.suit = suit;
        this.code = code;
        this.points = points;
        this.position = position;
        this.pile = 
        Card.all.push(this);
    }
}

Card.all = []