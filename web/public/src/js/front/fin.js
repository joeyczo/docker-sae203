import socket from "../server/socket";
import changerPanel from "../server/panelChanger";

// $(function(){
showRanking();
// })

/**
 * Déclenchement de l'animation du podium
 */
window.showRanking = () => {

    $(".list-joueur").hide();
    $(".second").hide();
    $(".first").hide();
    $(".third").hide();
    $(".fin").hide();

    setTimeout(() => {

        $(".third").css({'height':'0%'}).show().animate({'height':'60%'}, 800)

    }, 400);

    setTimeout(() => {

        $(".second").css({'height':'0%'}).show().animate({'height':'80%'}, 800)

    }, 1200);

    setTimeout(() => {

        $(".first").css({'height':'0%'}).show().animate({'height':'100%'}, 800)

    }, 2000);

    setTimeout(() => {

        $(".list-joueur").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800)

    }, 3000);

    setTimeout(() => {

        $(".fin").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800);

        decompteTimer();

    }, 5000)

}

/**
 * Décompte du timer jusqu'à 0
 */
window.decompteTimer = () => {

    var time = 2;

    var intT = setInterval(() => {

        $(".fin h1").text(time-- + "s").addClass('bounce-a');

        if (time == -1) {
            clearInterval(intT);

            $(".fin h1").text('');
            $(".fin h2").text('Début du jeu imminent !')
            socket.emit('newGame');

        }

    }, 1000);

}

window.test = [
    {
        "pseudo" : "Joey",
        "points" : 50,
        "pointsTotal" : 117
    },
    {
        "pseudo" : "Chandler",
        "points" : 40,
        "pointsTotal" : 147
    },
    {
        "pseudo" : "Pierre",
        "points" : 55,
        "pointsTotal" : 174
    },
    {
        "pseudo" : "Paul",
        "points" : 60,
        "pointsTotal" : 69
    },
    {
        "pseudo" : "Klément",
        "points" : 45,
        "pointsTotal" : 129
    },
    {
        "pseudo" : "Jean",
        "points" : 30,
        "pointsTotal" : 169
    },
    {
        "pseudo" : "PLP",
        "points" : 71,
        "pointsTotal" : 550
    },
    {
        "pseudo" : "Fanch",
        "points":  70,
        "pointsTotal" : 157
    },
    {
        "pseudo" : "Mickael",
        "points" : 45,
        "pointsTotal" : 201
    },
    {
        "pseudo" : "Mayonnaise",
        "points" : 40,
        "pointsTotal" : 196
    }

]

/**
 * Affichage du classement des joueurs
 * @param {Array} users
 */
window.placementUser = users => {

    var listeTriee = users.sort((a, b) => b.points - a.points);

    $("#user_place_1").html(listeTriee[0].pseudo);
    $("#user_place_2").html(listeTriee[1].pseudo);
    $("#user_place_3").html(listeTriee[2].pseudo);

    listeTriee = listeTriee.slice(3);

    $("#list_basique").empty();

    listeTriee.forEach((user, index) => {

        var txt = `
        <div class="rank-i">
        <div class="start">
        <div class="place">
        <p>#${index + 4}</p>
        </div>
        <div class="username">
        <p>${user.pseudo}</p>
        </div>
        </div>
        <div class="end">
        <div class="score">+${user.points}pts</div>
        <div class="bonus">
        </div>
        </div>
        </div>
        `;

        $("#list_basique").append(txt);

    });

    var listeGeneral = users.sort((a, b) => b.pointsTotal - a.pointsTotal);

    $("#lst_general").empty();

    listeGeneral.forEach((elm, index) => {

        var txt = `
        <div class="rank-i">
        <div class="start">
        <div class="place">
        <p>#${index + 1}</p>
        </div>
        <div class="username">
        <p>${elm.pseudo}</p>
        </div>
        </div>
        <div class="end">
        <div class="score">${elm.pointsTotal}pts</div>
        <div class="bonus">
        </div>
        </div>
        </div>
        `

        $("#lst_general").append(txt);

    });

    showRanking();
}


/* ----------------------------------------- */



socket.on('changerPanel', async panel => {
    await changerPanel(panel);
});

//
// /**
//  * Récéption des données du jeu et du classement
//  * (Voir au dessus pour l'exemple de tableau)
//  */
// socket.on('receiveDataGame', (obj) => {
//     placementUser(obj);
// })
