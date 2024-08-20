import { Request, Response, NextFunction } from 'express';
import { triggerAadharOTP, verifyAadharOTP } from './aadhar.service';
import aadharModel from './aadhar.model';
import {
  AadharVerificationRequest,
  AadharOTPRequest,
  ErrorResponse,
  AadharKYCData,
} from './aadhar.types';
const { getCustomerId, createAadharKYC, updateAadharData, getAllAadharData } =
  aadharModel;
interface CustomRequest extends Request {
  aadharNo?: string;
}
async function triggerOTP(req: CustomRequest, res: Response) {
  try {
    const { aadharNo = '' }: CustomRequest = req.body;
    let { aadharNumber = '', customerId = '' } = await getCustomerId(aadharNo);
    const otpResponse: any = await triggerAadharOTP({
      id_number: aadharNo,
    });
    const aadharKYCData: AadharKYCData = {
      customer_id: customerId,
      data_aadhar: {},
      client_id: otpResponse.data.client_id,
      status: 'active',
    };
    const otpSent = await createAadharKYC(aadharKYCData);
    return res.status(200).json({
      mesaage: 'OTP sent',
      clientId: otpResponse.data.client_id,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    res
      .status(500)
      .json({ message: errorMessage, statusCode: 500 } as ErrorResponse);
  }
}

async function verifyOTP(req: Request, res: Response) {
  try {
    const { otp = '', client_id = '' }: AadharOTPRequest = req.body;
    const aadharData: any = await verifyAadharOTP({
      otp: otp,
      client_id: client_id,
    });
    const updatedData: any = await updateAadharData(client_id, aadharData.data);
    res.status(200).json({ message: 'Aadhar KYC successfully completed' });
  } catch (error: any) {
    if (error.message === 'OTP Already Submitted') {
      res.status(422).json({ error: error.message });
    } else {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      res
        .status(500)
        .json({ message: errorMessage, statusCode: 500 } as ErrorResponse);
    }
  }
}
async function getAllAdharkycData(req: Request, res: Response) {
  try {
    const data = await getAllAadharData();
    return res.status(200).json({ Data: data });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    res
      .status(500)
      .json({ message: errorMessage, statusCode: 500 } as ErrorResponse);
  }
}

const aadharController = { triggerOTP, verifyOTP, getAllAdharkycData };
export default aadharController;
