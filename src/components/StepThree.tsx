import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, FileText, CheckCircle, AlertCircle, RefreshCw, Download, Share2, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import TrialLimitReached from "./TrialLimitReached";
import GenerationError from "./GenerationError";
import GeneratingQuestionsLoading from "./GeneratingQuestionsLoading";
import QuestionsSummary from "./QuestionsSummary";
import ActionButtons from "./ActionButtons";
import QuestionsAccordion from "./QuestionsAccordion";
import NextStepsCard from "./NextStepsCard";

const StepThree = ({ analysisData, fileData }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [freeLimit, setFreeLimit] = useState(null); // trial info
  const [freeUsed, setFreeUsed] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const generateQuestions = async () => {
      try {
        setIsGenerating(true);
        setError(null);

        console.log('Generating questions for analysis:', analysisData);

        const response = await supabase.functions.invoke('ai-study-assistant', {
          body: {
            action: 'generate-questions',
            analysisData: analysisData
          }
        });

        if (response.error) {
          if (response.error.limitReached) {
            setFreeLimit(response.error.questionsAllowed || 5);
            setFreeUsed(response.error.questionsUsed || freeLimit);
            setIsFree(true);
            setError("Trial limit reached. Please upgrade to premium for unlimited questions.");
            setIsGenerating(false);
            return;
          }
          throw new Error(response.error.message || response.error || 'Question generation failed');
        }

        const result = response.data;
        console.log('Generated questions:', result);

        setQuestions(result.questions || []);
        setSessionId(result.sessionId);
        setIsGenerating(false);

        // Free trial stats
        if (result.freeTrial) {
          setIsFree(true);
          setFreeLimit(result.questionsAllowed || 5);
          setFreeUsed(result.questionsUsed || 0);
        } else {
          setIsFree(false);
        }

        toast({
          title: "Questions Generated!",
          description: `Created ${result.totalQuestions} practice questions for your study session.`,
        });

      } catch (error) {
        console.error('Question generation error:', error);
        setError(error.message);
        setIsGenerating(false);

        toast({
          title: "Generation Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (analysisData && analysisData.topics) {
      generateQuestions();
    }
    // eslint-disable-next-line
  }, [analysisData, toast]);

  const handleRetry = () => {
    setError(null);
    setIsGenerating(true);
    // Re-trigger generation
    window.location.reload();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error && isFree && freeLimit !== null) {
    return (
      <TrialLimitReached
        freeUsed={freeUsed}
        freeLimit={freeLimit}
        handleRetry={handleRetry}
      />
    );
  }

  if (error) {
    return <GenerationError error={error} handleRetry={handleRetry} />;
  }

  if (isGenerating) {
    return (
      <GeneratingQuestionsLoading
        isFree={isFree}
        freeUsed={freeUsed}
        freeLimit={freeLimit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            Questions Ready!
            {isFree && freeLimit !== null && (
              <span className="ml-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-normal">
                Free Trial: {questions.length}/{freeLimit} today
              </span>
            )}
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Generated {questions.length} practice questions based on your study material
        </p>
      </div>
      <QuestionsSummary questions={questions} />
      <ActionButtons onStartNewSession={() => window.location.reload()} />
      <QuestionsAccordion
        questions={questions}
        getDifficultyColor={getDifficultyColor}
      />
      <NextStepsCard />
    </div>
  );
};

export default StepThree;
