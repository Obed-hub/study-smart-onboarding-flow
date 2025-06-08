
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Clock, CheckCircle, Sparkles } from 'lucide-react';

const StepTwo = ({ fileData, onNext }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [topics, setTopics] = useState([]);

  // Simulate AI analysis
  useEffect(() => {
    const analyzeContent = async () => {
      setIsAnalyzing(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis results based on the uploaded file
      const mockTopics = [
        {
          title: "Introduction to Economics",
          subtopics: [
            "Definition of economics",
            "Basic economic problems",
            "Scarcity and choice",
            "Opportunity cost"
          ]
        },
        {
          title: "Demand and Supply",
          subtopics: [
            "Law of demand",
            "Law of supply",
            "Market equilibrium",
            "Factors affecting demand and supply"
          ]
        },
        {
          title: "Elasticity of Demand",
          subtopics: [
            "Price elasticity of demand",
            "Income elasticity of demand",
            "Cross elasticity of demand",
            "Factors affecting elasticity"
          ]
        },
        {
          title: "Consumer Behavior",
          subtopics: [
            "Utility theory",
            "Consumer preferences",
            "Budget constraints",
            "Consumer equilibrium"
          ]
        },
        {
          title: "Production and Costs",
          subtopics: [
            "Production function",
            "Types of costs",
            "Short-run and long-run costs",
            "Economies of scale"
          ]
        }
      ];

      setTopics(mockTopics);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    };

    analyzeContent();
  }, [fileData]);

  const handleGenerateQuestions = () => {
    onNext({
      topics,
      totalTopics: topics.length,
      totalSubtopics: topics.reduce((acc, topic) => acc + topic.subtopics.length, 0)
    });
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Analysis in Progress</h1>
          <p className="text-lg text-gray-600">
            Our AI is analyzing your {fileData.file.name} to extract key topics and concepts
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
              <h4 className="font-semibold text-blue-900 mb-2">Did you know?</h4>
              <p className="text-blue-800">
                Our AI can identify the most important concepts and create study-focused questions 
                that match your learning level and exam style.
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
          We've extracted {topics.length} major topics from your {fileData.subject} syllabus
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
