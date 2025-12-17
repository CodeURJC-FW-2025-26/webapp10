// src/app.js
//JavaScript server-side main application file

import express from 'express'; // Express framework
import mustacheExpress from 'mustache-express'; // Mustache templating engine
import bodyParser from 'body-parser'; // Body parser middleware
 
import router from './router.js'; // Application routes
import './load_data.js'; // Load initial data

import { UPLOADS_FOLDER } from './catalog.js'; // Uploads folder constant

const app = express(); // Create Express app

app.use(express.static('./public')); // Serve static files

app.set('view engine', 'html'); // Set view engine to Mustache
app.engine('html', mustacheExpress(), ".html"); // Register Mustache engine
app.set('views', './views'); // Set views directory

app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use('/', router); // Use application routes

app.listen(3000, () => console.log('Web ready in http://localhost:3000/')); // Start server

app.use("/uploads", express.static(UPLOADS_FOLDER)); // Serve uploads folder