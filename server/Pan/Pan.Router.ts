import { Router } from 'express';
import PanController from './Pan.Controller';
const {getPankyc}=PanController

const PanRouter = Router();   

PanRouter.post('/pan',getPankyc);

export default PanRouter;
