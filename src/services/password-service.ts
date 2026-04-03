import bcrypt from "bcryptjs";

//hash password
export const hashPassword = (value: string) => {
  let salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(value, salt);
};

//check password
export const checkPassword = (pass: string, hash: string) => {
  return bcrypt.compareSync(pass, hash);
};

//generate password
export const generateRandomPassword = (): string => {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};


//generate OTP
export const generateRandomOTP = (): string => {
  var length = 6,
    charset = "1234567890",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export function generateRandomNumber() {
  return Math.floor(Math.random() * 1000000);
}
