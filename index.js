const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const controllers = require("./controllers/index");
const app = express();

const corsOptions = {
    origin: "*",
    methods: "*"
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

app.enable('trust proxy');

app.use(function (request, response, next) {
    if (process.env.NODE_ENV !== 'development' && !request.secure) {
        return response.redirect(307, "https://" + request.headers.host + request.url);
    }

    next();
});

app.use(controllers);

const httpServer = http.createServer(app);

console.log("current env : " + process.env.NODE_ENV);
httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});

if ( process.env.NODE_ENV !== 'development' ) {
    const credentials = {
        key: fs.readFileSync('./ssl/private.key'),
        cert: fs.readFileSync('./ssl/certificate.crt'),
        ca: fs.readFileSync('./ssl/ca_bundle.crt'),
        requestCert: false,
        rejectUnauthorized: false
    };
    
    const httpsServer = https.createServer(credentials, app);
    
    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
}