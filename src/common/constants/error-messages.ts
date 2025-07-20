export const ErrorMessages = {
  USER: {
    EMAIL_EXISTS: 'A user with this email already exists',
    PHONE_EXISTS: 'A user with this phone number already exists',
    NOT_FOUND: 'There is no user with this id',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    TOKEN_REQUIRED: 'A token is required for authentication'
  },
  MEDICATION: {
    NOT_PATIENT: 'Assigned user must have a patient role.',
    MEDICATION_ADDED_BEFORE: 'This medication already exists for this user.',
    CAN_NOT_UPDATE_ASSIGNED: 'Can not update assigned user.',
    NOT_FOUND: 'There is no medication with this id',
  },
  GENERAL: {
    INTERNAL_ERROR: 'An unexpected error occurred',
    VALIDATION_ERROR: 'Validation error occurred',
  }
};