import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import AxiosError from 'axios';
import PAN_CONFIG from './Pan.Config';
import { response } from 'express';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();
const {PAN_VERFICATION_API_ENDPOINT,PAN_VERFICATION_API_KEY}=PAN_CONFIG


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



async function getPanDetails(pan: string) {
  try {
    const response = await axios.post(PAN_VERFICATION_API_ENDPOINT, pan, {
      headers: {
        Authorization: `Bearer ${PAN_VERFICATION_API_KEY}`,
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

      const dbRes = async ({
        pan_id,
        customer_id,
        data
      }: {
        pan_id: string,
        customer_id: string,
        data:{},
      }) => {
        const createdPan = await prisma.pan_kyc.create({
          data: {
            pan_id: "b23880g6-f6c1-4034-a059-ca594a8e7d1b" || uuid(),
            customer_id: "b23880f6-f6c1-4034-a059-ca594a8e7d1b",
            data: response.data.data,
          },
        });
      }
      
      
    }
    return response.data;
  } catch (error) {
    response.status(500).json({ message: 'Error fetching PAN details' });
  }
}




