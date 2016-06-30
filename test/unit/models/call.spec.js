import {before, it} from 'mocha';
import sinon from 'sinon';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import utils from '../../../models/utils';
import {graphql} from 'graphql';
import schema from '../../../graphql';
import {maskErrors} from 'graphql-errors';
import 'sinon-bluebird';

maskErrors(schema);
chai.use(chaiAsPromised);

describe.only('Twilio Phone Call', () => {
  it('should throw an error for mismatching password and confirm', () => {
    let item = {
      email: 'new@reaktor.io',
      password: 'password',
      confirm: 'not_match'
    };

    item = utils.toGraphQL(item);

    let query = `mutation { users { add(data: ${item}) {id} } }`;
    let gql = graphql(schema, query, {auth: {app, token}});
    return expect(gql).to.eventually.have.deep.property('errors');
  });
});
