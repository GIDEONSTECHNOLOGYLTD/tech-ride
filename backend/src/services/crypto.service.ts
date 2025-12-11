import { ethers } from 'ethers';
import axios from 'axios';

class CryptoService {
  // Check USDT (TRC20) transaction on Tron network
  async verifyTronTransaction(txHash: string, expectedAmount: number, toAddress: string) {
    try {
      // Using TronGrid API
      const response = await axios.get(
        `https://api.trongrid.io/v1/transactions/${txHash}`
      );

      const tx = response.data;
      if (!tx.ret || tx.ret[0].contractRet !== 'SUCCESS') {
        return { success: false, error: 'Transaction failed' };
      }

      // Verify recipient and amount
      // Note: You'll need to decode the contract data properly
      return {
        success: true,
        amount: expectedAmount, // Should decode from tx data
        confirmed: true,
      };
    } catch (error) {
      console.error('Tron verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Check ETH/USDT (ERC20) transaction
  async verifyEthTransaction(txHash: string, expectedAmount: number, toAddress: string) {
    try {
      // Using Etherscan API or direct provider
      const provider = new ethers.JsonRpcProvider(
        process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY'
      );

      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return { success: false, error: 'Transaction not found' };
      }

      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status !== 1) {
        return { success: false, error: 'Transaction failed' };
      }

      return {
        success: true,
        amount: ethers.formatEther(tx.value),
        confirmed: true, // Simplified for development
        confirmations: 1,
      };
    } catch (error) {
      console.error('ETH verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Check BTC transaction
  async verifyBtcTransaction(txHash: string, expectedAmount: number, toAddress: string) {
    try {
      // Using Blockchain.info API
      const response = await axios.get(
        `https://blockchain.info/rawtx/${txHash}`
      );

      const tx = response.data;
      
      // Find the output to our address
      const output = tx.out.find((out: any) => out.addr === toAddress);
      if (!output) {
        return { success: false, error: 'Address not found in outputs' };
      }

      const amountBTC = output.value / 100000000; // Satoshi to BTC
      
      return {
        success: true,
        amount: amountBTC,
        confirmed: tx.confirmations >= 3,
        confirmations: tx.confirmations,
      };
    } catch (error) {
      console.error('BTC verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Get current crypto prices in NGN
  async getCryptoPrices() {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin,ethereum,tether',
            vs_currencies: 'ngn',
          },
        }
      );

      return {
        success: true,
        prices: {
          BTC: response.data.bitcoin.ngn,
          ETH: response.data.ethereum.ngn,
          USDT: response.data.tether.ngn,
        },
      };
    } catch (error) {
      console.error('Price fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch crypto prices',
      };
    }
  }

  // Convert NGN to crypto amount
  convertNgnToCrypto(ngnAmount: number, cryptoPrice: number): number {
    return ngnAmount / cryptoPrice;
  }

  // Convert crypto to NGN
  convertCryptoToNgn(cryptoAmount: number, cryptoPrice: number): number {
    return cryptoAmount * cryptoPrice;
  }

  // Generate payment QR code data
  generatePaymentAddress(crypto: 'BTC' | 'ETH' | 'USDT', address: string, amount: number) {
    // Returns format for QR code generation
    switch (crypto) {
      case 'BTC':
        return `bitcoin:${address}?amount=${amount}`;
      case 'ETH':
        return `ethereum:${address}?value=${amount}`;
      case 'USDT':
        return `ethereum:${address}?value=${amount}&token=USDT`;
      default:
        return address;
    }
  }
}

export default new CryptoService();
