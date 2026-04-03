import login from "./login";
import forgotPassword from "./forgotPassword";
import changePassword from "./changePassword";
import registerUser from "./registerUser";
import registerOTP from "./registerOTP";
import loginOTP from "./loginOTP";
import resendOTP from "./resendOTP"


const auth = {
    paths: {
        '/user/register-user': {
            ...registerUser
        },
        '/user/register-otp/:id': {
            ...registerOTP
        },
        '/user/login-otp': {
            ...loginOTP
        },
        '/app-api/app-login': {
            ...login
        },
        "/user/resend-otp": {
            ...resendOTP
        },
        '/user/forgotPassword': {
            ...forgotPassword
        },
        '/user/changePassword': {
            ...changePassword
        }
    }
}

export default auth;