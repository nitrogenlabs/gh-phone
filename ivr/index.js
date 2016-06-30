import express from 'express';
import twilio from 'twilio';
import request from 'request-promise';

// Express
const router = express.Router();

// Welcome
router.post('/welcome', twilio.webhook({validate: false}), (req, res) => {
  const twiml = new twilio.TwimlResponse();
  twiml.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST'
  }, node => {
    node.say('Welcome to Carebear! Press 1 for Grub Hub. Press 2 for Seamless.', {voice: 'alice', language: 'en-US'});
  });

  res.send(twiml);
});

// Select brand
router.post('/menu', twilio.webhook({validate: false}), (req, res) => {
  const selected = req.body.Digits;
  let options = {
    '1': gotoGrubHub,
    '2': gotoSeamless
  };

  if(options[selected]) {
    const twiml = new twilio.TwimlResponse();
    const callId = req.body.CallSid;
    const phone = req.body.PhoneNumber;

    options[selected](twiml, callId, phone)
      .then(() => {
        res.send(twiml);
      })
      .catch(() => {
        res.send(redirectWelcome());
      });
  } else {
    res.send(redirectWelcome());
  }
});

// Connect to agent
router.post('/agent', twilio.webhook({validate: false}), (req, res) => {
  const twiml = new twilio.TwimlResponse();
  twiml.dial(req.body.id);
  res.send(twiml);
});

const gotoGrubHub = (twiml, callId, phone) => {
  return createTicket('GrubHub', callId, phone)
    .then(ticketId => {
      twiml.say(`Thank you for calling grub hub. Your ticket is: ${ticketId}`, {voice: 'alice', language: 'en-US'});
      return twiml;
    });
};

const gotoSeamless = (twiml, callId, phone) => {
  return createTicket('Seamless', callId, phone)
    .then(ticketId => {
      twiml.say(`Thank you for calling seamless. Your ticket is: ${ticketId}`, {voice: 'alice', language: 'en-US'});
      return twiml;
    });
};

const redirectWelcome = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('Returning to the main menu.', {voice: 'alice', language: 'en-GB'});
  twiml.redirect('/ivr/welcome');
  return twiml;
};

const createTicket = (brand, callId, phone) => {
  return request(
    {
      method: 'POST',
      url: 'https://api-pp.grubhub.com/rainbow/telephone',
      headers: {
        Authorization: 'Token vNC3T0CnaTSLkXnjSoqYQcijpdrESWZu'
      },
      form: {
        brand,
        call_ani: phone,
        call_dnis: phone,
        call_id: callId,
        scope: 'diner,restaurant'
      },
      json: true
    })
    .then(json => {
      return json.zendesk_ticket_id;
    });
};

export default router;
