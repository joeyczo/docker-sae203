const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const {createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();

app.use(express.static(join(__dirname, 'public/src')));
console.log(join(__dirname, 'public'));


const server = createServer(app);
const io = new Server(server);

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

const users = {};

io.on('connection', (socket) => {




    const env = {
        nbJoueur: process.env.NB_JOUEUR, nbPartie: process.env.NB_PARTIE, playersCount: Object.keys(users).length
    };

    // console.log('Un utilisateur s\'est connecté');
    socket.emit('hello', 'Connexion au serveur réussie');
    socket.on('hello', (arg) => {
        console.log(arg);
    });

    socket.on('UserName', (user) => {
        // Iterate over the users object
        for (let id in users) {
            if (users[id].uid === user.uid) {
                // If a user with the same uid is found, emit 'redirect' event to the client
                socket.emit('changerPanel', '404');
                return;
            }
        }

        console.log('Nom utilisateur: ' + user.name + " " + user.uid);
        users[socket.id] = user; // Store the user object in the users object
        io.emit('player joined', user.name, env);
        socket.emit('changerPanel', 'wait');
    });

    socket.on('getName', (callback) => {
        const user = users[socket.id];
        console.log(user)
        callback(user);
    });

    socket.on('envVars', (callback) => {
        callback(env);
    });

    socket.on('disconnect', () => {
        // console.log('Utilisateur déconnecté');

        // Récupérer le nom de l'utilisateur à partir de l'ID de socket
        const name = users[socket.id];

        // Émettre un événement 'player left' avec le nom de l'utilisateur
        console.log('Déconnecté : ', name)
        if (name === undefined) {
            return;
        }
        io.emit('player left', name, env);

        // Supprimer l'utilisateur de l'objet users
        delete users[socket.id];
    });

    // socket.on('getObj', () => {
    // 	let obj = {
    // 		name: 'Nom du jeu',
    // 		number: 0,
    // 		maxJeu: 5,
    // 		point: 14
    // 	}
    // 	socket.emit('obj', obj);
    // });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

io.emit('hello', 'world');


server.listen(8080, () => {
    console.log('server running at http://localhost:8080');
});

// doc https://socket.io/docs/v4/tutorial/step-4