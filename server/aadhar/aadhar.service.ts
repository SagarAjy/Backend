import axios, { AxiosError } from 'axios';
import {
  AadharOTPRequest,
  AadharVerificationResponse,
  OTPTriggerResponse,
} from './aadhar.types';
import AADHAR_CONFIG from './aadhar.config';
const {
  AADHAR_VERIFICATION_API_GEN_OTP_ENDPOINT,
  AADHAR_VERIFICATION_API_SUBMIT_OTP_ENDPOINT,
  AADHAR_VERIFICATION_API_KEY,
} = AADHAR_CONFIG;

interface AadharVerificationRequest {
  id_number: string;
}

export async function triggerAadharOTP(request: AadharVerificationRequest) {
  try {
    const response = await axios.post(
      AADHAR_VERIFICATION_API_GEN_OTP_ENDPOINT,
      {
        id_number: request.id_number,
      },
      {
        headers: {
          Authorization: `Bearer ${AADHAR_VERIFICATION_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.response.data.status_code === 422) {
      throw new Error(`Inavlid aadhar Number`);
    } else {
      throw new Error(`Unexpected Error: ${error}`);
    }
  }
}
export async function verifyAadharOTP(
  request: AadharOTPRequest,
): Promise<AadharVerificationResponse> {
  try {
    const response = await axios.post<AadharVerificationResponse>(
      AADHAR_VERIFICATION_API_SUBMIT_OTP_ENDPOINT,
      {
        client_id: request.client_id,
        otp: request.otp,
      },
      {
        headers: {
          Authorization: `Bearer ${AADHAR_VERIFICATION_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.response.data.status_code === 422) {
      throw new Error(`OTP Already Submitted`);
    } else {
      throw new Error(`Unexpected Error: ${error}`);
    }
  }
}
