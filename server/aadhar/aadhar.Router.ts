import { Router } from 'express';
import aadharController from './aadhar.Controller';

const aadharRouter = Router();

aadharRouter.post('/verify-aadhar', aadharController.triggerOTP);
aadharRouter.post('/verify-otp', aadharController.verifyOTP);
aadharRouter.get('/getData', aadharController.getAllAdharkycData);
export default aadharRouter;
