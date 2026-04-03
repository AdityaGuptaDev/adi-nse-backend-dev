// import {OtpLog} from "../../routes/partner/otplog.model";

import { OtpLog } from "../routes/partner/otplog.model";

interface SaveOtpLogInput {
  userId: number;
  mobile: string;
  email?: string;
  otp: string;
  purpose: string;
  expiresInMinutes: number;
}

interface ValidateOtpLogInput {
  userId: number;
  mobile: string;
  otp: string;
  purpose: string;
}

export async function saveOtpLog({
  userId,
  mobile,
  email,
  otp,
  purpose,
  expiresInMinutes,
}: SaveOtpLogInput) {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const otpLog = await OtpLog.create({
    userId,
    mobile,
    email: email || null,
    otp,
    purpose,
    expiresAt,
    verifiedAt: null,
    attempts: 0,
    isUsed: 0,
    status: 1, // 1 = active
  });

  return otpLog;
}




export async function validateOtpLog({
  userId,
  mobile,
  otp,
  purpose,
}: ValidateOtpLogInput) {
  const otpLog = await OtpLog.findOne({
    where: {
      userId,
      mobile,
      otp,
      purpose,
      isUsed: 0,
      status: 1,
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otpLog) {
    throw new Error('Invalid or expired OTP');
  }

  const now = new Date();
  if (now > otpLog.expiresAt) {
    otpLog.status = 0;
    await otpLog.save();
    throw new Error('OTP has expired');
  }

  otpLog.isUsed = 1;
  otpLog.status = 2; // 2 = verified
  otpLog.verifiedAt = now;
  await otpLog.save();

  return true;
}
