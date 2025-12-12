/**
 * Nigerian Bank Codes for Paystack Transfers
 * Complete list of Nigerian banks and their codes
 */

export interface Bank {
  name: string;
  code: string;
  slug: string;
}

export const NIGERIAN_BANKS: Bank[] = [
  { name: 'Access Bank', code: '044', slug: 'access-bank' },
  { name: 'Citibank Nigeria', code: '023', slug: 'citibank' },
  { name: 'Ecobank Nigeria', code: '050', slug: 'ecobank' },
  { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank' },
  { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank' },
  { name: 'First City Monument Bank (FCMB)', code: '214', slug: 'fcmb' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', slug: 'gtbank' },
  { name: 'Heritage Bank', code: '030', slug: 'heritage-bank' },
  { name: 'Keystone Bank', code: '082', slug: 'keystone-bank' },
  { name: 'Polaris Bank', code: '076', slug: 'polaris-bank' },
  { name: 'Providus Bank', code: '101', slug: 'providus-bank' },
  { name: 'Stanbic IBTC Bank', code: '221', slug: 'stanbic-ibtc' },
  { name: 'Standard Chartered Bank', code: '068', slug: 'standard-chartered' },
  { name: 'Sterling Bank', code: '232', slug: 'sterling-bank' },
  { name: 'Union Bank of Nigeria', code: '032', slug: 'union-bank' },
  { name: 'United Bank for Africa (UBA)', code: '033', slug: 'uba' },
  { name: 'Unity Bank', code: '215', slug: 'unity-bank' },
  { name: 'Wema Bank', code: '035', slug: 'wema-bank' },
  { name: 'Zenith Bank', code: '057', slug: 'zenith-bank' },
  { name: 'Jaiz Bank', code: '301', slug: 'jaiz-bank' },
  { name: 'Suntrust Bank', code: '100', slug: 'suntrust-bank' },
  { name: 'Globus Bank', code: '00103', slug: 'globus-bank' },
  { name: 'Parallex Bank', code: '526', slug: 'parallex-bank' },
  { name: 'Kuda Bank', code: '50211', slug: 'kuda-bank' },
  { name: 'Opay', code: '999992', slug: 'opay' },
  { name: 'PalmPay', code: '999991', slug: 'palmpay' },
  { name: 'Moniepoint (Moniepoint MFB)', code: '50515', slug: 'moniepoint' },
];

/**
 * Get bank code by bank name
 */
export function getBankCode(bankName: string): string | null {
  const bank = NIGERIAN_BANKS.find(
    b => b.name.toLowerCase() === bankName.toLowerCase() || 
         b.slug === bankName.toLowerCase().replace(/\s+/g, '-')
  );
  return bank ? bank.code : null;
}

/**
 * Get bank name by code
 */
export function getBankName(code: string): string | null {
  const bank = NIGERIAN_BANKS.find(b => b.code === code);
  return bank ? bank.name : null;
}

/**
 * Search banks by name (for autocomplete)
 */
export function searchBanks(query: string): Bank[] {
  if (!query || query.length < 2) return NIGERIAN_BANKS;
  
  const lowerQuery = query.toLowerCase();
  return NIGERIAN_BANKS.filter(
    bank => bank.name.toLowerCase().includes(lowerQuery) || 
            bank.slug.includes(lowerQuery)
  );
}

/**
 * Validate Nigerian account number
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  // Nigerian account numbers are typically 10 digits
  return /^\d{10}$/.test(accountNumber);
}
