import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
  Fade,
  Grid,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  AddCircleOutline,
  Category as CategoryIcon,
  Info as InfoIcon,
  CalendarToday,
  AttachMoney,
  Description,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import config from '../config';

function AddExpense() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date(),
    category: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const api = axios.create({
    baseURL: config.API_URL,
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        setError('');
        const response = await api.get(config.API_ENDPOINTS.CATEGORIES);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.response?.status === 401) {
          setError('Please log in to add expenses.');
        } else {
          setError('Failed to load categories. Please try refreshing the page.');
        }
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setErrors({});

    try {
      if (!formData.category) {
        setErrors({ category: 'Please select a category' });
        throw new Error('Please select a category');
      }

      const expenseData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date.toISOString().split('T')[0],
        category: formData.category
      };

      const response = await api.post(config.API_ENDPOINTS.EXPENSES, expenseData);

      setSuccess('Expense added successfully!');
      setFormData({
        amount: '',
        description: '',
        date: new Date(),
        category: '',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      if (error.response?.status === 401) {
        setError('Please log in to add expenses.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to add expense. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      date: newDate,
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.primary.main}11 90%)`,
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Add New Expense
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Track your expenses by filling out the form below
          </Typography>
        </Box>

        {error && (
          <Fade in={Boolean(error)}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                boxShadow: theme.shadows[2],
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={Boolean(errors.description)}
                helperText={errors.description}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                error={Boolean(errors.amount)}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>₹</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={Boolean(errors.category)}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categoryLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          Loading categories...
                        </Typography>
                      </Box>
                    </MenuItem>
                  ) : categories.length === 0 ? (
                    <MenuItem disabled>
                      <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        No categories available
                      </Typography>
                    </MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem 
                        key={category.id} 
                        value={category.id}
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          py: { xs: 1, sm: 1.5 },
                        }}
                      >
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ width: '100%' }}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(newValue) => {
                      handleChange({
                        target: { name: 'date', value: newValue }
                      });
                    }}
                    slots={{
                      textField: (params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={Boolean(errors.date)}
                          helperText={errors.date}
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                            },
                            '& .MuiOutlinedInput-input': {
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                            },
                          }}
                        />
                      ),
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Adding Expense...</span>
                  </Box>
                ) : (
                  'Add Expense'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default AddExpense;
