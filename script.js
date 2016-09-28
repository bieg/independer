
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
//prompt: (bot) => bot.say('...'),
 receive: () => 'processing'
 },

start: {
    receive: (bot,message) => {
        const opening = message.text.trim().toUpperCase();
        return bot.say(`${groet}, wat voor soort hypotheek zoek je? `)
        .then(() => bot.say(`%[Starters hypotheek](postback:hypotheektype_starter) %[Nieuwe hypotheek](postback:hypotheektype_nieuw) %[Hypotheek oversluiten](postback:hypotheektype_oversluiten)`))
        .then(() => 'selecteerHypotheek');
    }
},

selecteerHypotheek: {
    receive: (bot, message) => {
      switch(message.text) {
      case 'Hoi':
            return bot.say(`${groet} waar ben je naar op zoek? %[Starters hypotheek](postback:hypotheektype_starter) %[Nieuwe hypotheek](postback:hypotheektype_nieuw) %[Hypotheek oversluiten](postback:hypotheektype_oversluiten)`)
            .then(() => 'askName')
          break;
      case 'Starters hypotheek':
      //  prompt: (bot) => bot.say(`![](http:www.bieg.nl/beeld/appartement.jpg)`)
          return bot.say(`Wat voor type woning zoek je? `)
          .then(() => bot.say(`%[Appartement](postback:hypotheekkeuze_appartement) %[Huis](postback:hypotheekkeuze_huis) %[Vakantiewoning](postback:hypotheekkeuze_vakantiewoning)`))
          .then(() => 'hypotheek_starter')
              break;
        case 'Nieuwe hypotheek':
          return bot.say(`Helaas biedt Independer momenteel alleen Starters een hypotheek aan.`)
          .then(() => bot.say(`Via onderstaande link kun je de beste hypotheekadviseur voor jou vinden. %[Hypotheek Adviseur](https://www.independer.nl/hypotheekadviseur/intro.aspx)`))
            .then(() => 'finish')
          break;
        case 'Hypotheek oversluiten':
          return bot.say(`Het spijt me maar op dit moment biedt Independer alleen  Starters een hypotheek.`)
          .then(()=> bot.say('Als het allemaal wel zo ver is, wil je dan een update ontvangen? %[Ja - graag](postback:update_ja) %[Nee, bedankt](postback:update_nee)'))
            .then(() => 'updateOntvangen')
          break;
        default:
          return bot.say(`...`)
            .then(() => 'processing')
          break;
      }
    }
},

updateOntvangen: {
    receive: (bot, message) => {
      switch(message.text) {
        case 'Ja - graag':
            return bot.say(`Leuk, dan houd ik  je op de hoogte zodra er weer nieuws is.' `)
            .then(() => 'update_ja');
          break;
          case 'Nee, bedankt':
              receive: () => 'bye'
              break;
          default:
            return bot.say(`...`)
              .then(() => 'processing')
            break;
}
}
},

update_ja: {
  prompt: (bot) => bot.say('Wat is je email adres?'),
      receive: (bot, message) => {
          const emailVisitor = message.text;
          return bot.setProp('emailVisitor', emailVisitor)
              .then(() => bot.say(message.text))
  //          //return bot.setProp('emailVisitor', emailVisitor)
  //           .then(()  => bot.say('Ok - dan hou ik je via ${emailVisitor} op de hoogte.'))
            .then(()  =>'processing')
    }
},

hypotheekkeuze_appartement: {
receive: (bot,message)  => {
    //  prompt: (bot) => bot.say(`![](http:www.bieg.nl/beeld/appartement.jpg)`)
    receive: () => 'askName'
}
},
hypotheekkeuze_huis: {
//    prompt: (bot) => bot.say(`![](http:www.bieg.nl/beeld/appartement.jpg)`)
  receive: () => 'askName'
},
hypotheekkeuze_vakantiewoning: {
//    prompt: (bot) => bot.say(`![](http:www.bieg.nl/beeld/appartement.jpg)`)
    receive: () => 'askName'
},
hypotheektype_starter: {
    prompt: (bot) => bot.say('Pleasure meeting you - starter'),
    receive: () => 'processing'
},
hypotheektype_nieuw: {
    prompt: (bot) => bot.say(`Independer biedt momenteel alleen voor Starters een hypotheek. Onderstaande link bied je meer informatie %[Hypotheek Adviseur](https://www.independer.nl/hypotheekadviseur/intro.aspx)`),
    receive: () => 'processing'
},

askName: {
  receive: (bot, message) => {
    switch(message.text) {
        case 'Appartement':
          return bot.say(`Nice!`)
          .then(() => 'vervolgVragen')
          break;
      case 'Huis':
          return bot.say(`Leuk :)`)
          .then(() => 'vervolgVragen')
          break;
      default:
        return bot.say(`...`)
          .then(() => 'processing')
        break;
    }
    }
},

vervolgVragen: {
  prompt: (bot) => bot.say('Hoe heet je eigelijk? Dat maakt het praten een stuk makkelijker...'),
  receive: (bot, message) => {
      const name = message.text;
      return bot.setProp('name', name)
          .then(() => bot.say(`Hoi ${name}. Ik heb nog wat vragen voor je om verder te kunnen.`))
          .then(() => 'lastCheck');
    }
},

lastCheck: {
    prompt: (bot) => bot.say('Is er nog iets waar ik  je bij kan helpen? %[JA](postback:nogietsanders) %[NEE](postback:bye) '),
    // .then(()  => 'processing');
},

bye: {
    prompt: (bot) => bot.say('Fijn je gesproken te hebben. Bedankt voor je tijd'),
    receive: ()  => 'finish'
},


// error: {
// prompt: (bot) => bot.say('Sorry - kun je dat nog eens zeggen?  Er ging iets mis...'),
// receive: () => ''
// },

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
