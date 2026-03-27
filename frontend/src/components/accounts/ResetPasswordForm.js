import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, Redirect } from 'react-router-dom';
import { Input } from 'reactstrap';
import ConfirmationModal from '../profile/ConfirmationModal';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
export default function ResetPasswordForm() {
  const [passwordForm, setpasswordForm] = useState({
    password: '',
    password2: '',
    token: '',
    errors: {},
    showError: false,
    messageFromServer: '',
    errorMessage: '',
  });
  const [show, setshow] = useState(false);
  const [redirectHome, setRedirectHome] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  let query = useQuery();

  const confirmPass = (e) => {
    e.preventDefault();
    const errorMsg = getPasswordErrorMessage();
    if (errorMsg) {
      setpasswordForm({
        ...passwordForm,
        errorMessage: errorMsg,
      });
      setshow(true);
    } else {
      axios
        .post(`${process.env.REACT_APP_ARQIVE}/password_reset/confirm/`, {
          token: query.get('token'),
          password: passwordForm.password,
        })
        .then((response) => {
          setpasswordForm({
            ...passwordForm,
            password: '',
            password2: '',
            messageFromServer: 'your password reset successfully',
          });
          setModalOpen(true);
        })
        .catch((error) => {
          let errorMsg = 'Password reset failed.';
          if (error.response && error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMsg = error.response.data;
            } else if (error.response.data.detail) {
              errorMsg = error.response.data.detail;
            } else if (error.response.data.password && Array.isArray(error.response.data.password)) {
              errorMsg = error.response.data.password.join(' ');
            }
          }
          setpasswordForm({
            ...passwordForm,
            messageFromServer: errorMsg,
            errorMessage: errorMsg,
          });
          setModalOpen(true);
          console.error('Reset password error:', error);
        });
    }
  };
  const formIsValid = () => {
    let formIsValid = true;
    if (passwordForm.password.length < 8) {
      formIsValid = false;
    }
    if (passwordForm.password.search(/[!@#$%^&*_+()]/) === -1) {
      formIsValid = false;
    }
    if (passwordForm.password.search(/\d/) === -1) {
      formIsValid = false;
    }
    if (passwordForm.password.search(/[a-zA-Z]/) === -1) {
      formIsValid = false;
    }
    if (passwordForm.password !== passwordForm.password2) {
      formIsValid = false;
    }
    return formIsValid;
  };

  const getPasswordErrorMessage = () => {
    if (passwordForm.password.length < 8) {
      return 'Password error: should match requirements (at least 8 characters)';
    }
    if (passwordForm.password.search(/[!@#$%^&*_+()]/) === -1) {
      return 'Password error: should match requirements (special character required)';
    }
    if (passwordForm.password.search(/\d/) === -1) {
      return 'Password error: should match requirements (at least 1 number)';
    }
    if (passwordForm.password.search(/[a-zA-Z]/) === -1) {
      return 'Password error: should match requirements (at least 1 letter)';
    }
    if (passwordForm.password !== passwordForm.password2) {
      return "Password error: passwords don't match";
    }
    return '';
  };
  if (!query.get('token') || redirectHome) return <Redirect to='/' />;
  const handleModalClose = () => {
    setModalOpen(false);
    setRedirectHome(true);
  };

  return (
    <div className={'main-content-div forgot-password-div'}>
      <div className='col-md-6 m-auto forgot-password-col'>
        <div className='card card-body mt-5 forgot-password-card accounts-form-group'>
          <h2 className='text-center forgot-password-title'>Reset Password</h2>

          <form
            className='profile-form accounts-form-group'
            onSubmit={confirmPass}>
            <div className='form-group'>
              <p className='forgot-password-text'>
                *Passwords must contain at least eight characters, including at
                least 1 letter, 1 special character and 1 number
              </p>
            </div>
            <div className='form-group'>
              <p className='forgot-password-text'>
                Please input your new password:
              </p>
              <div style={{ position: 'relative' }}>
                <Input
                  id='password'
                  label='New Password'
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.password || ''}
                  style={{ paddingRight: '40px' }}
                  onChange={(e) =>
                    setpasswordForm({
                      ...passwordForm,
                      password: e.target.value,
                    })
                  }
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#98999b' }}
                  tabIndex={-1}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>

              <p className='forgot-password-text'>
                Please Confirm your password:
              </p>
              <div style={{ position: 'relative' }}>
                <Input
                  id='password2'
                  label='confirm password'
                  type={showPassword2 ? 'text' : 'password'}
                  value={passwordForm.password2 || ''}
                  style={{ paddingRight: '40px' }}
                  onChange={(e) =>
                    setpasswordForm({
                      ...passwordForm,
                      password2: e.target.value,
                    })
                  }
                />
                <button
                  type='button'
                  onClick={() => setShowPassword2(!showPassword2)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#98999b' }}
                  tabIndex={-1}
                >
                  {showPassword2 ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
              {/* Error message at the bottom of the form */}
              {passwordForm.errorMessage && (
                <p className='text-danger' style={{ marginTop: '20px' }}>
                  {passwordForm.errorMessage}
                </p>
              )}
              <button
                type='submit'
                className='btn btn-primary float-right default-btn-purple'
                style={{ marginTop: '20px' }}>
                Reset Password
              </button>
            </div>
          </form>
        </div>
        {/* Confirmation Modal for success/failure */}
        <ConfirmationModal
          modalState={modalOpen}
          toggle={handleModalClose}
          onSubmit={handleModalClose}
          title={passwordForm.messageFromServer || 'Password reset'}
          buttonTitle={'OK'}
        />
      </div>
    </div>
  );
}
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
