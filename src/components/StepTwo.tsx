import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Clock, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StepTwo = ({ fileData, onNext }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Analyze content using AI
  useEffect(() => {
    const analyzeContent = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);

        console.log('Starting AI analysis for:', fileData);

        // Prepare input content - if there's textContent, use that, otherwise use the subject
        const inputContent = fileData.textContent || fileData.subject;
        const inputType = fileData.textContent ? 'text' : 'topic';

        const response = await supabase.functions.invoke('ai-study-assistant', {
          body: {
            action: 'analyze',
            input: inputContent,
            inputType: inputType
          }
        });

        if (response.error) {
          throw new Error(response.error.message || 'Analysis failed');
        }

        const analysisResult = response.data;
        console.log('Analysis result:', analysisResult);

        setTopics(analysisResult.topics || []);
        setIsAnalyzing(false);
        setAnalysisComplete(true);

        toast({
          title: "Analysis Complete!",
          description: `Extracted ${analysisResult.totalTopics} topics with ${analysisResult.totalSubtopics} key concepts.`,
        });

      } catch (error) {
        console.error('Analysis error:', error);
        setError(error.message);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (fileData) {
      analyzeContent();
    }
  }, [fileData, toast]);

  const handleGenerateQuestions = () => {
    onNext({
      topics,
      totalTopics: topics.length,
      totalSubtopics: topics.reduce((acc, topic) => acc + topic.subtopics.length, 0)
    });
  };

  const handleRetry = () => {
    setError(null);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    // Re-trigger the analysis
    window.location.reload();
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis Failed</h1>
          <p className="text-lg text-gray-600">
            We encountered an error while analyzing your content
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
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Analysis in Progress</h1>
          <p className="text-lg text-gray-600">
            Our AI is analyzing your {fileData?.file?.name || 'study material'} to extract key topics and concepts
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Analyzing Your Study Material
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Processing document structure...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Extracting key topics and concepts...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Organizing study points...</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="font-semibold text-blue-900 mb-2">Powered by Google Gemini AI</h4>
              <p className="text-blue-800">
                Our AI analyzes your content to identify the most important concepts and creates 
                study-focused questions that match your learning level and exam style.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Analysis Complete!</h1>
        </div>
        <p className="text-lg text-gray-600">
          We've extracted {topics.length} major topics from your {fileData?.subject || 'study material'}
        </p>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Brain className="w-6 h-6 mr-2" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{topics.length}</div>
              <div className="text-sm text-gray-600">Major Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {topics.reduce((acc, topic) => acc + topic.subtopics.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Key Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(topics.reduce((acc, topic) => acc + topic.subtopics.length, 0) * 2.5)}
              </div>
              <div className="text-sm text-gray-600">Potential Questions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {topics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{topic.title}</span>
                  <Badge variant="secondary">{topic.subtopics.length} concepts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.subtopics.map((subtopic, subIndex) => (
                    <li key={subIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{subtopic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-semibold text-yellow-900 mb-2">Ready for Question Generation?</h4>
            <p className="text-yellow-800 mb-4">
              Our AI will now create targeted questions based on these topics to help you master the material.
            </p>
            <Button 
              onClick={handleGenerateQuestions}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={topics.length === 0}
            >
              Generate Practice Questions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepTwo;
