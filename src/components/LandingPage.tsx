
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, FileText, Users, Star, CheckCircle, ArrowRight, BookOpen, Target, Zap } from "lucide-react";

interface LandingPageProps {
  isAuthenticated: boolean;
  handleStartApp: () => void;
  setShowAuth: (show: boolean) => void;
  showAuth: boolean;
  AuthModal: React.ComponentType<any>;
}

const LandingPage: React.FC<LandingPageProps> = ({
  isAuthenticated,
  handleStartApp,
  setShowAuth,
  showAuth,
  AuthModal,
}) => {
  const steps = [
    { icon: Upload, title: "Upload Syllabus", description: "Upload your course material" },
    { icon: Brain, title: "AI Analysis", description: "Extract key topics & concepts" },
    { icon: FileText, title: "Generate Questions", description: "Get exam-style Q&A" }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Learning
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Study Materials</span>
              <br />into Smart Q&A
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload your syllabus, get AI-generated questions, and ace your exams. 
              Join thousands of students already improving their grades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button onClick={handleStartApp} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                {isAuthenticated ? 'Go to App' : 'Try It Free'} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-2">
                Watch Demo
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600">Grade Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500k+</div>
                <div className="text-gray-600">Questions Generated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes exam preparation effortless and effective
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <Card key={index} className="relative border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Students Love Our Platform
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: BookOpen, title: "Smart Analysis", desc: "AI extracts key topics and concepts from any syllabus" },
              { icon: Target, title: "Exam-Style Questions", desc: "Generate questions that match your exam format" },
              { icon: Brain, title: "Detailed Explanations", desc: "Understand concepts with comprehensive answers" },
              { icon: Users, title: "Study Groups", desc: "Share questions with classmates and study together" },
              { icon: Star, title: "Progress Tracking", desc: "Monitor your improvement over time" },
              { icon: CheckCircle, title: "Verified Content", desc: "AI-generated content reviewed for accuracy" }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Sarah Chen", grade: "A+ in Physics", quote: "This app helped me understand complex concepts and ace my finals!" },
              { name: "Michael Rodriguez", grade: "B+ to A in History", quote: "The AI questions were spot-on with my actual exam questions." },
              { name: "Emma Thompson", grade: "95% in Biology", quote: "I love how it breaks down my syllabus into manageable study points." }
            ].map((testimonial, index) => (
              <Card key={index} className="border-2 border-gray-100">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-green-600 font-medium">{testimonial.grade}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Boost Your Grades?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using AI to improve their study efficiency
          </p>
          <Button onClick={handleStartApp} size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
            {isAuthenticated ? 'Go to App' : 'Start Your Free Trial'} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
      {/* Auth Modal */}
      {showAuth && (
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)}
          onAuthenticated={() => {
            setShowAuth(false);
          }}
        />
      )}
    </div>
  );
};

export default LandingPage;
