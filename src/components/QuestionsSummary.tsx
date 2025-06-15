
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

interface Question {
  difficulty?: string;
}
interface QuestionsSummaryProps {
  questions: Question[];
}

const QuestionsSummary: React.FC<QuestionsSummaryProps> = ({ questions }) => {
  const countByDifficulty = (diff: string) =>
    questions.filter(q => q.difficulty?.toLowerCase() === diff).length;
  return (
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
              {countByDifficulty("easy")}
            </div>
            <div className="text-sm text-gray-600">Easy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {countByDifficulty("medium")}
            </div>
            <div className="text-sm text-gray-600">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {countByDifficulty("hard")}
            </div>
            <div className="text-sm text-gray-600">Hard</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionsSummary;
