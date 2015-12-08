var request = require('request');
var html = require('htmlparser2');
$ = require('cheerio');
var async = require('async');
var player = require('play-sound')(opts = {});


var renfeUrl = 'http://horarios.renfe.com/cer/hjcer310.jsp?&nucleo=50&o=79009&d=79011&tc=DIA&td=D&df=20151208&th=1&ho=00&i=s&cp=NO&TXTInfo=';
var myExcel = 'https://docs.google.com/spreadsheets/d/1137gfrD-PQHB_0oAP2-UHGtLU3gpYFt2ak_O_I9AG2s/pubhtml';
var myExcelJson = 'https://spreadsheets.google.com/feeds/list/1137gfrD-PQHB_0oAP2-UHGtLU3gpYFt2ak_O_I9AG2s/od6/public/basic?alt=json';

var date = new Date();


async.parallel([
    function (callback) {
        request(renfeUrl, function (error, response, body) {
            //parser.write(body);
            tiempos = $('tr', body).find('.color2').text();
            var hora = "";
            var horas = [];
            for (var i = 1; i < tiempos.length; i++) {
                hora += tiempos.charAt(i - 1);
                if (i % 5 == 0 && i !== 0) {
                    horas.push(hora);
                    hora = "";
                }
            }
            callback(null, horas);
        });
    },
    function (callback) {
        request(myExcelJson, function (error, response, body) {
            var array = JSON.parse(body);
            var string = array['feed']['entry'][0]['content']['$t'];

            var test = string.split(",");

            var diaSemana = date.getDay();
            var horaSalida;
            if (diaSemana < 4) {
                horaSalida = test[2].substr(test[2].indexOf(':') + 2, 5);


            } else {
                horaSalida = test[4].substr(test[4].indexOf(':') + 2, 5);
            }
            callback(null, horaSalida);

        });
    }
], function (err, result) {

    var horasTren = result[0];
    var salida = result[1];
    var comprobar = 7000;
    setInterval(function () {
        var horaActual = formatAMPM(date.getHours());

        if (salida < horaActual) {
            console.log(true, salida, horaActual);
            
            //player.play('alarm.mp3', function(err){console.log(err)})
        } else {
            console.log(false);
        }
    }, comprobar)


});








function formatAMPM(date) {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var strTime = hours + ':' + minutes + ' ';
    return strTime;
}