
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, RefreshCw } from "lucide-react";

interface ActionButtonsProps {
  onStartNewSession: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onStartNewSession }) => (
  <div className="flex justify-center space-x-4 mb-6">
    <Button variant="outline" className="flex items-center">
      <Download className="w-4 h-4 mr-2" />
      Export Questions
    </Button>
    <Button variant="outline" className="flex items-center">
      <Share2 className="w-4 h-4 mr-2" />
      Share Session
    </Button>
    <Button
      onClick={onStartNewSession}
      className="bg-blue-600 hover:bg-blue-700 flex items-center"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Start New Session
    </Button>
  </div>
);

export default ActionButtons;
