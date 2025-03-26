const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
const cuiRegex = /^[0-9]{2,10}$/;
const telephoneRegex = /^[0-9]{7,10}$/;
const nameRegex = /^[A-Z][a-z]*(?: [A-Z][a-z]*)*$/;
const requiredExperienceRegex = /^(?:\d+-\d+|\d+) years?$/i;

const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

const validateCUI = (cui: string): boolean => {
  return cuiRegex.test(cui);
};

const validateTelephone = (telephone: string): boolean => {
  return telephoneRegex.test(telephone);
};

const validateName = (name: string): boolean => {
  return nameRegex.test(name);
};

const validateRequiredExperience = (experience: string): boolean => {
  return requiredExperienceRegex.test(experience);
};

export {
  validateEmail,
  validateCUI,
  validateTelephone,
  validateName,
  validateRequiredExperience,
};
