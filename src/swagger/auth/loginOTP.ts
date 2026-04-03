const loginOTP = {
    post: {
        tags: ["Auth"],
        description: "Verify OTP during login",
        operationId: "verifyLoginOTP",
        requestBody: {
            "content": {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            // required: ["email"],
                            email: {
                                type: "string",
                                example: "user.test@yopmail.com",
                            },
                            // loginOTP: {
                            //     type: "string",
                            //     example: "123456",
                            // },
                        },
                    }
                }
            }
        },
        responses: {
            200: {
                description: "OTP sent successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                data: {
                                    type: "object",
                                    properties: {
                                        email: { type: "string" },
                                    },
                                },
                                msg: {
                                    type: "string",
                                    example: "Your OTP sent successfully!!",
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
                description: "Invalid email",
            },
            500: {
                description: "Internal Server Error",
            },
        },
    },
};

export default loginOTP;
