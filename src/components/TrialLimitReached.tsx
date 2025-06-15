
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface TrialLimitReachedProps {
  freeUsed: number;
  freeLimit: number;
  handleRetry: () => void;
}

const TrialLimitReached: React.FC<TrialLimitReachedProps> = ({
  freeUsed,
  freeLimit,
  handleRetry,
}) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Free Trial Limit Reached</h1>
      <p className="text-lg text-gray-600">
        You have reached your daily free trial limit ({freeUsed}/{freeLimit} questions).
      </p>
    </div>
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">Upgrade for Unlimited Access</h3>
          </div>
          <p className="text-yellow-800 mb-4">
            Upgrade to premium to unlock unlimited, high-quality AI-generated study questions and enhanced features!
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upgrade to Premium
          </Button>
          <Button
            variant="outline"
            onClick={handleRetry}
          >
            Try Again Tomorrow
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default TrialLimitReached;
