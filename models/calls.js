import config from '../build/config';
import Twilio from 'twilio';

let model = {};

model.getToken = id => {
  const capability = new Twilio.Capability(config.twilio.sid, config.twilio.token);
  capability.allowClientOutgoing(config.twilio.agent);
  capability.allowClientIncoming(id);
  return capability.generate();
};

model.retrieve = callId => {
  const client = new Twilio.RestClient(config.twilio.sid, config.twilio.token);
  client.request({
      url: `/Accounts/${config.twilio.sid}/Calls/${callId}`,
      method: 'POST'
    },
    (error, data) => {
      //work with response data
    });
};

model.getCallsByTicket = ticketId => {
  const client = new Twilio.RestClient(config.twilio.sid, config.twilio.token);
  client.request({
      url: `/Accounts/${config.twilio.sid}/Calls/${callId}`,
      method: 'POST'
    },
    (error, data) => {
      //work with response data
    });
};

export default model;
