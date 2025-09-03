import { authenticate, refreshTokens } from "@/lib/echoAuth";

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Web Cmd+K is installed');

    // Set default side panel options
    try {
        await chrome.sidePanel.setOptions({
            enabled: true,
            path: 'index.html',
        });
    } catch (error) {
        console.error('Error setting side panel options:', error);
    }

    // Enable side panel on toolbar click
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-side-panel') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (tabId) {
              console.log("Opening side panel on tab:", tabId);
              chrome.sidePanel.open({ tabId });
            } else {
              console.warn("No active tab found");
            }
          });
    }
});

// Echo message handlers
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.action) {
        case 'AUTHENTICATE':
            console.log('Authentication request');
            authenticate(message, async (response) => {
                if (response.success && response.echoUser && response.tokenData) {
                    // Store authentication data in chrome storage
                    await chrome.storage.local.set({
                        echo_user: response.echoUser,
                        echo_access_token: response.tokenData.accessToken,
                        echo_refresh_token: response.tokenData.refreshToken,
                        echo_access_token_expires_at: response.tokenData.accessTokenExpiresAt,
                        echo_refresh_token_expires_at: response.tokenData.refreshTokenExpiresAt,
                    });
                }
                sendResponse(response);
            });
            break;
        case 'GET_USER':
            chrome.storage.local.get(['echo_user'], (result) => {
                sendResponse({ user: result.echo_user || null });
            });
            break;
        case 'GET_TOKEN':
            console.log('Getting Echo token')
            chrome.storage.local.get([
                'echo_access_token',
                'echo_access_token_expires_at',
                'echo_refresh_token',
                'echo_refresh_token_expires_at'
            ], (result) => {
                const now = Date.now();
                if (result.echo_access_token && result.echo_access_token_expires_at && now < result.echo_access_token_expires_at) {
                    sendResponse({ token: result.echo_access_token });
                } else {
                    refreshTokens(result.echo_refresh_token, message.params.echoBaseUrl, message.params.echoClientId, async (response) => {
                    if (response.success && response.tokenData) {
                        chrome.storage.local.set({
                            echo_access_token: response.tokenData.accessToken,
                            echo_access_token_expires_at: response.tokenData.accessTokenExpiresAt,
                            echo_refresh_token: response.tokenData.refreshToken,
                            echo_refresh_token_expires_at: response.tokenData.refreshTokenExpiresAt,
                        });
                            sendResponse({ token: response.tokenData.accessToken });
                        } else {
                            console.error('Error refreshing tokens:', response.error);
                            sendResponse({ token: null });
                        }
                    });
                }
            });
            break;
        case 'CHECK_AUTH':
            chrome.storage.local.get([
                'echo_user',
                'echo_access_token',
                'echo_access_token_expires_at'
            ], (result) => {
                const now = Date.now();
                const isAuthenticated = result.echo_user && 
                    result.echo_access_token && 
                    result.echo_access_token_expires_at &&
                    now < result.echo_access_token_expires_at;
                
                sendResponse({ 
                    isAuthenticated,
                    user: isAuthenticated ? result.echo_user : null,
                    token: isAuthenticated ? result.echo_access_token : null
                });
            });
            break;
        case 'SIGN_OUT':
            chrome.storage.local.remove([
                'echo_user',
                'echo_access_token',
                'echo_refresh_token',
                'echo_access_token_expires_at',
                'echo_refresh_token_expires_at'
            ], () => {
                sendResponse({ success: true });
            });
            break;
    }
    return true; // Keep the message channel open for async responses
});