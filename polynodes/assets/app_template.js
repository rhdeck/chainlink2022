const { fetch } = require("cross-fetch");
module.exports = async () => {
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
