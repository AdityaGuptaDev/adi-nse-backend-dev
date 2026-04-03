const login = {
  post: {
    tags: ["Auth"],
    description: "User Login",
    operationId: "userlogin",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: {
                type: "string",
                required: true,
                example: "test@gmail.com",
              },
              password: {
                type: "string",
                // required: true,
                example: "12345678",
              },
              loginOTP: {
                type: "number",
                // required: true,
                example: 123456,
              },
              fcmToken: {
                type: "string",
                required: true,
                example: "abcDYYYhh",
              },
              deviceId: {
                type: "string",
                required: true,
                example: "12dfGTKK9"
              },
            },
          }
        }
      }
    },
    responses: {
      200: {
        description: "Login success",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                    user: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                        },
                        email: {
                          type: "string",
                        },
                        fcmToken: {
                          type: "string",
                        },
                        deviceId: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
                msg: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      401: {
        description: "Unauthorized, Invalid email",
      },
      400: {
        description: "Otp not verified",
      },
    },
  }
}

export default login;