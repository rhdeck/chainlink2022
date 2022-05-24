const { fetch } = require("cross-fetch");
//#name
module.exports = async (inputData) => {
  const thisFunc = async (callback) => {
    //#mycode
  };
  const result = await new Promise(async (resolve) => {
    const ret = await thisFunc(resolve);
    if (ret !== "undefined") resolve(ret);
  });
  console.log(result);
  return result;
};
