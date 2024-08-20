import jwt from 'jsonwebtoken';
//import { logger } from '../../logger';

const secretKey = process.env.SECRET_KEY || '';

const fetchCustomer = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.header('Auth-Token');
    const clientId = req.header('client-id');
    if (!authHeader) {
      return res.status(401).send({ message: 'Invalid Token' });
    }
    const decoded = jwt.verify(authHeader, secretKey);
    req.phoneNo = decoded;
    req.clientId = clientId;
    next();
  } catch (error) {
    //    logger.error(error);
    res.status(401).send({ message: 'Some error occured' });
  }
};

export { fetchCustomer };
