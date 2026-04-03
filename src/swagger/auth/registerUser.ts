const registerUser = {
    post: {
        tags: ["Auth"],
        description: "User Register",
        operationId: "User-register",
        requestBody: {
            "content": {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            email: {
                                type: "string",
                                required: true,
                                example: "user.test@yopmail.com",
                            },
                            mobile: {
                                type: "number",
                                required: true,
                                example: 9874563210,
                            },
                            password: {
                                type: "string",
                                required: true,
                                example: "123456",
                            },
                            confirmPassword: {
                                type: "string",
                                required: true,
                                example: "123456",
                            },
                            isPartner: {
                                type: "boolean",
                                require: false,
                                default: false,
                                example: false
                            }
                        },
                    }
                }
            }
        },
        responses: {
            200: {
                description: "Register success",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                data: {
                                    type: "object",
                                    properties: {
                                        email: {
                                            type: "string",
                                        },
                                        mobile: {
                                            type: "string",
                                        },
                                        isPartner: {
                                            type: "boolean"
                                        }
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
                description: "Unauthorized, Invalid email or mobile",
            },
            400: {
                description: "Something went wrong",
            },
        },
    },
};

export default registerUser;
