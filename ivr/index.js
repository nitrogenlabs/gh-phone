import express from 'express';
import twilio from 'twilio';
import request from 'request';
import xml2js from 'xml2js';
import Promise from 'bluebird';

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
    node.say('Welcome to Carebear! Press 1 for grub hub. Press 2 for seamless.', {voice: 'woman', language: 'en-US'});
  });

  res.send(twiml);
});

// Select brand
router.post('/menu', twilio.webhook({validate: false}), (req, res) => {
  const selected = req.body.Digits;
  const options = {
    '1': gotoGrubHub,
    '2': gotoSeamless
  };

  if(options[selected]) {
    const twiml = new twilio.TwimlResponse();
    const callId = req.body.CallSid;
    const phone = req.body.From;

    options[selected](twiml, callId, phone)
      .then(() => {
        res.send(twiml);
      })
      .catch(() => {
        res.send(errorOccurred());
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
      twiml.say(`Thank you for calling grub hub. Your ticket is: ${ticketId}`, {voice: 'woman', language: 'en-US'});
      return twiml;
    });
};

const gotoSeamless = (twiml, callId, phone) => {
  return createTicket('Seamless', callId, phone)
    .then(ticketId => {
      twiml.say(`Thank you for calling seamless. Your ticket is: ${ticketId}`, {voice: 'woman', language: 'en-US'});
      return twiml;
    });
};

const redirectWelcome = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('Returning to the main menu.', {voice: 'woman', language: 'en-US'});
  twiml.redirect('/ivr/welcome');
  return twiml;
};

const errorOccurred = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('There was an error in creating your ticket. Returning to the main menu.',
    {voice: 'woman', language: 'en-US'});
  twiml.hangup();
  return twiml;
};

router.get('/createTicket', (req, res) => {
  createTicket('GrubHub', req.query.callId, req.query.phone)
    .then(ticketId => {
      res.send(`saved: ${ticketId}`);
    })
    .catch(console.error);
});

const createTicket = (brand, callId, phone) => {
  return new Promise(resolve => {
    request.post({
      uri: 'https://api-pp.grubhub.com/rainbow/telephone',
      headers: {
        Authorization: 'Token vNC3T0CnaTSLkXnjSoqYQcijpdrESWZu'
      },
      form: {
        brand,
        call_ani: phone,
        call_dnis: phone,
        call_id: callId,
        scope: 'diner,restaurant'
      }
    }, (err, res, body) => {
      const parser = new xml2js.Parser();
      parser.parseString(body, (parseError, parseResult) => {
        const response = parseResult.response || {};
        const variables = response.variables || [];
        const vars = variables[0] ? variables[0].var : [];
        const ticket = vars[1] || {};
        let ticketId = '';

        if(ticket['$']) {
          ticketId = ticket['$']['expr'];
        }

        resolve(ticketId);
      });
    });
  });
};

export default router;
