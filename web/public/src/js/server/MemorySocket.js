module.exports = function SimonSocket(socket, memoryGame, io, users) {

    socket.on('startMemoryGame', () => {

        memoryGame.savePlayer(Array.from(users.values()));

        if (memoryGame.allPlayerRead()) {
            memoryGame.startGame();
        }

    })

    socket.on('getNumJoueurRegleMemory', () => {
        memoryGame.playerToReadRules();
    });

    socket.on('newPlayerReadedRules', () => {

        memoryGame.newPlayerReadedRules();

    })

    socket.on('clickCardMemory', (card, uid) => {

        memoryGame.checkCard(card, uid);

    })

}