import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Menu as MenuIcon,
  Login as LoginIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/expenses', label: 'Expenses', icon: <ListIcon /> },
    { path: '/add-expense', label: 'Add Expense', icon: <AddIcon /> },
    { path: '/categories', label: 'Categories', icon: <CategoryIcon /> },
    { path: '/login', label: 'Login', icon: <LoginIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" component="div">
          Expense Tracker
        </Typography>
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ display: { sm: 'none' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
              color: isActive(item.path) ? 'primary.main' : 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isActive(item.path) ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              px: { xs: 1, sm: 2 },
              gap: 1,
              minHeight: { xs: 56, sm: 64 },
            }}
          >
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                flexGrow: 1,
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Expense Tracker
            </Typography>

            {!isMobile && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: { xs: 0.5, sm: 1 },
                  alignItems: 'center',
                }}
              >
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    size="medium"
                    sx={{
                      px: { sm: 2 },
                      py: 1,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      backgroundColor: isActive(item.path) 
                        ? 'action.selected' 
                        : 'transparent',
                      color: isActive(item.path) ? 'primary.main' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      transition: theme.transitions.create([
                        'background-color',
                        'color',
                        'box-shadow',
                      ]),
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navigation;
