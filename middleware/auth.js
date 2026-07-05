import jwt from 'jsonwebtoken';
import debug from 'debug';

const httpDebug = debug('app:http');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    httpDebug('Token is not found, access is not granted');
    return res.status(401).send('Access Denied - No token found');
  }
  try {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const decodedPayload = jwt.verify(token, privateKey);

    req.user = decodedPayload;
    next();
  } catch (error) {
    // if token expired, return an error
    httpDebug('Token was invalid');
    return res.status(400).send('Invalid Token');
  }
}

export default auth;
