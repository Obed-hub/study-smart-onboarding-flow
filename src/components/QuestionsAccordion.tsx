
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface Question {
  id?: string;
  topic?: string;
  question?: string;
  answer?: string;
  difficulty?: string;
}
interface QuestionsAccordionProps {
  questions: Question[];
  getDifficultyColor: (difficulty?: string) => string;
}

const QuestionsAccordion: React.FC<QuestionsAccordionProps> = ({
  questions,
  getDifficultyColor,
}) => (
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
          <AccordionItem
            key={question.id || index}
            value={`question-${index}`}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-left py-4">
              <div className="flex items-start justify-between w-full mr-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">Q{index + 1}</Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty || "Medium"}
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
);

export default QuestionsAccordion;
