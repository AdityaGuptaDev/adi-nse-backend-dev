// apiUtils.js
const axios = require('axios');
const https = require('https');
const qs = require('qs');

// Function to create a secure Axios instance with an optional SSL agent configuration
const createAxiosInstance = (apiUrl: any, customConfig = {}) => {
    const agent = new https.Agent({
        rejectUnauthorized: false, // Disables SSL certificate validation (use cautiously)
    });

    return axios.create({
        baseURL: apiUrl,
        httpsAgent: agent,
        ...customConfig, // Allows additional custom configuration like headers or timeout
    });
};

// Function to handle API request
export const apiRequest = async ({
    method = 'post', // Default to POST
    url,
    headers = {},
    data = null,
    params = {},
    retries = 3,
    timeout = 10000, // Timeout of 10 seconds by default
}: any) => {
    const axiosInstance = createAxiosInstance(url);

    const config = {
        method,
        url,
        headers,
        data,
        params,
        timeout,
        maxBodyLength: Infinity,
        httpsAgent: axiosInstance.defaults.httpsAgent, // Set custom SSL agent for requests
    };

    try {
        const response = await axiosInstance.request(config);
        console.log("response---"+response.data.stringify)
        return response.data; // Return the response data
    } catch (error) {
        console.error("Error during API request:", error);
        throw error; // Rethrow the error so it can be handled upstream
    }
};

