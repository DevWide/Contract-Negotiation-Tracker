// Contract Negotiation Tracker - SectionErrorBoundary Component
// Lightweight error boundary for individual app sections that doesn't crash the whole app

import React, { Component, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  /** Name of the section for display in error message */
  sectionName?: string;
  /** Optional fallback content to display instead of default error UI */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Custom class for the error container */
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console for debugging
    console.error(`Error in ${this.props.sectionName || 'section'}:`, error, errorInfo);
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI for sections
      return (
        <Card className={cn("border-destructive/50", this.props.className)}>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
            <h3 className="font-medium text-sm mb-1">
              {this.props.sectionName 
                ? `Failed to load ${this.props.sectionName}` 
                : 'Something went wrong'}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">
              {this.state.error?.message || 'An unexpected error occurred. Try again.'}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
