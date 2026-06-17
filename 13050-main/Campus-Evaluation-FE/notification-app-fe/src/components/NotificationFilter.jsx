import React from "react";
import { ToggleButton, ToggleButtonGroup, Box, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

// Explicit data matrix map to assign unique styles to filter badges
const FILTER_PRESETS = [
  { label: "All Feeds", apiKey: "" },
  { label: "Placements", apiKey: "Placement" },
  { label: "Results", apiKey: "Result" },
  { label: "Events", apiKey: "Event" }
];

export function NotificationFilter({ currentSelection, onFilterChange }) {
  
  // Custom intermediate handler to trace user layout shifts cleanly
  const handleSelectionIntercept = (event, selectionPayload) => {
    // Prevent breaking if a user double-clicks an already active filter choice
    if (selectionPayload !== null && typeof onFilterChange === "function") {
      console.log(`[UI Control] Filter action shifted selection target to: "${selectionPayload}"`);
      onFilterChange(selectionPayload);
    }
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 1.5, 
        my: 2,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        p: 1.5,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", gap: 0.5 }}>
        <FilterListIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: "none", sm: "block" } }}>
          Category:
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={currentSelection || ""}
        exclusive
        onChange={handleSelectionIntercept}
        size="medium"
        color="primary"
        sx={{ 
          flexWrap: "wrap", 
          gap: 1,
          boxShadow: "none",
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid rgba(0, 0, 0, 0.12) !important",
            borderRadius: "8px !important",
            mx: 0.2
          }
        }}
      >
        {FILTER_PRESETS.map((item) => (
          <ToggleButton 
            key={`filter-btn-${item.label}`} // Explicit key binding to keep React engine happy
            value={item.apiKey} 
            sx={{ 
              textTransform: "none", 
              px: 2.5,
              py: 0.5,
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "primary.dark"
                }
              }
            }}
          >
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}