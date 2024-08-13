import { Request, Response,NextFunction } from 'express';
import  PanModel from './Pan.Model'



export interface PanResponse {
  panNumber: string;
  name: string;
  dob: string;
  // Add other fields as per the API documentation
}
const PanController={
    getPan
}
export default PanController


async function getPan(req: Request, res: Response,next:NextFunction): Promise<void> {
    try {
      const panNumber = req.body;
      if (!panNumber.id_number || !panNumber.id_number || !isValidPanNumber(panNumber.id_number)) {
        res.status(400).json({ message: 'Invalid PAN number format' });
        return;
      }
      const panRes = await PanModel.getPanDetails(panNumber);

      res.json(panRes)
      next()
    } catch (error) {
      res.status(500).json({ message: 'Error fetching PAN details' });
    }
  }


const isValidPanNumber = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }