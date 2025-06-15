
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  error: string;
  onRetry: () => void;
}
const AnalysisError = ({ error, onRetry }: Props) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis Failed</h1>
      <p className="text-lg text-gray-600">
        We encountered an error while analyzing your content.
      </p>
    </div>
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Error Details</h3>
        </div>
        <p className="text-red-800 mb-4">{error}</p>
        <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default AnalysisError;
