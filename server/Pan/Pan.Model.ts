import { PrismaClient } from '@prisma/client';
import { customerModel } from '../customer/customer.model';
import axios from 'axios';
import AxiosError from 'axios';
import PAN_CONFIG from './pan.Config';
import { response } from 'express';
import { v4 as uuid } from 'uuid';
import { string } from 'yup';

const prisma = new PrismaClient();
const { PAN_VERIFICATION_API_ENDPOINT, PAN_VERIFICATION_API_KEY } = PAN_CONFIG;

interface PanRequest {
  pan: {
    id_number: string;
    // Add other properties as needed
  };
}

interface PanResponse {
  panNumber: string;
  name: string;
  dob: string;
  // Add other fields as per the API documentation
}
const panModel = {
  getPanDetails,
};
export default panModel;

async function getPanDetails(panNumber: string) {
  try {
    //Fetching the Pan Number with help of client
    const { customer_id = '', pancard = '' }: any =
      await getCustomerId(panNumber);
    //Now we are calling the PAN API
    const response: any = await axios.post(
      PAN_VERIFICATION_API_ENDPOINT,
      {
        id_number: panNumber
          .toUpperCase(),
      },
      {
        headers: {
          Authorization: `Bearer ${PAN_VERIFICATION_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.status === 422 || response.data.message === 'Invalid PAN') {
      throw {
        status: 422,
        message: 'Invalid PAN number',
      };
    }

    if (response.data.status_code === 200) {
      //Fetching the customer id with help of client id
      const custId = await getCustomerId(panNumber);
      let dbRes = async ({
        customer_id,
        data,
      }: {
        customer_id: string;
        data: {};
      }) => {
        const createdPan = await prisma.pan_kyc.create({
          data: {
            pan_id: uuid(),
            customer_id,
            data,
          },
        });
        return createdPan;
      };
      //Storing the Pan data
      await dbRes({
        customer_id,
        data: response.data.data,
      });
    }
    return response.data;
  } catch (error) {
    response.status(500).json({ message: 'Error fetching PAN details' });
  }
}

const getCustomerId = async (pancard: string) => {
  const customer = await prisma.customers.findFirst({
    where: {
      pancard: pancard,
    },
  });

  return customer;
};
