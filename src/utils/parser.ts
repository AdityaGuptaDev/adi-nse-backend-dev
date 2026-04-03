const { Builder, Parser } = require('xml2js');

export const convertJsonToXml = async (jsonData:any) => {
    const builder = new Builder({ headless: true });
    const xml = builder.buildObject(jsonData);
    return `${xml}`;
 }

 export const convertXmlToJson = async (xmlData:any, options = {}) => {

  try {
    const defaultOptions = {
      explicitArray: false,
      normalizeTags: false,
      explicitRoot: true,
      mergeAttrs: true
    };
    
    const parserOptions = { ...defaultOptions, ...options };
    const parser = new Parser(parserOptions);
    
    return await parser.parseStringPromise(xmlData);
  } catch (error) {
    console.error('Error converting XML to JSON:', error);
    throw error;
  }
}

