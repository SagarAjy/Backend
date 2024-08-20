export interface AadharVerificationRequest {
  aadharNumber: string;
}
export interface AadharOTPRequest {
  client_id: string;
  otp: string;
}

export interface AadharVerificationResponse {
  status: string;
  // Add other fields as per the third-party API response
}

export interface OTPTriggerResponse {
  otpRequestId: string;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
}

export interface AadharKYCData {
  customer_id: string;
  data_aadhar: any; // Replace with a more specific type if you know the structure of the JSON data
  client_id: any;
  status?: string; // Optional, defaults to 'active'
}
