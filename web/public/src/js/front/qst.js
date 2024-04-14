$(() => {

    $(".bar-loading").hide().css({'opacity':'0'});
    $(".res-qst").hide().css({'opacity':'0'});
    $(".disp-qst p").css({'opacity':'0'});

});

/**
 * Déclenche l'animation du compte
 * @param time
 */
window.animCountdown = (time) => {

    $(".cnt").css({'width':'100%'}).animate({'width':'0%'}, time);

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
 * Animation de l'affichage des questions
 * @param obj Objet question
 */
window.fetchQuestion = (obj) => {

    $(".bar-loading").hide().css({'opacity':'0'});
    $(".res-qst").hide().css({'opacity':'0'});
    $(".disp-qst p").css({'opacity':'0'});

    $(".disp-qst").css({'opacity':'0','height':'100vh'}).animate({'opacity':'1'}, 500);
    $(".disp-qst h1").html(obj.question);

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
                });

            } else if (obj.type === 2)
            {

                $(".res-qst").html(`<div class="trfl"><button class="true">Vrai</button><button class="false">Faux</button></div>`).show().animate({'opacity':'1'}, 500, () => {
                    $(".bar-loading").show().animate({'opacity':'1'}, 500)
                    animCountdown(15000);

                    $("button").on('click', function() { $("button").removeClass('actif');$(this).addClass('actif'); });
                });

            } else if (obj.type === 0) {

                $(".res-qst").html(`<div class="qcm"></div>`).show().animate({'opacity':'1'}, 500, () => {

                    obj.sets.forEach((item, i) => {

                        let char = String.fromCharCode(65 + i);

                        $(".qcm").append(`<button id="cc-${i}" style="opacity: 0" class="choix"><div class="index"><p>${char}</p></div><p>${item}</p></button>`).css({'opacity':'1'});

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