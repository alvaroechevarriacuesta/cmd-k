import type { Context } from "@/components/chat/ChatWindow";

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
      { action: "GET_TAB_CONTENT" },
      (response: TabContent) => {
        console.log("Tab content fetched:", {
          url: response.url,
          title: response.title,
          contentLength: response.content?.length || 0,
        });
        resolve(response);
      },
    );
  });
}

export async function getContextFromTabs(
  contexts: Context[],
): Promise<TabContent[]> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "GET_CONTEXT_FROM_TABS", contexts },
      (response: TabContent[]) => {
        resolve(response);
      },
    );
  });
}

/**
 * Formats tab content for inclusion in AI prompts
 * The content is structured to provide clear context about the current page
 */
export function formatTabContentForPrompt(tabContent: TabContent): string {
  if (!tabContent.content) {
    return "";
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

/**
 * Formats multiple tab contents for inclusion in system prompts
 * The content is structured to provide clear context about multiple pages
 */
export function formatMultipleTabContentsForSystemPrompt(
  tabContents: TabContent[],
): string {
  if (!tabContents || tabContents.length === 0) {
    return "";
  }

  const filteredContents = tabContents.filter(
    (tab) => tab.content && tab.content.trim().length > 0,
  );

  if (filteredContents.length === 0) {
    return "";
  }

  const contextSections = filteredContents
    .map(
      (tab, index) => `
[CONTEXT ${index + 1}]
URL: ${tab.url}
Title: ${tab.title}
Content: ${tab.content}
[END CONTEXT ${index + 1}]`,
    )
    .join("\n");

  return `
Here is additional context that the user provided, if relevant please use it to answer the question:

${contextSections}

`;
}
