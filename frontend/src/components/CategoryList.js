import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: config.API_URL,
  });

  // Add request interceptor to include token
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(config.API_ENDPOINTS.CATEGORIES);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load categories. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [navigate]);

  const handleOpenDialog = (mode, category = null) => {
    setDialogMode(mode);
    setSelectedCategory(category);
    setCategoryName(category ? category.name : '');
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCategoryName('');
    setSelectedCategory(null);
    setError('');
  };

  const handleAddCategory = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!categoryName.trim()) {
        setError('Category name cannot be empty');
        return;
      }

      const response = await api.post(config.API_ENDPOINTS.CATEGORIES, {
        name: categoryName.trim()
      });

      setCategories([...categories, response.data]);
      setSuccess('Category added successfully!');
      handleCloseDialog();
      setCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to add category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      setLoading(true);
      setError('');

      if (!categoryName.trim()) {
        setError('Category name cannot be empty');
        return;
      }

      const response = await api.put(`${config.API_ENDPOINTS.CATEGORIES}${selectedCategory.id}/`, {
        name: categoryName.trim()
      });

      const updatedCategories = categories.map(cat =>
        cat.id === selectedCategory.id ? response.data : cat
      );
      setCategories(updatedCategories);
      setSuccess('Category updated successfully!');
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to update category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError('');

      await api.delete(`${config.API_ENDPOINTS.CATEGORIES}${categoryId}/`);
      
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      setSuccess('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 400) {
        setError('Cannot delete category with associated expenses. Please delete or reassign expenses first.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to delete category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (dialogMode === 'add') {
      await handleAddCategory();
    } else {
      await handleUpdateCategory();
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    await handleDeleteCategory(categoryId);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Categories</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            disabled={loading}
          >
            Add Category
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <List>
          {categories.map((category) => (
            <ListItem
              key={category.id}
              divider
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText primary={category.name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleOpenDialog('edit', category)}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(category.id)}
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {!loading && categories.length === 0 && (
          <Typography color="textSecondary" align="center" sx={{ mt: 2 }}>
            No categories found. Add your first category!
          </Typography>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogMode === 'add' ? 'Add Category' : 'Edit Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : dialogMode === 'add' ? (
              'Add'
            ) : (
              'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CategoryList;
