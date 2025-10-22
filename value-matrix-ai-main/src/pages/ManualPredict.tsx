import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp } from "lucide-react";

const amenitiesList = [
  "Parking", "Swimming Pool", "Gym", "Garden", "Security", 
  "Elevator", "Balcony", "Power Backup", "Water Supply"
];

const ManualPredict = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bedrooms, setBedrooms] = useState("");
  const [floors, setFloors] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

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

    return () => subscription.unsubscribe();
  }, [navigate]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const { data, error } = await supabase.functions.invoke('predict-price', {
        body: {
          type: 'manual',
          data: {
            bedrooms: parseInt(bedrooms),
            floors: parseInt(floors),
            area_sqft: parseFloat(area),
            location,
            amenities: selectedAmenities,
          },
        },
      });

      if (error) throw error;

      setPrediction(data);

      // Save to history
      const { error: saveError } = await supabase.from('predictions').insert({
        user_id: session.user.id,
        prediction_type: 'manual',
        predicted_price: data.predicted_price,
        bedrooms: parseInt(bedrooms),
        floors: parseInt(floors),
        area_sqft: parseFloat(area),
        location,
        amenities: selectedAmenities,
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
          <h1 className="text-4xl font-bold mb-8 text-center">Manual Price Prediction</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Enter the details of the property to get an AI-powered price prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePredict} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Number of Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="1"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floors">Number of Floors</Label>
                    <Input
                      id="floors"
                      type="number"
                      min="1"
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input
                      id="area"
                      type="number"
                      min="100"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Mumbai, Bangalore"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {amenitiesList.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={() => toggleAmenity(amenity)}
                          />
                          <label htmlFor={amenity} className="text-sm cursor-pointer">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full gap-2"
                    disabled={loading}
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
                </form>
              </CardContent>
            </Card>

            {prediction && (
              <Card className="shadow-medium animate-slide-up">
                <CardHeader>
                  <CardTitle>Price Prediction</CardTitle>
                  <CardDescription>AI-powered estimation based on your inputs</CardDescription>
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

export default ManualPredict;
