import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, FileText, CheckCircle, AlertCircle, RefreshCw, Download, Share2, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // -------- TRIAL LIMIT REACHED UI --------
  if (error && isFree && freeLimit !== null) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Free Trial Limit Reached</h1>
          <p className="text-lg text-gray-600">
            You have reached your daily free trial limit ({freeUsed}/{freeLimit} questions).
          </p>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-900">Upgrade for Unlimited Access</h3>
              </div>
              <p className="text-yellow-800 mb-4">
                Upgrade to premium to unlock unlimited, high-quality AI-generated study questions and enhanced features!
              </p>
              <Button
                onClick={() => window.location.href = "/"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upgrade to Premium
              </Button>
              <Button
                variant="outline"
                onClick={handleRetry}
              >
                Try Again Tomorrow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Generation Failed</h1>
          <p className="text-lg text-gray-600">
            We encountered an error while generating your questions
          </p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Error Details</h3>
            </div>
            <p className="text-red-800 mb-4">{error}</p>
            <Button onClick={handleRetry} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Generating Questions</h1>
          <p className="text-lg text-gray-600">
            Creating personalized practice questions based on your study topics
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <User className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Creating Your Study Questions
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Crafting exam-style questions...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>Generating detailed explanations...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Organizing by difficulty level...</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Show free trial usage bar if relevant */}
        {isFree && freeLimit !== null && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center text-yellow-700">
                Free Trial: {freeUsed}/{freeLimit} questions generated today.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Brain className="w-6 h-6 mr-2" />
            Study Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {questions.filter(q => q.difficulty?.toLowerCase() === 'easy').length}
              </div>
              <div className="text-sm text-gray-600">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {questions.filter(q => q.difficulty?.toLowerCase() === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {questions.filter(q => q.difficulty?.toLowerCase() === 'hard').length}
              </div>
              <div className="text-sm text-gray-600">Hard</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <Button variant="outline" className="flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export Questions
        </Button>
        <Button variant="outline" className="flex items-center">
          <Share2 className="w-4 h-4 mr-2" />
          Share Session
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Start New Session
        </Button>
      </div>

      {/* Questions Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Questions</CardTitle>
          <CardDescription>
            Click on each question to reveal the answer and explanation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {questions.map((question, index) => (
              <AccordionItem key={question.id || index} value={`question-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left py-4">
                  <div className="flex items-start justify-between w-full mr-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">Q{index + 1}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty || 'Medium'}
                        </Badge>
                        <Badge variant="outline">{question.topic}</Badge>
                      </div>
                      <p className="text-gray-900 font-medium">{question.question}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Answer & Explanation:</h4>
                    <p className="text-gray-700 leading-relaxed">{question.answer}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
            <p className="text-blue-800 mb-4">
              Review these questions regularly, practice with different difficulty levels, 
              and create new sessions with additional study materials.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Create New Session
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                View All Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepThree;
