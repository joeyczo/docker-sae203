const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(express.static(join(__dirname, 'public/src')));
// console.log(join(__dirname, 'public'));
app.use(cors());

const server = createServer(app);
const io = new Server(server);

var usersEcrit = {};
let playedGames = [];
const users = new Map();
const tabMsg = new Map();
const jeux = require('./public/src/utils/jeu.json');

const {DosGame, Player} = require("./public/src/js/server/DosGame");
const {SimonGame} = require("./public/src/js/server/SimonGame");
const {MemoryGame} = require("./public/src/js/server/MemoryGame");
const {QstGame} = require("./public/src/js/server/QstGame");

const maxPoints = 10;

let availableGames = jeux.filter((game, index) => !playedGames.includes(index));
let gameIndex = Math.floor(Math.random() * availableGames.length);
let gameName = availableGames[gameIndex];

playedGames.push(jeux.indexOf(gameName));

if (playedGames.length === jeux.length) {
    playedGames = [];
}

let obj = {
    name: gameName.name,
    number: gameIndex,
    maxJeu: jeux.length,
    point: maxPoints,
    description: gameName.description
};

let env = {
    nbJoueur: parseInt(process.env.NB_JOUEUR),
    nbPartie: parseInt(process.env.NB_PARTIE),
    playersCount: users.size
};

let gameStarted = false;

class Game {
    constructor() {
        this.players = [];
        this.maxPlayers = parseInt(process.env.NB_JOUEUR);
        this.gameCount = 1;
    }

    addPlayer(player) {
        if (this.players.length < this.maxPlayers) {
            this.players.push(player);
            return true;
        } else {
            return false;
        }
    }

    removePlayer(uid) {
        this.players = this.players.filter(player => player.uid !== uid);
    }

    start() {
        if (this.gameCount > env.nbPartie) {
            console.log("La session de jeu est terminée. Impossible de démarrer une nouvelle partie.");
            return;
        }


        if (this.players.length === this.maxPlayers) {
            gameStarted = true;
            console.log(`La partie : ${this.gameCount } commence ! `);
            console.log("Liste des utilisateurs:");
            for (const user of users.values()) {
                console.log(`Nom utilisateur: ${user.name} ${user.uid}`);
            }
        }
    }

    end() {
        this.gameCount++;
        gameStarted = false;

        if (this.gameCount > env.nbPartie) {
            console.log("Fin de la session de jeu");
            this.players = [];
            this.gameCount = 0;
            io.emit('changerPanel', 'finJeu');

        } else {
            console.log("Prêt pour la prochaine partie !");

            let availableGames = jeux.filter((game, index) => !playedGames.includes(index));
            let gameIndex = Math.floor(Math.random() * availableGames.length);
            let gameName = availableGames[gameIndex];

            playedGames.push(jeux.indexOf(gameName));

            if (playedGames.length === jeux.length) {
                playedGames = [];
            }

            obj = {
                name: gameName.name,
                number: gameIndex,
                maxJeu: jeux.length,
                point: maxPoints,
                description: gameName.description
            };

            console.log("------------------------------------> GO Wait")
            io.emit('changerPanel', 'presentation');
            if (!gameStarted) {
                game.start();
                console.log("Lancement du jeu " + obj.name.toLowerCase());
                gameStarted = true;
            }

            setTimeout(() => {
                io.emit('changerPanel', obj.name.toLowerCase());
            }, 4000);

            // Create a new instance of the next game
            switch (obj.name.toLowerCase()) {
                case 'dos':
                    dosGame = new DosGame(io);
                    break;
                case 'simon':
                    simonGame = new SimonGame(io);
                    break;
                case 'memory':
                    memoryGame = new MemoryGame(io);
                    break;
                case 'qst':
                    qstGame = new QstGame(io);
                    break;
            }
        }
    }


}

let game = new Game();
let dosGame = new DosGame(io);
let simonGame = new SimonGame(io);
let memoryGame = new MemoryGame(io);
let qstGame = new QstGame(io);


io.on('connection', (socket) => {
    let user;

    if (gameStarted) {
        socket.emit('changerPanel', 'JeuLaunch');
        // socket.disconnect(true);
        return;
    }
    env = {
        nbJoueur: parseInt(process.env.NB_JOUEUR),
        nbPartie: parseInt(process.env.NB_PARTIE),
        playersCount: users.size
    };

    socket.emit('hello', 'Connexion au serveur réussie');

    socket.on('UserName', (userData) => {

        if (!userData || !userData.name || !userData.uid) {
            console.error('Pas Bon User:', userData);
            socket.emit('changerPanel', 'Erreur');
            return;
        }

        if (Array.from(users.values()).some(u => u.uid === userData.uid)) {
            socket.emit('changerPanel', '404');
            return;
        }

        const newUser = new Player(userData.name, userData.uid);
        if (!game.addPlayer(newUser)) {
            socket.emit('changerPanel', 'JeuLaunch');
            return;
        }

        users.set(socket.id, newUser);

        console.log(`Nom utilisateur: ${userData.name} ${userData.uid}`);

        env.playersCount = users.size;
        console.log(`Nombre de joueurs: ${env.playersCount} / ${env.nbJoueur}`);

        io.emit('player joined', userData.name, env);
        socket.emit('changerPanel', 'wait');

        if (env.playersCount === env.nbJoueur) {
            io.emit('changerPanel', 'presentation');
            if (!gameStarted) {
                game.start();
                console.log("Lancement du jeu " + obj.name.toLowerCase());
                gameStarted = true;
            }

            setTimeout(() => {
                io.emit('changerPanel', obj.name.toLowerCase());
            }, 4000);
        }
    });

    socket.on('disconnect', () => {
        const user = users.get(socket.id);

        if (user) {
                let currentPlayer = dosGame.getCurrentPlayer();
                if (currentPlayer && currentPlayer.uid === user.uid) {
                    dosGame.nextPlayer();
                }

            game.removePlayer(user.uid);
            dosGame.removePlayer(user.uid);
            simonGame.removePlayer(user.uid);
            memoryGame.removePlayer(user.uid);

            console.log(`User: ${user.name} ${user.uid} has left the game`);
            io.emit('player left', user, env);

            if (currentPlayer) {
                io.emit('toggle deck', currentPlayer.uid);
                io.emit('dos game debut', dosGame.getState());
            }

            users.delete(socket.id);
        }

        env.playersCount = users.size;
        console.log(`Number of players: ${env.playersCount} / ${env.nbJoueur}`);

        if (users.size === 0) {
            gameStarted = false;

            let gameIndex = Math.floor(Math.random() * jeux.length);
            let gameName = jeux[gameIndex];

            obj = {
                name: gameName.name,
                number: gameIndex,
                maxJeu: jeux.length,
                point: maxPoints,
                description: gameName.description
            };


            console.log("Relancement de plateau...");
            dosGame = new DosGame(io);
            simonGame = new SimonGame(io);
            memoryGame = new MemoryGame(io);
            qstGame = new QstGame(io);
        }
    });

    socket.on('getName', (callback) => {
        callback(users.get(socket.id));
    });

    socket.on('envVars', (callback) => {
        callback(env);
    });

    socket.on('getObj', (callback) => {
        callback(obj);
    });

    /**
    *
    * Prend une liste avec : nom client avec le message et le renvoie à tous les utilisateurs
    */
    socket.on('chat message', (msg) => {
        delete usersEcrit[msg.uid];

        io.emit('chat message', msg);
        io.emit('entrain ecrire', Object.values(usersEcrit));
    });

    socket.on('entrain ecrire', (utilisateurEcrit) => {
        if (!usersEcrit.hasOwnProperty(utilisateurEcrit.uid))
            usersEcrit[utilisateurEcrit.uid] = utilisateurEcrit;

        io.emit('entrain ecrire', Object.values(usersEcrit));
    });




    socket.on('listPlayers', (callback) => {
        callback(Array.from(users.values()));
    });

    socket.on('newGame', () => {
        game.end();
        // io.emit('changerPanel', 'wait');
    });

    const DosSocket = require('./public/src/js/server/DosSocket');
    DosSocket(socket, dosGame, io, users);

    const SimonSocket = require('./public/src/js/server/SimonSocket');
    SimonSocket(socket, simonGame, io, users);

    const MemorySocket = require('./public/src/js/server/MemorySocket');
    MemorySocket(socket, memoryGame, io, users);

    const QstSocket = require('./public/src/js/server/QstSocket');
    QstSocket(socket, qstGame, io, users);

});

// kick auto
setInterval(() => {
    // console.log("------------------> " + gameStarted);

    if (!gameStarted) {
        return;
    }
    const now = Date.now();
    const timeout = 2 * 60 * 1000;
    for (const [socketId, player] of users.entries()) {
        const tempsPasse = now - player.derniereInteraction;
        const tempsRestant = timeout - tempsPasse;
        io.to(socketId).emit('remaining time', tempsRestant);

        const currentPlayer = dosGame.getCurrentPlayer();

        if (!currentPlayer || currentPlayer.uid !== player.uid) {
            player.derniereInteraction = now;
            continue;
        }

        if (tempsPasse > timeout) {
            console.log(`Utilisateur ${player.name} : ${player.uid} a été exclu`)

            game.removePlayer(player.uid);
            dosGame.removePlayer(player.uid);
            io.to(socketId).emit('changerPanel', 'exclusion');
            io.sockets.sockets.get(socketId).disconnect(true);

            users.delete(socketId);

            dosGame.nextPlayer();
            const nextPlayer = dosGame.getCurrentPlayer();
            if (nextPlayer) {
                io.emit('toggle deck', nextPlayer.uid);
                io.emit('dos game debut', dosGame.getState());
            }
        }
    }
}, 1 * 1000);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/index.html'));
});
app.get('/presentation', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/presentation.html'));
});
app.get('/chat', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/chat.html'));
});
app.get('/wait', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/wait.html'));
});
app.get('/404', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/404.html'));
});
app.get('/Erreur', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/Erreur.html'));
});
app.get('/JeuLaunch', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/JeuLaunch.html'));
});

app.get('/exclusion', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/exclusion.html'));
});

app.get('/reboot', (req, res) => {
    gameStarted = false;
    users.clear();
    game = new Game();
    console.log("Le jeu a été relancé");
    res.send("Le jeu a été relancé");

});

// getteur Jeux :
app.get('/dos', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/dos/dos.html'));
});

app.get('/simon', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/simon/simon.html'));
});

app.get('/memory', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/memory/memory.html'));
});

app.get('/qst', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/qst/qst.html'));
});

// Fin de jeu

app.get('/fin', (req, res) => {
       res.sendFile(join(__dirname, 'public/src/panels/fin.html'));
});

app.get('/finJeu', (req, res) => {
    res.sendFile(join(__dirname, 'public/src/panels/fin.html'));
});

var port = process.env.port || 7696
server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});

// doc https://socket.io/docs/v4/tutorial/step-4