import {GraphQLObjectType, GraphQLList, GraphQLString, GraphQLFloat, GraphQLBoolean} from 'graphql';
import utils from '../../models/utils';

export default new GraphQLObjectType({
  name: 'Call',
  fields: {
    sid: {
      type: GraphQLString
    },
    date_created: {
      type: GraphQLString
    },
    date_updated: {
      type: GraphQLString
    },
    parent_call_sid: {
      type: GraphQLString
    },
    account_sid: {
      type: GraphQLString
    },
    to: {
      type: GraphQLString
    },
    formatted_to: {
      type: GraphQLString
    },
    from: {
      type: GraphQLString
    },
    formatted_from: {
      type: GraphQLString
    },
    phone_number_sid: {
      type: GraphQLString
    },
    status: {
      type: GraphQLString
    },
    start_time: {
      type: GraphQLString
    },
    end_time: {
      type: GraphQLString
    },
    duration: {
      type: GraphQLString
    },
    price: {
      type: GraphQLString
    },
    direction: {
      type: GraphQLString
    },
    answered_by: {
      type: GraphQLString
    },
    api_version: {
      type: GraphQLString
    },
    forwarded_from: {
      type: GraphQLString
    },
    caller_name: {
      type: GraphQLString
    },
    uri: {
      type: GraphQLString
    }
  }
});
