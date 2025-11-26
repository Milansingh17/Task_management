export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required && !validateRequired(value)) {
      errors[field] = `${field} is required`;
    }
    
    if (rule.email && value && !validateEmail(value)) {
      errors[field] = 'Invalid email format';
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Minimum ${rule.minLength} characters required`;
    }
    
    if (rule.match && value !== formData[rule.match]) {
      errors[field] = 'Passwords do not match';
    }
  });
  
  return errors;
};