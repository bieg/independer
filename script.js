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
        prompt: (bot) => bot.say('...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hoi...')
                .then(() => 'askName');
        }
    },
    
    askName: {
        prompt: (bot) => bot.say('Ik ben Independer. En wie ben jij?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Hoi ${name}. Bezwaar als ik je ${name} noem? %[Nee hoor](postback:no) %[Eigenlijk wel](postback:yes)`))
                .then(() => 'speak');
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
                    return bot.say(`Sorry - maar ik begrijp je even niet`).then(() => 'opNieuw');
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
    
    opNieuw: {
        prompt: (bot) => bot.say('Hoe kan ik je helpen?'),
            return bot.say(`Zoek je een verzekering %[Ja](postback:verzekering_gezocht) %[Wil je schade melden?](postback:schade_melden)`))
            .then(() => 'speak');
        }
    },
    
  
    
});
