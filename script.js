
'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

var myDate = new Date();
var groet = '';

/* hour is before noon */
if ( myDate.getHours() < 12 )
{
groet = "Goeiemorgen";
}
else  /* Hour is from noon to 5pm (actually to 5:59 pm) */
if ( myDate.getHours() >= 12 && myDate.getHours() <= 17 )
{
groet = "Goedendag";
}
else  /* the hour is after 5pm, so it is between 6pm and midnight */
if ( myDate.getHours() > 17 && myDate.getHours() <= 24 )
{
groet = "Goedenavond";
}
else  /* the hour is not between 0 and 24, so something is wrong */
{
groet = "Welkom";
}

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
return bot.say(`${groet} - welkom bij Independer Wil je verder? %[Yes](postback:askName) %[No](postback:bye)`)
.then(() => 'processing');
}
},

bye: {
prompt: (bot) => bot.say('Postback is working'),
receive: () => 'processing'
},


askName: {
prompt: (bot) => bot.say('Hoe heet je?'),
receive: (bot,message) => {
const name = message.text;
return bot.setProp('name', name)
.then(() => bot.say(`Ok ${name}, hoe kan ik je helpen? \n
%[Heb je schade](postback:schade) %[Zoek je een verzekering](postback:zoek)`))
.then(() => 'processing');
},
},

zoek: {
prompt: (bot) => bot.say('Postback is working'),
receive: () => 'processing'
},

error: {
prompt: (bot) => bot.say('Sorry - kun je dat nog eens zeggen?  Er ging iets mis...'),
receive: () => ''
},

finish: {
receive: () => 'finish'
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
