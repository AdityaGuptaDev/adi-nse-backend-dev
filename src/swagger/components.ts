const components = {
    components: {
        securitySchemes: {
            jwt: {
               description: "",
               type: "apiKey",
               name: "Authorization",
               in: "header"
            }
        },
        schemas: {
            Error: {
                type: "object",
                properties: {
                    msg: {
                        type: "string",
                    },
                    internal_code: {
                        type: "string",
                    },

                },
            },
            getToken: {
                name: "Authorization",
                type: "string",
                required: true,
                in: "header",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTM4MSwiZW1haWwiOiJwYXJ0aGl2Z0BnbWFpbC5jb20iLCJyb2xlSWQiOjE4LCJ1c2VyVHlwZUlEIjoxNSwibWV0YSI6eyJGYWN1bHR5TWFzdGVyIjp7ImlkIjozMCwibWVtYmVySWQiOm51bGwsIm5hbWUiOiJwYXJ0aGl2IFNoYWgiLCJlbWFpbCI6InBhcnRoaXZnQGdtYWlsLmNvbSIsInBob25lTm8iOiI5ODI1OTc5NDU2IiwidGFtcFBhc3N3b3JkIjoiMTIzNDU2NzgiLCJpc0ZlZXMiOnRydWUsImFtb3VudCI6bnVsbCwiY291cG9uX2NvZGUiOm51bGwsImlzUGF5bWVudCI6bnVsbCwiaXNNYW5hZ2VTdGF5Ijp0cnVlLCJpc01hbmFnZVRyYXZlbCI6dHJ1ZSwiaXNGZWVkYmFjayI6MCwiaXNBY3RpdmUiOnRydWUsImlzRGVsZXRlIjpmYWxzZSwiY3JlYXRlZEJ5IjoxNywibW9kaWZpZWRCeSI6bnVsbCwiY3JlYXRlZEF0IjoiMjAyMy0wMS0xOVQxMzoxMjoxMC4xNzlaIiwidXBkYXRlZEF0IjoiMjAyMy0wMS0xOVQxMzoxMjoxMC4xNzlaIiwidXNlclR5cGVJRCI6MTUsInJlZklEIjozMCwicm9sZUlEIjoxOCwidXNlcklEIjoxMzgxfX0sImlhdCI6MTY3NDYzODQwMiwiZXhwIjoxNjc3MjMwNDAyfQ.dv28wzG2Haa231mH5DXg8UQgv6pnt2kGp86bJJd74JU"
            }
        },
    },
};

export default components