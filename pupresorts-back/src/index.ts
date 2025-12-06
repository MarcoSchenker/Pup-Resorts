import logger from 'jet-logger';

import server from './server';
import dotenv from 'dotenv';
import * as process from "node:process";

/******************************************************************************
                                Constants
******************************************************************************/

const port = process.env.PORT || 8080;
const SERVER_START_MSG = (
  'Express server started on port: ' + port
);


/******************************************************************************
                                  Run
******************************************************************************/

// Start the server
server.listen(port, err => {
  if (!!err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MSG);
  }
});


