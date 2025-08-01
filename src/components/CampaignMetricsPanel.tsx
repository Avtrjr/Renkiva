import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Eye, 
  Smartphone, 
  MapPin, 
  DollarSign,
  Activity,
  Globe,
  Wifi,
  WifiOff
} from "lucide-react";
import { getSponsorStats } from "@/services/sponsorService";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

function MetricCard({ title, value, icon, trend, color = "primary" }: MetricCardProps) {
  return (
    <Card className="mesh-card border-border/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold text-${color}`}>{value}</p>
            {trend && (
              <p className="text-xs text-green-400 mt-1">↗ {trend}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-${color}/20`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignMetricsPanel() {
  const [stats, setStats] = useState({ views: 0, devices: 0, estimatedRevenue: 0 });
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const viewsByDevice = [
    { name: 'Mobile', views: 1247, offline: 856, online: 391 },
    { name: 'Desktop', views: 892, offline: 234, online: 658 },
    { name: 'Tablet', views: 534, offline: 445, online: 89 },
    { name: 'Smart TV', views: 223, offline: 198, online: 25 }
  ];

  const distributionData = [
    { name: 'Offline Views', value: 65, color: '#00FFFF' },
    { name: 'Online Views', value: 35, color: '#8B5CF6' }
  ];

  const regionData = [
    { region: 'North America', impressions: 1234, revenue: 24.68 },
    { region: 'Europe', views: 892, revenue: 17.84 },
    { region: 'Asia Pacific', views: 667, revenue: 13.34 },
    { region: 'Latin America', views: 445, revenue: 8.90 },
    { region: 'Other', views: 234, revenue: 4.68 }
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        const sponsorStats = await getSponsorStats();
        setStats(sponsorStats);
      } catch (error) {
        console.error("Failed to load sponsor stats:", error);
        // Use mock data on error
        setStats({ views: 2896, devices: 1847, estimatedRevenue: 69.44 });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Impressions"
          value={loading ? "..." : stats.views.toLocaleString()}
          icon={<Eye className="w-5 h-5 text-primary" />}
          trend="+12.5% vs last month"
          color="primary"
        />
        
        <MetricCard
          title="Unique Devices"
          value={loading ? "..." : stats.devices.toLocaleString()}
          icon={<Smartphone className="w-5 h-5 text-secondary" />}
          trend="+8.3% vs last month"
          color="secondary"
        />
        
        <MetricCard
          title="Revenue"
          value={loading ? "..." : `$${stats.estimatedRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-accent" />}
          trend="+15.2% vs last month"
          color="accent"
        />
        
        <MetricCard
          title="CPM Average"
          value="$0.024"
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          trend="-2.1% vs last month"
          color="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Device Type */}
        <Card className="mesh-card backdrop-blur-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Smartphone className="w-5 h-5" />
              Views by Device Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsByDevice}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Bar dataKey="offline" fill="hsl(var(--primary))" name="Offline" />
                <Bar dataKey="online" fill="hsl(var(--secondary))" name="Online" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card className="mesh-card backdrop-blur-lg border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Activity className="w-5 h-5" />
              Offline vs Online Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-primary" />
                <span className="text-sm">Offline: 65%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-secondary" />
                <span className="text-sm">Online: 35%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      <Card className="mesh-card backdrop-blur-lg border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <MapPin className="w-5 h-5" />
            Regional Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regionData.map((region, index) => (
              <div key={region.region} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-cyber flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{region.region}</p>
                    <p className="text-sm text-muted-foreground">
                      {region.impressions?.toLocaleString() || region.views?.toLocaleString()} impressions
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-accent">${region.revenue.toFixed(2)}</p>
                  <div className="w-32 mt-1">
                    <Progress 
                      value={(region.impressions || region.views) / 1234 * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Status */}
      <Card className="mesh-card backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Globe className="w-5 h-5" />
            Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "EduKit Summer 2024",
                status: "active",
                budget: 1000,
                spent: 245.67,
                impressions: 12456
              },
              {
                name: "CyberSec Awareness",
                status: "paused", 
                budget: 500,
                spent: 123.45,
                impressions: 6234
              },
              {
                name: "Holiday Special",
                status: "completed",
                budget: 750,
                spent: 750,
                impressions: 38945
              }
            ].map((campaign) => (
              <div key={campaign.name} className="flex items-center justify-between p-4 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={campaign.status === "active" ? "default" : "outline"}
                    className={
                      campaign.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      campaign.status === "paused" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      "bg-muted/20 text-muted-foreground"
                    }
                  >
                    {campaign.status}
                  </Badge>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.impressions.toLocaleString()} impressions
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold">${campaign.spent.toFixed(2)} / ${campaign.budget}</p>
                  <div className="w-32 mt-1">
                    <Progress 
                      value={(campaign.spent / campaign.budget) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}