import { Router } from 'express';
import PanController from './Pan.Controller';
const {getPan}=PanController

const PanRouter = Router();   

PanRouter.post('/pan',getPan);

export default PanRouter;
