enum RETURN_TYPES {
  SUCCESS,
  INVALID_CREDENTIALS,
  INVALID_EMAIL_FORMAT,
  INVALID_CUI_FORMAT,
  INVALID_TELEPHONE_FORMAT,
  INVALID_USER_NAME_FORMAT,
  INVALID_FIRM_NAME_FORMAT,
  INVALID_REQUIRED_EXPERIENCE_FORMAT,
  INVALID_REPRESENTATIVE_NAME_FORMAT,
  INVALID_TECHNOLOGY_FORMAT,
  USER_NOT_FOUND,
  EMAIL_IN_USE,
  WEAK_PASSWORD,
  REGISTRATION_FAILED,
  JOB_ADD_FAILED,
  CREDENTIALS_REQUIRED,
  JOB_INFORMATION_REQUIRED,
  EMPTY_TECH_STACK_INPUTS,
  GOOGLE_LOGIN_FAILED,
  PASSWORDS_NOT_MATCH,
  LOGIN_FAILED,
  NO_TECHNOLOGIES_ADDED,
  JOB_DELETE_FAILED,
  JOB_EDIT_FAILED,
  APPLICATION_CV_REQUIRED,
  JOB_APPLICATION_FAILED,
  USER_UPDATE_FAILED,
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
    case RETURN_TYPES.INVALID_REQUIRED_EXPERIENCE_FORMAT:
      return "Invalid required experience format!";
    case RETURN_TYPES.INVALID_TECHNOLOGY_FORMAT:
      return "Enter a valid technology!";
    case RETURN_TYPES.NO_TECHNOLOGIES_ADDED:
      return "No technologies chosen, tech stack will be set to: Any.";
    case RETURN_TYPES.JOB_INFORMATION_REQUIRED:
      return "Please complete every section!";
    case RETURN_TYPES.EMPTY_TECH_STACK_INPUTS:
      return "Please complete all the technology sections that are opened!";
    case RETURN_TYPES.JOB_ADD_FAILED:
      return "An error occured while trying to add this job. Please try again!";
    case RETURN_TYPES.JOB_DELETE_FAILED:
      return "An error occured while trying to delete this job. Please try again!";
    case RETURN_TYPES.JOB_EDIT_FAILED:
      return "An error occured while trying to update this job. Please try again!";
    case RETURN_TYPES.APPLICATION_CV_REQUIRED:
      return "Please upload a valid CV!";
    case RETURN_TYPES.JOB_APPLICATION_FAILED:
      return "An error occured while trying to apply to this job. Please try again!";
    case RETURN_TYPES.USER_UPDATE_FAILED:
      return "An error occured while trying to update your profile. Please try again!";
    default:
      return "An error occurred!";
  }
};

export { RETURN_TYPES, getErrorType };
