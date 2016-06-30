import graphqlHTTP from 'express-graphql';
import jwt from 'express-jwt';
import schema from '../graphql';
import {maskErrors} from 'graphql-errors';
import util from 'gulp-util';
import config from './config';
import {Server} from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import SocketIO from 'socket.io';
import cors from 'cors';
import utils from '../models/utils';
import ivr from '../ivr';

// Mask GraphQL Errors
maskErrors(schema);

// Express
const app = express();
const server = Server(app);
const port = config.port[config.env];
const corsOpts = {
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
  origin: true
};

// SocketIO
const io = SocketIO(server);
io.on('connection', socket => {
  socket.on('disconnect', () => {
  });

  socket.on('join', id => {
    id = utils.parseVarChar(id, 32);
    socket.join(id);
  });
});

// JWT
app.use(jwt({secret: config.jwt.secret, requestProperty: 'auth', credentialsRequired: false}));

// Body
app.use(bodyParser.text({type: 'application/graphql', limit: '1mb'}));
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// GraphQL
app.use('/graphql', cors(corsOpts), graphqlHTTP(req => ({
  schema: schema,
  pretty: true,
  rootValue: {auth: req.auth, io},
  graphiql: true
})));

// IVR
app.use('/ivr', ivr);

// Static files
app.use('/', express.static(config.absolute(config.directories.dist)));

// Run server on default port
server
  .listen(port, () => {
    util.log('---------------------------------------');
    util.log('|  DEVELOPMENT                        |');
    util.log('|  Local: http://localhost:%d', server.address().port);
    util.log('---------------------------------------');
  })
  .on('error', error => {
    util.log('[express]', error.message);
  });
