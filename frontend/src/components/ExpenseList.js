import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import config from '../config';
import { format } from 'date-fns';

function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Get the access token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Create axios instance with authentication
  const api = axios.create({
    baseURL: config.API_URL,
    headers: getAuthHeader(),
  });

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses/');
      setExpenses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showSnackbar('Error loading expenses', 'error');
      }
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showSnackbar('Error loading categories', 'error');
      }
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}/`);
      showSnackbar('Expense deleted successfully', 'success');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showSnackbar('Error deleting expense', 'error');
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense({
      ...expense,
      date: new Date(expense.date),
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const updatedData = {
        ...editingExpense,
        date: format(new Date(editingExpense.date), 'yyyy-MM-dd'),
      };
      await api.put(`/expenses/${editingExpense.id}/`, updatedData);
      showSnackbar('Expense updated successfully', 'success');
      setEditDialogOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showSnackbar('Error updating expense', 'error');
      }
    }
  };

  const handleEditChange = (field) => (event) => {
    setEditingExpense({
      ...editingExpense,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (newDate) => {
    setEditingExpense({
      ...editingExpense,
      date: newDate,
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 4 } }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 600,
          mb: { xs: 2, sm: 3 },
        }}
      >
        Expenses
      </Typography>

      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Date
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Description
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Category
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Amount
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={5} 
                    align="center"
                    sx={{ 
                      py: 4,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      color: 'text.secondary',
                    }}
                  >
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow 
                    key={expense.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      {format(new Date(expense.date), 'MM/dd/yyyy')}
                    </TableCell>
                    <TableCell
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      {expense.description}
                    </TableCell>
                    <TableCell
                      sx={{ 
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      {expense.category_name}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 2 },
                        fontWeight: 500,
                      }}
                    >
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        whiteSpace: 'nowrap',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      <IconButton 
                        onClick={() => handleEdit(expense)} 
                        size="small"
                        sx={{ 
                          mr: { xs: 0.5, sm: 1 },
                          color: 'primary.main',
                        }}
                      >
                        <EditIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(expense.id)} 
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 2,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
          }}
        >
          Edit Expense
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={editingExpense?.description || ''}
                onChange={handleEditChange('description')}
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
                type="number"
                value={editingExpense?.amount || ''}
                onChange={handleEditChange('amount')}
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
              <TextField
                fullWidth
                select
                label="Category"
                value={editingExpense?.category || ''}
                onChange={handleEditChange('category')}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              >
                {categories.map((category) => (
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
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={editingExpense?.date || null}
                  onChange={handleDateChange}
                  slots={{
                    textField: (params) => (
                      <TextField
                        {...params}
                        fullWidth
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
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 3 },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 3 },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ExpenseList;
