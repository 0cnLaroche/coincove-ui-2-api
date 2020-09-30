const assert = require('assert');
const mailer = require('../services/mailer');

describe('mailer.js', () => {
    before(() => {

    })
    describe('#send()', () => {
        it('Should deliver email', (done) => {
            mailer.send('dev-testing@ecove.ca', 'unit testing', 'Hello World! this test is a succcess')
            .then(info => {
                console.log("Message sent: %s", info.messageId);
                done();
            })
            .catch(err => {
                assert.fail(err);
            })
        })
    })
})