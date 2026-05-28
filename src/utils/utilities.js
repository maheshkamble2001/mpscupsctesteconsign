import { normalDecryptData } from "configs/encryption";
import Cookies from "js-cookie";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const verifyRole = (data) => {
  const role = JSON.parse(normalDecryptData(Cookies.get("role")));
  if(role){
    return !role.includes(data);
  }else{
    return true;
  }
};


