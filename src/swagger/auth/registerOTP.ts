const registerOTP = {
    put: {
        tags: ["Auth"],
        description: "Verify both Email and Mobile OTP during registration",
        operationId: "verifyRegisterOTP",
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                type: "number",
                schema: {
                    type: "string",
                },
                description: "User ID to update after OTP verification",
            },
        ],
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
                            mobile: {
                                type: "number",
                                example: 9874563210,
                            },
                            emailOTP: {
                                type: "number",
                                example: 123456,
                            },
                            mobileOTP: {
                                type: "number",
                                example: 654321,
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
                                        mobile: { type: "string" },
                                        isEmailOTPVerified: { type: "boolean" },
                                        isMobileOTPVerified: { type: "boolean" },
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

export default registerOTP;
