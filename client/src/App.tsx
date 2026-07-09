import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import FindTutor from "./pages/FindTutor";
import BecomeTutor from "./pages/BecomeTutor";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TutorProfile from "./pages/TutorProfile";
import Subjects from "./pages/Subjects";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import WhatsAppButton from "./components/WhatsAppButton";
import Admin from "./pages/Admin";
import StudentPortal from "./pages/StudentPortal";
import SEOGuide from "./pages/SEOGuide";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/find-tutor" component={FindTutor} />
      <Route path="/become-tutor" component={BecomeTutor} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/tutor/:id" component={TutorProfile} />
      <Route path="/admin" component={Admin} />
      <Route path="/portal" component={StudentPortal} />
      <Route path="/seo-guide" component={SEOGuide} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
