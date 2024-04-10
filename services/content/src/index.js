const express   = require('express');
const env       = require('./env');
const routes    = require('./routes');

const app = express();
app.use(express.json());
app.use('/', routes);

const server = app.listen(env.port, () => {
    console.log(`Listening on port ${env.port}`)
});


// TODO Exercise 2: Use Sigterm handling to shut down gracefully
process.on('SIGTERM', () => {
    console.log('The service is about to shut down!');
    
    server.close(() => {
        console.log('TMS content service shut down.');

        process.exit(0);
    });
    // Finish any outstanding requests, then...
    
});
