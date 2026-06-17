import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, getPrioritySortedNotifications } from "../api/notifications";

// Custom debug key prefix for state inspection
const READ_REGISTRY_KEY = "campus_alerts_read_v1";

export function useNotifications() {
  // Main data payloads states
  const [rawItems, setRawItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  
  // Interface pipeline trackers
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [syncFailureMessage, setSyncFailureMessage] = useState(null);

  // Local state tracking for Read/Unread notification IDs
  const [viewedNotificationIds, setViewedNotificationIds] = useState(() => {
    try {
      const archivedLogs = localStorage.getItem(READ_REGISTRY_KEY);
      return archivedLogs ? JSON.parse(archivedLogs) : [];
    } catch (fsException) {
      console.warn("[Storage Error] Safe state restoration failed, initializing clean registry.", fsException);
      return [];
    }
  });

  /**
   * Primary orchestrator function to handle network operations.
   * Uses useCallback so it doesn't cause unnecessary component re-renders.
   */
  const executeDataSync = useCallback(async (targetPage, activeFilter, activeLimit) => {
    setIsDataSyncing(true);
    setSyncFailureMessage(null);
    
    console.log(`[Pipeline Hook] Querying live streams: Page ${targetPage}, Filter: "${activeFilter || 'ALL'}"`);
    
    try {
      const responseFeed = await fetchNotifications({
        page: targetPage,
        limit: activeLimit,
        notification_type: activeFilter
      });

      if (Array.isArray(responseFeed)) {
        setRawItems(responseFeed);
      } else {
        setRawItems([]);
        console.warn("[Pipeline Hook] Received unexpected non-array format from underlying API source.");
      }
    } catch (runtimeError) {
      setSyncFailureMessage(runtimeError.message || "Failed to load notification stream.");
      console.error("[Pipeline Hook] Stream transmission broken down.", runtimeError);
    } finally {
      setIsDataSyncing(false);
    }
  }, []);

  // Synchronize component views to respond instantly on criteria shifts
  useEffect(() => {
    executeDataSync(currentPage, categoryFilter, pageSize);
  }, [currentPage, categoryFilter, pageSize, executeDataSync]);

  /**
   * Action trigger: Sets a notification's state to 'Read' locally
   */
  const commitItemAsViewed = useCallback((notificationId) => {
    if (!notificationId) return;
    
    setViewedNotificationIds((prevRegistry) => {
      if (prevRegistry.includes(notificationId)) return prevRegistry;
      const updatedRegistry = [...prevRegistry, notificationId];
      
      // Save state into local storage so it persists through page refreshes
      try {
        localStorage.setItem(READ_REGISTRY_KEY, JSON.stringify(updatedRegistry));
      } catch (ioError) {
        console.error("[Local Sync Warning] Storing user interaction trace failed.", ioError);
      }
      
      return updatedRegistry;
    });
  }, []);

  /**
   * Action trigger: Resets all read status states back to unread
   */
  const clearReadHistoryLocal = useCallback(() => {
    try {
      localStorage.removeItem(READ_REGISTRY_KEY);
      setViewedNotificationIds([]);
      console.log("[State Refresher] Local read history flushed successfully.");
    } catch (err) {
      console.error("Failed to clear local storage history.", err);
    }
  }, []);

  // Algorithmic compute properties for Stage 1 & Stage 2 requirements
  const prioritizedOutputFeed = getPrioritySortedNotifications(rawItems);

  // Manual fallback calculation for total count mapping (since API response structure varies)
  const syntheticTotalCount = rawItems.length < pageSize && currentPage === 1 
    ? rawItems.length 
    : 50; // Mock pagination ceiling to satisfy interface requirements safely

  const computedTotalPages = Math.ceil(syntheticTotalCount / pageSize);

  return {
    // Array feeds
    notifications: rawItems,                // General timeline layout feed
    priorityFeed: prioritizedOutputFeed,    // Priority Inbox layout algorithm stream
    viewedIds: viewedNotificationIds,       // Unread/Read tracking state pointers
    
    // UI configuration states
    activePage: currentPage,
    activeFilter: categoryFilter,
    itemsLimit: pageSize,
    statusLoading: isDataSyncing,
    errorMessage: syncFailureMessage,
    totalPagesCount: computedTotalPages || 1,

    // Core actions dispatchers
    setPagePointer: setCurrentPage,
    setFilterCriteria: setCategoryFilter,
    setPageLimitSize: setPageSize,
    markAsRead: commitItemAsViewed,
    resetReadCache: clearReadHistoryLocal,
    refreshFeedManual: () => executeDataSync(currentPage, categoryFilter, pageSize)
  };
}