import changerPanel from '../server/panelChanger.js';
import socket from '../server/socket.js';

console.log("wait.js chargé");


var randomUID = (taille = 20) => {
    var uid = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < taille; i++) {
        uid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return uid;
}
var playerJoined = name => {

    var rand = randomUID(10);

    var txt = `
    <div id="${rand}" class="item good">
            
        <div class="icon">

            <img src="../../img/arrow_r.svg" alt="Flèche">
            
        </div>

        <p><b>${name}</b> vient d'arriver</p>
        
    </div>`;

    $(".msg-disp").append(txt);

    $("#" + rand).animate({'opacity':1}, 500);

    setTimeout(() => {

        $("#" + rand).animate({'opacity':0}, 500, function() {
            $(this).remove();
        });

    }, 5000);

}

var playerLeft = name => {

    var rand = randomUID(10);

    var txt = `
    <div id="${rand}" class="item error">

        <div class="icon">

            <img src="../../img/arrow_e.svg" alt="Flèche">

        </div>

        <p><b>${name.name}</b> nous a quiité !</p>

    </div>
    `;

    $(".msg-disp").append(txt);

    $("#" + rand).animate({'opacity':1}, 500);

    setTimeout(() => {

        $("#" + rand).animate({'opacity':0}, 500, function() {
            $(this).remove();
        });

    }, 5000);

}

var element = document.querySelector('.btn-changename');

if (element != null){
    element.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
}

var changementJoueur = (joueur, nbMax, players) => {

    socket.emit('listPlayers', players => {
        console.log(players);
        var playerNames = players.map(player => player.name).join(', ');
        $(".indice").html(`${joueur}/${nbMax}`);
        $(".playerNames").html(`${playerNames}`)
    });
}


socket.emit('getName', (user) => {
    console.log('Vous êtes : ', user.name);
});

socket.emit('envVars', envVars => {
    const nbMax = envVars.nbJoueur;
    const nbplayer = envVars.playersCount;
    console.log(nbplayer + " / " +  nbMax)
    changementJoueur( nbplayer, nbMax);
})

socket.on('player joined', (name, envVars) => {

    playerJoined(name);
    const nbMax = envVars.nbJoueur;
    const nbplayer = envVars.playersCount;

    console.log(nbplayer + " / " +  nbMax)
    changementJoueur( nbplayer, nbMax);

});
socket.on('player left', (name, envVars) => {

    playerLeft(name);
    const nbMax = envVars.nbJoueur;
    const nbplayer = envVars.playersCount;
    console.log(nbplayer + " / " +  nbMax)
    changementJoueur( nbplayer, nbMax);
});

// socket.on('changerPanel', async panel => {
//     await changerPanel(panel);
// });