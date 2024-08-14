import { Request, Response,NextFunction } from 'express';
import  PanModel from './Pan.Model'
const PanController={
  getPankyc
}
export default PanController


async function getPankyc(req: Request, res: Response,next:NextFunction): Promise<void> {
  try {
      //@ts-ignore
      let {clientId='' } = req.body;
      const panRes = await PanModel.getPanDetails(clientId);
      res.status(201).json({ message: 'Pan is verifed.' });
      next()
    } catch (error) {
      res.status(500).json({ message: 'Error fetching PAN details' });
    }
  }

