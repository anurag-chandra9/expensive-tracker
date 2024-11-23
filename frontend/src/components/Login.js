import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material';
import axiosInstance from '../axiosInstance'; // Import the new axios instance
import config from '../config';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  
  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post(config.API_ENDPOINTS.LOGIN, {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.tokens) {
        localStorage.setItem('accessToken', response.data.tokens.access);
        localStorage.setItem('refreshToken', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setSuccess('Login successful! Redirecting...');
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid username or password');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setErrors({});

    // Validate form data
    const validationErrors = {};
    if (!formData.username) validationErrors.username = 'Username is required';
    if (!formData.email) validationErrors.email = 'Email is required';
    if (!formData.password) validationErrors.password = 'Password is required';
    if (!formData.confirmPassword) validationErrors.confirmPassword = 'Please confirm your password';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long' });
      return;
    }

    try {
      const response = await axiosInstance.post(config.API_ENDPOINTS.REGISTER, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.data) {
        setSuccess('Registration successful! Please login with your credentials.');
        // Switch to login tab after a short delay
        setTimeout(() => {
          setTabValue(0);
          // Clear registration form
          setFormData({
            username: '',
            password: '',
            email: '',
            confirmPassword: '',
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.username) {
        setErrors({ username: error.response.data.username[0] });
      } else if (error.response?.data?.email) {
        setErrors({ email: error.response.data.email[0] });
      } else if (error.response?.data?.password) {
        setErrors({ password: error.response.data.password[0] });
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const handleRequestOTP = async () => {
    try {
      await axiosInstance.post(`${config.API_URL}/api/auth/request-password-reset/`, {
        email: resetEmail,
      });
      setOtpSent(true);
      setSuccess('OTP has been sent to your email');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await axiosInstance.post(`${config.API_URL}/api/auth/verify-otp/`, {
        email: resetEmail,
        otp: otp,
        new_password: newPassword,
      });
      setSuccess('Password reset successful! Please login with your new password.');
      setForgotPasswordOpen(false);
      resetForgotPasswordForm();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    }
  };

  const resetForgotPasswordForm = () => {
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOtpSent(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleLogin}>
            <Typography variant="h5" gutterBottom>
              Login
            </Typography>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setForgotPasswordOpen(true)}
                sx={{ cursor: 'pointer' }}
              >
                Forgot Password?
              </Link>
            </Box>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleRegister}>
            <Typography variant="h5" gutterBottom>
              Register
            </Typography>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Register
            </Button>
          </form>
        </TabPanel>
      </Paper>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => {
          setForgotPasswordOpen(false);
          resetForgotPasswordForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {!otpSent ? (
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              margin="normal"
              required
            />
          ) : (
            <>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                margin="normal"
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setForgotPasswordOpen(false);
              resetForgotPasswordForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={otpSent ? handleResetPassword : handleRequestOTP}
            variant="contained"
            color="primary"
          >
            {otpSent ? 'Reset Password' : 'Send OTP'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Login;
