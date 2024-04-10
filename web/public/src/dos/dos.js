// import changerPanel from '../server/panelChanger.js';
// import socket from '../server/socket.js';

console.log("dosServer.js front chargé");

var randomUID = (taille = 20) => {
    var uid = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < taille; i++) {
        uid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return uid;
}

/**
 * Permet d'activer ou de désactiver le deck du joueur
 */
window.toggleDeck = () => {

    if ($(".deck").hasClass('disabled')) {
        $(".deck").removeClass('disabled');
    } else {
        $(".deck").addClass('disabled');
    }

}

/**
 * Permet de jouer l'animation de distribution des cartes
 * @param numJoueur Nombre de joueur
 */
window.animeCarte = (numJoueur) => {

    var tableRand = [];

    var posPioche = $(".pioche").offset();

    for (var i = 0; i < numJoueur; i++) {

        var randK = randomUID(10);

        $(".anim-carte").append(`<div style="top: ${posPioche.top + 146}px; left: ${posPioche.left +97}px;" id="${randK}" class="carte"></div>`);

        tableRand.push(randK);

    }

    tableRand.forEach((element, index) => {

        setTimeout(() => {

            var posJoueur = $(".items").eq(index).offset();

            $("#" + element).animate({
                top: posJoueur.top + 146,
                left: posJoueur.left + 97,
                opacity: 0
            }, 400, () => {
                $("#" + element).remove();
            });

        }, index *200);

    });

}

/**
 * Déclenche l'animation de pioche pour le joueur
 */
window.animePioche = () => {

    var randK = randomUID(10);

    var posPioche = $(".pioche").offset();

    $(".anim-carte").append(`<div style="top: ${posPioche.top + 146}px; left: ${posPioche.left +97}px;width: 210px;height: 297px;" id="${randK}" class="carte"></div>`);

    setTimeout(() => {

        var posDeck = $(".deck").offset();

        $("#" + randK).animate({
            top: posDeck.top + 146,
            left: posDeck.left + 97,
            opacity: 0
        }, 400, () => {
            $("#" + randK).remove();
        });

    }, 1);

}

/**
 * Déclenche l'animation de pioche pour les autres joueurs
 * @param index N° du joueur
 */
window.animeOtherPioche = index => {

    var randK = randomUID(10);

    var posPioche = $(".pioche").offset();

    $(".anim-carte").append(`<div style="top: ${posPioche.top + 146}px; left: ${posPioche.left +97}px;" id="${randK}" class="carte"></div>`);

    setTimeout(() => {

        var posJoueur = $(".items").eq(index).offset();

        $("#" + randK).animate({
            top: posJoueur.top + 146,
            left: posJoueur.left + 97,
            opacity: 0
        }, 400, () => {
            $("#" + randK).remove();
        });

    }, 1);

}

/**
 * Déclenche l'animation d'ajout de la carte cliqué dans le jeu
 * @param img
 */
window.animCarteJeu = id => {

    var randK = randomUID(10);

    var img = $("#" + id).css('background-image');


    var txt = `<div id="${randK}" class="carte" style="width: 256px;height: 336px;z-index: 4;"></div>`;

    $(".anim-carte").append(txt);

    var posCarte = $("#"+id).offset();

    $(`#${randK}`).css({'background-image' : img,'top': posCarte.top + 200, 'left': posCarte.left + 150});

    $("#" + id).remove();

    setTimeout(() => {

        var posCarte = $(".cartes .active").offset();

        $("#" + randK).animate({
            top: posCarte.top + 146,
            left: posCarte.left + 97
        }, 400, () => {
            $("#" + randK).remove();
            $(".active").css({'background-image' : img});
        });

    }, 1);

}

/**
 * Affiche le modal qui permet de sélectionner la couleur
 */
window.toggleModal = () => {

    if ($(".modal").is(':visible')) {
        $(".modal").fadeOut();
    } else {
        $(".modal").fadeIn();
    }
}
