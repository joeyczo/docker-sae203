import changerPanel from '../server/panelChanger.js';
import socket from '../server/socket.js';

console.log("dos.js front chargé");


var randomUID = (taille = 20) => {
    var uid = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < taille; i++) {
        uid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return uid;
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

        $(".anim-carte").append(`<div style="top: ${posPioche.top + 146}px; left: ${posPioche.left + 97}px;" id="${randK}" class="carte"></div>`);

        tableRand.push(randK);

    }
    let posJoueur = 0;
    tableRand.forEach((element, index) => {

        setTimeout(() => {

            posJoueur = $(".items").eq(index).offset();

            $("#" + element).animate({
                top: posJoueur.top + 146,
                left: posJoueur.left + 97,
                opacity: 0
            }, 400, () => {
                $("#" + element).remove();
            });

        }, index * 200);

    });

}

/**
 * Déclenche l'animation d'ajout de la carte cliqué dans le jeu
 * @param id
 */
window.animCarteJeu = id => {

    const player = statusDuJeu.players.find(p => p.uid === monNom.uid);
    const card = player.hand[id];
    // Vérifier si c'est le tour du joueur
    if (!player.isMyTurn(statusDuJeu)) {
        console.log('Ce n\'est pas votre tour:', player.name);
        return;
    }

    // Vérifier si la carte peut être jouée
    if (card.color !== 'special' && (statusDuJeu.currentColor !== card.color && statusDuJeu.currentValue !== card.value)) {
        console.log('La carte ne peut pas être jouée:', card);
        return;
    }
    console.log(card);
    socket.emit('carte clic', {player: player, card: card});


    // annime

    var randK = randomUID(10);

    var img = $("#" + id).css('background-image');


    var txt = `<div id="${randK}" class="carte" style="width: 256px;height: 336px;z-index: 4;"></div>`;

    $(".anim-carte").append(txt);

    var posCarte = $("#" + id).offset();

    $(`#${randK}`).css({'background-image': img, 'top': posCarte.top + 200, 'left': posCarte.left + 150});

    $("#" + id).remove();

    setTimeout(() => {

        var posCarte = $(".cartes .active").offset();

        $("#" + randK).animate({
            top: posCarte.top + 146,
            left: posCarte.left + 97
        }, 400, () => {
            $("#" + randK).remove();
            $(".active").css({'background-image': img});
        });

    }, 1);

}

/**
 * Déclenche l'animation de pioche pour le joueur
 */
window.animePioche = () => {

    const player = statusDuJeu.players.find(p => p.uid === monNom.uid);

    // Vérifier si c'est le tour du joueur
    if (!player.isMyTurn(statusDuJeu)) {
        console.log('Ce n\'est pas votre tour:', player.name);
        return;
    }

    socket.emit('draw card', monNom.uid);

    var randK = randomUID(10);

    var posPioche = $(".pioche").offset();

    $(".anim-carte").append(`<div style="top: ${posPioche.top + 146}px; left: ${posPioche.left + 97}px;width: 210px;height: 297px;" id="${randK}" class="carte"></div>`);

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

    $(".anim-carte").append(`<div style="top: ${posPioche.top + 146}px; left: ${posPioche.left + 97}px;" id="${randK}" class="carte"></div>`);

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


// Les toggles :

/**
 * Affiche le modal qui permet de sélectionner la couleur
 */
window.toggleModal = () => {

    if ($(".modal").css('display') === 'none') {
        $(".modal").css('display', 'block');


// Choix Couleur
        let items = document.querySelectorAll('.selector .item');

        items.forEach(item => {
            item.addEventListener('click', () => {
                let style = window.getComputedStyle(item);
                let color = style.background;
                switch (true) {
                    case color.includes('linear-gradient(159deg, rgb(236, 0, 0)'):
                        color = "rouge"
                        break;
                    case color.includes('linear-gradient(158deg, rgb(1, 204, 9)'):
                        color = "vert"
                        break;
                    case color.includes('linear-gradient(157deg, rgb(0, 107, 205)'):
                        color = "bleu"
                        break;
                    case color.includes('linear-gradient(158deg, rgb(240, 233, 51)'):
                        color = "jaune"
                        break;
                }
                socket.emit('colorChoisi', color);
                $(".modal").css('display', 'none')
            });
        });
    } else {
        $(".modal").css('display', 'none');
    }

}

/**
 * Permet d'activer ou de désactiver le deck du joueur
 */
window.toggleDeck = (currentPlayerUID) => {
    if (currentPlayerUID === monNom.uid) {
        $(".deck").removeClass('disabled');
    } else {
        $(".deck").addClass('disabled');
    }
}
var statusDuJeu;
var monNom;

socket.emit('getName', (user) => {
    console.log('Vous êtes : ', user);
    monNom = user;
});

socket.emit('get game debut');
let playersHTMLRight = '';
let playersHTMLLeft = '';
let activeCardHTML = '';

let isAnimeCarteCalled = false;

socket.on('dos game debut', async (state) => {
    console.log(state);
    statusDuJeu = state;
    console.log(state.players.length);

    statusDuJeu.players.forEach(player => {
        player.isMyTurn = function (game) {
            return this.uid === game.currentPlayer.uid;
        };
    });

    playersHTMLRight = '';
    playersHTMLLeft = '';

    statusDuJeu.players.forEach((player, index) => {
        if (index < 5) {
            playersHTMLRight += generatePlayerHTML(player);
        } else {
            playersHTMLLeft += generatePlayerHTML(player);
        }
    });
    document.getElementById('joueurQuiDoisJouer').style.color = statusDuJeu.currentPlayer.uid === monNom.uid ? 'green' : 'red';
    document.getElementById('joueurQuiDoisJouer').innerHTML = statusDuJeu.currentPlayer.uid === monNom.uid ? "Vous !" : statusDuJeu.currentPlayer.name;
    ;

    document.querySelector('.player-right').innerHTML = playersHTMLRight;
    document.querySelector('.player-left').innerHTML = playersHTMLLeft;

    activeCardHTML = `
        <div class="active" style="background-image: url('../img/uno/${statusDuJeu.currentColor}_${statusDuJeu.currentValue}.svg')"></div>
    `;


    document.getElementById('monNom').textContent = "Vous êtes : " + monNom.name;
    document.querySelector('.cartes').innerHTML = activeCardHTML;

    document.querySelector('.deck').innerHTML = generatePlayerDeckHTML(monNom.uid);

    // tri des cartes
    if (!isAnimeCarteCalled) {
        window.animeCarte(statusDuJeu.players.length);
        isAnimeCarteCalled = true;
    }
})

socket.on('other player drew card', (playerUID) => {
    // Trouver l'index du joueur qui a pioché une carte
    const playerIndex = statusDuJeu.players.findIndex(p => p.uid === playerUID);

    if (playerIndex !== -1) {
        // Déclencher l'animation pour le joueur qui a pioché une carte
        window.animeOtherPioche(playerIndex);
    } else {
        console.log('Joueur non trouvé:', playerUID);
    }
});


socket.on('toggleModal', (playerUID) => {
    if (playerUID === monNom.uid) {
        window.toggleModal();
    }
});

socket.on('toggle deck', (playerUID) => {
    window.toggleDeck(playerUID);
});


document.querySelector('.player-right').innerHTML = playersHTMLRight;
document.querySelector('.player-left').innerHTML = playersHTMLLeft;

function generatePlayerHTML(player) {
    let html = `
        <div class="items">
            <div class="infos">
                <div class="img"><img src="../img/player.svg" alt="IMAGE"></div>
                <h1>${player.name}</h1>
            </div>
            <div class="card-d">`;

    player.hand.forEach(() => {
        html += `<div class="carte"></div>`;
    });

    html += `</div></div>`;

    return html;
}

function generatePlayerDeckHTML(playerUID) {
    console.log('Création du deck:', playerUID);

    const player = statusDuJeu.players.find(p => p.uid === playerUID);

    if (!player) {
        console.log('Joueur pas trouvé');
        return '';
    }

    // console.log('Joueur Trouvé :', player);

    let deckHTML = '';
    player.hand.forEach((card, index) => {
        deckHTML += `
            <div id="${index}" onclick="window.animCarteJeu(this.id)" class="cartes" style="background-image: url('../img/uno/${card.color}_${card.value}.svg');"></div>
        `;
    });
    return deckHTML;
}



