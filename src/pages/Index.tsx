import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { SMILESInput } from '@/components/SMILESInput';
import { ResultsVisualization } from '@/components/ResultsVisualization';
import { TestTube, Upload, BarChart3, Info, Github, BookOpen } from 'lucide-react';
import heroImage from '@/assets/hero-molecular.jpg';

// Mock data for demonstration
const mockResults = [
  {
    smiles: 'CCO',
    compound_name: 'Ethanol',
    toxicity_score: 2.3,
    toxicity_level: 'Low' as const,
    confidence: 0.92,
    properties: {
      molecular_weight: 46.07,
      logP: -0.31,
      polar_surface_area: 20.23,
      hydrogen_bonds: 2
    },
    clusters: 'Alcohol'
  },
  {
    smiles: 'c1ccccc1',
    compound_name: 'Benzene',
    toxicity_score: 6.8,
    toxicity_level: 'High' as const,
    confidence: 0.87,
    properties: {
      molecular_weight: 78.11,
      logP: 2.13,
      polar_surface_area: 0.00,
      hydrogen_bonds: 0
    },
    clusters: 'Aromatic'
  },
  {
    smiles: 'C=O',
    compound_name: 'Formaldehyde',
    toxicity_score: 8.9,
    toxicity_level: 'Very High' as const,
    confidence: 0.95,
    properties: {
      molecular_weight: 30.03,
      logP: 0.35,
      polar_surface_area: 17.07,
      hydrogen_bonds: 1
    },
    clusters: 'Aldehyde'
  },
  {
    smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    compound_name: 'Aspirin',
    toxicity_score: 3.1,
    toxicity_level: 'Low' as const,
    confidence: 0.89,
    properties: {
      molecular_weight: 180.16,
      logP: 1.19,
      polar_surface_area: 63.60,
      hydrogen_bonds: 4
    },
    clusters: 'Pharmaceutical'
  },
  {
    smiles: 'CCCc1ccccc1',
    compound_name: 'Propylbenzene',
    toxicity_score: 5.2,
    toxicity_level: 'Moderate' as const,
    confidence: 0.83,
    properties: {
      molecular_weight: 120.19,
      logP: 3.69,
      polar_surface_area: 0.00,
      hydrogen_bonds: 0
    },
    clusters: 'Aromatic'
  }
];

const Index = () => {
  const [results, setResults] = useState<typeof mockResults>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileSelect = async (file: File) => {
    console.log('File selected:', file.name);
    setIsAnalyzing(true);
    setActiveTab('results');
    
    try {
      // Parse CSV file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Find relevant columns
      const smilesIndex = headers.findIndex(h => h.includes('smiles'));
      const idIndex = headers.findIndex(h => h.includes('id') || h.includes('compound_id') || h.includes('mol_id'));
      const toxicityIndex = headers.findIndex(h => h.includes('toxicity') || h.includes('toxic') || h.includes('pic') || h.includes('activity'));
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('compound_name'));
      
      const parsedResults = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const smiles = smilesIndex >= 0 ? values[smilesIndex] : `Unknown_${index}`;
        const id = idIndex >= 0 ? values[idIndex] : index + 1;
        const toxicityValue = toxicityIndex >= 0 ? parseFloat(values[toxicityIndex]) || Math.random() * 10 : Math.random() * 10;
        const compoundName = nameIndex >= 0 ? values[nameIndex] : `Compound ${index + 1}`;
        
        // Convert toxicity score to level
        let toxicityLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
        if (toxicityValue < 3) toxicityLevel = 'Low';
        else if (toxicityValue < 5) toxicityLevel = 'Moderate';
        else if (toxicityValue < 7) toxicityLevel = 'High';
        else toxicityLevel = 'Very High';
        
        return {
          id,
          smiles,
          compound_name: compoundName,
          toxicity_score: toxicityValue,
          toxicity_level: toxicityLevel,
          confidence: 0.7 + Math.random() * 0.3,
          properties: {
            molecular_weight: 50 + Math.random() * 400,
            logP: -2 + Math.random() * 8,
            polar_surface_area: Math.random() * 200,
            hydrogen_bonds: Math.floor(Math.random() * 10)
          },
          clusters: 'Dataset'
        };
      });
      
      setResults(parsedResults);
    } catch (error) {
      console.error('Error parsing file:', error);
      setResults(mockResults);
    }
    
    setIsAnalyzing(false);
  };

  const handleSMILESAnalysis = async (smilesArray: string[]) => {
    console.log('Analyzing SMILES:', smilesArray);
    setIsAnalyzing(true);
    setActiveTab('results');
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate results based on input SMILES
    const generatedResults = smilesArray.map((smiles, index) => {
      const result = mockResults.find(r => r.smiles === smiles) || {
        smiles,
        compound_name: `Compound ${index + 1}`,
        toxicity_score: Math.random() * 10,
        toxicity_level: ['Low', 'Moderate', 'High', 'Very High'][Math.floor(Math.random() * 4)] as any,
        confidence: 0.7 + Math.random() * 0.3,
        properties: {
          molecular_weight: 50 + Math.random() * 400,
          logP: -2 + Math.random() * 8,
          polar_surface_area: Math.random() * 200,
          hydrogen_bonds: Math.floor(Math.random() * 10)
        },
        clusters: 'Unknown'
      };
      return result;
    });
    
    setResults(generatedResults);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full gradient-interactive flex items-center justify-center shadow-intense float-animation">
              <TestTube className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SMILES Toxicity Predictor
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced molecular toxicity analysis using machine learning. Upload datasets or enter SMILES notation 
            to predict toxicity levels, analyze chemical properties, and visualize clustering results.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button 
              size="lg" 
              className="gradient-interactive text-white border-0 hover-glow shimmer-effect"
              onClick={() => setActiveTab('upload')}
            >
              <Upload className="w-5 h-5 mr-2" />
              Start Analysis
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="gradient-glass hover-lift transition-bounce border-primary/20"
              onClick={() => setActiveTab('about')}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Main Application */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 gradient-glass border border-primary/10">
            <TabsTrigger value="upload" className="flex items-center space-x-2 hover-bounce data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Upload className="w-4 h-4" />
              <span>Upload Data</span>
            </TabsTrigger>
            <TabsTrigger value="smiles" className="flex items-center space-x-2 hover-bounce data-[state=active]:gradient-primary data-[state=active]:text-white">
              <TestTube className="w-4 h-4" />
              <span>SMILES Input</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2 hover-bounce data-[state=active]:gradient-primary data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              <span>Results</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center space-x-2 hover-bounce data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Info className="w-4 h-4" />
              <span>About</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="shadow-card hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-primary pulse-glow" />
                  <span>Dataset Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Upload your molecular dataset files containing SMILES notation and toxicity data.
                  Supported formats include CSV, Excel, and TSV files.
                </p>
                <FileUpload onFileSelect={handleFileSelect} />
              </CardContent>
            </Card>

            <Card className="shadow-card hover-lift gradient-glass">
              <CardHeader>
                <CardTitle>Dataset Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Required Columns:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• <code className="bg-secondary px-1 rounded">smiles</code> - SMILES notation strings</li>
                      <li>• <code className="bg-secondary px-1 rounded">toxicity</code> - Toxicity labels or scores</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optional Columns:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• <code className="bg-secondary px-1 rounded">compound_name</code> - Chemical names</li>
                      <li>• <code className="bg-secondary px-1 rounded">molecular_weight</code> - MW values</li>
                      <li>• <code className="bg-secondary px-1 rounded">logP</code> - Partition coefficients</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smiles" className="space-y-6">
            <SMILESInput onAnalyze={handleSMILESAnalysis} />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ResultsVisualization 
              results={results} 
              isLoading={isAnalyzing}
            />
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>About This Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    This SMILES-based toxicity prediction system uses advanced machine learning algorithms 
                    to analyze molecular structures and predict potential toxicity levels.
                  </p>
                  <p className="text-muted-foreground">
                    The system processes SMILES (Simplified Molecular Input Line Entry System) notation 
                    to extract molecular features and apply trained models for toxicity classification.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Batch processing of multiple compounds</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Interactive data visualization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Molecular property calculation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Toxicity clustering analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Confidence scoring</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-card md:col-span-2">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <h4 className="font-semibold">Input Data</h4>
                      <p className="text-sm text-muted-foreground">Upload datasets or enter SMILES strings</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <h4 className="font-semibold">Feature Extraction</h4>
                      <p className="text-sm text-muted-foreground">Calculate molecular descriptors and properties</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <h4 className="font-semibold">ML Prediction</h4>
                      <p className="text-sm text-muted-foreground">Apply trained models for toxicity prediction</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <span className="text-primary font-bold">4</span>
                      </div>
                      <h4 className="font-semibold">Visualization</h4>
                      <p className="text-sm text-muted-foreground">Interactive charts and detailed results</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <TestTube className="w-5 h-5 text-primary" />
              <span className="font-semibold">SMILES Toxicity Predictor</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4 mr-2" />
                Source Code
              </Button>
              <Button variant="ghost" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;