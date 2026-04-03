import auth from "./auth"
import basicInfo from "./basicInfo"
import components from "./components"
import other from "./other"

const swaggerDocs = {
    ...basicInfo,
    ...components,
    
    paths: {
        ...auth.paths,


        //(only for admin user)
        ...other.paths


        // ...CustomerLogin.paths,
        // ...Customers.paths
    }

}

export default swaggerDocs