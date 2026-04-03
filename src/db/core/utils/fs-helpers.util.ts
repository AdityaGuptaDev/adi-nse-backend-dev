import configs from "../../../config/config";
import environment from "../../../environment";
import path from 'path';
const config = (configs as { [key: string]: any })[environment];


// const currentPath = resolve(__dirname);
// export const ROOT_FOLDER = currentPath.split(config.publicPath)[0] + config.publicPath;
// Fix: Use actual project root instead of public folder
export const ROOT_FOLDER = path.resolve(__dirname, '../../../../');

