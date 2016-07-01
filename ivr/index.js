import express from 'express';
import twilio from 'twilio';
import request from 'request';
import xml2js from 'xml2js';
import Promise from 'bluebird';
import formatter from 'google-libphonenumber';

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
    node.say('Welcome to Carebear! Press 1 for grub hub. Press 2 for seamless.', {voice: 'man', language: 'en-US'});
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
    let phone = req.body.From || '';

    if(phone === 'client:Anonymous'){
      phone = '';
    } else {
      const country = req.body.FromCountry || 'US';

      if(country === 'US') {
        const phoneUtil = formatter.PhoneNumberUtil.getInstance();
        const phoneObj = phoneUtil.parse(phone, country);
        const values = phoneObj['values_'] || {};
        phone = values['2'] || phone;
      }
    }

    options[selected](twiml, callId, phone)
      .then(twiml => {
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
  let phone = req.body.phone || '';
  const conference = req.body.conference || '';

  const twiml = new twilio.TwimlResponse();

  if(phone !== '') {
    const phoneUtil = formatter.PhoneNumberUtil.getInstance();
    const country = req.body.country || 'US';
    const phoneObj = phoneUtil.parse(phone, country);
    phone = phoneUtil.format(phoneObj, formatter.PhoneNumberFormat.E164);
    twiml.dial(phone);
  } else {
    twiml.dial(node => {
      node.conference(conference, {
        waitUrl: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.soft-rock',
        startConferenceOnEnter: true,
        endConferenceOnExit: true,
        beep: false,
        record: 'record-from-start'
      });
    });
  }

  res.send(twiml);
});

const gotoGrubHub = (twiml, callId, phone) => {
  return createTicket('GrubHub', callId, phone)
    .then(ticketId => {
      twiml.say(`Thank you for calling grub hub. Your ticket is: ${ticketId}`, {voice: 'man', language: 'en-US'});
      twiml.dial(node => {
        node.conference(ticketId, {
          waitUrl: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.soft-rock',
          startConferenceOnEnter: false,
          endConferenceOnExit: false,
          beep: false,
          record: 'record-from-start'
        });
      });
      return twiml;
    });
};

const gotoSeamless = (twiml, callId, phone) => {
  return createTicket('Seamless', callId, phone)
    .then(ticketId => {
      twiml.say(`Thank you for calling seamless. Your ticket is: ${ticketId}`, {voice: 'man', language: 'en-US'});
      twiml.dial(node => {
        node.conference(ticketId, {
          waitUrl: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.soft-rock',
          startConferenceOnEnter: false,
          endConferenceOnExit: false,
          beep: false,
          record: 'record-from-start'
        });
      });
      return twiml;
    });
};

const redirectWelcome = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('Returning to the main menu.', {voice: 'man', language: 'en-US'});
  twiml.redirect('/ivr/welcome');
  return twiml;
};

const errorOccurred = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('There was an error in creating your ticket.', {voice: 'man', language: 'en-US'});
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

const createTicket = (brand = '', callId = '', phone = '') => {
  const promise = new Promise((resolve, reject) => {
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
    }, (err, res, xml) => {
      if(err) {
        console.error(err);
        return reject(err);
      }

      const parser = new xml2js.Parser();

      parser.parseString(xml, (parseError, parseResult) => {
        if(parseError) {
          console.error(parseError);
          return reject(parseError);
        }

        parseResult = parseResult || {};
        const response = parseResult.response || {};
        const variables = response.variables || [];
        const vars = variables[0] ? variables[0]['var'] : [];
        const ticket = vars[1] || {};
        let ticketId = '';

        if(ticket['$']) {
          ticketId = ticket['$']['expr'];
        }

        return resolve(ticketId);
      });
    });
  });

  promise.catch(error => {
    console.error(error);
    return error;
  });

  return promise;
};

export default router;
