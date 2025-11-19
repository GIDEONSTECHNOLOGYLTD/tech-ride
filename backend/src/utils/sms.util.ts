import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SMS] To: ${to}, Message: ${message}`);
      return true;
    }

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
}
