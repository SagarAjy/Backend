import { Request, Response,NextFunction } from 'express';
import  PanModel from './Pan.Model'
const PanController={
  getPankyc
}
export default PanController


async function getPankyc(req: Request, res: Response,next:NextFunction): Promise<void> {
  try {
      //@ts-ignore
     let { panNumber='',clientId='' } = req.body;
    //@ts-ignore
    panNumber=panNumber.toUpperCase()
    console.log(panNumber, clientId, req.body)
     
      if (!panNumber || !panNumber || !isValidPanNumber(panNumber)) {
        res.status(400).json({ message: 'Invalid PAN number format' });
        return;
      }
      const panRes = await PanModel.getPanDetails(panNumber,clientId);
      res.status(201).json({ message: 'Pan is verifed.' });
      next()
    } catch (error) {
      res.status(500).json({ message: 'Error fetching PAN details' });
    }
  }


const isValidPanNumber = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
}
