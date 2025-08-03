// Function to handle changes in download status
chrome.downloads.onChanged.addListener((downloadDelta) => {
  // Log the download ID and its changes for debugging purposes
  console.log(`Download ID: ${downloadDelta.id}`);
  console.log('Download Delta:', JSON.stringify(downloadDelta, null, 2));

  // Check if the download's state has changed to 'interrupted'
  if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
    console.log(`Download ${downloadDelta.id} is interrupted. Attempting to resume...`);
    // Attempt to resume the download using its ID
    chrome.downloads.resume(downloadDelta.id, () => {
      // Check if there was an error during the resume attempt
      if (chrome.runtime.lastError) {
        console.error(`Error resuming download ${downloadDelta.id}:`, chrome.runtime.lastError.message);
      } else {
        console.log(`Successfully requested resume for download ${downloadDelta.id}.`);
      }
    });
  }

  // Also check if the 'paused' property has changed to 'true'
  // This is often how a manual pause is reported by the API
  if (downloadDelta.paused && downloadDelta.paused.current === true) {
    console.log(`Download ${downloadDelta.id} is paused. Attempting to resume...`);
    // Attempt to resume the download using its ID
    chrome.downloads.resume(downloadDelta.id, () => {
      // Check if there was an error during the resume attempt
      if (chrome.runtime.lastError) {
        console.error(`Error resuming download ${downloadDelta.id}:`, chrome.runtime.lastError.message);
      } else {
        console.log(`Successfully requested resume for download ${downloadDelta.id}.`);
      }
    });
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