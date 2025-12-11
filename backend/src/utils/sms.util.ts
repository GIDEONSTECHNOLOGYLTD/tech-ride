import twilio from 'twilio';

let twilioClient: any = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    // Always log in development, even without Twilio credentials
    console.log(`📱 [SMS] To: ${to}, Message: ${message}`);
    
    if (process.env.NODE_ENV === 'development' || !process.env.TWILIO_ACCOUNT_SID) {
      return true;
    }

    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️  Twilio not configured - SMS not sent');
      return false;
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
