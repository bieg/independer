'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = new Script({
    processing: {
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say(
                'Hoi! Ik ben de bot van Independer. Je kunt me dag en nacht aanschieten als er iets is.'
            )
            .then(() => 'vraagNaam');
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
                    return bot.say(`Sorry - dat begreep ik niet. Kun je het nog een keer zeggen?`).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return wait(80).then(function() {
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
    },
    
    
    vraagNaam: {
        const name = message.text;

        prompt: (bot) => bot.say('Trouwens, hoe heet je eigenlijk? Dat maakt het praten een stuk makkelijker.'),

        receive: (bot, message) => {
            return bot.setProp('name', name)
            .then(() => bot.say('Hoi') )
            .then(() => 'finish');
        }
    },

        finish: {
        receive: (bot, message) => {
            return bot.getProp('name')
                .then((name) => bot.say(`Sorry ${name}, my creator didn't ` +
                        'teach me how to do anything else!'))
                .then(() => 'finish');
        }
    }

});
