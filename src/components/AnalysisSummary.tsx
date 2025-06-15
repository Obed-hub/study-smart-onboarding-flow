
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Topic = {
  title: string;
  subtopics: string[];
};
interface Props {
  topics: Topic[];
  subject: string;
  onNext: () => void;
}
const AnalysisSummary = ({ topics, subject, onNext }: Props) => {
  const totalConcepts = topics.reduce((acc, topic) => acc + (topic.subtopics?.length || 0), 0);
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Analysis Complete!</h1>
        </div>
        <p className="text-lg text-gray-600">
          We've extracted {topics.length} major topics from your {subject}
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
                {totalConcepts}
              </div>
              <div className="text-sm text-gray-600">Key Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(totalConcepts * 2.5)}
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
              onClick={onNext}
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
export default AnalysisSummary;
