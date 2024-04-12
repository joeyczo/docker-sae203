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
            const colorComparison = orderColors.indexOf(a.color) - orderColors.indexOf(b.color);
            if (colorComparison !== 0) {
                return colorComparison;
            }
            return orderValues.indexOf(a.value) - orderValues.indexOf(b.value);
        });
    }


    isMyTurn(game) {
        return this === game.getCurrentPlayer();
    }
}

class DosGame {
    constructor(io) {
        this.io = io;
        this.players = [];
        this.deck = [];
        this.pile = [];
        this.currentColor = null;
        this.currentValue = null;
        this.started = false;
        this.currentPlayerIndex = 0;
    }

    addPlayers(players) {
        this.players = players;
    }

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

        for (let i = 0; i < 4; i++) {
            for (let specialCard of specialCards) {
                deck.push(new Card('special', specialCard));
            }
        }

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }

    playCard(player, card) {
        console.log(`Player ${player.name} is trying to play:`, card);
        // console.log('Their hand before playing:', player.hand);

        //
        if (!player.isMyTurn(this)) {
            console.log('Ce n\'est pas votre tour:', player.name);
            return;
        }


        if (card.value !== 'changement_couleur' && card.value !== 'plus_4') {
            if (this.pile.length > 0 && this.currentColor !== card.color && this.currentValue !== card.value) {
                console.log('La carte ne peut pas être jouée:', card);
                return;
            }
        }


        this.pile.push(card);
        if (card.color === 'special') {
            this.currentColor = 'special';
        } else {
            this.currentColor = card.color;
        }
        this.currentValue = card.value;

        const cardIndex = player.hand.findIndex(c => c.color === card.color && c.value === card.value);

        if (cardIndex !== -1) {
            const replacedCard = player.play(cardIndex);
            this.deck.push(replacedCard);

            for (let i = this.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
            }
        }

        switch (card.value) {
            case 'plus_2':
                this.getNextPlayer().draw(this.deck, this);
                this.getNextPlayer().draw(this.deck, this);
                break;
            case 'changement_sens':
                this.players.reverse();
                this.currentPlayerIndex = this.players.length - 1 - this.currentPlayerIndex;
                break;
            case 'interdiction':
                this.nextPlayer();
                break;
            case 'changement_couleur':
                this.currentColor = player.chooseColor();
                break;
            case 'plus_4':
                this.getNextPlayer().draw(this.deck, this);
                this.getNextPlayer().draw(this.deck, this);
                this.getNextPlayer().draw(this.deck, this);
                this.getNextPlayer().draw(this.deck, this);
                this.currentColor = player.chooseColor();
                break;
        }

        if (player.hand.length === 0) {
            this.endGame(player);
        }

        // console.log('\n\n\n\ETAT :', this.getState());
        this.nextPlayer();
        this.io.emit('toggle deck', this.getCurrentPlayer().uid);
        // console.log('Their hand after playing:', player.hand);

    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    nextPlayer() {

        this.io.to(this.getCurrentPlayer().uid).emit('toggle deck');

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        console.log(`C'est le tour de ${this.getCurrentPlayer().name}`);

        this.io.to(this.getCurrentPlayer().uid).emit('toggle deck');
    }

    start() {
        console.log('Starting game');
        this.started = true;
        this.deck = this.createDeck();
        this.dealCards();

        let firstCard;
        do {
            firstCard = this.deck.pop();
        } while (firstCard.color === 'special' || firstCard.value === 'interdiction' || firstCard.value === 'plus_2' || firstCard.value === 'changement_sens' || firstCard.value === 'changement_couleur' || firstCard.value === 'plus_4' || firstCard.value === 'changement_sens');

        this.playCard(this.getCurrentPlayer(), firstCard);

        this.players.forEach(player => {
            this.io.to(player.uid).emit('toggle deck');
        });

        this.io.to(this.getCurrentPlayer().uid).emit('toggle deck');
    }

    getState() {
        return {
            players: this.players,
            deck: this.deck,
            pile: this.pile,
            currentColor: this.currentColor,
            currentValue: this.currentValue,
            currentPlayer: this.getCurrentPlayer()
        };
    }

    hasStarted() {
        return this.started;
    }

    getNextPlayer() {
        return this.players[(this.currentPlayerIndex + 1) % this.players.length];
    }

    skipNextPlayer() {
        this.nextPlayer();
    }

    endGame(winningPlayer) {
        console.log(`Le joueur ${winningPlayer.name} a gagné !`);
        this.started = false;
    }
}

module.exports = { DosGame, Player, Card };