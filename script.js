'use strict';

const _ = require('lodash')
const Script = require('smooch-bot').Script;
const scriptRules = require('./script.json');

var myDate = new Date();
var groet = '';

/* hour is before noon */
if ( myDate.getHours() < 8 )
{
  groet = "Goeiemorgen 🌝.  Bedankt voor je bezoek maar op dit moment is Independer echter gesloten. 🕘 Uiteraard kun je met onze IndyBot verder praten maar er is helaas niemand die jouw vraag specifiek kan beantwoorden. Je kan je vraag ook doormailen 📩 naar info@independer. Dan komt het altijd goed.";
}
else
if ( myDate.getHours() >= 8 && myDate.getHours() <=12 )
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
