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
            return bot.say('Hoi! Ik ben de bot van Independer. Je kunt me dag en nacht aanschieten als er iets is.' 
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
        
        prompt: (bot) => bot.say('Trouwens, hoe heet je eigenlijk? Dat maakt het praten een stuk makkelijker.'),
        
        receive: (bot, message) => {
            
            const name = message.text;
                return bot.setProp('name', name)
                .then(()  => bot.say('Hoi'))
                .then(() => 'finish');
        }
    },

    leesNaam: {
    
    receive: (bot, message) => {
        
        const getname = message.text;
            return bot.setProp('name', getname)
            .then(()  => bot.say('Hebbes'))
            .then(() => 'finish');
        }
    },

    naam: {
           
        receive: (bot, message) => {
        
        const naam = message.text;
            return bot.setProp('naam', naam)
            .then(()  => bot.say('voila'))
            .then(() => 'finish');
        } 
            
    }

    finish: {
        receive: () => 'finish' 
    }

});
