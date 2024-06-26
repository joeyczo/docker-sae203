const jeux = require("../../utils/jeu.json");
module.exports = function DosSocket(socket, dosGame, io, users, game, obj, env, gameStarted, maxPoints, gameName, gameIndex, jeux) {

    socket.on('get game debut', () => {
        dosGame.addPlayers(Array.from(users.values()));


        if (!dosGame.hasStarted()) {
            dosGame.start();
        }
        socket.emit('dos game debut', dosGame.getState());
    });

    socket.on('carte clic', ({ player, card }) => {
        // console.log("CARTE RECU : ", card);
        const playerInstance = dosGame.players.find(p => p.uid === player.uid);
        if (playerInstance) {
            playerInstance.derniereInteraction = Date.now();
            dosGame.playCard(playerInstance, card);
            io.emit('dos game debut', dosGame.getState());
        } else {
            console.log('Joueur non trouvé:', player.uid);
        }
    });

    socket.on('draw card', (playerUID) => {
        // Trouver l'instance Player correspondant à l'UID du joueur
        const player = dosGame.players.find(p => p.uid === playerUID);
        console.log(player)

        if (player) {
            player.draw(dosGame.deck, dosGame);
            player.sortHand();

            dosGame.nextPlayer()
            io.emit('toggle deck', dosGame.getCurrentPlayer().uid);

            io.emit('other player drew card', playerUID);
            io.emit('dos game debut', dosGame.getState());
        } else {
            console.log('Joueur non trouvé:', playerUID);
        }
    });

    socket.on('colorChoisi', (color) => {
        dosGame.currentColor = color;
        socket.emit('toggleModal');
        io.emit('dos game debut', dosGame.getState());
    });

    socket.on('newPlayersReadedDos', () => {
        dosGame.newPlayerReaded();
    });

    socket.on('getPlayersRestDos', () => {
        dosGame.viewPlayerRestRules();
    })


}