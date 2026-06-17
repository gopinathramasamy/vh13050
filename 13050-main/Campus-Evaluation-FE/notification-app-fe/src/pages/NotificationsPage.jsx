import React, { useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WorkIcon from "@mui/icons-material/Work";

import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage() {
  // Tabs tracking: 0 = General Live Stream, 1 = Priority High-Weight Inbox
  const [activeTabWindow, setActiveTabWindow] = useState(0);
  
  // User configurable constraint size for Stage 1 & 2 Priority feeds
  const [priorityInboxLimit, setPriorityInboxLimit] = useState(10);

  // Extract variables and controllers directly from our custom data pipeline hook
  const {
    notifications,
    priorityFeed,
    viewedIds,
    activePage,
    activeFilter,
    statusLoading,
    errorMessage,
    totalPagesCount,
    setPagePointer,
    setFilterCriteria,
    markAsRead,
    resetReadCache
  } = useNotifications();

  // Calculate live unread count based on active fetched feed vs locally stored read arrays
  const targetFeedForCounting = activeTabWindow === 0 ? notifications : priorityFeed;
  const dynamicallyUnreadItems = targetFeedForCounting.filter(item => !viewedIds.includes(item.ID));
  const rawUnreadCountBadge = dynamicallyUnreadItems.length;

  // Intercept layout criteria shifts safely
  const handleFilterChange = (selectedCategory) => {
    setPagePointer(1); // Drop back to first page upon changing target category
    setFilterCriteria(selectedCategory);
  };

  const handlePageChange = (event, selectedPage) => {
    console.log(`[Interface Navigation] Advancing data layout index view to page: ${selectedPage}`);
    setPagePointer(selectedPage);
  };

  // Human aesthetic helper to format badges with unique lookups
  const renderCategoryBadge = (categoryType) => {
    switch (categoryType) {
      case "Placement":
        return <Chip icon={<WorkIcon />} label="Placement" color="error" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
      case "Result":
        return <Chip icon={<AssignmentTurnedInIcon />} label="Result" color="success" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
      case "Event":
        return <Chip icon={<CampaignIcon />} label="Event" color="info" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={categoryType} size="small" />;
    }
  };

  // Isolate current runtime payload slice depending on chosen tab selection view
  const resolvedDisplayCollection = activeTabWindow === 0 
    ? notifications 
    : priorityFeed.slice(0, priorityInboxLimit);

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: 2, py: 4 }}>
      
      {/* Structural Header Area Component Banner */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", sm: "center" }} 
        spacing={2} 
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={rawUnreadCountBadge} color="primary" max={99}>
            <NotificationsIcon sx={{ fontSize: 32, color: "text.primary" }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
              Campus Alerts Center
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time Placements, Events & Results Stream
            </Typography>
          </Box>
        </Stack>

        {viewedIds.length > 0 && (
          <Button 
            size="small" 
            variant="outlined" 
            color="inherit"
            startIcon={<DoneAllIcon />}
            onClick={resetReadCache}
            sx={{ textTransform: "none", borderRadius: "6px", fontSize: "12px", opacity: 0.7 }}
          >
            Mark All Unread
          </Button>
        )}
      </Stack>

      {/* Navigation Tabs Layer to separate Stage 2 All Feed view from Priority view */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs 
          value={activeTabWindow} 
          onChange={(e, nextIdx) => {
            setActiveTabWindow(nextIdx);
            setPagePointer(1); // Reset page on tab shift
          }}
          variant="fullWidth"
        >
          <Tab 
            label="All Notifications Feed" 
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "14px" }} 
          />
          <Tab 
            icon={<StarIcon fontSize="small" />} 
            iconPosition="start"
            label="Priority Inbox Engine" 
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "14px" }} 
          />
        </Tabs>
      </Box>

      {/* Dynamic Sub-Controls Section depending on active operational mode */}
      {activeTabWindow === 0 ? (
        <Box sx={{ mb: 2 }}>
          <NotificationFilter currentSelection={activeFilter} onFilterChange={handleFilterChange} />
        </Box>
      ) : (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 3, p: 2, backgroundColor: "rgba(25, 118, 210, 0.04)", borderRadius: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="primary.dark">
              Algorithm: Weight + Recency Sorting Mode
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Strict Priority Sequence: Placement &gt; Result &gt; Event
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel id="priority-size-select-label">Show Top</InputLabel>
            <Select
              labelId="priority-size-select-label"
              value={priorityInboxLimit}
              label="Show Top"
              onChange={(e) => setPriorityInboxLimit(Number(e.target.value))}
              sx={{ borderRadius: "8px", backgroundColor: "white" }}
            >
              <MenuItem value={10}>Top 10 Alerts</MenuItem>
              <MenuItem value={15}>Top 15 Alerts</MenuItem>
              <MenuItem value={20}>Top 20 Alerts</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* DYNAMIC PIPELINE STATE RENDERING ROUTER */}
      
      {/* 1. Loading Gateway Spinner View */}
      {statusLoading && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
          <CircularProgress thickness={4.5} size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Synchronizing live campus data registry...
          </Typography>
        </Box>
      )}

      {/* 2. Exception/Network Error Display Block */}
      {!statusLoading && errorMessage && (
        <Alert severity="error" variant="filled" sx={{ borderRadius: "8px", my: 2 }}>
          Pipeline Synchronization Failure: {errorMessage}
        </Alert>
      )}

      {/* 3. Empty Results Vector View Fallback */}
      {!statusLoading && !errorMessage && resolvedDisplayCollection.length === 0 && (
        <Box sx={{ py: 8, textAlign: "center", backgroundColor: "rgba(0,0,0,0.01)", borderRadius: 3, border: "1px dashed rgba(0,0,0,0.1)" }}>
          <NotificationsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            No Active Notifications Available
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 360, mx: "auto", mt: 0.5 }}>
            No current campus alerts fit this selection criteria. Check back later for updates.
          </Typography>
        </Box>
      )}

      {/* 4. Active Interactive Render Feed Stack */}
      {!statusLoading && resolvedDisplayCollection.length > 0 && (
        <Stack spacing={2}>
          {resolvedDisplayCollection.map((item) => {
            const isItemAlreadyRead = viewedIds.includes(item.ID);
            
            return (
              <Card 
                key={`notification-node-${item.ID}`}
                variant="outlined"
                onClick={() => markAsRead(item.ID)}
                sx={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  borderLeft: isItemAlreadyRead ? "4px solid #cbd5e1" : "5px solid #1976d2",
                  backgroundColor: isItemAlreadyRead ? "rgba(0, 0, 0, 0.01)" : "#ffffff",
                  boxShadow: isItemAlreadyRead ? "none" : "0 4px 12px rgba(0, 0, 0, 0.04)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
                    backgroundColor: isItemAlreadyRead ? "rgba(0,0,0,0.03)" : "rgba(25, 118, 210, 0.01)"
                  }
                }}
              >
                {!isItemAlreadyRead && (
                  <Box 
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "primary.main"
                    }}
                  />
                )}

                <CardContent sx={{ p: "20px !important" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
                    {renderCategoryBadge(item.Type)}
                    
                    <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                      <AccessTimeIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                        {item.Timestamp}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Typography 
                    variant="body1" 
                    fontWeight={isItemAlreadyRead ? 500 : 700}
                    color={isItemAlreadyRead ? "text.secondary" : "text.primary"}
                    sx={{ lineHeight: 1.4 }}
                  >
                    {item.Message}
                  </Typography>
                  
                  <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1, fontSize: "10px", fontFamily: "monospace" }}>
                    ID: {item.ID}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* 5. Pagination control bar (Hidden on priority system views) */}
      {!statusLoading && activeTabWindow === 0 && resolvedDisplayCollection.length > 0 && (
        <Box display="flex" justifyContent="center" mt={5}>
          <Pagination
            count={totalPagesCount}
            page={activePage}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                borderRadius: "8px"
              }
                }}
          />
        </Box>
      )}
    </Box>
  );
}