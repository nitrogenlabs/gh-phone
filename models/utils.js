import config from '../build/config';
import _ from 'lodash';
import crypto from 'crypto';
import Promise from 'bluebird';
import jwt from 'jsonwebtoken';
import Twilio from 'twilio';
import phoneFormatter from 'google-libphonenumber';

let utils = {};

utils.generateHash = key => {
  //Get Milliseconds
  let date = new Date();
  let time = date.getTime();
  
  //Create Hash
  date = time + key;
  let md5 = crypto.createHash('md5');
  md5.update(date, 'utf8');
  return md5.digest('hex');
};

// Session
utils.getSession = token => {
  // Get Session
  let auth = jwt.verify(token, config.jwt.secret);
  
  if(auth && auth.id) {
    return auth;
  } else {
    throw new Error('jwt_error');
  }
};

utils.setSession = session => jwt.sign(session, config.jwt.secret, {expiresIn: '60d'});

// GraphQL
utils.graphqlProps = (options) => {
  let props = {};

  options.fieldASTs.map(f => {
    let name = f.name.value;
    let selections = f.selectionSet.selections || [];
    props[name] = selections.map(s => s.name.value);
  });

  return props;
};

utils.toGraphQL = obj => {
  if(_.isString(obj) || _.isArray(obj)) {
    return JSON.stringify(obj);
  } else {
    obj = _(obj).omit(_.isUndefined).omit(_.isNull).value();
    let keys = Object.keys(obj);
    let props = [];
    
    keys.map(k => {
      let item = obj[k];
      
      if(_.isPlainObject(item)) {
        props.push(utils.toGraphQL(item));
      }
      else if(_.isArray(item)) {
        let list = item.map(o => {
          return utils.toGraphQL(o);
        });
        
        props.push(`${k}: [${list.join(', ')}]`);
      } else {
        let val = JSON.stringify(item);
        
        if(val) {
          props.push(`${k}: ${val}`);
        }
      }
    });
    
    return `{${props.join(', ')}}`;
  }
};

// Twilio
utils.twilio = Twilio(config.twilio.sid, config.twilio.token);

utils.sendSMS = (phone, message, countryCode = 'US') => {
  phone = utils.formatPhone(phone, countryCode);
  const cfg = {
    to: phone,
    from: config.twilio.number,
    body: message
  };
  
  return new Promise((resolve, reject) => {
    utils.twilio.sendMessage(cfg, (error, data) => {
      if(error) {
        reject(new Error(error.error_message));
      } else {
        resolve(data);
      }
    });
  });
};

utils.formatPhone = (phone, countryCode = 'US') => {
  const converter = phoneFormatter.PhoneNumberUtil.getInstance();
  const number = converter.parse(phone, countryCode);
  return converter.format(number, phoneFormatter.PhoneNumberFormat.E164);
};

export default utils;