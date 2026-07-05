import debug from 'debug';

const httpDebug = debug('app:http');

function admin(req, res, next) {
  const adminPrevilage = req.user.role === 'admin';
  if (!adminPrevilage) {
    httpDebug('The user does not have admin previlage');
    return res.status(403).send('Access denied. Admin privileges required.');
  }
  httpDebug('Token with admin previlage is found');
  next();
}

export default admin;
