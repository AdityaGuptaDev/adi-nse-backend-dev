const convertData = {
    post: {
      tags: ["Other - (Only For Admin User)"],
      description: "Convert Data",
      operationId: "convertData",
      requestBody: {
        "content": {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        data: {
                            type: "string",
                            example: ""
                          }
                    },
                }
            }
        }
      },
      responses: {
        200: {
          description: "Created Successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
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
                  msg: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
        400: {
          description: "not found",
        },
      },
    },
  };
  
  export default convertData;
  