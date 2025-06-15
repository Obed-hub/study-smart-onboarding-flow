
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Clock, Sparkles } from "lucide-react";

const AnalysisLoading = ({ fileName }: { fileName?: string }) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Analysis in Progress</h1>
      <p className="text-lg text-gray-600">
        Our AI is analyzing your {fileName ?? "study material"} to extract key topics and concepts
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

export default AnalysisLoading;
