const changePassword = {
    post: {
        tags: ["Auth"],
        description: "User changePassword",
        operationId: "userchangePassword",
        security: [
            {
                jwt: [],
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            oldPassword: {
                                type: "string",
                                required: true,
                                example: "12345678",
                            },
                            newPassword: {
                                type: "string",
                                required: true,
                                example: "12345678",
                            },
                        },
                    }
                }
            }
        },
        responses: {
            200: {
                description: "Change Password successfully",
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
                description: "Unauthorized, Invalid password",
            },
            400: {
                description: "Request body could not be read properly.",
            },
        },
    }
}

export default changePassword;