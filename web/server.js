const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const {createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();
app.use(express.static(join(__dirname, 'public/src')));
// console.log(join(__dirname, 'public'));


const server = createServer(app);
const io = new Server(server);


const users = new Map();
const jeux = require('./public/src/utils/jeu.json');
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
            console.log("Lancement du jeu");

            console.log("Liste des utilisateurs:");
            for (const user of users.values()) {
                console.log(`Nom utilisateur: ${user.name} ${user.uid}`);
            }
        }
    }
}


class User {
    constructor(name, uid) {
        this.name = name;
        this.uid = uid;
    }
}

const game = new Game();


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
        user = userData;
        if (Array.from(users.values()).some(u => u.uid === user.uid)) {
            socket.emit('changerPanel', '404');
            return;
        }
        const newUser = new User(user.name, user.uid);
        if (game.addPlayer(newUser)) {
            users.set(socket.id, user);

            console.log(`Nom utilisateur: ${user.name} ${user.uid}`);

            env.playersCount = users.size;
            // console.log(`Nombre de joueurs: ${env.playersCount}` + ` / ${env.nbJoueur}`)
            if (env.playersCount > env.nbJoueur) {
                socket.emit('changerPanel', 'Erreur');
                return;
            }

            io.emit('player joined', user.name, env);
            socket.emit('changerPanel', 'wait');
            console.log(`Nombre de joueurs: ${env.playersCount}` + ` / ${env.nbJoueur}`)

            if (env.playersCount === env.nbJoueur) {
                io.emit('changerPanel', 'presentation');
                game.start();

            }
        } else {
            socket.emit('changerPanel', 'JeuLaunch');
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
            console.log("Relancement du jeu !");
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

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
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
server.listen(8080, () => {
    console.log('server running at http://localhost:8080');
});

// doc https://socket.io/docs/v4/tutorial/step-4