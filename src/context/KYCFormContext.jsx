import { createContext, useContext, useState } from "react";

const KYCFormContext = createContext();

export const useKYCForm = () => useContext(KYCFormContext);

export const KYCFormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    personalInfo: {},
    identification: {},
    contactInfo: {},
    educationalInfo: {},
    medicalInfo: {},
    employeeInfo: {},
    bankInfo: {},
    salaryandbenefitInfo: {},
    transferInfo: {},
    declaration: {},
  });

  const updateFormData = (step, data) => {
    setFormData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  };

  return (
    <KYCFormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </KYCFormContext.Provider>
  );
};
