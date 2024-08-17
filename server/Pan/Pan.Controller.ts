import { Request, Response, NextFunction } from 'express';
import panModel from './pan.Model';
const panController = {
  getPankyc,
};
export default panController;

async function getPankyc(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let { clientId = '' } = req.body;
    const panRes = await panModel.getPanDetails(clientId);
    res.status(201).json({ message: 'Pan is verifed.' });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PAN details' });
  }
}
