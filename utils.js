"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicketID = exports.formatDate = exports.getDueDate = exports.getCurrentRepayAmount = exports.decrypt = exports.encrypt = exports.processInBatch = exports.convertToIndianWords = exports.formatIndianNumber = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const date_fns_1 = require("date-fns");
// encryption of data
const secretKey = Buffer.from(process.env.AES_SECRET_KEY || '', 'hex');
// * function to generate random otp
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};
exports.generateOTP = generateOTP;
const formatIndianNumber = (number) => {
    // Convert the number to a string for easier manipulation
    const numStr = number.toFixed(1).toString();
    // Split the number into integer and decimal parts
    const [integerPart, decimalPart] = numStr.split('.');
    // Format the integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Combine the formatted integer and decimal parts
    const formattedNumber = decimalPart
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;
    return '₹' + formattedNumber + '/-';
};
exports.formatIndianNumber = formatIndianNumber;
const convertToIndianWords = (number) => {
    const units = [
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
    const teens = [
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
    const tens = [
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
    const convertChunk = (num) => {
        let words = '';
        if (num >= 100) {
            words += units[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num >= 11 && num <= 19) {
            words += teens[num - 10] + ' ';
        }
        else if (num === 10 || num >= 20) {
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
exports.convertToIndianWords = convertToIndianWords;
const processInBatch = (items, processFunc, BATCH_SIZE) => __awaiter(void 0, void 0, void 0, function* () {
    let results = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const batchResults = yield Promise.all(batch.map(processFunc));
        results = results.concat(batchResults);
    }
    return results;
});
exports.processInBatch = processInBatch;
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: tag.toString('hex'),
    };
};
exports.encrypt = encrypt;
const decrypt = (hash) => {
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', secretKey, Buffer.from(hash.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));
    let decrypted = decipher.update(hash.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decrypt = decrypt;
const getCurrentRepayAmount = ({ principal, tenure, roi, penaltyRoi, amtApproved, disbursalDate, repaymentDate, currentDate, collections, }) => {
    let currentRepayAmount = 0;
    let newPrincipal = amtApproved;
    let prevInterestDate = disbursalDate; // start from the disbursal date
    let repayDate = repaymentDate;
    //total values
    let totalInterest = 0;
    let penaltyInterest = 0;
    let penaltyDays = 0;
    if (collections.length === 0) {
        // if today date less than equal to repay date then no penalty etc
        if (currentDate <= repayDate) {
            const tempTenure = (0, date_fns_1.differenceInCalendarDays)(new Date(), prevInterestDate);
            totalInterest = principal * roi * tempTenure * 0.01;
        }
        // if today date greater than repay date then normal interest till repay date then penalty interest
        // till today date
        else if (currentDate > repayDate) {
            const tempTenure = (0, date_fns_1.differenceInCalendarDays)(repayDate, prevInterestDate);
            totalInterest = principal * roi * tempTenure * 0.01;
            penaltyDays = (0, date_fns_1.differenceInCalendarDays)(currentDate, repayDate);
            penaltyInterest = principal * penaltyRoi * penaltyDays * 0.01;
        }
        currentRepayAmount = principal + totalInterest + penaltyInterest;
    }
    else if (collections.length > 0) {
        // today date less than or equal to repay date then
        // we map all collections and calculate interest till collection date
        // then add this interest to total interest and subtract collected amount from principal + interest
        // check if first collection date is before repay date
        const firstCollection = collections[collections.length - 1];
        // format date to dd-MM-yyyy then back to collected date to fix timezone issue
        const firstCollectionDate = firstCollection.collected_date;
        // if first collection date is after repay date then everything before
        // is just total interest over the tenure
        if (firstCollectionDate > repayDate) {
            totalInterest = newPrincipal * roi * tenure * 0.01;
            prevInterestDate = repayDate;
            for (let i = collections.length - 1; i >= 0; i--) {
                const collection = collections[i];
                const collectionDate = collection.collected_date;
                //no. of days till this collection made
                let penaltyDaysTillCollection = (0, date_fns_1.differenceInCalendarDays)(collectionDate, prevInterestDate);
                //calculate penalty interest till this collection made
                let penaltyInterestTillCollection = newPrincipal * penaltyRoi * penaltyDaysTillCollection * 0.01;
                let amountToDistribute = collection.collected_amount;
                // First, reduce penalty interest
                if (amountToDistribute > penaltyInterestTillCollection) {
                    amountToDistribute -= penaltyInterestTillCollection;
                    penaltyInterestTillCollection = 0;
                }
                else {
                    penaltyInterestTillCollection -= amountToDistribute;
                    amountToDistribute = 0;
                }
                // Next, reduce regular interest
                if (amountToDistribute > totalInterest) {
                    amountToDistribute -= totalInterest;
                    totalInterest = 0;
                }
                else {
                    totalInterest -= amountToDistribute;
                    amountToDistribute = 0;
                }
                // Finally, reduce principal with any remaining amount
                newPrincipal -= amountToDistribute;
                penaltyDays = penaltyDays + penaltyDaysTillCollection;
                penaltyInterest = penaltyInterest + penaltyInterestTillCollection;
                prevInterestDate = collectionDate;
            }
        }
        else if (firstCollectionDate <= repayDate) {
            for (let i = collections.length - 1; i >= 0; i--) {
                const collection = collections[i];
                const collectionDate = collection.collected_date;
                let penaltyDaysTillCollection = 0;
                let penaltyInterestTillCollection = 0;
                // if collection date is before repay date then calculate interest
                if (collectionDate <= repayDate) {
                    let daysTillCollection = (0, date_fns_1.differenceInCalendarDays)(collectionDate, prevInterestDate);
                    // calculate interest for this tenure
                    let interestTillCollection = newPrincipal * roi * daysTillCollection * 0.01;
                    // subtract this interest from collection amount
                    let amountToDistribute = collection.collected_amount;
                    if (amountToDistribute > interestTillCollection) {
                        amountToDistribute -= interestTillCollection;
                        interestTillCollection = 0;
                    }
                    else {
                        interestTillCollection -= amountToDistribute;
                        amountToDistribute = 0;
                    }
                    // subtract remaining collection amount from principal
                    newPrincipal -= amountToDistribute;
                    totalInterest = totalInterest + interestTillCollection;
                }
                // if collection date is after repay date then calculate penalty interest
                if (collectionDate > repayDate) {
                    penaltyDaysTillCollection = (0, date_fns_1.differenceInCalendarDays)(collectionDate, prevInterestDate);
                    penaltyInterestTillCollection =
                        newPrincipal * penaltyRoi * penaltyDaysTillCollection * 0.01;
                    let amountToDistribute = collection.collected_amount;
                    // First, reduce penalty interest
                    if (amountToDistribute > penaltyInterestTillCollection) {
                        amountToDistribute -= penaltyInterestTillCollection;
                        penaltyInterestTillCollection = 0;
                    }
                    else {
                        penaltyInterestTillCollection -= amountToDistribute;
                        amountToDistribute = 0;
                    }
                    // Next, reduce regular interest
                    if (amountToDistribute > totalInterest) {
                        amountToDistribute -= totalInterest;
                        totalInterest = 0;
                    }
                    else {
                        totalInterest -= amountToDistribute;
                        amountToDistribute = 0;
                    }
                    // Finally, reduce principal with any remaining amount
                    newPrincipal -= amountToDistribute;
                    penaltyDays = penaltyDays + penaltyDaysTillCollection;
                    penaltyInterest = penaltyInterest + penaltyInterestTillCollection;
                    prevInterestDate = collectionDate;
                }
            }
            if (prevInterestDate < repayDate) {
                let daysTillRepay = (0, date_fns_1.differenceInCalendarDays)(repayDate, prevInterestDate);
                let interestTillRepay = newPrincipal * roi * daysTillRepay * 0.01;
                totalInterest = totalInterest + interestTillRepay;
                prevInterestDate = repayDate;
            }
            if (currentDate > repayDate) {
                penaltyDays = (0, date_fns_1.differenceInCalendarDays)(currentDate, repayDate);
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
exports.getCurrentRepayAmount = getCurrentRepayAmount;
const getDueDate = (startDate, tenure) => {
    if (!startDate)
        return null;
    const parsedDate = typeof startDate === 'string' ? (0, date_fns_1.parse)(startDate, 'dd-MM-yyyy', new Date()) : startDate;
    return new Date(parsedDate.getTime() + tenure * 24 * 60 * 60 * 1000);
};
exports.getDueDate = getDueDate;
const formatDate = (date) => {
    const parsedDate = typeof date === 'string' ? (0, date_fns_1.parse)(date, 'yyyy-MM-dd', new Date()) : date;
    return (0, date_fns_1.format)(parsedDate, 'dd-MM-yyyy');
};
exports.formatDate = formatDate;
const generateTicketID = (randnum) => {
    return "";
};
exports.generateTicketID = generateTicketID;
//# sourceMappingURL=utils.js.map