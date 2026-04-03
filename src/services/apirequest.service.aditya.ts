import axios from 'axios';
import https from 'https';

const createAxiosInstance = (apiUrl: any, customConfig = {}) => {
  const agent = new https.Agent({ rejectUnauthorized: false });
  return axios.create({
    baseURL: apiUrl,
    httpsAgent: agent,
    ...customConfig,
  } as any ) as any;
};

export const apiRequest2 = async ({
  method = 'post',
  url,
  headers = {},
  data = null,
  params = {},
  retries = 3,
  timeout = 10000,
}: any) => {
  const axiosInstance = createAxiosInstance(url);

  const config = {
    method,
    url,
    headers,
    data,
    params,
    timeout,
    maxBodyLength: Infinity,
    httpsAgent: axiosInstance.defaults.httpsAgent,
  };

  try {
    console.log("[apiRequest] Sending request to:", url);
    const response = await axiosInstance.request(config);
    console.log("[apiRequest] Full response:", response);
    return response.data;
  } catch (error) {
    console.error("[apiRequest] Error during API request:", error);
    throw error;
  }
};
