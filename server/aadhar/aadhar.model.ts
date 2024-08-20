import { PrismaClient } from '@prisma/client';
import { customerModel } from '../customer/customer.model';
import {
  AadharVerificationRequest,
  AadharOTPRequest,
  ErrorResponse,
  AadharKYCData,
} from './aadhar.types';

// export class CustomerModel {
//   static async findByClientId(clientId: string): Promise<Customer | null> {
//     return prisma.customer.findUnique({
//       where: { clientId },
//     });
//   }
// }

const prisma = new PrismaClient();
export const getCustomerId = async (aadharNumber: string) => {
  const customer = await prisma.customers.findFirst({
    where: {
      aadhar_no: aadharNumber,
    },
  });

  let obj: any = {
    aadharNumber: customer?.aadhar_no,
    customerId: customer?.customer_id,
  };
  return obj;
};

async function createAadharKYC(data: AadharKYCData): Promise<void> {
  try {
    await prisma.aadharkyc.create({
      data: {
        customer_id: data.customer_id,
        data_aadhar: data.data_aadhar,
        client_id: data.client_id,
        status: data.status || 'active', // Default to 'active' if status is not provided
      },
    });
  } catch (error) {
    console.error('Error creating Aadhar KYC record:', error);
    throw new Error('Failed to create Aadhar KYC record');
  }
}

async function updateAadharData(client_id: string, data: any) {
  try {
    const updatedRecord: any = await prisma.aadharkyc.update({
      where: {
        client_id: client_id,
      },
      data: {
        data_aadhar: data,
      },
    });
    return updatedRecord;
  } catch (error) {
    console.error('Error updating Aadhar KYC record:', error);
    throw new Error('Failed to update Aadhar KYC record');
  }
}

async function getAllAadharData() {
  try {
    const aadharDataList = await prisma.aadharkyc.findMany();
    return aadharDataList;
  } catch (error) {
    console.error('Error retrieving Aadhar KYC data:', error);
    throw new Error('Failed to retrieve Aadhar KYC data');
  }
}

const aadhaarModel = {
  getCustomerId,
  createAadharKYC,
  updateAadharData,
  getAllAadharData,
};

export default aadhaarModel;
