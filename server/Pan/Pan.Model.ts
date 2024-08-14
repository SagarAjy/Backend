import { PrismaClient } from '@prisma/client';
import {customerModel} from '../customer/customer.model'
import axios from 'axios';
import AxiosError from 'axios';
import PAN_CONFIG from './Pan.Config';
import { response } from 'express';
import { v4 as uuid } from 'uuid';
import { string } from 'yup';

const prisma = new PrismaClient();
const {PAN_VERIFICATION_API_ENDPOINT, PAN_VERIFICATION_API_KEY}=PAN_CONFIG


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
const PanModel={
    getPanDetails
}
export default PanModel



async function getPanDetails(clientId:string) {
  try {
    //Fetching the Pan Number with help of client
     //@ts-ignore
    const { customer_id = '', pancard = '' } = await getCustomerId(clientId);
    const response = await axios.post(PAN_VERIFICATION_API_ENDPOINT, {
      id_number: pancard.toUpperCase()}, {
      headers: {
        Authorization: `Bearer ${PAN_VERIFICATION_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 422 || response.data.message === 'Invalid PAN') {
      throw {
        status: 422,
        message: 'Invalid PAN number',
      };
    }
    
    if (response.data.status_code === 200) {
      //Fetching the customer id with help of client id 
      const custId = await getCustomerId(clientId);
      let dbRes = async ({
        customer_id,
        data
      }: { 
        customer_id: string,
        data:{},
      }) => {
        const createdPan = await prisma.pan_kyc.create({
          data: {
            pan_id:uuid(),
            customer_id,
            data
           
          },
        });
        return createdPan
      }
      //Storing the Pan data
      await dbRes({
        customer_id,
        data: response.data.data
      })
      
    }
    return response.data;
  } catch (error) {
    response.status(500).json({ message: 'Error fetching PAN details' });
  }
}

const getCustomerId = async (d:string) => {
  const customer = await prisma.customers.findFirst({ where: {
    client_id:d,
  },
  }
  )

  return customer
}