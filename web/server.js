const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const {createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
app.use(express.static(join(__dirname, 'public/src')));
// console.log(join(__dirname, 'public'));
app.use(cors());

const server = createServer(app);
const io = new Server(server);


const users = new Map();
const jeux = require('./public/src/utils/jeu.json');

const {DosGame , Player} = require("./public/src/js/server/DosGame");
const {SimonGame} = require("./public/src/js/server/SimonGame");
const {MemoryGame} = require("./public/src/js/server/MemoryGame");
const {QstGame} = require("./public/src/js/server/QstGame");

const maxPoints = 10;

const gameIndex = Math.floor(Math.random() * jeux.length);
const gameName = jeux[gameIndex];

let obj = {
    name: gameName.name,
    number: gameIndex,
    maxJeu: jeux.length,
    point: maxPoints,
    description: gameName.description
};
let gameStarted = false;

class Game {
    constructor() {
        this.players = [];
        this.maxPlayers = parseInt(process.env.NB_JOUEUR);
        this.gameCount = 0;
    }

    addPlayer(player) {
        if (this.players.length < this.maxPlayers) {
            this.players.push(player);
            return true;
        } else {
            return false;
        }
    }

    start() {
        if (this.players.length === this.maxPlayers) {
            gameStarted = true;
            console.log("Liste des utilisateurs:");
            for (const user of users.values()) {
                console.log(`Nom utilisateur: ${user.name} ${user.uid}`);
            }
        }
    }

    end() {
        this.gameCount++;
        if (this.gameCount > env.nbPartie) {
            console.log("Fin de la session de jeu");
        } else {
            console.log("Prêt pour la prochaine partie !");
            io.emit('changerPanel', 'wait')
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
    let env = {
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
            }, 5000);
        }
    });

    socket.on('disconnect', () => {
        const name = users.get(socket.id);
        users.delete(socket.id);

        if (name) {
            game.players = game.players.filter(player => player.uid !== name.uid);
            io.emit('player left', name, env);
        }

        env.playersCount = users.size;
        console.log(`Nombre de joueurs: ${env.playersCount}` + ` / ${env.nbJoueur}`)

        if (users.size === 0) {
            gameStarted = false;
            // game.end();
            console.log("Relancement du jeu !");
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

    // socket.on('chat message', (msg) => {
    //     io.emit('chat message', msg);
    // });

    socket.on('listPlayers', (callback) => {
        callback(Array.from(users.values()));
    });

    const DosSocket = require('./public/src/js/server/DosSocket');
    DosSocket(socket, dosGame, io, users, game, obj, env, gameStarted, maxPoints, gameName, gameIndex, jeux);

    const SimonSocket = require('./public/src/js/server/SimonSocket');
    SimonSocket(socket, simonGame, io, users);

    const MemorySocket = require('./public/src/js/server/MemorySocket');
    MemorySocket(socket, memoryGame, io, users);

    const QstSocket = require('./public/src/js/server/QstSocket');
    QstSocket(socket, qstGame, io, users);

});


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
    res.sendFile(join(__dirname, 'public/src/panels/waiting.html'));
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

var port = process.env.port || 7696
server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});

// doc https://socket.io/docs/v4/tutorial/step-4