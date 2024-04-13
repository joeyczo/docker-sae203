module.exports = function SimonSocket(socket, simonGame, io, users) {

    socket.on('startGameSimon', () => {
        simonGame.savePlayer(Array.from(users.values()));

        if (simonGame.allPlayerRead()) {
            simonGame.startGame();
        }
    })

    socket.on('clickedForme', (forme, uid) => {

        simonGame.checkForme(forme, uid.uid);

    });

    socket.on('getNumJoueurRegleSimon', () => {
        simonGame.showPlayerToRead();
    })

    socket.on('showCouleur', () => {
        simonGame.affichageCouleur();
    })

    socket.on('endAffichageSimon', () => {
        simonGame.enableGamePlayer();
    });

    socket.on('readedRegleSimon', () => {
        simonGame.setReadedRules();
    })

}