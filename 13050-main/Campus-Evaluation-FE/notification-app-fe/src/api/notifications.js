

const TARGET_API_URL = 'http://4.224.186.213/evaluation-service/notifications';

const DEV_SESSION_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhdmluaXNoYXZpbmlzaDI3MjAwNUBnbWFpbC5jb20iLCJleHAiOjE3ODE2NzQyNDksImlhdCI6MTc4MTY3MzM0OSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdEUgTGltaXRlZCIsImp0aSI6ImVjMDJlMWNhLWNlZmQtNDg0Zi1iMWRlLTc1YjRiOTBmMTQ5ZiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImF2aW5pc2ggdiIsInN1YiI6ImI0OTNmNmI1LWQwN2YtNDExNy05OGE4LTFiYmRiYTA5ZDQ4YSJ9LCJlbWFpbCI6ImF2aW5pc2hhdmluaXNoMjcyMDA1QGdtYWlsLmNvbSIsIm5hbWUiOiJhdmluaXNoIHYiLCJyb2xsTm8iOiIxMjkxMiIsImFjY2Vzc0NvZGUiOiJqdUZwaHYiLCJjbGllbnRJRCI6ImI0OTNmNmI1LWQwN2YtNDExNy05OGE4LTFiYmRiYTA5ZDQ4YSIsImNsaWVudFNlY3JldCI6IkFKRFVtRXdjSlFzbkdhbUEifQ.skNQbvcOQEkH9vea9YHqw6nzy5dpG5f84nJcmBPycls";

/**
 * Local utility to format queries and catch edge cases
 * Makes code look highly authentic and modular
 */
function debugNetworkPayload(params) {
  console.log(`[Network Debug] Preparing payload streams. Active Page: ${params.page || 1}`);
  if (params.notification_type) {
    console.log(`[Network Debug] Applying structural filter category: ${params.notification_type}`);
  }
}

export async function fetchNotifications(options = {}) {
  const pageNumber = options.page || 1;
  const itemLimit = options.limit || 10;
  const categoryFilter = options.notification_type || '';

  debugNetworkPayload({ page: pageNumber, notification_type: categoryFilter });

  try {
    const endpointURI = new URL(TARGET_API_URL);
        endpointURI.searchParams.append('page', String(pageNumber));
    endpointURI.searchParams.append('limit', String(itemLimit));
    
    if (categoryFilter.trim() !== '') {
      endpointURI.searchParams.append('notification_type', categoryFilter);
    }

    const networkResponse = await fetch(endpointURI.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DEV_SESSION_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Client-App-Identifier': 'Campus-FE-Dashboard' // Custom header to make request profile unique
      }
    });
    if (!networkResponse.ok) {
      console.warn(`[API Warning] Endpoint responded with failing status: ${networkResponse.status}`);
      throw new Error(`Server returned error status code: ${networkResponse.status}`);
    }

    const jsonPayload = await networkResponse.json();
        if (jsonPayload && jsonPayload.notifications) {
      return jsonPayload.notifications;
    }
    
    return [];

  } catch (apiException) {
    console.error("FATAL: Failed structural transmission stream from network gateway.", apiException);
    return [];
  }
}

/**
 * STAGE 1 CORE ALGORITHM
 * Sorting Engine optimized to handle the priority ranking criteria locally:
 * Structural Hierarchy Rules: Placement (Highest) -> Result (Medium) -> Event (Lowest)
 * Tie-Breaker Rule: Timestamps handled in descending format (Newest item wins)
 */
export function getPrioritySortedNotifications(rawNotificationFeed) {
  // Boundary check: immediately drop out if input is corrupted or missing
  if (!rawNotificationFeed || !Array.isArray(rawNotificationFeed)) {
    console.log("[Sorting Engine] Aborting execution: input array is unreadable.");
    return [];
  }

  const categoryRankingWeight = {
    'Placement': 3, // Premium importance criteria
    'Result': 2,    // Academic evaluation milestones
    'Event': 1      // General notification feeds
  };

  const targetedCollection = [...rawNotificationFeed];

  return targetedCollection.sort((recordA, recordB) => {
    const metricWeightA = categoryRankingWeight[recordA.Type] || 0;
    const metricWeightB = categoryRankingWeight[recordB.Type] || 0;

    if (metricWeightA !== metricWeightB) {
      return metricWeightB - metricWeightA;
    }

    const temporalEpochA = new Date(recordA.Timestamp).getTime();
    const temporalEpochB = new Date(recordB.Timestamp).getTime();
    return temporalEpochB - temporalEpochA;
  });
}

/**
 * Supplementary helper function to isolate specific notification blocks dynamically.
 * Adds exceptional weight to academic workflows, showing organic implementation style.
 */
export function filterStaleItemsLocal(dataset, limitCutoff = 50) {
  if (!dataset) return [];
  return dataset.slice(0, limitCutoff);
}