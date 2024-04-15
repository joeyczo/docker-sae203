module.exports = function QstSocket(socket, qstGame, io, users) {

    socket.on('playerReadedRulesQst', () => {
        qstGame.playerReadedRules();
    })

    socket.on('getPlayerReadedQst', () => {
        qstGame.getPlayerReaded();
    });

    socket.on('startGameQst', () => {

        qstGame.savePlayer(Array.from(users.values()));

        if (qstGame.allPlayerRead()) {
            qstGame.start();
        }

    });

    socket.on('timerStartedQst', (time) => {

        qstGame.startTimer(time);

    });

    socket.on('sendQstReponse', (obj) => {

        qstGame.traiterResp(obj);

    })

    socket.on('getPlayerRestManche', () => {

        qstGame.getPlayersRestantManche();

    })

    socket.on('passerProchaineMancheQst', () => {

        qstGame.passerProchaineManche();

    })

    socket.on('appelRespQst', (uid) => {

        qstGame.appelResp(uid);

    });

    socket.on('reponseAppelQst', (type) => {
        qstGame.reponseAppel(type);
    })

}