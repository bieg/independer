
'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');


//CREATE WELCOME TEXT
var myDate = new Date();
var groet = '';

/* hour is before noon */
if ( myDate.getHours() < 8 )
{
  groet = "Goeiemorgen 🌝.  Bedankt voor je bezoek maar op dit moment is Independer echter gesloten. 🕘 Uiteraard kun je met onze IndyBot verder praten maar er is helaas niemand die jouw vraag specifiek kan beantwoorden. Je kan je vraag ook doormailen 📩 naar info@independer. Dan komt het altijd goed.";
}
else
if ( myDate.getHours() >8 )
{
  groet = "Goeiemorgen 🌝 ";
}
else  /* Hour is from noon to 5pm (actually to 5:59 pm) */
if ( myDate.getHours() >= 12 && myDate.getHours() <= 17 )
{
groet = "Goedendag 🌞";
}
else  /* the hour is after 5pm, so it is between 6pm and midnight */
if ( myDate.getHours() > 17&& myDate.getHours() <= 20 )
{
groet = "Goedenavond 🌙";
}
else
if (myDate.getHours() > 20  || myDate.getHours() <= 24 )
{
  groet = "Goedenavond 🌙  Bedankt voor je bezoek maar op dit moment is Independer echter gesloten. 🕘 Uiteraard kun je met onze IndyBot verder praten maar er is helaas niemand die jouw vraag specifiek kan beantwoorden. Je kan je vraag ook doormailen 📩 naar info@independer. Dan komt het altijd goed.";
}
else  /* the hour is not between 0 and 24, so something is wrong */
{
groet = "Welkom. ";
}

function wait(ms) {
return new Promise((resolve) => {
setTimeout(resolve, ms);
});
}

module.exports = new Script({

start: {
    receive: (bot,message) => {
        const opening = message.text.trim().toUpperCase();
        return bot.say(`${groet}... Wat voor soort hypotheek zoek je? `)
        .then(() => bot.say(`![](http://www.bieg.nl/beeld/woningen.jpg)`))
        .then(() => bot.say(`%[Starters Hypotheek](postback:hypotheektype_starter)`))
        .then(() => bot.say (`%[Nieuwe hypotheek](postback:hypotheektype_nieuw) `))
        .then(() => bot.say (`%[Hypotheek oversluiten](postback:hypotheektype_oversluiten)`))
        .then(() => 'speak');
    }
},

  speak: {
          receive: (bot, message) => {

              const upperText = message.text.trim();

              function updateSilent() {
                  switch (upperText) {
                      //THE MORTGAGE STUFF
                      case 'Hoi':
                            return bot.say(`${groet} waar ben je naar op zoek? %[Starters hypotheek](postback:hypotheektype_starter) %[Nieuwe hypotheek](postback:hypotheektype_nieuw) %[Hypotheek oversluiten](postback:hypotheektype_oversluiten)`)
                            .then(() => woningType())
                          break;
                      case 'Starters Hypotheek':
                          return bot.say(`Wat voor type woning zoek je? `)
                          .then(() => bot.say(`%[🏬 Appartement](postback:hypotheekkeuze_appartement) %[🏠 Huis](postback:hypotheekkeuze_huis) %[📭 Vakantiewoning](postback:hypotheekkeuze_vakantiewoning)`))
                          .then(() => woningType())
                              break;
                      case 'Nieuwe hypotheek':
                          return bot.say(`😞 Helaas biedt Independer momenteel alleen Starters een hypotheek aan.`)
                          .then(() => bot.say(`Via onderstaande link kun je de beste hypotheekadviseur voor jou vinden. %[💼 Zoek Hypotheek Adviseur](https://www.independer.nl/hypotheekadviseur/jelocatie.aspx)`))
                            .then(() => 'finish')
                          break;
                      case 'Hypotheek oversluiten':
                          return bot.say(`😟 Het spijt me maar op dit moment biedt Independer alleen  Starters een hypotheek.`)
                          .then(()=> bot.say(`Als het allemaal wel zo ver is, wil je dan een update ontvangen? %[Ja, dat wil ik wel](postback:update_ja) %[Nee, dat hoeft niet](postback:update_nee)`))
                            .then(() => 'updateOntvangen')
                          break;
                      //THE REST
                      case "CONNECT ME":
                          return bot.setProp("silent", true);
                      case "DISCONNECT":
                          return bot.setProp("silent", false);
                      default:
                          return Promise.resolve();
                  }
              }

              function woningType(){
                      receive: (bot, message) => {

                          const typeWoning = message.text.trim();

                          function updateWoning() {
                            switch(typeWoning.text) {
                              case '🏬 Appartement':
                                  return bot.say(`Nice!`)
                                  .then(() => 'vervolgVragen')
                                  break;
                              case '🏠 Huis':
                                  return bot.say(`Leuk`)
                                  .then(() => 'vervolgVragen')
                                  break;
                              case '📭 Vakantiewoning':
                                  return bot.say(`Gezellig`)
                                  .then(() => 'vervolgVragen')
                                  break;
                              default:
                                receive => 'processing'
                                break;
                            }
                          }
                        }
                      }

              function getSilent() {
                  return bot.getProp("silent");
              }

              //CHECK INPUT  FLOW
              function processMessage(isSilent) {
                  if (isSilent) {
                      return Promise.resolve("speak");
                  }

                  //BASICALLY ERROR OR NO TXT
                  if (!_.has(scriptRules, upperText)) {
                      return bot.say(`![](http://www.bieg.nl/beeld/speechbubble.gif)`).then(() => 'speak');
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
