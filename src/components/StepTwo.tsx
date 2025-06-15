
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AnalysisLoading from "./AnalysisLoading";
import AnalysisError from "./AnalysisError";
import AnalysisSummary from "./AnalysisSummary";
import { useAnalyzeContent } from "@/hooks/useAnalyzeContent";

const StepTwo = ({ fileData, onNext }) => {
  const [retryToken, setRetryToken] = useState(0);
  const { toast } = useToast();
  const [topics, setTopics] = useState<any[]>([]);
  const [analysisDone, setAnalysisDone] = useState(false);

  const handleSuccess = (res) => {
    setTopics(res.topics);
    setAnalysisDone(true);
    toast({
      title: "Analysis Complete!",
      description: `Extracted ${res.totalTopics} topics with ${res.totalSubtopics} key concepts.`
    });
  };

  const handleError = (msg) => {
    setAnalysisDone(false);
    toast({
      title: "Analysis Failed",
      description: msg,
      variant: "destructive"
    });
  };

  // MAKE SURE HOOK IS CALLED BEFORE USAGE OF isLoading or error
  const { isLoading, error, result } = useAnalyzeContent({
    fileData,
    onSuccess: handleSuccess,
    onError: handleError,
    enabled: !analysisDone && !!fileData && !error && !isLoading && !topics.length,
  });

  // Retry triggers useEffect in useAnalyzeContent via key
  const handleRetry = () => {
    setAnalysisDone(false);
    setTopics([]);
    setRetryToken((t) => t + 1);
  };

  // Render conditionals using isLoading and error ONLY AFTER their declaration
  if (error) {
    return <AnalysisError error={error} onRetry={handleRetry} />;
  }
  if (isLoading || (!analysisDone && !error)) {
    return <AnalysisLoading fileName={fileData?.file?.name} />;
  }
  if (topics.length > 0) {
    return (
      <AnalysisSummary
        topics={topics}
        subject={fileData?.subject || "study material"}
        onNext={() => {
          onNext({
            topics,
            totalTopics: topics.length,
            totalSubtopics: topics.reduce((acc, topic) => acc + (topic.subtopics.length || 0), 0)
          });
        }}
      />
    );
  }
  return null;
};

export default StepTwo;
