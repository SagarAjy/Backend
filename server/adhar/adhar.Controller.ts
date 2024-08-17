// import { Request, Response } from 'express';
// import axios from 'axios';

// import { KYCModel } from './adhar.model';

// import { JsonValue } from '@prisma/client/runtime';

// export interface Customer {
//   id: number;
//   clientId: string;
//   aadhaarNumber: string;
//   kycRecords?: KYCRecord[];
// }

// export interface KYCRecord {
//   id: number;
//   customerId: number;
//   clientId: string;
//   aadhaarId: string;
//   data: JsonValue;
//   createdAt: Date;
//   updatedAt: Date;
//   status: string;
// }

// export interface RequestOtpBody {
//   aadhaarNumber: string;
// }

// export interface VerifyOtpBody {
//   otp: string;
// }

// export interface VerifyOtpParams {
//   clientId: string;
// }

// export class KYCController {
//   static async getAadhaarNumber(
//     req: Request<{ clientId: string }>,
//     res: Response,
//   ) {
//     const { clientId } = req.params;
//     try {
//       const customer = await CustomerModel.findByClientId(clientId);
//       if (!customer) {
//         return res.status(404).json({ error: 'Customer not found' });
//       }
//       res.json({ aadhaarNumber: customer.aadhaarNumber });
//     } catch (error) {
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }

//   static async requestOtp(req: Request<{}, {}, RequestOtpBody>, res: Response) {
//     const { aadhaarNumber } = req.body;
//     try {
//       const response = await axios.post('https://aadhaarapi.example.com/otp', {
//         aadhaarNumber,
//       });
//       res.json(response.data);
//     } catch (error) {
//       res.status(500).json({ error: 'Error requesting OTP' });
//     }
//   }

//   static async verifyOtp(
//     req: Request<VerifyOtpParams, {}, VerifyOtpBody>,
//     res: Response,
//   ) {
//     const { otp } = req.body;
//     const { clientId } = req.params;

//     try {
//       // Fetch Aadhaar number from the customer table
//       const customer = await CustomerModel.findByClientId(clientId);
//       if (!customer) {
//         return res.status(404).json({ error: 'Customer not found' });
//       }

//       // Verify OTP
//       const response = await axios.post(
//         'https://aadhaarapi.example.com/verify',
//         { otp, aadhaarNumber: customer.aadhaarNumber },
//       );

//       // Store the result in the database
//       await KYCModel.createRecord({
//         customerId: customer.id,
//         clientId,
//         aadhaarId: customer.aadhaarNumber,
//         kycData: response.data,
//       });

//       res.json(response.data);
//     } catch (error) {
//       res.status(500).json({ error: 'Error verifying OTP' });
//     }
//   }
// }
