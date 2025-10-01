// سرویس ارسال پیامک
// SMS Service for Drug Registration Notifications

class SMSService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_SMS_API_URL;
    this.apiKey = import.meta.env.VITE_SMS_API_KEY;
    this.username = import.meta.env.VITE_SMS_USERNAME;
    this.password = import.meta.env.VITE_SMS_PASSWORD;
    this.senderNumber = import.meta.env.VITE_SMS_SENDER_NUMBER;
    this.adminPhone = import.meta.env.VITE_ADMIN_PHONE_NUMBER;
  }

  // ارسال پیامک کلی
  async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          to: phoneNumber,
          from: this.senderNumber,
          text: message,
          isflash: false
        })
      });

      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        console.log('پیامک با موفقیت ارسال شد:', result);
        return { success: true, data: result };
      } else {
        console.error('خطا در ارسال پیامک:', result);
        return { success: false, error: result.message || 'خطا در ارسال پیامک' };
      }
    } catch (error) {
      console.error('خطا در اتصال به سرویس پیامک:', error);
      return { success: false, error: 'خطا در اتصال به سرویس پیامک' };
    }
  }

  // ارسال پیامک برای ثبت دارو جدید
  async sendDrugRegistrationSMS(drugData) {
    const message = this.createDrugRegistrationMessage(drugData);
    return await this.sendSMS(this.adminPhone, message);
  }

  // ایجاد متن پیامک برای ثبت دارو
  createDrugRegistrationMessage(drugData) {
    const currentDate = new Date().toLocaleDateString('fa-IR');
    const currentTime = new Date().toLocaleTimeString('fa-IR');
    
    return `
🏥 سیستم مدیریت انبار داروخانه
📅 تاریخ: ${currentDate} - ساعت: ${currentTime}

💊 دارو جدید ثبت شد:
نام دارو: ${drugData.name}
نام ژنریک: ${drugData.generic_name || 'نامشخص'}
شکل: ${drugData.form || 'نامشخص'}
دوز: ${drugData.dosage || 'نامشخص'}
شرکت تولیدکننده: ${drugData.manufacturer || 'نامشخص'}

✅ ثبت موفق در سیستم
    `.trim();
  }

  // ارسال پیامک برای کمبود موجودی
  async sendLowStockAlert(drugName, currentStock, warehouseName) {
    const message = `
🚨 هشدار کمبود موجودی!
💊 دارو: ${drugName}
📦 موجودی فعلی: ${currentStock}
🏪 انبار: ${warehouseName}
⏰ ${new Date().toLocaleString('fa-IR')}
    `.trim();

    return await this.sendSMS(this.adminPhone, message);
  }

  // ارسال پیامک برای داروهای منقضی‌شده
  async sendExpiryAlert(drugName, expiryDate, warehouseName) {
    const message = `
⚠️ هشدار انقضای دارو!
💊 دارو: ${drugName}
📅 تاریخ انقضا: ${expiryDate}
🏪 انبار: ${warehouseName}
⏰ ${new Date().toLocaleString('fa-IR')}
    `.trim();

    return await this.sendSMS(this.adminPhone, message);
  }

  // ارسال پیامک برای انتقال بین انبارها
  async sendTransferNotification(transferData) {
    const message = `
🔄 انتقال انجام شد
💊 دارو: ${transferData.drugName}
📦 تعداد: ${transferData.quantity}
🏪 از: ${transferData.fromWarehouse}
🏪 به: ${transferData.toWarehouse}
⏰ ${new Date().toLocaleString('fa-IR')}
    `.trim();

    return await this.sendSMS(this.adminPhone, message);
  }

  // تست اتصال به سرویس پیامک
  async testConnection() {
    try {
      const testMessage = 'تست اتصال سیستم مدیریت انبار داروخانه - ' + new Date().toLocaleString('fa-IR');
      return await this.sendSMS(this.adminPhone, testMessage);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// نمونه‌ای از پیکربندی‌های مختلف پنل‌های پیامک ایرانی

// 1. برای Kavenegar
export class KavenegarSMS extends SMSService {
  async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch(`https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          receptor: phoneNumber,
          sender: this.senderNumber,
          message: message
        })
      });

      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 2. برای Ghasedak
export class GhasedakSMS extends SMSService {
  async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch('https://api.ghasedak.me/v2/sms/send/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': this.apiKey
        },
        body: new URLSearchParams({
          receptor: phoneNumber,
          linenumber: this.senderNumber,
          message: message
        })
      });

      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 3. برای Melipayamak
export class MelipayamakSMS extends SMSService {
  async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          to: phoneNumber,
          from: this.senderNumber,
          text: message,
          isflash: false
        })
      });

      const result = await response.json();
      return { success: result.RetStatus === 1, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 4. برای رهیاب پیام گستران ایران (RahyabSMS)
export class RahyabSMS extends SMSService {
  async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch('https://api.rahyab-sms.ir/rest/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: this.senderNumber,
          to: [phoneNumber],
          text: message,
          flash: false
        })
      });

      const result = await response.json();
      return { 
        success: result.status === 'success' || result.code === 200, 
        data: result 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 5. برای رهیاب پیام گستران ایران (روش Username/Password)
export class RahyabUserPassSMS extends SMSService {
  async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch('https://panel.rahyab-sms.ir/webservice/v1rest/sendsms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          to: phoneNumber,
          from: this.senderNumber,
          text: message,
          flash: false
        })
      });

      const result = await response.json();
      return { 
        success: result.status === 1 || result.success === true, 
        data: result 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// اکسپورت سرویس پیش‌فرض
export default SMSService;