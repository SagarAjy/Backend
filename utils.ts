import crypto from 'crypto';
import { differenceInCalendarDays, format, parse } from 'date-fns';

const secretKey = Buffer.from(process.env.AES_SECRET_KEY || '', 'hex');

// Define types for function parameters and return values

interface Collection {
  collected_date: Date;
  collected_amount: number;
}

interface RepaymentParams {
  principal: number;
  tenure: number;
  roi: number;
  penaltyRoi: number;
  amtApproved: number;
  disbursalDate: Date;
  repaymentDate: Date;
  currentDate: Date;
  collections: Collection[];
}

interface RepaymentResult {
  totalInterest: number;
  currentRepayAmount: number;
  penaltyInterest: number;
  penaltyDays: number;
}

interface EncryptionResult {
  iv: string;
  encryptedData: string;
  authTag: string;
}

// Function to generate random OTP
export const generateOTP = (): number => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Format number as Indian currency
export const formatIndianNumber = (number: number): string => {
  const numStr = number.toFixed(1).toString();
  const [integerPart, decimalPart] = numStr.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedNumber = decimalPart
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
  return '₹' + formattedNumber + '/-';
};

// Convert number to Indian words
export const convertToIndianWords = (number: number): string => {
  const units: string[] = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
  ];
  const teens: string[] = [
    '',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens: string[] = [
    '',
    'Ten',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const convertChunk = (num: number): string => {
    let words = '';
    if (num >= 100) {
      words += units[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 11 && num <= 19) {
      words += teens[num - 10] + ' ';
    } else if (num === 10 || num >= 20) {
      words += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num >= 1 && num <= 9) {
      words += units[num] + ' ';
    }
    return words;
  };

  if (number === 0) {
    return 'Zero';
  }

  let words = '';
  if (number >= 1e9) {
    words += convertChunk(Math.floor(number / 1e9)) + 'Billion ';
    number %= 1e9;
  }
  if (number >= 1e7) {
    words += convertChunk(Math.floor(number / 1e7)) + 'Crore ';
    number %= 1e7;
  }
  if (number >= 1e5) {
    words += convertChunk(Math.floor(number / 1e5)) + 'Lakh ';
    number %= 1e5;
  }
  if (number >= 1e3) {
    words += convertChunk(Math.floor(number / 1e3)) + 'Thousand ';
    number %= 1e3;
  }
  words += convertChunk(number);
  return words.trim();
};

// Process items in batches
export const processInBatch = async <T, R>(
  items: T[],
  processFunc: (item: T) => Promise<R>,
  BATCH_SIZE: number,
): Promise<R[]> => {
  let results: R[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(processFunc));
    results = results.concat(batchResults);
  }
  return results;
};

// Encrypt data
export const encrypt = (text: string): EncryptionResult => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: tag.toString('hex'),
  };
};

// Decrypt data
export const decrypt = (hash: EncryptionResult): string => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    secretKey,
    Buffer.from(hash.iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));
  let decrypted = decipher.update(hash.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Get current repay amount
export const getCurrentRepayAmount = ({
  principal,
  tenure,
  roi,
  penaltyRoi,
  amtApproved,
  disbursalDate,
  repaymentDate,
  currentDate,
  collections,
}: RepaymentParams): RepaymentResult => {
  let currentRepayAmount = 0;
  let newPrincipal = amtApproved;
  let prevInterestDate = disbursalDate;
  let repayDate = repaymentDate;
  let totalInterest = 0;
  let penaltyInterest = 0;
  let penaltyDays = 0;

  if (collections.length === 0) {
    if (currentDate <= repayDate) {
      const tempTenure = differenceInCalendarDays(new Date(), prevInterestDate);
      totalInterest = principal * roi * tempTenure * 0.01;
    } else {
      const tempTenure = differenceInCalendarDays(repayDate, prevInterestDate);
      totalInterest = principal * roi * tempTenure * 0.01;
      penaltyDays = differenceInCalendarDays(currentDate, repayDate);
      penaltyInterest = principal * penaltyRoi * penaltyDays * 0.01;
    }
    currentRepayAmount = principal + totalInterest + penaltyInterest;
  } else {
    const firstCollection = collections[collections.length - 1];
    const firstCollectionDate = firstCollection.collected_date;

    if (firstCollectionDate > repayDate) {
      totalInterest = newPrincipal * roi * tenure * 0.01;
      prevInterestDate = repayDate;
      for (let i = collections.length - 1; i >= 0; i--) {
        const collection = collections[i];
        const collectionDate = collection.collected_date;
        let penaltyDaysTillCollection = differenceInCalendarDays(
          collectionDate,
          prevInterestDate,
        );
        let penaltyInterestTillCollection =
          newPrincipal * penaltyRoi * penaltyDaysTillCollection * 0.01;
        let amountToDistribute = collection.collected_amount;

        if (amountToDistribute > penaltyInterestTillCollection) {
          amountToDistribute -= penaltyInterestTillCollection;
          penaltyInterestTillCollection = 0;
        } else {
          penaltyInterestTillCollection -= amountToDistribute;
          amountToDistribute = 0;
        }

        if (amountToDistribute > totalInterest) {
          amountToDistribute -= totalInterest;
          totalInterest = 0;
        } else {
          totalInterest -= amountToDistribute;
          amountToDistribute = 0;
        }

        newPrincipal -= amountToDistribute;
        penaltyDays += penaltyDaysTillCollection;
        penaltyInterest += penaltyInterestTillCollection;
        prevInterestDate = collectionDate;
      }
    } else {
      for (let i = collections.length - 1; i >= 0; i--) {
        const collection = collections[i];
        const collectionDate = collection.collected_date;
        let penaltyDaysTillCollection = 0;
        let penaltyInterestTillCollection = 0;

        if (collectionDate <= repayDate) {
          let daysTillCollection = differenceInCalendarDays(
            collectionDate,
            prevInterestDate,
          );
          let interestTillCollection =
            newPrincipal * roi * daysTillCollection * 0.01;
          let amountToDistribute = collection.collected_amount;

          if (amountToDistribute > interestTillCollection) {
            amountToDistribute -= interestTillCollection;
            interestTillCollection = 0;
          } else {
            interestTillCollection -= amountToDistribute;
            amountToDistribute = 0;
          }

          newPrincipal -= amountToDistribute;
          totalInterest += interestTillCollection;
        }

        if (collectionDate > repayDate) {
          penaltyDaysTillCollection = differenceInCalendarDays(
            collectionDate,
            prevInterestDate,
          );
          penaltyInterestTillCollection =
            newPrincipal * penaltyRoi * penaltyDaysTillCollection * 0.01;
          let amountToDistribute = collection.collected_amount;

          if (amountToDistribute > penaltyInterestTillCollection) {
            amountToDistribute -= penaltyInterestTillCollection;
            penaltyInterestTillCollection = 0;
          } else {
            penaltyInterestTillCollection -= amountToDistribute;
            amountToDistribute = 0;
          }

          if (amountToDistribute > totalInterest) {
            amountToDistribute -= totalInterest;
            totalInterest = 0;
          } else {
            totalInterest -= amountToDistribute;
            amountToDistribute = 0;
          }

          newPrincipal -= amountToDistribute;
          penaltyDays += penaltyDaysTillCollection;
          penaltyInterest += penaltyInterestTillCollection;
          prevInterestDate = collectionDate;
        }
      }

      if (prevInterestDate < repayDate) {
        let daysTillRepay = differenceInCalendarDays(
          repayDate,
          prevInterestDate,
        );
        let interestTillRepay = newPrincipal * roi * daysTillRepay * 0.01;
        totalInterest += interestTillRepay;
        prevInterestDate = repayDate;
      }

      if (currentDate > repayDate) {
        penaltyDays = differenceInCalendarDays(currentDate, repayDate);
        penaltyInterest = newPrincipal * penaltyRoi * penaltyDays * 0.01;
      }
    }

    currentRepayAmount = newPrincipal + totalInterest + penaltyInterest;
  }

  return {
    totalInterest,
    currentRepayAmount,
    penaltyInterest,
    penaltyDays,
  };
};

// Get due date
export const getDueDate = (
  startDate: Date | string,
  tenure: number,
): Date | null => {
  if (!startDate) return null;
  const parsedDate =
    typeof startDate === 'string'
      ? parse(startDate, 'dd-MM-yyyy', new Date())
      : startDate;
  return new Date(parsedDate.getTime() + tenure * 24 * 60 * 60 * 1000);
};

// Format date
export const formatDate = (date: Date | string): string => {
  const parsedDate =
    typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date;
  return format(parsedDate, 'dd-MM-yyyy');
};

// Generate ticket ID (Placeholder function)
export const generateTicketID = (randnum: any): string => {
  return '';
};
