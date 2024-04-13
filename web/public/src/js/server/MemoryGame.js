var randomUID = (taille = 20) => {
    var uid = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < taille; i++) {
        uid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return uid;
}

class CarteMemory
{

    constructor(image) {
        this.id = randomUID(8);
        this.image = image;
        this.uidPlayer = null;
        this.points = this.calculerPoint();
    }

    calculerPoint()
    {

    if (this.image === '20_me.svg' || this.image === '23_me.svg' || this.image === '24_me.svg' || this.image === '21_me.svg' || this.image === '22_me.svg') {
        return 20;
    }

    return 10;

    }

    /**
     * Permet de mettre l'UID du joueur qui à découvert la carte
     * @param uid
     */
    setUidPlayer(uid)
    {
        this.uidPlayer = uid;
    }

    getId() {
        return this.id;
    }

}

const NUM_CARDS = [12, 18, 24];

class MemoryGame {

    constructor(io) {

        this.io = io;                                 // Socket
        this.players = [];                            // Liste des joueurs
        this.started = false;                         // Définit si le jeu à commencé ou non
        this.cards = [];                              // Tableau des cartes
        this.numCartes = NUM_CARDS[generateNumber()]; // Nombre de cartes

        this.firstCard = null;                        // Première carte cliquée
        this.discoverd = 0;                           // Nombre de carte découverte

        this.playerReaded = 0;                        // Nombre de joueurs ayant lu les règles

    }

    /**
     * Définit les joueurs
     * @param players Tableau de joueur
     */
    savePlayer(players) {
        this.players = players;
    }

    /**
     * Démarrer le jeu
     */
    startGame()
    {
        this.started = true;
        this.showOrdreJoueur();
        this.generateCard();
        this.changerStyle();
        this.activatePlayer();
    }

    /**
     * Afficher l'ordre des joueurs
     */
    showOrdreJoueur()
    {
        this.io.emit('showPlayerRoundMemory', this.players);
    }


    /**
     * Retour le nombre de joueur restant à lire les règles
     */
    playerToReadRules() {
        var num = this.players.length - this.playerReaded;

        this.io.emit('showPlayerToReadMemory', num);
    }


    /**
     * Retourne vrai si tous les joueurs ont lu les règles
     * @returns {boolean} Vrai si tous les joueurs ont lu les règles
     */
    allPlayerRead()
    {
        return this.playerReaded === this.players.length;
    }

    /**
     * Génère les cartes du jeu
     */
    generateCard()
    {

        console.log("Nombre de carte au mémory : " + this.numCartes);

        // On génère les cartes
        for (var i = 2; i < 26 * 2; i++)
        {
            var img_carte = (i < 10) ? `0${i}` : i;

            img_carte += '_me.svg';

            this.cards.push(new CarteMemory(img_carte));
            this.cards.push(new CarteMemory(img_carte));

        }

        // On prend le nombre de carte demandé
        this.cards = this.cards.slice(0, this.numCartes * 2);

        // On mélange les cartes
        this.cards.sort(() => Math.random() - 0.5);

        // On envoie nos cartes aux joueurs
        this.io.emit('generateCardsMemory', this.cards);

        console.log(this.cards);

    }

    /**
     * Ajoute un joueur ayant lu les règles
     */
    newPlayerReadedRules()
    {
        this.playerReaded++;

        this.playerToReadRules();

        if (this.allPlayerRead()) {
            this.io.emit('hideModalMemory');
            this.startGame();
        }
    }


    /**
     * Passage au prochain joueur
     */
    nextPlayer()
    {

        this.players.push(this.players.shift());

        this.showOrdreJoueur();
        this.activatePlayer();

    }


    /**
     * Action lorsqu'un joueur clique sur une carte
     * @param id ID de la carte
     * @param uid ID du joueur
     */
    checkCard(id, uid)
    {

        console.log(uid + " === " + this.players[0].uid)

        if (uid === this.players[0].uid)
        {

            this.io.emit('otherPlayerCard', id, uid);

            if (this.firstCard === null) {

                this.firstCard = id;

                let id1 = -1;

                for (var i = 0; i < this.cards.length; i++) {
                    if (this.cards[i].id === id) {
                        id1 = i;
                        break;
                    }
                }

                this.io.emit('setImageCard', id, this.cards[id1].image);

                console.log("Première carte");

                return;

            }

            let id1 = -1;

            for (var i = 0; i < this.cards.length; i++) {
                if (this.cards[i].id === id) {
                    id1 = i;
                    break;
                }
            }

            this.io.emit('setImageCard', id, this.cards[id1].image);

            let id2 = -1;

            for (var i = 0; i < this.cards.length; i++) {
                if (this.cards[i].id === this.firstCard) {
                    id2 = i;
                    break;
                }
            }

            if (this.players[0].points === undefined) this.players[0].points = 0;

            this.players[0].points += this.cards[id1].points;

            if (this.players[0].pointsMemory === undefined) this.players[0].pointsMemory = 0;

            this.players[0].pointsMemory += this.cards[id1].points;

            if (this.cards[id1].image === this.cards[id2].image) {

                console.log("Bonne carte");

                this.discoverd++;

                if (this.discoverd === this.numCartes) {
                    console.log(this.players);
                    this.io.emit('endGameMemory');
                    return;
                }

                this.io.emit('goodCard');
                this.firstCard = null;

            } else
            {
                console.log("Mauvaise carte");

                this.io.emit('returnCard', id);
                this.io.emit('returnCard', this.firstCard);
                this.firstCard = null;


                this.disablePlayer();
                this.nextPlayer();
                this.activatePlayer();
            }


        } else {

            console.error("Mauvais joueur");

        }

    }

    /**
     * Changer le style des cartes en fonction du nombre de cartes
     */
    changerStyle()
    {

        var numGrid = 0;

        if (this.numCartes * 2 === 36) numGrid = 12;

        if (this.numCartes * 2 === 48) numGrid = 16;

        if (numGrid !== 0) {
            this.io.emit('changerStyleMemory', numGrid);
        }

    }

    /**
     * Permet d'activer le plateau du joueur en cours
     */
    activatePlayer() {
        this.io.emit('activatePlayer', this.players[0].uid);
    }

    /**
     * Permet de désactiver le plateau de tous les joueurs
     */
    disablePlayer() {
        this.io.emit('disabledAllPlayerMemory');
    }


}

function generateNumber() {
    const weightedArray = [];

    for(let i = 0; i < 85; i++) {
        weightedArray.push(0);
    }

    for(let i = 0; i < 10; i++) {
        weightedArray.push(1);
    }

    for(let i = 0; i < 5; i++) {
        weightedArray.push(2);
    }

    const randomIndex = Math.floor(Math.random() * weightedArray.length);
    return weightedArray[randomIndex];
}

module.exports = {MemoryGame, CarteMemory};