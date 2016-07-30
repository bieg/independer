
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
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
            receive: (bot) => {
                return bot.say('Hoi.')
                     .then(() => 'askName');
            }
        },

        askName: {
                prompt: (bot) => bot.say('Hoe heet je eigenlijk?'),
                receive: (bot,message) => {
                    const name = message.text;
                    return bot.setProp('name', name)
                        .then(() => bot.say(`Hoe kan ik je helpen ${name}?
                        %[Heb je schade"](postback:yes_schade) %[Ik zoek een verzekering](postback:zoekverzekering) `)
                        .then(() => 'finish');
                }
            },

            error: {
        prompt: (bot) => bot.say('Sorry - kun je dat nog eens zeggen?  Er ging iets mis...'),
        receive: () => 'start'
    },

            finish: {
    receive: (bot, message) => {
        return bot.getProp('name')
            .then((name) => bot.say(`Sorry`))
            .then(() => 'done');
    }
},

done: {
    receive: () => 'done'
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
                    return bot.say(`So, I'm good at structured conversations but stickers, emoji and sentences still confuse me. Say 'more' to chat about something else.`).then(() => 'speak');
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
