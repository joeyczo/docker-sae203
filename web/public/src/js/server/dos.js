// dos.js

class Card {
    constructor(color, value) {
        this.color = color;
        this.value = value;
    }
}

class Player {
    constructor(name, uid) {
        this.name = name;
        this.uid = uid;
        this.hand = [];
    }

    draw(deck) {
        const card = deck.pop();
        this.hand.push(card);
    }

    play(cardIndex) {
        return this.hand.splice(cardIndex, 1)[0];
    }
}

class DosGame {
    constructor() {
        this.players = [];
        this.deck = [];
        this.pile = [];
        this.currentColor = null;
        this.currentValue = null;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    start() {
        this.deck = this.createDeck();
        this.dealCards();
        this.playCard(this.players[0].play(0));
    }

    createDeck() {
        const colors = ['red', 'green', 'blue', 'yellow'];
        const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw two'];
        const deck = [];

        for (let color of colors) {
            for (let value of values) {
                deck.push(new Card(color, value));
                if (value !== '0') {
                    deck.push(new Card(color, value)); // Add second set of non-zero cards
                }
            }
        }

        // Add wild and wild draw four cards
        for (let i = 0; i < 4; i++) {
            deck.push(new Card('wild', 'wild'));
            deck.push(new Card('wild', 'draw four'));
        }

        // Shuffle the deck
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }

    dealCards() {
        for (let player of this.players) {
            for (let i = 0; i < 7; i++) {
                player.draw(this.deck);
            }
        }
    }

    playCard(card) {
        this.pile.push(card);
        this.currentColor = card.color;
        this.currentValue = card.value;
    }

    getState() {
        return {
            players: this.players,
            deck: this.deck,
            pile: this.pile,
            currentColor: this.currentColor,
            currentValue: this.currentValue
        };
    }
}

module.exports = { DosGame, Player, Card };