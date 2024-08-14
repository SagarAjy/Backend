import { Router } from 'express';
import { fetchCustomer } from '../middleware/customer.auth.middleware'
import PanController from './Pan.Controller';
const {getPankyc}=PanController

const PanRouter = Router();   

PanRouter.post('/pan',fetchCustomer,getPankyc);
//PanRouter.post('/pan',getPankyc); testing for local set the client id
export default PanRouter;
