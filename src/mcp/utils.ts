export function formatToolResult(result: any): string {
    try {
      if (typeof result === "string") {        
        try {
          const parsedResult = JSON.parse(result);
          return JSON.stringify(parsedResult, null, 2);
        } catch {
          return result;
        }
      } else if (result && result.content && Array.isArray(result.content)) {        
        return result.content
          .filter((item: any) => item.type === "text")
          .map((item: any) => {
            try {
              return JSON.stringify(JSON.parse(item.text), null, 2);
            } catch {
              return item.text;
            }
          })
          .join("\n");
      } else {        
        return JSON.stringify(result, null, 2);
      }
    } catch (error) {
      console.error("格式化结果出错:", error);
      return String(result);
    }
  }