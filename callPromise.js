//call async data request from database example: callPromise(getUserById(args)).then(function(data){ use data here })
export default async (promise) => {
  const result = await promise;
  return result;
};
