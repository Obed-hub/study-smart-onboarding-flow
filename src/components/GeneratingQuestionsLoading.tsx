
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Brain, CheckCircle, User } from "lucide-react";

interface GeneratingQuestionsLoadingProps {
  isFree: boolean;
  freeUsed: number | null;
  freeLimit: number | null;
}

const GeneratingQuestionsLoading: React.FC<GeneratingQuestionsLoadingProps> = ({
  isFree,
  freeUsed,
  freeLimit,
}) => (
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

export default GeneratingQuestionsLoading;
