import { Request, Response, NextFunction } from 'express';
import panModel from './pan.Model';
interface CustomRequest extends Request {
  panNumber?: string;
}
const panController = {
  getPankyc,
};
export default panController;

async function getPankyc(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let { panNumber = '' } = req.body;
    const panRes = await panModel.getPanDetails(panNumber);
    res.status(201).json({ message: 'Pan is verifed.' });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PAN details', error });
  }
}
