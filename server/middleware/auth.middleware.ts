import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY || '';

 
const fetchUser = (req, res, next) => {
  try {
    const authHeader = req.header('auth-token');
    const clientId = req.header('client-Id');
    console.log("clientId from backend auth=",clientId)
    if (!authHeader) {
      return res.status(401).send({ message: 'Invalid Token' });
    }

    const decoded = jwt.verify(authHeader, secretKey);
    req.user = decoded;
    req.clientId = clientId;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Invalid token!' });
  }
};

export { fetchUser };
