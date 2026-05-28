import CryptoJS from "crypto-js";

// Encrypt request data
export const encryptData = (value) => {
  const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";
  const secret = import.meta.env.VITE_CRYPTO_SECRET_KEY;

  if (isEncryptionEnabled && secret) {
    return CryptoJS.AES.encrypt(JSON.stringify(value), secret).toString();
  } else {
    return value; // 👈 return plain object
  }
};

// Decrypt response data
export const decryptData = (response) => {
  if (response?.name === "AxiosError") return response;

  const encrypted = response?.data;
  const secretKey = import.meta.env.VITE_CRYPTO_SECRET_KEY;

  // If no secret key or encryption is disabled, return raw JSON
  if (!secretKey) {
    try {
      return typeof encrypted === "string" ? JSON.parse(encrypted) : encrypted;
    } catch (err) {
      console.error("Decryption fallback parse failed:", err);
      return encrypted;
    }
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    return encrypted;
  }
};

export const normalEncryptData = (value) => {
  const secret = import.meta.env.VITE_CRYPTO_SECRET_KEY;

  if ( secret) {
    return CryptoJS.AES.encrypt(JSON.stringify(value), secret).toString();
  } else {
    return value; // 👈 return plain object
  }
};


export const normalDecryptData = (data) => {
  if (data) {
    const bytes = CryptoJS.AES.decrypt(
      data,
      import.meta.env.VITE_CRYPTO_SECRET_KEY
    );
    const finalValue = bytes.toString(CryptoJS.enc.Utf8);
    return finalValue;
  } else {
    return data;
  }
};


// utils/fixedEncrypt.js

export const fixedEncrypt = (password) => {
  // AES ke liye fixed key & IV (DON’T change)
  const key = CryptoJS.enc.Utf8.parse("1234567890123456");
  const iv = CryptoJS.enc.Utf8.parse("6543210987654321");

  return CryptoJS.AES.encrypt(password, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString();
};
