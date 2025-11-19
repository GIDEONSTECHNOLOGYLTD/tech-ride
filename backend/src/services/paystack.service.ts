import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

class PaystackService {
  private headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  // Initialize transaction
  async initializeTransaction(email: string, amount: number, reference: string, metadata?: any) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo (₦1 = 100 kobo)
          reference,
          currency: 'NGN',
          metadata,
          channels: ['card', 'bank', 'ussd', 'mobile_money'], // Multiple payment options
        },
        { headers: this.headers }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initialization failed',
      };
    }
  }

  // Verify transaction
  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        { headers: this.headers }
      );

      return {
        success: response.data.data.status === 'success',
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment verification failed',
      };
    }
  }

  // Create transfer recipient (for driver payouts)
  async createTransferRecipient(accountNumber: string, bankCode: string, accountName: string) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transferrecipient`,
        {
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        },
        { headers: this.headers }
      );

      return {
        success: true,
        recipientCode: response.data.data.recipient_code,
      };
    } catch (error: any) {
      console.error('Paystack recipient creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Recipient creation failed',
      };
    }
  }

  // Initiate transfer (for driver payouts)
  async initiateTransfer(recipientCode: string, amount: number, reference: string, reason?: string) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transfer`,
        {
          source: 'balance',
          reason: reason || 'Driver payout',
          amount: amount * 100, // Convert to kobo
          reference,
          recipient: recipientCode,
        },
        { headers: this.headers }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack transfer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Transfer failed',
      };
    }
  }

  // Get list of Nigerian banks
  async getBanks() {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/bank?currency=NGN`,
        { headers: this.headers }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch banks',
      };
    }
  }

  // Resolve account number
  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        { headers: this.headers }
      );

      return {
        success: true,
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number,
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to resolve account',
      };
    }
  }
}

export default new PaystackService();
