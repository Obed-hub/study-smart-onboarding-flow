
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NextStepsCard = () => (
  <Card className="bg-blue-50 border-blue-200">
    <CardContent className="pt-6">
      <div className="text-center">
        <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
        <p className="text-blue-800 mb-4">
          Review these questions regularly, practice with different difficulty levels,
          and create new sessions with additional study materials.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Create New Session
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            View All Sessions
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default NextStepsCard;
