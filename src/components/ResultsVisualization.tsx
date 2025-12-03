import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToxicityResult {
  id?: string | number;
  smiles: string;
  compound_name?: string;
  toxicity_score: number;
  toxicity_level: 'Low' | 'Moderate' | 'High' | 'Very High';
  confidence: number;
  properties: {
    molecular_weight: number;
    logP: number;
    polar_surface_area: number;
    hydrogen_bonds: number;
  };
  clusters?: string;
}

interface ResultsVisualizationProps {
  results: ToxicityResult[];
  isLoading?: boolean;
  className?: string;
}

export const ResultsVisualization: React.FC<ResultsVisualizationProps> = ({
  results,
  isLoading = false,
  className
}) => {
  if (isLoading) {
    return (
      <Card className={cn("glass-card shadow-glow", className)}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow"></div>
            <div className="shimmer-effect px-4 py-2 rounded-lg">
              <p className="text-gradient-vivid font-semibold text-lg">Analyzing molecular toxicity...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card className={cn("glass-card hover-lift", className)}>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <Beaker className="w-12 h-12 mx-auto mb-4 opacity-50 float-animation" />
            <p className="text-lg">No analysis results yet. Upload a dataset or enter SMILES to begin.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Data processing for charts
  const toxicityDistribution = results.reduce((acc, result) => {
    acc[result.toxicity_level] = (acc[result.toxicity_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(toxicityDistribution).map(([level, count]) => ({
    name: level,
    value: count,
    percentage: ((count / results.length) * 100).toFixed(1)
  }));

  const scatterData = results.map(result => ({
    x: result.properties.molecular_weight,
    y: result.toxicity_score,
    smiles: result.smiles,
    level: result.toxicity_level
  }));

  const barData = Object.entries(toxicityDistribution).map(([level, count]) => ({
    toxicity_level: level,
    count
  }));

  const getToxicityColor = (level: string) => {
    switch (level) {
      case 'Low': return '#10b981';
      case 'Moderate': return '#f59e0b';
      case 'High': return '#f97316';
      case 'Very High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getToxicityIcon = (level: string) => {
    switch (level) {
      case 'Low': return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case 'Moderate': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'High': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'Very High': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const averageToxicity = results.reduce((sum, r) => sum + r.toxicity_score, 0) / results.length;
  const highRiskCount = results.filter(r => r.toxicity_level === 'High' || r.toxicity_level === 'Very High').length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card hover-lift neon-border transition-ultra">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Compounds</p>
                <p className="text-3xl font-bold text-gradient">{results.length}</p>
              </div>
              <div className="gradient-primary p-3 rounded-xl shadow-glow float-animation">
                <Beaker className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift neon-border transition-ultra">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Toxicity</p>
                <p className="text-3xl font-bold text-gradient">{averageToxicity.toFixed(2)}</p>
              </div>
              <div className="gradient-secondary p-3 rounded-xl shadow-neon float-animation" style={{animationDelay: '0.2s'}}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift neon-border transition-ultra">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">High Risk</p>
                <p className="text-3xl font-bold text-destructive">{highRiskCount}</p>
              </div>
              <div className="bg-destructive/20 p-3 rounded-xl shadow-multi float-animation" style={{animationDelay: '0.4s'}}>
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift neon-border transition-ultra">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Risk Rate</p>
                <p className="text-3xl font-bold text-gradient-vivid">{((highRiskCount / results.length) * 100).toFixed(0)}%</p>
              </div>
              <div className="gradient-vivid p-3 rounded-xl shadow-intense pulse-glow float-animation" style={{animationDelay: '0.6s'}}>
                <span className="text-white text-xl font-bold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card hover-lift shadow-multi transition-ultra">
              <CardHeader>
                <CardTitle className="text-gradient">Toxicity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getToxicityColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift shadow-multi transition-ultra">
              <CardHeader>
                <CardTitle className="text-gradient">Toxicity Levels Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="toxicity_level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="glass-card hover-lift shadow-multi transition-ultra">
            <CardHeader>
              <CardTitle className="text-gradient">Toxicity Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.slice(0, 10).map((result, index) => (
                  <div key={index} className="space-y-2 p-3 rounded-lg glass-card hover-glow transition-smooth">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{result.smiles}</span>
                      <Badge className={cn(
                        "text-xs shadow-card transition-smooth hover:scale-110",
                        result.toxicity_level === 'Low' && "bg-accent/20 text-accent hover:bg-accent/30",
                        result.toxicity_level === 'Moderate' && "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30",
                        result.toxicity_level === 'High' && "bg-orange-500/20 text-orange-600 hover:bg-orange-500/30",
                        result.toxicity_level === 'Very High' && "bg-destructive/20 text-destructive hover:bg-destructive/30"
                      )}>
                        {result.toxicity_level}
                      </Badge>
                    </div>
                    <Progress value={result.toxicity_score * 10} className="h-3 shadow-card" />
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>Score: {result.toxicity_score.toFixed(2)}</span>
                      <span>Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card className="glass-card hover-lift shadow-multi transition-ultra">
            <CardHeader>
              <CardTitle className="text-gradient">Molecular Weight vs Toxicity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={scatterData}>
                  <CartesianGrid />
                  <XAxis dataKey="x" name="Molecular Weight" />
                  <YAxis dataKey="y" name="Toxicity Score" />
                  <Tooltip 
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-card p-3 shadow-intense">
                            <p className="font-mono text-sm font-semibold">{data.smiles}</p>
                            <p className="text-sm">MW: {data.x.toFixed(2)}</p>
                            <p className="text-sm">Toxicity: {data.y.toFixed(2)}</p>
                            <Badge className="text-xs mt-1">{data.level}</Badge>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    dataKey="y" 
                    fill="#3b82f6"
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="glass-card hover-lift shadow-multi transition-ultra">
            <CardHeader>
              <CardTitle className="text-gradient">Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="glass-card p-5 space-y-3 hover-lift neon-border transition-ultra">
                    <div className="flex items-center justify-between">
                      <div className="space-x-2">
                        {result.id && (
                          <span className="text-xs font-medium bg-primary/20 text-primary px-3 py-1.5 rounded-lg shadow-card">
                            ID: {result.id}
                          </span>
                        )}
                        <span className="font-mono text-sm font-semibold bg-secondary/50 px-3 py-1.5 rounded-lg shadow-card">
                          {result.smiles}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getToxicityIcon(result.toxicity_level)}
                        <Badge className={cn(
                          "shadow-card transition-spring hover:scale-110",
                          result.toxicity_level === 'Low' && "bg-accent/20 text-accent hover:bg-accent/30",
                          result.toxicity_level === 'Moderate' && "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30",
                          result.toxicity_level === 'High' && "bg-orange-500/20 text-orange-600 hover:bg-orange-500/30",
                          result.toxicity_level === 'Very High' && "bg-destructive/20 text-destructive hover:bg-destructive/30"
                        )}>
                          {result.toxicity_level}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="p-3 rounded-lg glass-card transition-smooth hover:shadow-glow">
                        <p className="text-muted-foreground font-medium mb-1">Toxicity Score</p>
                        <p className="font-bold text-lg text-gradient">{result.toxicity_score.toFixed(3)}</p>
                      </div>
                      <div className="p-3 rounded-lg glass-card transition-smooth hover:shadow-glow">
                        <p className="text-muted-foreground font-medium mb-1">Confidence</p>
                        <p className="font-bold text-lg text-gradient">{(result.confidence * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-3 rounded-lg glass-card transition-smooth hover:shadow-glow">
                        <p className="text-muted-foreground font-medium mb-1">Mol Weight</p>
                        <p className="font-bold text-lg text-gradient">{result.properties.molecular_weight.toFixed(1)}</p>
                      </div>
                      <div className="p-3 rounded-lg glass-card transition-smooth hover:shadow-glow">
                        <p className="text-muted-foreground font-medium mb-1">LogP</p>
                        <p className="font-bold text-lg text-gradient">{result.properties.logP.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};