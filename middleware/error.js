import Debug from 'debug';

const appDebug = Debug('app:startup');

function errorHandler(err, req, res, next) {
  appDebug(`Global Exception Error: ${err.stack}`);

  res.status(500).send(`Something went wrong on the server side`);
}

export default errorHandler;
