const resendOTP = {
    post: {
        tags: ["Auth"],
        description: "Verify both Email and Mobile OTP during registration",
        operationId: "verifyResendOTP",
        requestBody: {
            "content": {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            email: {
                                type: "string",
                                example: "user.test@yopmail.com",
                            },
                            isRegister: {
                                type: "boolean",
                                example: true,
                            },
                        },
                    }
                }
            }
        },
        responses: {
            200: {
                description: "OTP verified successfully",
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
                                    example: "Your OTP is verified successfully!!",
                                },
                            },
                        },
                    },
                },
            },
            401: {
                description: "Unauthorized, Invalid email or mobile",
            },
            400: {
                description: "Invalid email or mobile OTP",
            },
            500: {
                description: "Internal Server Error",
            },
        },
    },
};

export default resendOTP;
