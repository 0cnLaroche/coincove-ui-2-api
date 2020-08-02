const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');
const logger = require('../logger');
const { isNullOrUndefined } = require('util');

/* Load environement variables */
dotenv.config();


axios.interceptors.request.use(request => {
    logger.debug('Starting Request: %O', {
        url: request.url,
        method: request.method,
        data: request.data
    })
    return request
  })
  
  axios.interceptors.response.use(response => {
    logger.debug('Response: %O', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
    })
    return response
  })


const testNonStatic = () => {
    return true;
}

/**
 * Call Paypal API to obtain authentication
 */
const fetchAuthentication = async () => {
    const url = `${process.env.PAYPAL_URL}/v1/oauth2/token`;
    config = {
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    }
    const response = await axios.post(url, 'grant_type=client_credentials', config);
    if (response.status === 200) {
        return response.data;
    } else if (response.status === 401){
        throw new Error("Paypal authorization error: Bad credentials")
    } else {
        throw new Error("Paypal authorization error: " + response.statusText)
    }
}

class PaypalService {
    constructor() {
        this.testNonStatic = testNonStatic;
        this.fetchAuthentication = fetchAuthentication;
        this._accessTokenExpiry = null;
        this.accessToken = null;
    }
    /**
     * Set expiry of Paypal API Access Token 
     * @param {Date} expiryDate
     */
    set accessTokenExpiry(expiryIn) {
        let expiryDate = new Date(Date.now() + expiryIn);
        this._accessTokenExpiry = expiryDate;
        logger.debug('Paypal access token expire at %s', this.accessTokenExpiry)
    }
    /**
     * Get expiry of Paypal API Access Token
     * @returns {Date} expiry date
     */
    get accessTokenExpiry() {
        return this._accessTokenExpiry;
    }
    /**
     * Get API Access Token. If expired, fetch a new one from API
     * and sets new expiry
     * @returns {Promise<String>} Paypal access token
     */
    async getAccessToken() {
        if (this.accessTokenExpiry < Date.now() || this.accessToken === null) {
            const data = await fetchAuthentication();
            this.accessToken = data.access_token;
            this.accessTokenExpiry = data.expires_in;
        }
        return this.accessToken;
    }
    /**
     * Fetch payment 
     * @param {String} authorizationId 
     */
    async getPayment(authorizationId) {
        const url = `${process.env.PAYPAL_URL}/v2/payments/captures/${authorizationId}`
        const token = await this.getAccessToken();
        const config = {
            headers: { 
                'authorization' : `Bearer ${token}`
            }
        }
        const response = await axios.get(url, config);
        return response.data;
    }
}

const paypalService = new PaypalService();

module.exports = paypalService;