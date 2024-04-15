const qstKlement = require('../../qst/qst.json');

class QstGame
{

    constructor(io) {

        this.io = io;               // Socket
        this.players = [];          // Tableau des joueurs
        this.indexQst = 0;          // Index de la question actuelle
        this.resp = [];             // Tableau des réponses
        this.uidResp = [];          // Tableau des uid des réponses

        this.nbPlayersReaded = 0;   // Nombre de joueurs qui ont lu les règles
        this.started = false;       // Définit si le jeu à commencé ou pas
        this.qst = qstKlement;      // Tableau des questions

        this.nextPlayer = 0;        // Nombre de joueur pour la prochaine manche

        this.appYes = 0;            // Nombre de joueur ayant répondu oui
        this.appNo = 0;             // Nombre de joueur ayant répondu non
        this.uidPlayerApp = null;   // UID du player faisant appel

    }

    /**
     * Sauvegarde les joueurs
     * @param users
     */
    savePlayer(users)
    {
        this.players = users;
    }


    /**
     * Permet de mélanger les questions dans un ordre aléatoire
     */
    melangerQst()
    {
        this.qst = this.qst.sort(() => Math.random() - 0.5);
    }


    /**
     * Démarre le jeu
     */
    start()
    {

        this.melangerQst();
        this.qst = this.qst.slice(0, 10);

        setTimeout(() => {
            this.fetchQuestion();
        }, 500);

    }

    /**
     * Vérifie si tous les joueurs ont lu les règles
     */
    allPlayerRead()
    {
        return this.nbPlayersReaded === this.players.length;
    }


    /**
     * Ajouter un joueur qui à lu les règles
     */
    playerReadedRules()
    {

        this.nbPlayersReaded++;

        this.getPlayerReaded();

        if (this.allPlayerRead()) {
            this.io.emit('hideModalRulesQst');
            this.start();
        }

    }

    /**
     * Récupère le nombre de joueur restant à lire les consignes
     */
    getPlayerReaded()
    {

        var playersToRead = this.players.length - this.nbPlayersReaded;

        this.io.emit('playerReadedQst', this.players.length - this.nbPlayersReaded);

    }


    /**
     * Envoie la question actuelle aux clients
     */
    fetchQuestion()
    {

        this.io.emit('fetchQst', this.qst[this.indexQst]);

    }

    /**
     * Le timer à commencé
     */
    startTimer(time)
    {

        setTimeout(() => {

            this.players.forEach(elm => {
                this.io.emit('getQstReponse', elm.uid);
            });

        }, time)

    }


    /**
     * Traitement des réponses
     * @param obj OBJ avec uid et resp
     */
    traiterResp(obj)
    {


        if (this.uidResp.includes(obj.user.uid)) {
            return;
        }

        this.resp.push(obj);
        this.uidResp.push(obj.user.uid);

        if (this.resp.length === this.players.length)
        {
            this.traiterBonneResp();
        }
    }


    /**
     * Vérification des réponses et attribution des points
     */
    traiterBonneResp()
    {

        var typeQst = this.qst[this.indexQst].type;
        var resp = this.qst[this.indexQst].reponse;

        this.resp.forEach(elm => {

            elm.win = false;

            if (typeQst === 0) {
                console.log(elm.res + " === " + resp);
                if (parseInt(elm.res) === parseInt(resp)) {
                    elm.win = true;
                }
            } else if (typeQst === 1) {

                resp.forEach(respP => {

                    if (respP.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === elm.res.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
                        elm.win = true;
                    }

                });

            } else if (typeQst === 2) {
                resp = (resp === '1') ? 'vrai' : 'faux';
                if (elm.res === resp) {
                    elm.win = true;
                }
            }

        });

        if (typeQst === 2) {
            resp = (resp === '1') ? 'Vrai' : 'Faux';
        } else if (typeQst === 0) {
            resp = String.fromCharCode(65 + parseInt(resp)) + " - " + this.qst[this.indexQst].sets[resp];
        } else if (typeQst === 1) {
            resp = this.qst[this.indexQst].reponse.join('/');
        }

        console.log(this.resp);

        this.io.emit('showRespQst', this.resp);
        this.io.emit('showRespQstFinal', resp);

    }


    /**
     * Nombre de joueur voulant passer à la prochaine manche
     */
    passerProchaineManche()
    {
        this.nextPlayer++;
        this.getPlayersRestantManche();

        console.log("Demande prochaine manche", this.nextPlayer, this.players.length)

        if (this.nextPlayer === this.players.length)
        {
            this.nextManch();
        }
    }

    /**
     * Affiche le nombre de joueur restant pour la manche
     */
    getPlayersRestantManche()
    {

        console.log("Envoie");

        this.io.emit('setPlayersRestantManche', this.players.length - this.nextPlayer)

    }

    /**
     * Permet de passer à la prochaine manche
     */
    nextManch()
    {

        this.resp = [];
        this.uidResp = [];
        this.nextPlayer = 0;
        this.uidPlayerApp = null;
        this.appYes = 0;
        this.appNo = 0;

        this.indexQst++;
        this.io.emit('nextManche');

        if (this.indexQst === 10) {
            this.io.emit('endGameQst');
            return;
        }

        setTimeout(() => {
            this.fetchQuestion();
        }, 500);

    }

    /**
     * Afficher le popup d'appel aux réponses
     * @param obj Objet de la réponse
     */
    appelResp(uid)
    {

        this.uidPlayerApp = uid;

        this.appYes = 0;
        this.appNo = 0;

        var idPlayers = -1;

        this.resp.forEach((elm, index) => {

            if (elm.user.uid === uid) {
                idPlayers = index;
            }

        });

        this.io.emit('openAppelQst', this.resp[idPlayers], (this.players.length -1));

    }

    /**
     * Réponse positive ou négative à l'appel pour une réponse
     * @param type yes ou no
     */
    reponseAppel(type)
    {

        if (type === 'yes') {
            this.appYes++;
        } else
        {
            this.appNo++;
        }

        this.io.emit('updatePlayerRestAppelQst', (this.players.length -1 ) - (this.appYes + this.appNo));

        if (this.appYes + this.appNo === (this.players.length -1)) {
            this.io.emit('showVoteAppelQst', this.appYes, this.appNo, this.players.length -1);

            this.traiterAppel();
        }

    }

    /**
     * Permet de traiter l'appel du joueur
     */
    traiterAppel()
    {

        var uid = this.uidPlayerApp;

        if (this.appYes > this.appNo) {

            var index = -1;

            this.resp.forEach((elm, i) => {

                if (elm.user.uid === uid) {
                    index = i;
                }

            });

            this.resp[index].win = true;

        }

        setTimeout(() => {
            this.io.emit('closeAppelQst');
        }, 4000);
        this.io.emit('showRespQst', this.resp);
    }
}


module.exports = { QstGame };