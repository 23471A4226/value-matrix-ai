import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, MicOff, TrendingUp } from "lucide-react";

const VoicePredict = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [prediction, setPrediction] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Error",
          description: "Speech recognition error. Please try again.",
          variant: "destructive",
        });
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak now to describe the property...",
      });
    }
  };

  const handlePredict = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "Please record a description first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const { data, error } = await supabase.functions.invoke('predict-price', {
        body: {
          type: 'voice',
          data: {
            transcript: transcript.trim(),
          },
        },
      });

      if (error) throw error;

      setPrediction(data);

      // Save to history
      const { error: saveError } = await supabase.from('predictions').insert({
        user_id: session.user.id,
        prediction_type: 'voice',
        predicted_price: data.predicted_price,
        voice_transcript: transcript.trim(),
      });

      if (saveError) console.error('Error saving prediction:', saveError);

      toast({
        title: "Prediction Complete!",
        description: `Estimated price: ₹${data.predicted_price.toLocaleString('en-IN')}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to predict price",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Voice-Based Price Prediction</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Describe the Property</CardTitle>
                <CardDescription>
                  Speak in any language to describe the house. Click stop when you're finished.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-6 p-8">
                  <button
                    onClick={toggleRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-destructive hover:bg-destructive/90 shadow-glow animate-pulse'
                        : 'bg-gradient-primary hover:shadow-medium'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-16 w-16 text-destructive-foreground" />
                    ) : (
                      <Mic className="h-16 w-16 text-primary-foreground" />
                    )}
                  </button>
                  
                  <div className="text-center">
                    <p className="font-semibold mb-1">
                      {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Describe bedrooms, floors, area, location, amenities
                    </p>
                  </div>
                </div>

                {transcript && (
                  <div className="bg-secondary p-4 rounded-lg">
                    <div className="text-sm font-semibold mb-2">Transcript</div>
                    <p className="text-sm">{transcript}</p>
                  </div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  disabled={loading || !transcript || isRecording}
                  onClick={handlePredict}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Predict Price
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {prediction && (
              <Card className="shadow-medium animate-slide-up">
                <CardHeader>
                  <CardTitle>Price Prediction</CardTitle>
                  <CardDescription>AI analysis based on voice description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-primary p-6 rounded-lg text-center">
                    <div className="text-sm text-primary-foreground/80 mb-2">Estimated Price</div>
                    <div className="text-4xl font-bold text-primary-foreground">
                      ₹{prediction.predicted_price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {prediction.price_range && (
                    <div className="bg-secondary p-4 rounded-lg">
                      <div className="text-sm font-semibold mb-2">Price Range</div>
                      <div className="flex justify-between text-sm">
                        <span>Min: ₹{prediction.price_range.min.toLocaleString('en-IN')}</span>
                        <span>Max: ₹{prediction.price_range.max.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-semibold mb-2">Analysis</div>
                    <p className="text-sm text-muted-foreground">{prediction.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePredict;
