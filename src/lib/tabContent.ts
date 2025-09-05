export interface TabContent {
  content: string | null;
  url: string | null;
  title: string | null;
}

/**
 * Fetches the content of the currently active tab
 */
export async function getCurrentTabContent(): Promise<TabContent> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'GET_TAB_CONTENT' },
      (response: TabContent) => {
        console.log('Tab content fetched:', {
          url: response.url,
          title: response.title,
          contentLength: response.content?.length || 0
        });
        resolve(response);
      }
    );
  });
}

/**
 * Formats tab content for inclusion in AI prompts
 * The content is structured to provide clear context about the current page
 */
export function formatTabContentForPrompt(tabContent: TabContent): string {
  if (!tabContent.content) {
    return '';
  }

  return `

[CURRENT PAGE CONTEXT]
URL: ${tabContent.url}
Title: ${tabContent.title}
Content: ${tabContent.content}
[END CONTEXT]

Please use the above page content as context when answering my question. The content comes from the page I'm currently viewing.

`;
}
