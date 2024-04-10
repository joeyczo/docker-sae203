import changerPanel from './panelChanger.js';
import socket from './socket.js';

/**
 * Permet de générer un identifiant unique aléatoire
 * @param {Int} taille Taille de l'identifiant (Défaut 20)
 * @returns {String} La chaîne aléatoire
 */
var randomUID = (taille = 20) => {
    var uid = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < taille; i++) {
        uid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return uid;
}


var input = document.getElementById('username');
var btnName = document.getElementById('btnName');
var uid = localStorage.getItem('uid');
var name = localStorage.getItem('name');
window.onload = function () {

    if (uid && name) {
        socket.emit('UserName', {name: name, uid: uid});
    }
}

if (!uid) {
    uid = randomUID(10);
    localStorage.setItem('uid', uid);
}
if (name) {
    input.value = name;
}

btnName.addEventListener('click', (e) => {
    e.preventDefault();
    if (input.value) {
        name = input.value;
        localStorage.setItem('name', name); // Store the name in the localStorage
        // Emit the UserName event with an object containing the name and uid
        socket.emit('UserName', {name, uid});
        input.value = '';
    }
});

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value) {
            name = input.value;
            localStorage.setItem('name', name);
            // Emit the UserName event with an object containing the name and uid
            socket.emit('UserName', {name, uid});
            input.value = '';
        }
    }
});

socket.emit('hello', 'Connection établie');
socket.emit('getEnvVars');

socket.on('hello', (arg) => {
    console.log(arg);
});


socket.on('changerPanel', async panel => {
    await changerPanel(panel);
});
