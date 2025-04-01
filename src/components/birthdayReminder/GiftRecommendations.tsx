
import { useState } from 'react';
import { Person, Gift, GiftIdea } from '@/types/birthday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GiftIcon, History, ShoppingCart, ExternalLink } from 'lucide-react';

interface GiftRecommendationsProps {
  person: Person;
  giftIdeas: GiftIdea[];
  isLoading: boolean;
  previousGifts: Gift[];
}

const GiftRecommendations = ({ 
  person, 
  giftIdeas, 
  isLoading,
  previousGifts 
}: GiftRecommendationsProps) => {
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  // Filter ideas based on price range
  const filteredIdeas = giftIdeas.filter(idea => 
    idea.price >= priceRange[0] && idea.price <= priceRange[1]
  );
  
  // Group by platform
  const platformGroups = filteredIdeas.reduce((groups, idea) => {
    if (!groups[idea.platform]) {
      groups[idea.platform] = [];
    }
    groups[idea.platform].push(idea);
    return groups;
  }, {} as Record<string, GiftIdea[]>);
  
  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl">Gift Ideas for {person.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personalized recommendations based on interests and preferences
            </p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2">
            <div className="flex gap-2 items-center">
              <Label htmlFor="budget" className="whitespace-nowrap">
                Budget:
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="Max price"
                className="w-24"
                value={budget || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  setBudget(value);
                  if (value) {
                    setPriceRange([0, value]);
                  }
                }}
              />
            </div>
            <Button 
              size="sm" 
              className="whitespace-nowrap"
              disabled={isLoading}
            >
              Refresh Ideas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="recommendations">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="recommendations" className="flex-1">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              Gift History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="p-4">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Finding the perfect gift ideas...</p>
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="p-8 text-center">
                <GiftIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No gift ideas found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your budget or preferences
                </p>
                <Button>Refresh Ideas</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(platformGroups).map(([platform, ideas]) => (
                  <div key={platform}>
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {platform}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ideas.map(idea => (
                        <div 
                          key={idea.id}
                          className="border rounded-lg overflow-hidden flex flex-col"
                        >
                          <div className="h-48 bg-muted relative">
                            {idea.imageUrl ? (
                              <img 
                                src={idea.imageUrl} 
                                alt={idea.name}
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-accent">
                                <GiftIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                              ${idea.price.toFixed(2)}
                            </div>
                          </div>
                          <div className="p-3 flex-1 flex flex-col">
                            <h4 className="font-medium">{idea.name}</h4>
                            {idea.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {idea.description}
                              </p>
                            )}
                            <div className="mt-auto pt-3 flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                              >
                                Save
                              </Button>
                              <Button 
                                size="sm"
                                className="flex-1 flex items-center gap-1"
                                onClick={() => window.open(idea.purchaseLink, '_blank')}
                              >
                                Buy <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="p-4">
            {previousGifts.length === 0 ? (
              <div className="p-8 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No gift history</h3>
                <p className="text-muted-foreground">
                  You haven't recorded any gifts for {person.name} yet
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-4">Gift History</h3>
                <div className="space-y-4">
                  {previousGifts.map(gift => (
                    <div 
                      key={gift.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="h-16 w-16 bg-muted rounded flex-shrink-0">
                        {gift.imageUrl ? (
                          <img 
                            src={gift.imageUrl} 
                            alt={gift.name}
                            className="h-full w-full object-cover rounded" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <GiftIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{gift.name}</h4>
                        {gift.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {gift.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">${gift.price.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm">{gift.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GiftRecommendations;
