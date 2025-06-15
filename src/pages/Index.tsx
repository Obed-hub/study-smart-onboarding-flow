import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Brain, FileText, Users, Star, CheckCircle, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import StepOne from '@/components/StepOne';
import StepTwo from '@/components/StepTwo';
import StepThree from '@/components/StepThree';
import AuthModal from '@/components/AuthModal';
import { supabase } from "@/integrations/supabase/client";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import UpgradeToPremium from "@/components/UpgradeToPremium";
import LandingPage from "@/components/LandingPage";
import ProgressBar from "@/components/ProgressBar";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { isPremium, loading: premiumLoading, userId } = usePremiumStatus();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newIsAuthenticated = !!session;
      setIsAuthenticated(newIsAuthenticated);
      
      if (_event === 'SIGNED_IN' && newIsAuthenticated) {
        setShowAuth(false);
        setCurrentStep(1);
      } else if (_event === 'SIGNED_OUT') {
        setCurrentStep(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const steps = [
    { icon: Upload, title: "Upload Syllabus", description: "Upload your course material" },
    { icon: Brain, title: "AI Analysis", description: "Extract key topics & concepts" },
    { icon: FileText, title: "Generate Questions", description: "Get exam-style Q&A" }
  ];

  const handleStartApp = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setCurrentStep(1);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Premium Required Overlay / Upgrade Prompt is now ONLY shown after free trial is used up!
  const renderPremiumBlock = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur">
      <div className="max-w-md w-full mx-auto">
        <UpgradeToPremium userId={userId || ""} />
      </div>
    </div>
  );

  if (currentStep === 0) {
    return (
      <LandingPage
        isAuthenticated={isAuthenticated}
        handleStartApp={handleStartApp}
        setShowAuth={setShowAuth}
        showAuth={showAuth}
        AuthModal={AuthModal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <ProgressBar
        steps={steps}
        currentStep={currentStep}
        onBackToHome={() => setCurrentStep(0)}
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Remove global isPremium blocking, StepThree now handles the trial gating */}
        {currentStep === 1 && (
          <StepOne
            onNext={(fileData) => {
              setUploadedFile(fileData);
              setCurrentStep(2);
            }}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            fileData={uploadedFile}
            onNext={(analysis) => {
              setAnalysisData(analysis);
              setCurrentStep(3);
            }}
          />
        )}
        {currentStep === 3 && (
          <StepThree
            analysisData={analysisData}
            fileData={uploadedFile}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
