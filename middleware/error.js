import Debug from 'debug';

const appDebug = Debug('sppz:error');

function errorHandler(err, req, res, next) {
  appDebug(`Global Exception Error: ${err.stack}`);

  res.status(500).send(`Something went wrong on the server`);
}

export default errorHandler;
