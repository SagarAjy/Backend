import { PrismaClient, KYCRecord } from '@prisma/client';

const prisma = new PrismaClient();

export class KYCModel {
  static async createRecord(data: {
    customerId: number;
    clientId: string;
    aadhaarId: string;
    kycData: any; // Adjust the type based on actual data structure
    status?: string;
  }): Promise<KYCRecord> {
    return prisma.kycRecord.create({
      data: {
        customerId: data.customerId,
        clientId: data.clientId,
        aadhaarId: data.aadhaarId,
        data: data.kycData,
        status: data.status || 'active',
      },
    });
  }
}


export class CustomerModel {
  static async findByClientId(clientId: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { clientId },
    });
  }
}

