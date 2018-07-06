const feathers = require('@feathersjs/feathers');
const { expect } = require('chai');
const { Server } = require('../../lib');

module.exports = () => {
  describe('Server Test', () => {
    it('Cannot setup subscriptions when no app name set', async () => {
      const app = feathers();
      function testMe() {
        app.configure(Server());
      }
      expect(testMe).to.throw('App name is required');
    });

    it('Successfully setup nats subscriptions for app', async () => {
      const app = feathers();
      app.set('name', 'ServerTestName');
      app.configure(Server());
      expect(typeof app.mq.subs).to.be.equal('object');
    });
  });
};
