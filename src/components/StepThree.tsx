
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Database, Clock, CheckCircle, X, RotateCcw, Crown, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const StepThree = ({ analysisData, fileData }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  // Simulate question generation
  useEffect(() => {
    const generateQuestions = async () => {
      setIsGenerating(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock generated questions
      const mockQuestions = [
        {
          id: 1,
          question: "What is the definition of economics?",
          type: "multiple-choice",
          source: "AI",
          topic: "Introduction to Economics",
          options: [
            "Study of scarcity and choice",
            "Study of production and distribution",
            "Study of natural resources",
            "Study of market behavior"
          ],
          correctAnswer: 0,
          explanation: "Economics is fundamentally the study of scarcity and choice. It examines how individuals, businesses, and societies allocate limited resources to satisfy unlimited wants and needs.",
          difficulty: "Easy"
        },
        {
          id: 2,
          question: "What is the basic economic problem?",
          type: "multiple-choice",
          source: "AI",
          topic: "Introduction to Economics",
          options: [
            "Unlimited wants and limited resources",
            "Limited wants and unlimited resources",
            "Limited wants and limited resources",
            "Unlimited wants and unlimited resources"
          ],
          correctAnswer: 0,
          explanation: "The basic economic problem is the scarcity of resources relative to human wants. We have unlimited wants but limited resources to satisfy them, which necessitates choice and prioritization.",
          difficulty: "Medium"
        },
        {
          id: 3,
          question: "According to the law of demand, when the price of a good decreases, what happens?",
          type: "multiple-choice",
          source: "Database",
          topic: "Demand and Supply",
          options: [
            "Quantity demanded increases",
            "Quantity demanded decreases",
            "Quantity supplied increases",
            "Supply curve shifts"
          ],
          correctAnswer: 0,
          explanation: "The law of demand states that there is an inverse relationship between price and quantity demanded. When price decreases, quantity demanded increases, all other factors being equal.",
          difficulty: "Medium"
        },
        {
          id: 4,
          question: "Price elasticity of demand measures:",
          type: "multiple-choice",
          source: "AI",
          topic: "Elasticity of Demand",
          options: [
            "How quantity demanded responds to price changes",
            "How supply responds to demand changes",
            "How price responds to supply changes",
            "How income affects demand"
          ],
          correctAnswer: 0,
          explanation: "Price elasticity of demand measures the responsiveness of quantity demanded to changes in price. It's calculated as the percentage change in quantity demanded divided by the percentage change in price.",
          difficulty: "Hard"
        },
        {
          id: 5,
          question: "What is opportunity cost?",
          type: "multiple-choice",
          source: "Database",
          topic: "Introduction to Economics",
          options: [
            "The value of the next best alternative foregone",
            "The total cost of production",
            "The price paid for a good",
            "The benefit received from a choice"
          ],
          correctAnswer: 0,
          explanation: "Opportunity cost represents the value of the next best alternative that must be given up when making a choice. It's a fundamental concept in economics that helps in decision-making.",
          difficulty: "Medium",
          isPremium: true
        }
      ];

      setQuestions(mockQuestions);
      setIsGenerating(false);
    };

    generateQuestions();
  }, [analysisData]);

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitAnswer = (questionId) => {
    if (selectedAnswers[questionId] === undefined) {
      toast({
        title: "Please select an answer",
        description: "Choose an option before submitting.",
        variant: "destructive",
      });
      return;
    }

    const question = questions.find(q => q.id === questionId);
    const isCorrect = selectedAnswers[questionId] === question.correctAnswer;
    
    setShowResults(prev => ({
      ...prev,
      [questionId]: true
    }));

    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect ? "Great job! You got it right." : "Don't worry, keep practicing!",
      variant: isCorrect ? "default" : "destructive",
    });
  };

  const resetQuestion = (questionId) => {
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
    setShowResults(prev => {
      const newResults = { ...prev };
      delete newResults[questionId];
      return newResults;
    });
  };

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Generating Questions</h1>
          <p className="text-lg text-gray-600">
            Creating personalized exam-style questions based on your analysis
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto w-8 h-8 text-green-600" />
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Creating Your Practice Questions
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>✨ Generating multiple-choice questions</p>
                  <p>🎯 Matching your grade level and subject</p>
                  <p>📚 Including detailed explanations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const freeQuestions = questions.slice(0, 3);
  const premiumQuestions = questions.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Your Practice Questions</h1>
        </div>
        <p className="text-lg text-gray-600">
          {questions.length} exam-style questions generated from your {fileData.subject} material
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Brain className="w-6 h-6 mr-2 text-blue-600" />
              Question Summary
            </span>
            <div className="flex space-x-2">
              <Badge variant="secondary">{questions.filter(q => q.source === 'AI').length} AI Generated</Badge>
              <Badge variant="outline">{questions.filter(q => q.source === 'Database').length} Database</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{freeQuestions.length}</div>
              <div className="text-sm text-gray-600">Free Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{premiumQuestions.length}</div>
              <div className="text-sm text-gray-600">Premium Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {questions.filter(q => q.difficulty === 'Hard').length}
              </div>
              <div className="text-sm text-gray-600">Advanced Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="free" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="free">Free Questions ({freeQuestions.length})</TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center">
            <Crown className="w-4 h-4 mr-1" />
            Premium ({premiumQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="free" className="space-y-6">
          {freeQuestions.map((question, index) => (
            <Card key={question.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={question.source === 'AI' ? 'default' : 'secondary'}>
                      {question.source === 'AI' ? (
                        <><Brain className="w-3 h-3 mr-1" /> AI</>
                      ) : (
                        <><Database className="w-3 h-3 mr-1" /> DB</>
                      )}
                    </Badge>
                    <Badge variant="outline">{question.difficulty}</Badge>
                  </div>
                </div>
                <CardDescription className="text-base font-medium text-gray-800">
                  {question.question}
                </CardDescription>
                <p className="text-sm text-blue-600">Topic: {question.topic}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`q${question.id}_option${optionIndex}`}
                        name={`question_${question.id}`}
                        value={optionIndex}
                        checked={selectedAnswers[question.id] === optionIndex}
                        onChange={() => handleAnswerSelect(question.id, optionIndex)}
                        disabled={showResults[question.id]}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label 
                        htmlFor={`q${question.id}_option${optionIndex}`}
                        className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                          showResults[question.id]
                            ? optionIndex === question.correctAnswer
                              ? 'bg-green-50 border-green-300 text-green-800'
                              : selectedAnswers[question.id] === optionIndex
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-gray-50 border-gray-200'
                            : selectedAnswers[question.id] === optionIndex
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3 text-sm font-medium">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          {option}
                          {showResults[question.id] && optionIndex === question.correctAnswer && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                          {showResults[question.id] && selectedAnswers[question.id] === optionIndex && optionIndex !== question.correctAnswer && (
                            <X className="w-5 h-5 text-red-600 ml-auto" />
                          )}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                {showResults[question.id] && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetQuestion(question.id)}
                    disabled={!showResults[question.id]}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    onClick={() => handleSubmitAnswer(question.id)}
                    disabled={showResults[question.id] || selectedAnswers[question.id] === undefined}
                  >
                    Submit Answer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="premium" className="space-y-6">
          {!isPremium ? (
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="pt-8 text-center">
                <Crown className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Unlock Premium Questions</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get access to advanced questions, detailed explanations, and unlimited question generation.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span>✨ Advanced difficulty questions</span>
                    <span>📊 Progress tracking</span>
                    <span>🎯 Unlimited access</span>
                  </div>
                  <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                    Upgrade to Premium - $9.99/month
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            premiumQuestions.map((question, index) => (
              <Card key={question.id} className="hover:shadow-lg transition-shadow duration-300 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                      Premium Question {index + 1}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={question.source === 'AI' ? 'default' : 'secondary'}>
                        {question.source === 'AI' ? (
                          <><Brain className="w-3 h-3 mr-1" /> AI</>
                        ) : (
                          <><Database className="w-3 h-3 mr-1" /> DB</>
                        )}
                      </Badge>
                      <Badge variant="outline">{question.difficulty}</Badge>
                    </div>
                  </div>
                  <CardDescription className="text-base font-medium text-gray-800">
                    {question.question}
                  </CardDescription>
                  <p className="text-sm text-blue-600">Topic: {question.topic}</p>
                </CardHeader>
                <CardContent>
                  {/* Question content similar to free questions */}
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                          <span className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3 text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            {option}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" disabled>
                      <Lock className="w-4 h-4 mr-2" />
                      Premium Required
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6 text-center">
          <h4 className="font-semibold text-green-900 mb-2">Ready for More Practice?</h4>
          <p className="text-green-800 mb-4">
            Generate more questions from different topics or upload new study materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline">
              Generate More Questions
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Upload New Material
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepThree;
