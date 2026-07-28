import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const ContentContext = createContext(null);

export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/content");
      setContent(data);
    } catch (e) {
      console.error("content load failed", e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ContentContext.Provider value={{ content, setContent, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}
