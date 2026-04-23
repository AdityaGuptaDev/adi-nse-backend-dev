import express, { Application, Request } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import routes from "./routes/route-index";
import errorHandler from "./middlewares/errorHandler.middleware";
import currentUser from "./services/current-user";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger";
import bodyParser from 'body-parser';

//not used
import { initProsesConfig } from "./config/init-proses";
// import loadService from "./services/load-service";
// import errorHandler from "./middlewares/errorHandler.middleware"
const app: Application = express();
// Honor X-Forwarded-For from the reverse proxy (nginx/Cloudflare/cloud LB) so
// req.ip resolves to the real client IP instead of the proxy's IP. Without
// this, the rate limiter keys every production user under the single proxy IP
// and the shared bucket trips "Too many verification requests" on the live
// server even though it works locally.
app.set('trust proxy', 1);
const fs = require("fs");
import configs from "./config/config";
import environment from "./environment";
import { Cronjob } from "./services/cronejob.service";
const config = (configs as { [key: string]: any })[environment];

//added on dated 21-03-2026 by rakesh sinha

import { rateLimitMiddleware } from './middlewares/rateLimit';
import { sanitizeInput, sanitizeUserInput } from './middlewares/sanitization';
import { securityHeaders, strictSecurityHeaders } from './middlewares/securityHeaders';
import { piiDecryptMiddleware } from './middlewares/piiDecrypt.middleware';
import { env } from "./environment";
// import { initializeOpenSourceSIEM } from './services/simple-siem.service';





app.use(bodyParser.json({ limit: '50mb' }));

// Initialize Open-Source SIEM/SOC
// initializeOpenSourceSIEM(); // Temporarily disabled

//added by rakesh sinha on dated 21-03-2026

// Global security monitoring
app.use(rateLimitMiddleware); // Rate limiting
app.use(piiDecryptMiddleware); // Decrypt PII fields encrypted by frontend (MUST run BEFORE sanitization)
app.use(sanitizeInput); // Input sanitization (runs AFTER PII decryption so Base64 ciphertext is not corrupted)
app.use(cors())
/*app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://vedantmf.com/api']
    : ['https://vedantmf.com/api'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));*/
//// Configured CORS

//
//app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '1mb' })); // Parse JSON bodies with reduced limit
//app.use(sanitizeUserInput); // User-specific input sanitization


app
  .use("/api-docs/", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      docExpansions: "none",
      persistAuthorization: true
    }
  }))

  .use("/static", express.static(config.publicPath))
  .use(helmet())
  .use(compression())
  //.use(express.json())
  .use(express.urlencoded({ limit: "50mb", extended: true }))
  .use(
    helmet.frameguard({
      action: "deny",
    })
  );
Cronjob.startAll();


//global error handler
app.use(errorHandler);




app.post('*', (req, res, next) => {
  req.query = hydrateUser(req.query)
  next();
});

app.put('*', (req, res, next) => {
  req.query = hydrateUser(req.query)
  next();
});

//init proses configs
initProsesConfig();
(routes as any)(app);

app.use("/", (req, res) => {
  res.status(404).send("Route Not Found");
});
export default app;


function hydrateUser(query: any) {
  if (!query.userData) {
    return query;
  }

  currentUser.hydrate(JSON.parse(query.userData));
  delete query.userData;
  return query

}