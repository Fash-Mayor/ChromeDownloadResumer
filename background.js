// A Map to store the retry count and timeout ID for each download
const retryAttempts = new Map();

// Constants for retry logic
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 2000; // 2 seconds

// Function to handle changes in download status
chrome.downloads.onChanged.addListener((downloadDelta) => {
  console.log(`Download ID: ${downloadDelta.id}`);
  console.log('Download Delta:', JSON.stringify(downloadDelta, null, 2));

  // Use parentheses to ensure correct order of evaluation**
  if (downloadDelta.state && (downloadDelta.state.current === 'in_progress' || downloadDelta.state.current === 'complete')) {
    if (retryAttempts.has(downloadDelta.id)) {
      clearTimeout(retryAttempts.get(downloadDelta.id).timeoutId);
      retryAttempts.delete(downloadDelta.id);
      console.log(`Cleared retry logic for download ${downloadDelta.id}.`);
    }
  }

  // Use a separate function for the resume attempt**
  const attemptResume = (downloadId) => {
    // Check if we've reached the maximum number of retries
    const attempts = (retryAttempts.has(downloadId) ? retryAttempts.get(downloadId).count : 0) + 1;

    if (attempts > MAX_RETRIES) {
      console.error(`Download ${downloadId} has failed to resume after ${MAX_RETRIES} attempts. Giving up.`);
      retryAttempts.delete(downloadId); // Clean up the retry state
      return;
    }

    // Calculate exponential backoff delay
    const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempts - 1);
    console.log(`Attempting to resume download ${downloadId}. Attempt #${attempts} with a delay of ${delay}ms.`);

    // Set a timeout to attempt the resume after the delay
    const timeoutId = setTimeout(() => {
      chrome.downloads.resume(downloadId, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error resuming download ${downloadId}:`, chrome.runtime.lastError.message);
          // If it fails, schedule another retry
          retryAttempts.set(downloadId, { count: attempts, timeoutId: null });
          attemptResume(downloadId);
        } else {
          console.log(`Successfully requested resume for download ${downloadId}.`);
          retryAttempts.delete(downloadId); // Success, so clean up
        }
      });
    }, delay);

    // Store the timeout ID so we can clear it if the download state changes
    retryAttempts.set(downloadId, { count: attempts, timeoutId });
  };

  // Check if the download's state has changed to 'interrupted'
  if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
    console.log(`Download ${downloadDelta.id} is interrupted. Initializing resume logic.`);
    // Start the retry process
    attemptResume(downloadDelta.id);
  }

  // Also check if the 'paused' property has changed to 'true'
  if (downloadDelta.paused && downloadDelta.paused.current === true) {
    console.log(`Download ${downloadDelta.id} is paused. Initializing resume logic.`);
    // Start the retry process
    attemptResume(downloadDelta.id);
  }

  // Log other state changes for monitoring
  if (downloadDelta.state) {
    const newState = downloadDelta.state.current;
    if (newState === 'complete') {
      console.log(`Download ${downloadDelta.id} is complete.`);
    } else if (newState === 'in_progress') {
      console.log(`Download ${downloadDelta.id} is in progress.`);
    }
  }
});

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Auto Download Resumer extension installed or updated.");
});