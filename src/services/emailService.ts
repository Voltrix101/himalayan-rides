// Email service for OTP and password reset functionality
// This is a mock implementation - replace with actual email service in production

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface OTPEmailData {
  email: string;
  otp: string;
  userName?: string;
  expiryMinutes?: number;
}

class EmailService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // These would come from environment variables in production
    this.apiKey = process.env.REACT_APP_EMAIL_API_KEY || 'demo-api-key';
    this.baseUrl = process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://api.emailservice.com';
  }

  // Generate OTP email template
  private generateOTPTemplate(data: OTPEmailData): EmailTemplate {
    const { otp, userName = 'User', expiryMinutes = 10 } = data;
    
    const subject = 'Password Reset OTP - Himalayan Rides';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏔️ Himalayan Rides</div>
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your Himalayan Rides account.</p>
            
            <div class="otp-box">
              <p>Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p><small>This code expires in ${expiryMinutes} minutes</small></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for this code over phone or email</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
            
            <p>If the code doesn't work, you can request a new one from the password reset page.</p>
            
            <p>Safe travels,<br>The Himalayan Rides Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${data.email}</p>
            <p>© 2025 Himalayan Rides. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Himalayan Rides - Password Reset OTP

      Hello ${userName}!

      We received a request to reset your password for your Himalayan Rides account.

      Your verification code is: ${otp}
      
      This code expires in ${expiryMinutes} minutes.

      Security Notice:
      - Never share this code with anyone
      - Our team will never ask for this code over phone or email
      - If you didn't request this reset, please ignore this email

      Safe travels,
      The Himalayan Rides Team

      This email was sent to ${data.email}
      © 2025 Himalayan Rides. All rights reserved.
    `;

    return { subject, htmlContent, textContent };
  }

  // Send OTP email
  async sendOTPEmail(data: OTPEmailData): Promise<boolean> {
    try {
      const template = this.generateOTPTemplate(data);
      
      // In production, replace this with actual email service API call
      // Example: SendGrid, AWS SES, Mailgun, etc.
      
      if (process.env.NODE_ENV === 'development') {
        // Development mode - log to console
        console.log('=== EMAIL SERVICE DEBUG ===');
        console.log('To:', data.email);
        console.log('Subject:', template.subject);
        console.log('OTP:', data.otp);
        console.log('HTML Preview:', template.htmlContent.substring(0, 200) + '...');
        console.log('=========================');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }

      // Production email sending
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          to: data.email,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent
        })
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Generate a secure 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Send welcome email (bonus feature)
  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    try {
      const subject = 'Welcome to Himalayan Rides! 🏔️';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { background: #f8f9fa; padding: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏔️ Welcome to Himalayan Rides!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Welcome to the ultimate Himalayan adventure community! 🚗✨</p>
              <p>Get ready to explore breathtaking destinations like Pangong Lake, Nubra Valley, and Khardung La Pass.</p>
              <p>Your journey to the roof of the world starts here!</p>
              <p>Safe travels,<br>The Himalayan Rides Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Welcome email sent to ${userName} (${email})`);
        console.log('Subject:', subject);
        console.log('HTML:', htmlContent.substring(0, 100) + '...');
        return true;
      }

      // Production implementation would go here
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
