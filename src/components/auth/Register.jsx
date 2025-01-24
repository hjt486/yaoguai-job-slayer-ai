import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { LoadingButton } from '../common/LoadingButton';
import Modal from '../common/Modal';

const Register = ({ onRegister, onToggleForm }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await new Promise(resolve => setTimeout(resolve, 3000));
      await onRegister(registrationData);
      setShowSuccessModal(true);
      return true;
    } catch (error) {
      setErrors({ submit: error.message });
      console.error('Registration failed:', error);
      return false; // Changed from throw error to return false
    }
  };

  // Add new state to track field touches
  const [touchedFields, setTouchedFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // Update handleChange to track touched fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isValidInput = {
    firstName: (value) => value && value.trim().length > 0,
    lastName: (value) => value && value.trim().length > 0,
    email: (value) => value && /\S+@\S+\.\S+/.test(value),
    password: (value) => value && value.length >= 6,
    confirmPassword: (value) => value && value === formData.password
  };

  const validateForm = () => {
    const errors = {};
    if (!isValidInput.firstName(formData.firstName)) {
      errors.firstName = 'First name is required';
    }
    if (!isValidInput.lastName(formData.lastName)) {
      errors.lastName = 'Last name is required';
    }
    if (!isValidInput.email(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!isValidInput.password(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!isValidInput.confirmPassword(formData.confirmPassword)) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const getValidationMessages = () => {
    const messages = [];
    if (!isValidInput.firstName(formData.firstName)) {
      messages.push('First name is required');
    }
    if (!isValidInput.lastName(formData.lastName)) {
      messages.push('Last name is required');
    }
    if (!isValidInput.email(formData.email)) {
      messages.push('Please enter a valid email address');
    }
    if (!isValidInput.password(formData.password)) {
      messages.push('Password must be at least 6 characters');
    }
    if (!isValidInput.confirmPassword(formData.confirmPassword)) {
      messages.push('Passwords do not match');
    }
    return messages;
  };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <article>
          <div className="grid">
            <button type="button" className="secondary" onClick={onToggleForm}>
              Back to Login
            </button>
          </div>
          <div className="grid">
            <label>
              First Name
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                {...(touchedFields.firstName && {
                  'aria-invalid': !isValidInput.firstName(formData.firstName)
                })}
                data-valid={isValidInput.firstName(formData.firstName)}
              />
              {touchedFields.firstName && errors.firstName && <small>{errors.firstName}</small>}
            </label>
            <label>
              Last Name
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                {...(touchedFields.lastName && {
                  'aria-invalid': !isValidInput.lastName(formData.lastName)
                })}
                data-valid={isValidInput.lastName(formData.lastName)}
              />
              {touchedFields.lastName && errors.lastName && <small>{errors.lastName}</small>}
            </label>
          </div>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              {...(touchedFields.email && {
                'aria-invalid': !isValidInput.email(formData.email)
              })}
              data-valid={isValidInput.email(formData.email)}
            />
            {touchedFields.email && errors.email && <small>{errors.email}</small>}
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              {...(touchedFields.password && {
                'aria-invalid': !isValidInput.password(formData.password)
              })}
              data-valid={isValidInput.password(formData.password)}
            />
            {touchedFields.password && errors.password && <small>{errors.password}</small>}
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              {...(touchedFields.confirmPassword && {
                'aria-invalid': !isValidInput.confirmPassword(formData.confirmPassword)
              })}
              data-valid={isValidInput.confirmPassword(formData.confirmPassword)}
            />
            {touchedFields.confirmPassword && errors.confirmPassword && <small>{errors.confirmPassword}</small>}
          </label>

          {errors.submit && (
            <div className="error-message">
              <small style={{ color: 'red' }}>{errors.submit}</small>
            </div>
          )}

          {showValidation && (
            <div className="validation-messages">
              {getValidationMessages().map((message, index) => (
                <small key={index} style={{ color: 'red', display: 'block' }}>
                  • {message}
                </small>
              ))}
            </div>
          )}

          <div className='grid'>
            <LoadingButton
              onClick={handleSubmit}
              loadingText="Registering..."
              timeout={5000}
            >
              Register
            </LoadingButton>
          </div>
        </article>
      </form>
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          onToggleForm()
        }}
      >
        <h1>Registration Successful!</h1>
        <p>Your account has been created. Please log in with your credentials.</p>
      </Modal>
    </>
  );
};

export default Register;