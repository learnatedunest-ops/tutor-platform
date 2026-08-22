import { cn } from "@/lib/utils";
import { AlertTriangle, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  private recoveryScheduled = false;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch() {
    if (this.recoveryScheduled || typeof window === "undefined") return;
    this.recoveryScheduled = true;
    window.setTimeout(() => window.location.replace("/"), 1500);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md p-8 text-center">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-2">We had trouble loading this page.</h2>
            <p className="text-sm text-muted-foreground mb-6">Taking you safely back to the EduNest homepage…</p>

            <button
              onClick={() => window.location.replace("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
            >
              <Home size={16} />
              Go to Homepage Now
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
