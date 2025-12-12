import { Request, Response } from 'express';
import { NIGERIAN_BANKS, searchBanks } from '../utils/banks.util';
import paystackService from '../services/paystack.service';

/**
 * Get list of all supported Nigerian banks
 */
export const getBanks = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let banks = NIGERIAN_BANKS;
    
    if (search && typeof search === 'string') {
      banks = searchBanks(search);
    }
    
    res.json({
      success: true,
      banks,
      total: banks.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch banks', details: error.message });
  }
};

/**
 * Verify bank account number
 */
export const verifyAccountNumber = async (req: Request, res: Response) => {
  try {
    const { accountNumber, bankCode } = req.body;
    
    if (!accountNumber || !bankCode) {
      return res.status(400).json({ error: 'Account number and bank code are required' });
    }
    
    // Validate account number format
    if (!/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({ error: 'Account number must be 10 digits' });
    }
    
    // Verify with Paystack
    const result = await paystackService.resolveAccountNumber(accountNumber, bankCode);
    
    if (result.success) {
      res.json({
        success: true,
        accountName: result.accountName,
        accountNumber: result.accountNumber,
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'Account verification failed',
        details: result.error,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify account', details: error.message });
  }
};
