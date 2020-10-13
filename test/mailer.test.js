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
    describe('#sendOnBehalfOf()', () => {
        it('Should deliver email', (done) => {
            mailer.sendOnBehalfOf(
                'dev-testing@ecove.ca', 
                {name: "Not the sender", address: "samuellaroche@live.ca"},
                'unit testing on behalf of', 
                'Hello World! Testing sending on behalf of')
            .then(info => {
                console.log("Message sent: %s", info.messageId);
                done();
            })
            .catch(err => {
                assert.fail(err);
            })
        })
    })
    describe('#sendOrderConfirmation()', () => {
        it('Should deliver email', (done) => {

            const order = {
                company : "ecove",
                shipping: 5.0,
                total: 115.0,
                taxes: {},
                email: 'dev-testing@ecove.ca',
                orderLines: [
                    { description: "item description 1", price: 9.99}, 
                    { description: "item description 2", price: 78.78}
                ],
                shippingAddress: {
                    firstName: "Bertrand",
                    lastName: "Banane",
                    address1: "146 rue Katimaviks",
                    address2: "app 1",
                    city: "Gatineau",
                    state: "QC",
                    postalCode: "J9P 3K6",
                    country: "Canada"
                }
            }
            mailer.sendOrderConfirmation(order)
            .then(info => {
                console.log("Message sent: %s", info.messageId);
                done();
            })
            .catch(err => {
                console.log("send Order confirmation errror:" + err);
                assert.fail(err);
            })
        })
    })
})