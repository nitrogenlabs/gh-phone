import {GraphQLNonNull, GraphQLString, GraphQLObjectType} from 'graphql';
import callType from '../types/calls';
import CallsModel from '../../models/calls';

export default {
  calls: {
    type: new GraphQLObjectType({
      name: 'UserQueries',
      fields: {
        token: {
          type: GraphQLString,
          args: {
            id: {
              name: 'id',
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve({auth}, params) {
            return CallsModel.getToken(params.id);
          }
        },
        call: {
          type: callType,
          args: {
            token: {
              name: 'token',
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve({auth}, params) {
            return CallsModel.makeCall(params.token);
          }
        }
      }
    }),
    resolve(root) {
      return root;
    }
  }
};