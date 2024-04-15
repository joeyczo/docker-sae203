import changerPanel from '../server/panelChanger.js';
import socket from '../server/socket.js';

console.log("Qst.js front chargé");

var monNom;

socket.emit('getName', (user) => {
    console.log('Vous êtes : ', user);
    monNom = user;
});

$(() => {

    socket.emit('getPlayerReadedQst');

    socket.emit('startGameQst');

    $(".bar-loading").hide().css({'opacity':'0'});
    $(".res-qst").hide().css({'opacity':'0'});
    $(".disp-qst p").css({'opacity':'0'});

    $(".modal-appel").hide();

});

/**
 * Déclenche l'animation du compte
 * @param time
 */
window.animCountdown = (time) => {

    $(".cnt").css({'width':'100%'}).animate({'width':'0%'}, time, 'linear');

    socket.emit('timerStartedQst', time);

}

window.qstTest = {
    "question": "Laquelle de ces planètes est la plus proche du soleil ?",
    "type": 0,
    "sets": [
        "Vénus",
        "Mercure",
        "Mars",
        "Jupiter"
    ],
    "reponse": 1,
    "diff": 1
};


/**
 * Lorsqu'un joueur à bien lu les règles
 */
window.playerReadedRule = () => {
    socket.emit('playerReadedRulesQst');

    $("#btn_rules").remove();
}

/**
 * Animation de l'affichage des questions
 * @param obj Objet question
 */
window.fetchQuestion = (obj) => {

    $(".bar-loading").hide().css({'opacity':'0'});
    $(".res-qst").hide().css({'opacity':'0'});
    $(".disp-qst p").css({'opacity':'0'});

    $(".disp-qst").css({'opacity':'0','height':'100vh'}).animate({'opacity':'1'}, 500);
    $(".disp-qst h1").html(obj.question.replaceAll('\n', '<br>'));

    var tailleQst = (obj.reponse === 2) ? '80vh' : ((obj.reponse === 0) ? '70vh' : '86vh');
    var difficulte = (obj.diff === 0) ? 'Facile' : ((obj.diff === 1) ? 'Moyen' : 'Difficile');

    setTimeout(() => {

        $(".disp-qst").animate({'height':tailleQst}, 500, () => {

            $(".disp-qst p").animate({'opacity':'1'});
            $(".disp-qst span").html(difficulte);

            if (obj.type === 1)
            {

                $(".res-qst").html(`<div class="input"><input type="text" name="res" id="res" placeholder="Tapez votre réponse"></div>`).show().animate({'opacity':'1'}, 500, () => {
                    $(".bar-loading").show().animate({'opacity':'1'}, 500)
                    animCountdown(15000);
                    $("#res").focus();
                });

            } else if (obj.type === 2)
            {

                $(".res-qst").html(`<div class="trfl"><button id="vrai" class="true">Vrai</button><button id="faux" class="false">Faux</button></div>`).show().animate({'opacity':'1'}, 500, () => {
                    $(".bar-loading").show().animate({'opacity':'1'}, 500)
                    animCountdown(15000);

                    $("button").on('click', function() { $("button").removeClass('actif');$(this).addClass('actif'); });
                });

            } else if (obj.type === 0) {

                $(".res-qst").html(`<div class="qcm"></div>`).show().animate({'opacity':'1'}, 500, () => {

                    obj.sets.forEach((item, i) => {

                        let char = String.fromCharCode(65 + i);

                        $(".qcm").append(`<button id="cc-${i}" style="opacity: 0" class="choix"><div class="index"><h3>${char}</h3></div><p>${item}</p></button>`).css({'opacity':'1'});

                        setTimeout(() => {

                            $(`#cc-${i}`).animate({'opacity':'1'}, 600);

                        }, i * 800);

                    });

                    setTimeout(() => {

                        $(".bar-loading").show().animate({'opacity':'1'}, 500)
                        animCountdown(15000);

                        $("button").on('click', function() { $("button").removeClass('actif');$(this).addClass('actif'); });

                    }, obj.sets.length * 950);

                });

            }

        });


    }, 2000);

}

/**
 * Anime la victoire de Question
 */
window.animeWinQst = () => {

    $(".modal-infos").show();
    $(".modal-infos .win").css({'display':'flex','top':'-100vh'}).animate({'top':'0'}, 500);

    setTimeout(() => {

        $(".modal-infos .win").animate({'top':'100%'}, 500, () => {
            $(".modal-infos").hide();
        });

    }, 4000);

}

/**
 * Demander à passer à la manche suivante
 */
window.passerSuivantManche = () => {

    socket.emit('passerProchaineMancheQst');

    $("#mc-qst").hide();

}

window.openRespQst = () => {

    $("#appel_btn_ap").attr('disabled', true);

    socket.emit('appelRespQst', monNom.uid);

}

/**
 * Répondre à l'appel de question
 * @param type Type de la question
 */
window.reponseAppelQst = type => {

    socket.emit('reponseAppelQst', type);

    $(".act-btn button").hide();

}


/* ------------------------------------- */

socket.on('playerReadedQst', (num) => {

    $("#player_reste").html(num);

});

socket.on('hideModalRulesQst', () => {

    $(".modal-consigne").fadeOut();

})

socket.on('fetchQst', (qst) => {

    sessionStorage.setItem('qst', JSON.stringify(qst));

    fetchQuestion(qst);
});

socket.on('winQst', () => {
    animeWinQst();
})

socket.on('getQstReponse', (uid) => {

    if (uid === monNom.uid) {

        var typeQst = JSON.parse(sessionStorage.getItem('qst')).type;
        var resp = "";

        if (typeQst === 1) {
            resp = $("#res").val();
        } else if (typeQst === 2) {
            resp = $(".actif").attr('id');
        } else if (typeQst === 0) {
            resp = $(".actif").attr('id').replace('cc-', '');
        }

        var objResp = {
            user : monNom,
            res : resp
        }

        socket.emit('sendQstReponse', objResp);

    }

});

socket.on('showRespQst', (resp) => {

    var dataResp = JSON.parse(sessionStorage.getItem('qst'));

    $('.resp-showing').show();

    $(".qst-showing").hide();

    $(".grid-resp").empty();

    console.log(resp);

    resp.forEach(elm => {

        var txtRes = ``;

        if (dataResp.type === 0)
        {
            let char = String.fromCharCode(65 + parseInt(elm.res));
            txtRes = `<div class="qcm"><p>${char}</p><p>${dataResp.sets[elm.res]}</p></div>`
        } else if (dataResp.type === 2)
        {
            txtRes = `<div class="vrf"><p>${(elm.res === "vrai") ? "Vrai" : "Faux"}</p></div>`
            elm.res = (elm.res === "vrai") ? 1 : 0;
        } else
        {
            txtRes = `<div class="txt"><p>${elm.res}</p></div>`
        }


        var reponseVrai = (elm.win) ? "Bonne réponse" : "Mauvaise réponse";
        let classeVrai = (elm.win) ? 'good' : 'error';

        var txt = `
        <div class="item">

            <div class="infos">

                <h2>${elm.user.name}</h2>

                <h3 class="${classeVrai}">${reponseVrai}</h3>

            </div>

            <div class="resp">

                ${txtRes}

            </div>

        </div>
        `;

        $(".grid-resp").append(txt);


    });

    $("#mc-qst").show();
    socket.emit('getPlayerRestManche');

})

socket.on('showRespQstFinal', str => {

    console.log(str);

    $("#resp-show-go").html(str);

})

socket.on('nextManche', () => {

    $('.resp-showing').hide();

    $(".qst-showing").show();

    $(".act-btn button").show();

    $("#appel_btn_ap").attr('disabled', false);

});

socket.on('setPlayersRestantManche', (player) => {

    $("#next_pers").html(player);

})

socket.on('endGameQst',  () => {
    animeWinQst();
})

socket.on('openAppelQst', (obj, user) => {

    var dataQst = JSON.parse(sessionStorage.getItem('qst'));

    $(".prt-show-vote").hide();

    $("#players_rest_appel").html(user);

    $("#user_appel").html(obj.user.name);

    $("#qst_appel").html(dataQst.question);

    $("#resp_appel").html(obj.res);

    $(".modal-appel").show();

    if (monNom.uid === obj.user.uid) {
        $(".act-btn button").hide();
    }

});

socket.on('showVoteAppelQst', (yes, no, total) => {

    var propYes = (yes / total) * 100;
    var propNo = (no / total) * 100;

    $(".no-vote").css({'width':propNo + "%"}).html(`<h3>Refusé</h3><p>${propNo}%</p>`);
    $(".yes-vote").css({'width':propYes + "%"}).html(`<h3>Validé</h3><p>${propYes}%</p>`);

    $(".prt-show-vote").show();

    $(".other").hide();

})

socket.on('closeAppelQst', () => {
    $(".modal-appel").hide();

    $(".other").show();
    $(".prt-show-vote").hide();

    $(".act-btn button").show();
})

socket.on('updatePlayerRestAppelQst', (num) => {
    $("#players_rest_appel").html(num);
})