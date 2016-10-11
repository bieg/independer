'use strict';

const _ = require('lodash');
const smoochBot = require('smooch-bot');
const MemoryStore = smoochBot.MemoryStore;
const MemoryLock = smoochBot.MemoryLock;
const Bot = smoochBot.Bot;
const Script = require('smooch-bot').Script;
const StateMachine = smoochBot.StateMachine;
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
};

module.exports = new Script({

processing: {
      prompt: (bot) => bot.say('![](http://www.bieg.nl/beeld/speechbubble.gif)'),
       receive: () => 'processing'
 },

start: {
      receive: (bot,message) => {
          return bot.say(`${groet}... Wat voor soort hypotheek zoek je? `)
          .then(() => bot.say(`![](http://www.bieg.nl/beeld/woningen.jpg)`))
          .then(() => bot.say(`%[Starters Hypotheek](postback:hypotheektype_starter)`))
          .then(() => bot.say (`%[Nieuwe hypotheek](postback:hypotheektype_nieuw) `))
          .then(() => bot.say (`%[Hypotheek oversluiten](postback:hypotheektype_oversluiten)`))
          .then(() => 'selecteerHypotheek');
    }
    }
});

const userId = 'testUserId';
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
