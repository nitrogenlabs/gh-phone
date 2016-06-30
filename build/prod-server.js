import graphqlHTTP from 'express-graphql';
import jwt from 'express-jwt';
import schema from '../graphql';
import {maskErrors} from 'graphql-errors';
import config from './config';
import cors from 'cors';
import { Server } from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import SocketIO from 'socket.io';

maskErrors(schema);

const app = express();
const server = Server(app);
const port = config.port[config.env];

// SocketIO
const io = SocketIO(server);
io.on('connection', socket => {
  socket.on('disconnect', () => {});

  socket.on('join', id => {
    id = utils.parseVarChar(id, 32);
    socket.join(id);
  });
});

// JWT
app.use(jwt({secret: config.jwt.secret, requestProperty: 'auth', credentialsRequired: false}));

// Body
app.use(bodyParser.text({ type: 'application/graphql', limit: '3mb' }));
app.use(bodyParser.json({ limit: '3mb' }));

// GraphQL
app.use('/graphql', cors(corsOpts), graphqlHTTP(req => ({ schema: schema, pretty: false, rootValue: {headers:req.headers, io}, graphiql: false })));

// Run server on default port
server
  .listen(port, function() {
    console.log('---------------------------------------');
    console.log('| Local: http://localhost:%d', server.address().port);
    console.log('---------------------------------------');
  })
  .on('error', function(error) {
    console.log('[express]', error.message);
  });