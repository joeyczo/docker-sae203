
import changerPanel from './panelChanger.js';
import socket from './socket.js';


var donneeNumJeu = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième', 'Sixième', 'Septième', 'Huitième', 'Neuvième', 'Dixième', 'Onzième', 'Douxième', 'Flemme de compte ...'];

/**
 * Affiche le nom du jeu sur la page 'presentation.html'
 * @param obj Objet [ name : nom du jeu, number : numéro du jeu, maxJeu : nombre de jeu maximum, point : nombre de point max ]
 */
var showNewGame = obj => {

    $(".infos").hide().css({'opacity':'0'});
    $(".bg-game").hide().css({'opacity':'0'})
    $(".presentation p").css({'opacity':'0'});

    $(".presentation p").html('C\'est l\'heure du ' + donneeNumJeu[obj.number] + " jeu !").animate({'opacity':1}, 500);

    setTimeout(() => {

        $(".bg-game").show().animate({'opacity':1}, 500);

        setTimeout(() => {

            $(".bg-game h1").html(obj.name).css({'opacity':'0'}).animate({'opacity':1}, 500);

        }, 500);

    }, 1000);

    setTimeout(() => {

        var txt = `
        <p>Jeu N°${obj.number+1}/${obj.maxJeu}</p>

        <p>-</p>

        <p>${obj.point}pts</p>`;

        $(".infos").html(txt).css({'opacity':'0'}).show().animate({'opacity':1}, 500);

    }, 1800);


}

var uid = localStorage.getItem('uid');
var name = localStorage.getItem('name');


socket.emit('getName', (user) => {
    console.log('Vous êtes : ', user);
});

socket.on('obj', (obj) => {
    console.log('Received game object: ', obj);
    showNewGame(obj);
});

socket.on('changerPanel', async panel => {
    await changerPanel(panel);
});
