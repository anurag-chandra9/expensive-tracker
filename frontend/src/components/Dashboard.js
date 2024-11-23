import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
  useTheme,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  DateRange,
  Category as CategoryIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import axios from 'axios';

const COLORS = [
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#FFC107', // Amber
  '#F44336', // Red
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#00BCD4', // Cyan
  '#E91E63', // Pink
];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ 
    height: '100%',
    background: `linear-gradient(45deg, ${color}22 30%, ${color}11 90%)`,
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `0 4px 20px ${color}33`,
    },
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: color,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
        }}>
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState({
    total_expenses: 0,
    monthly_expenses: 0,
    category_expenses: [],
    monthly_trend: [],
    recent_expenses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:8000/api',
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if token exists
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('You are not logged in. Please log in to view the dashboard.');
          navigate('/login');
          return;
        }

        // Make the API request
        const response = await api.get('/expenses/dashboard_stats/');
        console.log('Dashboard data received:', response.data);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Handle different types of errors
        if (error.response) {
          // Server responded with an error
          if (error.response.status === 401) {
            setError('Your session has expired. Please log in again.');
            navigate('/login');
          } else if (error.response.status === 500) {
            setError(`Server error: ${error.response.data.details || 'Failed to load dashboard data'}`);
          } else {
            setError(`Error: ${error.response.data.error || 'Failed to load dashboard data'}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          setError('Could not connect to the server. Please check your internet connection.');
        } else {
          // Something else went wrong
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading your financial insights...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {error && (
        <Fade in={Boolean(error)}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              boxShadow: theme.shadows[2],
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {/* Total Expenses Card */}
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Expenses"
            value={formatAmount(dashboardData.total_expenses)}
            icon={<AccountBalance sx={{ color: 'white' }} />}
            color={theme.palette.primary.main}
            subtitle="All time total"
          />
        </Grid>

        {/* Monthly Expenses Card */}
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Monthly Expenses"
            value={formatAmount(dashboardData.monthly_expenses)}
            icon={<DateRange sx={{ color: 'white' }} />}
            color={theme.palette.secondary.main}
            subtitle="Current month"
          />
        </Grid>

        {/* Monthly Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 400,
              background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.background.default} 90%)`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Monthly Trend
              <Tooltip title="Shows your expense trend over the last 6 months">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={dashboardData.monthly_trend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatAmount(value)}
                />
                <RechartsTooltip
                  formatter={(value) => formatAmount(value)}
                  labelStyle={{ color: theme.palette.text.primary }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ fill: theme.palette.primary.main }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 400,
              background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.background.default} 90%)`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Category Distribution
              <Tooltip title="Shows how your expenses are distributed across categories">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={dashboardData.category_expenses.map(item => ({
                    ...item,
                    amount: parseFloat(item.amount),
                    percentage: parseFloat(item.percentage)
                  }))}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                    payload
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill={theme.palette.text.primary}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        style={{ fontSize: '12px' }}
                      >
                        {`${payload.category} (${payload.percentage.toFixed(1)}%)`}
                      </text>
                    );
                  }}
                >
                  {dashboardData.category_expenses.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${formatAmount(value)} (${parseFloat(props.payload.percentage).toFixed(1)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Expenses */}
        {dashboardData.recent_expenses && dashboardData.recent_expenses.length > 0 && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.background.default} 90%)`,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Expenses
                <Tooltip title="Your most recent transactions">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <List>
                {dashboardData.recent_expenses.map((expense) => (
                  <ListItem
                    key={expense.id}
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <ListItemText
                      primary={expense.description}
                      secondary={`${expense.category_name} • ${new Date(expense.date).toLocaleDateString()}`}
                    />
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ minWidth: 100, textAlign: 'right' }}
                    >
                      {formatAmount(expense.amount)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Dashboard;
