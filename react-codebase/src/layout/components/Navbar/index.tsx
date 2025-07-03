"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        borderBottom: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
      elevation={0}
    >
      <Toolbar sx={{ minHeight: "70px", padding: "0 24px" }}>
        {/* Logo */}
        <Box sx={{ marginLeft: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px',
            }}
          >
            OrderManager
          </Typography>
        </Box>

        {/* Navigation Links - Hidden on mobile */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 4,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 20,
            }}
          >
            <Button
              component={RouterLink}
              to="/"
              variant="text"
              sx={{ 
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                padding: '8px 20px',
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              🏠 Home
            </Button>
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="text"
              sx={{ 
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                padding: '8px 20px',
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              📊 Dashboard
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}