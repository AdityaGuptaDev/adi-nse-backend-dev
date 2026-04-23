import app from "./app";
import controlDB from "./db/core/control-db";
import { initControlDB } from "./db/core/init-control-db";
import environment, {env} from "./environment";
import { createServer, Server } from "http";
import { createServer as secureServer } from "https";

import fs from "fs";

const port = 9075;
let server: Server = createServer(app);



async function run() {
  initControlDB(controlDB);
  server.listen(port, () => {
    console.log(`Http '${environment}' server running on port no: ${port}`);
  });
}

run();
