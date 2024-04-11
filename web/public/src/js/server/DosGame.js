
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

    draw(deck, game) {
        // si le deck est vide, on le remplit avec le deck de la partie
        if (deck.length === 0) {
            deck.push(...game.createDeck());
        }
        const card = deck.pop();
        this.hand.push(card);
    }

    play(cardIndex) {
        return this.hand.splice(cardIndex, 1)[0];
    }

    sortHand() {
        const orderValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'plus_2', 'changement_sens', 'interdiction', 'changement_couleur', 'plus_4'];
        const orderColors = ['bleu', 'jaune', 'rouge', 'vert', 'special'];
        this.hand.sort((a, b) => {
            // Compare les couleurs d'abord
            const colorComparison = orderColors.indexOf(a.color) - orderColors.indexOf(b.color);
            if (colorComparison !== 0) {
                return colorComparison;
            }
            // Si les couleurs sont égales, compare les valeurs
            return orderValues.indexOf(a.value) - orderValues.indexOf(b.value);
        });
    }
}

class DosGame {
    constructor() {
        this.players = [];
        this.deck = [];
        this.pile = [];
        this.currentColor = null;
        this.currentValue = null;
        this.started = false;

    }

    addPlayers(players) {
        this.players = players;
    }


    // distrib
    dealCards() {
        for (let player of this.players) {
            player.hand = [];
            for (let i = 0; i < 7; i++) {
                const card = this.deck.pop();
                player.hand.push(card);
            }
            player.sortHand();

        }
    }

    createDeck() {
        const colors = ['bleu', 'jaune', 'rouge', 'vert'];
        const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'plus_2', 'changement_sens', 'interdiction'];
        const specialCards = ['changement_couleur', 'plus_4'];
        const deck = [];

        for (let color of colors) {
            for (let value of values) {
                deck.push(new Card(color, value));
            }
        }

        // les cartes spéciales
        for (let i = 0; i < 4; i++) {
            for (let specialCard of specialCards) {
                deck.push(new Card('special', specialCard));
            }
        }

        // mélange
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }



    playCard(player, card) {
        console.log('Playing card:', card);
        this.pile.push(card);
        if (card.color === 'special') {
            this.currentColor = 'special';
        } else {
            this.currentColor = card.color;
        }
        this.currentValue = card.value;

        const cardIndex = player.hand.findIndex(c => c.color === card.color && c.value === card.value);

        if (cardIndex !== -1) {
            // Ajouter la carte remplacée au deck
            const replacedCard = player.play(cardIndex);
            this.deck.push(replacedCard);

            // Mélanger le deck
            for (let i = this.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
            }
        }

        console.log('\n\n\n\ETAT :', this.getState());
    }


    start() {
        console.log('Starting game');
        this.started = true;
        this.deck = this.createDeck(); // Créez le deck une seule fois ici
        this.dealCards(); // Distribuez les cartes à partir du même deck


        let firstCard;
        do {
            firstCard = this.deck.pop();
        } while (firstCard.color === 'special' || firstCard.value === 'interdiction' || firstCard.value === 'plus_2' || firstCard.value === 'changement_sens' || firstCard.value === 'changement_couleur' || firstCard.value === 'plus_4' || firstCard.value === 'changement_sens');

        this.playCard(this.players[0], firstCard);
        console.log('Game state after starting:', this.getState());
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


    hasStarted() {
        return this.started;
    }
}

module.exports = { DosGame, Player, Card };