'use strict';

const smoochBot = require('smooch-bot');
const MemoryStore = smoochBot.MemoryStore;
const MemoryLock = smoochBot.MemoryLock;
const Bot = smoochBot.Bot;
//const Script = smoochBot.Script;
const StateMachine = smoochBot.StateMachine;

const _ = require('lodash');
const Script = require('smooch-bot').Script;
const scriptRules = require('./script.json');

class ConsoleBot extends Bot {
    constructor(options) {
        super(options);
    }

    say(text) {
        return new Promise((resolve) => {
            console.log(text);
            resolve();
        });
    }
}

const script = new Script({

  // processing: {
  // prompt: (bot) => bot.say(`![](http://www.bieg.nl/beeld/speechbubble.gif)`),
  // receive: () => 'processing'
  // },

  start: {
      receive: (bot) => {
            return bot.say(`${groet}... Wat voor soort hypotheek zoek je? `)
            .then(() => bot.say(`![](http://www.bieg.nl/beeld/woningen.jpg)`))
            .then(() => bot.say(`%[Starters Hypotheek](postback:hypotheektype_starter)`))
            .then(() => bot.say (`%[Nieuwe hypotheek](postback:hypotheektype_nieuw) `))
            .then(() => bot.say (`%[Hypotheek oversluiten](postback:hypotheektype_oversluiten)`))
            .then(() => 'processing');
      }
  },

    askName: {
        prompt: (bot) => bot.say('What\'s your name'),
        receive: (bot, message) => {
            const name = message.text.trim();
            bot.setProp('name', name);
            return bot.say(`I'll call you ${name}! Great!`)
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

const userId = 666;
const store = new MemoryStore();
const lock = new MemoryLock();
const bot = new ConsoleBot({
    store,
    lock,
    userId
});

const stateMachine = new StateMachine({
    script,
    bot,
    userId
});

process.stdin.on('data', function(data) {
    stateMachine.receiveMessage({
        text: data.toString().trim()
    })
        .catch((err) => {
            console.error(err);
            console.error(err.stack);
        });
});
