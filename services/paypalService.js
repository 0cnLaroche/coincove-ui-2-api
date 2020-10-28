const axios = require('axios');
const querystring = require('querystring');
const config = require('config');
const dotenv = require('dotenv');
const logger = require('../logger');

/* Load environement variables */
dotenv.config();
const SECRET = config.get('security.pay.secret');
const CLIENT_ID = config.get('pay.client_id')
const API = config.get('pay.api');

axios.interceptors.request.use(request => {
    logger.debug('Starting Request: %O', {
        url: request.url,
        method: request.method,
        data: request.data
    })
    return request;
})
  
axios.interceptors.response.use(response => {
    logger.debug('Response: %O', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
    })
    return response;
})


const testNonStatic = () => {
    return true;
}

/**
 * Call Paypal API to obtain authentication
 */
const fetchAuthentication = async () => {
    const url = `${API}/v1/oauth2/token`;
    const options = {
        auth: {
            username: CLIENT_ID,
            password: SECRET
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    }
    const response = await axios.post(url, 'grant_type=client_credentials', options);
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
        const url = `${API}/v2/payments/captures/${authorizationId}`
        const token = await this.getAccessToken();
        const config = {
            headers: { 
                'authorization' : `Bearer ${token}`
            }
        }
        const { data } = await axios.get(url, config);
        return data;
    }

    /** POST tracking number for transaction. Paypal will
     * lift hold on funds when shipment is received by client
     * @param transaction_id payment Paypal transaction id
     * @param tracking_number shipment tracking number
     * @param carrier carrier name
     */
    async postTrackingId(transaction_id, tracking_number, carrier) {
        const url = `${API}/v1/shipping/trackers-batch`
        const token = await this.getAccessToken();
        const options = {
            headers: { 
                'authorization' : `Bearer ${token}`
            }
        }
        const data = {
            trackers: [
                {
                transaction_id,
                tracking_number,
                status: "SHIPPED",
                carrier
              },
            ]
        }
        return await axios.post(url, data, options);
    }
}

const paypalService = new PaypalService();

module.exports = paypalService;