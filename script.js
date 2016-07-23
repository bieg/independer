'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script
const scriptRules = require('./script.json');

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: (bot) => {
            return bot.say('Hiya')
            .then(() => 'finish');
        }
    },

    start: {
        receive: (bot) => {
            return bot.say('Hoi. Kan ik iets voor je doen?')
                 .then(() => bot.say('%[Graag, ik wil schade melden](postback:damage) '))
                 .then(() => bot.say('%[Zeker, ik had een ongeluk](postback:accident)'))
                 .then(() => bot.say('%[Ja, ik zoek informatie](postback:information)'))
                 .then(() => 'watKanIkDoen');
        }
    },
    
    watKanIkDoen: {
        receive: (message) => {
            const wat = message.text;
            return bot.setProp('wat', wat)
                .then(() => bot.say('${wat}'))
                .then(() => 'finish');
        }
    },
    
    damage : {
      prompt: (bot) => bot.say('helemaal stuk jongen'),
        receive: () => 'damage'
    },
    
    askName: {
        prompt: (bot) => bot.say('What\'s your name?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Great! I'll call you ${name}
Is that OK? %[Yes](postback:yes) %[No](postback:no)`))
                .then(() => 'finish');
        }
    },

    finish: {
        receive: (bot, message) => {
            const answer = message.text;
            return bot.getProp('answer')
                .then((answer) => bot.say(`Sorry ${name}, dat was niet duidelijk voor me. Kun je het nog eens zeggen?`))
                .then(() => 'finish');
        }
    },
    

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`Hey, zeg dat nog eens? Want dat ging even niet goed.`).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return wait(50).then(function() {
                            return bot.say(line);
                        });
                    });
                });

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
