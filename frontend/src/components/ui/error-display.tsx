"use client";

import { AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

type ErrorDisplayProps = {
  title: string;
  message: string;
  details?: string;
};

export function ErrorDisplay({ title, message, details }: ErrorDisplayProps) {
  const handleCopy = () => {
    if (details) {
      navigator.clipboard.writeText(details);
    }
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
        {details && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Error Details
            </Button>
            <pre className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs overflow-auto">
              {details}
            </pre>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
