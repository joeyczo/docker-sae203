const MAX_ORDRE = 1000;


class SimonGame
{
    constructor(io) {

        this.ordre = [];                // Ordre des couleurs
        this.io = io;                   // Socket
        this.id = 0;                    // Index max de l'ordre acutel (Ex : 5 couleurs à cliquer => 4)
        this.actArray = [];             // Tableau des couleurs actuelles
        this.actClique = 0;             // Nombre de couleurs cliquées
        this.players = [];              // Tableau des joueurs
        this.playerAct = undefined;     // Joueur actuel
        this.started = false;           // Défini si le jeu a commencé

        this.playerReaded = 0;          // Nombre de joueur ayant lu les règles

        this.pointManche = 20;          // Nombre de point par manche

        this.generateOrder();

    }

    startGame()
    {

        this.started = true;
        console.log(this.players);

        setTimeout(() => { this.showOrdreJoueur()}, 500);
        setTimeout(() => { this.affichageCouleur()}, 1000);

    }

    /**
     * Définir les joueurs
     * @param players Tableau des joueurs
     */
    savePlayer(players)
    {
        this.players = players;

        console.log("Joueurs enregistrés");
        console.log(this.players);
    }


    /**
     * Retire un joueur
     * @param uid
     */
    removePlayer(uid) {
        this.players = this.players.filter(player => player.uid !== uid);
    }


    /**
     * Permet de générer un tableau d'ordre pour le jeu Simon
     */
    generateOrder()
    {
        for (var i = 0; i < MAX_ORDRE; i++){
            this.ordre.push(Math.floor(Math.random() * 4));
        }

        console.log("L'ordre de jeu pour Simon a été généré avec succès");

    }

    /**
     * Afficher l'ordre des couleurs
     */
    affichageCouleur()
    {

        console.log('Envoie de la couleur');

        this.actArray = this.ordre.slice(0, this.id + 1);

        this.io.emit('sendColorAffichage', this.actArray);

    }

    /**
     * Action qui se passe lorsqu'un joueur clique sur une forme
     * @param forme ID de la forme [0 => 3]
     * @param uid ID du joueur
     */
    checkForme(forme, uid)
    {

        if (this.players[0].uid === uid) {

            this.io.emit('animationPlayerClick', uid, forme)

            if (this.ordre[this.actClique] === forme) {

                this.actClique++;

                if (this.actClique === this.id + 1) {

                    this.id++;
                    this.actClique = 0;

                    if (this.id === MAX_ORDRE) {
                        this.io.emit('winSimon');
                        console.log('Le joueur a gagné');
                        console.log(this.players);
                        return;
                    }

                    if (this.players[0].points === undefined) this.players[0].points = 0;

                    this.players[0].points += 10;

                    if (this.players[0].pointsMemory === undefined) this.players[0].pointsMemory = 0;

                    this.players[0].pointsMemory += 10;

                    this.nextPlayer();
                    this.showOrdreJoueur();
                    this.disableAllPlayer();

                    setTimeout(() => { this.affichageCouleur()}, 1000);

                }

            } else {

                this.io.emit('endGameSimon', uid);
                console.log('Le joueur a perdu');

                this.eliminatePlayer(uid);

            }
        } else {

            console.error("Le joueur n'est pas le bon !")

        }

    }

    /**
     * Afficher l'ordre des joueurs et le joueur acutel
     */
    showOrdreJoueur()
    {
        this.io.emit('showPlayerRoundSimon', this.players);
    }

    /**
     * Prochain joueur
     */
    nextPlayer()
    {

        this.players.push(this.players.shift());

        console.log("CHANGEMENT DE JOUEUR");
        console.log(this.players);

        this.playerAct = this.players[0];

    }

    /**
     * Permet d'activer le jeu pour le joueur selon son ID
     */
    enableGamePlayer()
    {
        this.io.emit('enableGameSimon', this.players[0].uid);
    }

    /**
     * Permet de désactiver le jeu de tous les joueurs
     */
    disableAllPlayer()
    {
        this.io.emit('disableGameSimon');
    }

    /**
     * Eliminer le joueur
     * @param uid UID du joueur
     */
    eliminatePlayer(uid)
    {

        this.players.shift();
        console.log("Joueur élinimé");
        console.log(this.players)

        this.playerAct = this.players[0];

        // TODO = Gestion des points par élimination

        this.showOrdreJoueur();
        this.disableAllPlayer();

        this.id++;
        this.actClique = 0;

        if (this.players.length === 1) {
            this.io.emit('winGameSimon', this.players[0].uid);
            console.log('Le joueur a gagné');

            setTimeout(() => {

            });
            return;
        }


        setTimeout(() => { this.affichageCouleur()}, 1000);

    }

    /**
     * Permet de définir le malus d'un joueur
     * @param uid UID du joueur qui aura le malus
     * @param player Pseudo du joueur qui a appliqué le malus
     */
    setMalusPlayer(uid, player)
    {

        this.io.emit('setMalusSimon', uid, player, 120000);

    }

    /**
     * Permet d'indiquer qu'un joueur à lu les règles
     */
    setReadedRules()
    {
        this.playerReaded++;

        this.showPlayerToRead();

        if (this.playerReaded === this.players.length) {
            this.io.emit('hideModalSimon');
            this.startGame();
        }
    }

    /**
     * Changer le nombre de joueur restant pour commencer la partie
     */
    showPlayerToRead()
    {

        var restant = this.players.length - this.playerReaded;

        this.io.emit('showPlayerToReadSimon', restant);

    }

    /**
     * Permet de savoir si tous les joueurs ont lu les règles
     * @returns {boolean} Vrai si tous les joueurs ont lu les règles
     */
    allPlayerRead()
    {
        return this.playerReaded === this.players.length;
    }

}

module.exports = {SimonGame};