import { Router } from 'express';
import { fetchCustomer } from '../middleware/customer.auth.middleware';
import panController from './pan.Controller';
const { getPankyc } = panController;

const panRouter = Router();

panRouter.post('/pan', fetchCustomer, getPankyc);

//PanRouter.post('/pan',getPankyc); testing for local set the client id
export default panRouter;
