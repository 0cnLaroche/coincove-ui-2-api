const assert = require('assert');
const paypalService = require('../services/paypalService');
const { doesNotMatch } = require('assert');

describe('paypalService', () => {
    it('should have non-static method', () => {

        assert.ok(paypalService.testNonStatic(), 'Non Static is working')
    })

    describe('#fetchAuthentication()', () => {
        it('Should obtain access token', async () => {
            const auth = await paypalService.fetchAuthentication();
            assert.ok(auth, "Did received authentication object");
        })
    })
    describe('#getAccessToken', async () => {
        it('Should return a valid access token', async () => {
            const token = await paypalService.getAccessToken();
            assert.ok(token, 'Did get a token');
        })
    })
})