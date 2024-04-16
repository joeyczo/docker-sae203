$(() => {
});

/**
 * Déclenchement de l'animation du podium
 */
var showRanking = () => {

    $(".list-other").hide();
    $(".scd").hide();
    $(".first").hide();
    $(".third").hide();
    $(".fin-dst").hide();

    setTimeout(() => {

        $(".third").css({'height':'0%'}).show().animate({'height':'60%'}, 800)

    }, 400);

    setTimeout(() => {

        $(".scd").css({'height':'0%'}).show().animate({'height':'80%'}, 800)

    }, 1200);

    setTimeout(() => {

        $(".first").css({'height':'0%'}).show().animate({'height':'100%'}, 800)

    }, 2000);

    setTimeout(() => {

        $(".list-other").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800)

    }, 3000);

    setTimeout(() => {

        $(".fin-dst").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800);

        decompteTimer();

    }, 5000)

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
 * Permet d'afficher le classement
 * @param obj OBJ exemple au dessus
 */
window.placementUser = (obj) => {

    var objTrier = obj.sort((a, b) => {
        return b.pointsTotal - a.pointsTotal;
    });

    $("#points_1").html(objTrier[0].pointsTotal);
    $("#points_2").html(objTrier[1].pointsTotal);
    $("#points_3").html(objTrier[2].pointsTotal);

    $("#username_1").html(objTrier[0].pseudo);
    $("#username_2").html(objTrier[1].pseudo);
    $("#username_3").html(objTrier[2].pseudo);

    objTrier.splice(0, 3);

    $("#classement").empty();

    objTrier.forEach((elm, index) => {

        var txt = `
        <div class="item">

            <div class="start">

                <h3>#${index + 4}</h3>

                <p>${elm.pseudo}</p>

            </div>

            <div class="end">

                <p>${elm.pointsTotal} pts</p>

            </div>

        </div>
        `;

        $("#classement").append(txt);

    });

    showRanking();


}

window.decompteTimer = () => {

    var time = 10;

    var intT = setInterval(() => {

        $(".fin-dst h1").text(time-- + "s").addClass('bounce-a');

        if (time == -1) {
            clearInterval(intT);

            $(".fin-dst h1").text('');
            $(".fin-dst h2").text('Début du jeu imminent !')
            socket.emit('newGame')

        }

    }, 1000);

}


/* ----------------------- */

/**
 * Permet de récupérer les données finales de classement (Pas besoin d'être triée)
 * @param {Array} obj Exemple au dessus de la forme
 */
socket.on('retrieveDataFinal', (obj) => {
    placementUser(obj);
})
