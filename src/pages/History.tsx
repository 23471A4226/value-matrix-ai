import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Calculator, Image, Mic } from "lucide-react";

const History = () => {
  const [session, setSession] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadPredictions(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadPredictions(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadPredictions = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive",
      });
    } else {
      setPredictions(data || []);
    }
    setLoading(false);
  };

  const deletePrediction = async (id: string) => {
    const { error } = await supabase.from('predictions').delete().eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete prediction",
        variant: "destructive",
      });
    } else {
      setPredictions(predictions.filter(p => p.id !== id));
      toast({
        title: "Deleted",
        description: "Prediction removed from history",
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'manual': return <Calculator className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'voice': return <Mic className="h-5 w-5" />;
      default: return null;
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Prediction History</h1>
          
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : predictions.length === 0 ? (
            <Card className="shadow-medium">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No predictions yet</p>
                <Button variant="hero" onClick={() => navigate("/predict")}>
                  Make Your First Prediction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {predictions.map((pred) => (
                <Card key={pred.id} className="shadow-soft hover:shadow-medium transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getIcon(pred.prediction_type)}
                        <div>
                          <CardTitle className="text-lg">
                            ₹{pred.predicted_price.toLocaleString('en-IN')}
                          </CardTitle>
                          <CardDescription>
                            {new Date(pred.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePrediction(pred.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {(pred.bedrooms || pred.location || pred.voice_transcript) && (
                    <CardContent>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {pred.bedrooms && <p>Bedrooms: {pred.bedrooms}, Floors: {pred.floors}, Area: {pred.area_sqft} sq ft</p>}
                        {pred.location && <p>Location: {pred.location}</p>}
                        {pred.voice_transcript && <p>Description: {pred.voice_transcript.substring(0, 100)}...</p>}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
