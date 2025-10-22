import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Calculator, Image, Mic, TrendingUp, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-house.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Predict House Prices with{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  AI Precision
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                ValueMatrix uses advanced machine learning to provide accurate house price predictions in rupees. 
                Upload images, use voice input, or enter details manually.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/predict">
                  <Button variant="hero" size="xl" className="gap-2">
                    <Calculator className="h-5 w-5" />
                    Start Predicting
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="xl">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-3xl" />
              <img
                src={heroImage}
                alt="Luxury modern house"
                className="relative rounded-2xl shadow-strong w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Multiple Ways to Predict
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Choose the method that works best for you
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/predict" className="group">
              <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 border border-border h-full">
                <div className="w-14 h-14 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calculator className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Manual Input</h3>
                <p className="text-muted-foreground">
                  Enter property details like bedrooms, floors, area, location, and amenities for precise predictions.
                </p>
              </div>
            </Link>

            <Link to="/image-predict" className="group">
              <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 border border-border h-full">
                <div className="w-14 h-14 bg-gradient-accent rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Image className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Image Analysis</h3>
                <p className="text-muted-foreground">
                  Upload photos of the property and let our AI analyze the ambiance and features to predict the price.
                </p>
              </div>
            </Link>

            <Link to="/voice-predict" className="group">
              <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 border border-border h-full">
                <div className="w-14 h-14 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mic className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Voice Description</h3>
                <p className="text-muted-foreground">
                  Describe the property in any language. Our multilingual AI will understand and predict the price.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose ValueMatrix?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">ML-Powered Accuracy</h3>
              <p className="text-muted-foreground">
                Advanced regression models trained on comprehensive market data for reliable predictions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is protected with enterprise-grade security. All predictions are stored securely.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Results</h3>
              <p className="text-muted-foreground">
                Get price predictions in seconds, with detailed breakdowns and market insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto bg-gradient-primary p-12 rounded-2xl shadow-strong">
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join thousands of users who trust ValueMatrix for accurate house price predictions.
            </p>
            <Link to="/auth">
              <Button variant="accent" size="xl" className="gap-2">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-8 px-4 text-primary-foreground">
        <div className="container mx-auto text-center">
          <p className="text-sm opacity-80">
            © 2025 ValueMatrix. All rights reserved. Powered by advanced AI and machine learning.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
