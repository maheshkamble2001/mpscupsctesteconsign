export const setMultiPartHeader = () => {
  return {
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  };
};