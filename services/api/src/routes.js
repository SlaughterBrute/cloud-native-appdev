const axios = require('axios');
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
        

const express = require('express');
const routes = express.Router();
const client = new SNSClient({ region: "eu-north-1" });
const {requestsTopic} = JSON.parse(process.env.COPILOT_SNS_TOPIC_ARNS);

// TODO Exercise 1: Implement healthcheck path GET /healthz
let isHealthy = true;
let healthTimeout;

routes.get('/healthz', (req, res) => {
    if (isHealthy) {
        res.status(200).send('Service is healthy');
    } else {
        res.status(500).send('Service is unhealthy');
    }
});

routes.post('/toggle-health', (req, res) => {
    isHealthy = !isHealthy;

    // Clear any existing timeout to avoid multiple resets
    clearTimeout(healthTimeout);

    // If the service is now unhealthy, set it to automatically recover after 2 minutes
    if (!isHealthy) {
        healthTimeout = setTimeout(() => {
            isHealthy = true;
            console.log('Automatically set health to true after 2 minutes');
        }, 120 * 1000);
    }

    res.status(200).send(`Health toggled. Current state: ${isHealthy ? 'healthy' : 'unhealthy'}`);
});

// TODO Exercise 2 "Resiliency": Simulate service failure
//axios.post('http://content/request');

const publishToRequestTopic = async (requestId) => {
    const out = await client.send(new PublishCommand({
        Message: requestId,
        TopicArn: requestsTopic,
    }));
}

routes.post('/content-request', async (req, res) => {
    const contentRequest = req.body;

    // Simple validation - check for existence of languaeg and fields
    if (!contentRequest.language || !contentRequest.fields) {
        return res.status(400).send('Invalid content request.\n');
    }

    // TODO Exercise 2: Use axios to send the content request to the content service
    try {
        const response
            = await axios({
            method: 'POST',
            url: 'http://content/request',
            data: contentRequest,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const request
            = response.data;

        console.log(`RequestId received from Content Service: '${request.id}'`);

        publishToRequestTopic(request.id);

        res.send(request);
    } catch (error) {
        console.error('Error storing contentRequest', error);
        res.status(500).send('Error storing contentRequest');
    }

    // TODO Exercise 4: Send messages to SNS via the AWS SDK for SNS (according to example in exercise description)
    // ...

    // Send a response back to the client
    //res.status(200).send('Successful (dummy) response with status 200');

});

routes.get('/content-request/:id', async (req, res) => {

    // TODO Exercise 3: Fetch an existing request
    const requestId = req.params.id;

    try {
        const response = await axios.get(`http://content/request/${requestId}`);
        res.send(response.data);
    } catch (error) {
        console.error('Error getting content-request by id');
        res.status(500).send('Error getting content request by id');
    }

    // res.status(404).send("Call to content service needs to be implemented.")

});

module.exports = routes;