var utils = require('./utils');
var request = require('request');
var $ = require('cheerio');
var async = require('async');
var player = require('play-sound')(opts = {});
var beep = require('beepbeep');
var dialog = require('dialog');

//TODO: Notificar Movil.

var renfeUrl = 'http://horarios.renfe.com/cer/hjcer310.jsp?&nucleo=50&o=79009&d=79011&tc=DIA&td=D&df=20151208&th=1&ho=00&i=s&cp=NO&TXTInfo=';
var myExcelJson = 'https://spreadsheets.google.com/feeds/list/1137gfrD-PQHB_0oAP2-UHGtLU3gpYFt2ak_O_I9AG2s/od6/public/basic?alt=json';


var date = new Date();


async.parallel([
    function (callback) {
        request(renfeUrl, function (error, response, body) {
            //parser.write(body);
            var tiempos = $('tr', body).find('.color2').text();
            var hora = "";
            var horas = [];
            for (var i = 1; i < tiempos.length; i++) {
                hora += tiempos.charAt(i - 1);
                if (i % 5 === 0 && i !== 0) {
                    horas.push(hora);
                    hora = "";
                }
            }
            callback(error, horas);
        });
    },
    function (callback) {
        request(myExcelJson, function (error, response, body) {
            var array = JSON.parse(body);
            var string = array.feed.entry[0].content.$t; //['feed']['entry'][0]['content']['$t'];

            var test = string.split(",");

            var diaSemana = date.getDay();
            var horaSalida;
            if (diaSemana <= 4) {
                horaSalida = test[2].substr(test[2].indexOf(':') + 2, 5);


            } else {
                horaSalida = test[4].substr(test[4].indexOf(':') + 2, 5);
            }
            callback(error, horaSalida);

        });
    }
], function (err, result) {
    var horasTren = result[0];
    var salida = result[1];
    var comprobar = 7000;
    var media = 25;
    console.log(horasTren);
    setInterval(function () {
        date = new Date();

        var horaActual = date.getHours() + ":" + date.getMinutes();

        if (salida < horaActual) {
            date.setMinutes(date.getMinutes() + media);
            horaActual = date.getHours() + ":" + date.getMinutes();
            for (var i = horasTren.length / 2; i < horasTren.length; i++) {
                var horatren = horasTren[i].replace(".", ":");
                if (horaActual < horatren) {
                    if (horaActual === horatren) {
                        console.log(true, horaActual, horatren);
                        beep();
                        dialog.warn('Pa casa!!!! :D');
                    }

                } else {
                    console.log(false);
                }
            }

            //player.play('alarm.mp3', function(err){console.log(err)})
        } else {
            console.log(false);
            console.log(salida, horaActual);

        }
    }, comprobar);


});
