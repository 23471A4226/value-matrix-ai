import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";

const ImagePredict = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!imageFile || !imagePreview) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const { data, error } = await supabase.functions.invoke('predict-price', {
        body: {
          type: 'image',
          data: {
            image_url: imagePreview,
          },
        },
      });

      if (error) throw error;

      setPrediction(data);

      // Save to history
      const { error: saveError } = await supabase.from('predictions').insert({
        user_id: session.user.id,
        prediction_type: 'image',
        predicted_price: data.predicted_price,
        image_url: imagePreview,
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
          <h1 className="text-4xl font-bold mb-8 text-center">Image-Based Price Prediction</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Upload House Image</CardTitle>
                <CardDescription>
                  Upload a photo of the property for AI analysis and price prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Property preview"
                        className="max-h-64 mx-auto rounded-lg object-cover"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Click to upload image</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG or WEBP (max 10MB)
                          </p>
                        </div>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  disabled={loading || !imageFile}
                  onClick={handlePredict}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Predict Price from Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {prediction && (
              <Card className="shadow-medium animate-slide-up">
                <CardHeader>
                  <CardTitle>Price Prediction</CardTitle>
                  <CardDescription>AI analysis based on image</CardDescription>
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
                    <div className="text-sm font-semibold mb-2">Image Analysis</div>
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

export default ImagePredict;
