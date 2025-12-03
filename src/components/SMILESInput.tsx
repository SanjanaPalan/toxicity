import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SMILESInputProps {
  onAnalyze: (smiles: string[]) => void;
  className?: string;
}

export const SMILESInput: React.FC<SMILESInputProps> = ({ onAnalyze, className }) => {
  const [singleSMILES, setSingleSMILES] = useState('');
  const [batchSMILES, setBatchSMILES] = useState('');
  const [smilesHistory, setSmilesHistory] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Common SMILES examples for demo
  const exampleSMILES = [
    { name: 'Benzene', smiles: 'c1ccccc1', toxicity: 'Moderate' },
    { name: 'Ethanol', smiles: 'CCO', toxicity: 'Low' },
    { name: 'Formaldehyde', smiles: 'C=O', toxicity: 'High' },
    { name: 'Aspirin', smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O', toxicity: 'Low' },
    { name: 'Benzopyrene', smiles: 'C1=CC=C2C(=C1)C=CC3=C2C4=CC=CC=C4C=C3', toxicity: 'Very High' }
  ];

  const validateSMILES = (smiles: string): boolean => {
    // Basic SMILES validation - can be enhanced
    if (!smiles || smiles.length === 0) return false;
    
    // Check for basic SMILES characters
    const validChars = /^[A-Za-z0-9\[\]()=+\-#@\/\\\.%]+$/;
    return validChars.test(smiles);
  };

  const handleSingleAnalysis = async () => {
    if (!validateSMILES(singleSMILES)) {
      alert('Please enter a valid SMILES string');
      return;
    }

    setIsValidating(true);
    
    // Add to history
    if (!smilesHistory.includes(singleSMILES)) {
      setSmilesHistory(prev => [singleSMILES, ...prev.slice(0, 9)]);
    }
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onAnalyze([singleSMILES]);
    setIsValidating(false);
  };

  const handleBatchAnalysis = async () => {
    const smilesArray = batchSMILES
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (smilesArray.length === 0) {
      alert('Please enter at least one SMILES string');
      return;
    }

    const invalidSMILES = smilesArray.filter(smiles => !validateSMILES(smiles));
    if (invalidSMILES.length > 0) {
      alert(`Invalid SMILES detected: ${invalidSMILES.join(', ')}`);
      return;
    }

    setIsValidating(true);
    
    // Add valid SMILES to history
    const newSMILES = smilesArray.filter(smiles => !smilesHistory.includes(smiles));
    setSmilesHistory(prev => [...newSMILES, ...prev].slice(0, 10));
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onAnalyze(smilesArray);
    setIsValidating(false);
  };

  const addExampleSMILES = (smiles: string) => {
    setSingleSMILES(smiles);
  };

  const removeFromHistory = (smilesToRemove: string) => {
    setSmilesHistory(prev => prev.filter(smiles => smiles !== smilesToRemove));
  };

  const getToxicityColor = (toxicity: string) => {
    switch (toxicity) {
      case 'Low': return 'bg-accent/20 text-accent-glow';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-600';
      case 'High': return 'bg-orange-500/20 text-orange-600';
      case 'Very High': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-primary" />
          <span>SMILES Input & Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Compound</TabsTrigger>
            <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">SMILES String</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter SMILES notation (e.g., CCO for ethanol)"
                  value={singleSMILES}
                  onChange={(e) => setSingleSMILES(e.target.value)}
                  className="font-mono"
                />
                <Button 
                  onClick={handleSingleAnalysis}
                  disabled={isValidating || !singleSMILES}
                  className="gradient-primary transition-smooth"
                >
                  {isValidating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Example SMILES */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Example Compounds</label>
              <div className="flex flex-wrap gap-2">
                {exampleSMILES.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addExampleSMILES(example.smiles)}
                    className="h-auto p-2 flex flex-col items-start"
                  >
                    <span className="font-medium text-xs">{example.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{example.smiles}</span>
                    <Badge className={cn("text-xs mt-1", getToxicityColor(example.toxicity))}>
                      {example.toxicity}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch SMILES (one per line)</label>
              <Textarea
                placeholder={`Enter multiple SMILES strings, one per line:\nCCO\nc1ccccc1\nC=O\nCC(=O)OC1=CC=CC=C1C(=O)O`}
                value={batchSMILES}
                onChange={(e) => setBatchSMILES(e.target.value)}
                className="font-mono min-h-[120px]"
              />
            </div>
            
            <Button 
              onClick={handleBatchAnalysis}
              disabled={isValidating || !batchSMILES}
              className="w-full gradient-primary transition-smooth"
              size="lg"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing Batch...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Batch
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* SMILES History */}
        {smilesHistory.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recent SMILES</label>
            <div className="flex flex-wrap gap-2">
              {smilesHistory.map((smiles, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="font-mono cursor-pointer group relative pr-6 transition-smooth hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSingleSMILES(smiles)}
                >
                  {smiles}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(smiles);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};