
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Topic {
  title: string;
  subtopics: string[];
}
interface AnalysisResult {
  topics: Topic[];
  totalTopics: number;
  totalSubtopics: number;
}
interface UseAnalyzeContentProps {
  fileData: any;
  onSuccess: (result: AnalysisResult) => void;
  onError: (msg: string) => void;
  enabled: boolean;
}

export function useAnalyzeContent({ fileData, onSuccess, onError, enabled }: UseAnalyzeContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!fileData || !enabled) return;
    setError(null);
    setResult(null);

    async function analyze() {
      setIsLoading(true);
      const inputContent = fileData.textContent || fileData.subject;
      const inputType = fileData.textContent ? "text" : "topic";
      const timeout = 60000; // ms

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Analysis timed out after 60 seconds. The server might be busy. Please try again.")), timeout)
      );

      let response: any;
      try {
        response = await Promise.race([
          supabase.functions.invoke("ai-study-assistant", {
            body: { action: "analyze", input: inputContent, inputType }
          }),
          timeoutPromise
        ]);
      } catch (err: any) {
        setError(err.message || "Unknown analysis error");
        onError(err.message || "Unknown analysis error");
        setIsLoading(false);
        return;
      }

      if (response?.error) {
        setError(response.error.message || "Server error in analysis.");
        onError(response.error.message || "Server error in analysis.");
        setIsLoading(false);
        return;
      }
      if (response?.data?.error) {
        setError(response.data.error);
        onError(response.data.error);
        setIsLoading(false);
        return;
      }
      if (!response?.data?.topics || !Array.isArray(response.data.topics)) {
        setError("Invalid analysis result received from the server.");
        onError("Invalid analysis result received from the server.");
        setIsLoading(false);
        return;
      }

      const topics: Topic[] = response.data.topics;
      const analysisRes: AnalysisResult = {
        topics,
        totalTopics: topics.length,
        totalSubtopics: topics.reduce((a, t) => a + (t.subtopics?.length || 0), 0)
      };
      setResult(analysisRes);
      onSuccess(analysisRes);
      setIsLoading(false);
    }
    analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData, enabled]);

  return { isLoading, error, result, setError, setResult };
}
