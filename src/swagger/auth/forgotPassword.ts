const forgotPassword = {
    post: {
        tags: ["Auth"],
        description: "User ForgotPassword",
        operationId: "userForgotPassword",
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
                },
                }
              }
            }
          },
          responses: {
            200: {
              description: "Send Password successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
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
              description: "Request body could not be read properly.",
            },
          },
    }
}

export default forgotPassword;