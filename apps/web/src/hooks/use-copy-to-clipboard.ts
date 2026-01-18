import * as React from "react";

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      setIsCopied(false);
    }
  }, []);

  return { copyToClipboard, isCopied };
}
