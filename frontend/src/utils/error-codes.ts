enum RETURN_TYPES {
  SUCCESS,
  INVALID_CREDENTIALS,
  INVALID_EMAIL_FORMAT,
  INVALID_CUI_FORMAT,
  INVALID_TELEPHONE_FORMAT,
  INVALID_USER_NAME_FORMAT,
  INVALID_FIRM_NAME_FORMAT,
  INVALID_REPRESENTATIVE_NAME_FORMAT,
  USER_NOT_FOUND,
  EMAIL_IN_USE,
  WEAK_PASSWORD,
  REGISTRATION_FAILED,
  CREDENTIALS_REQUIRED,
  GOOGLE_LOGIN_FAILED,
  PASSWORDS_NOT_MATCH,
  LOGIN_FAILED,
}

const getErrorType = (error_type: RETURN_TYPES): string => {
  switch (error_type) {
    case RETURN_TYPES.INVALID_CREDENTIALS:
      return "Invalid email or password!";
    case RETURN_TYPES.EMAIL_IN_USE:
      return "Email is already in use!";
    case RETURN_TYPES.WEAK_PASSWORD:
      return "Password must be at least 6 characters long!";
    case RETURN_TYPES.REGISTRATION_FAILED:
      return "Failed to register!";
    case RETURN_TYPES.CREDENTIALS_REQUIRED:
      return "Credentials are required!";
    case RETURN_TYPES.PASSWORDS_NOT_MATCH:
      return "Passwords do not match!";
    case RETURN_TYPES.INVALID_EMAIL_FORMAT:
      return "Invalid email format!";
    case RETURN_TYPES.INVALID_CUI_FORMAT:
      return "Invalid CUI format!";
    case RETURN_TYPES.INVALID_TELEPHONE_FORMAT:
      return "Invalid telephone format!";
    case RETURN_TYPES.INVALID_USER_NAME_FORMAT:
      return "Invalid user name format!";
    case RETURN_TYPES.INVALID_FIRM_NAME_FORMAT:
      return "Invalid company name format!";
    case RETURN_TYPES.INVALID_REPRESENTATIVE_NAME_FORMAT:
      return "Invalid representative name format!";
    default:
      return "An error occurred!";
  }
};

export { RETURN_TYPES, getErrorType };
