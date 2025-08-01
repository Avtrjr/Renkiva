import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Lock, DollarSign, Tags, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface DistributionPanelProps {
  onSettingsChange?: (settings: DistributionSettings) => void;
}

interface DistributionSettings {
  visibility: "public" | "private";
  sponsorshipEnabled: boolean;
  tags: string[];
  inviteToken?: string;
}

export default function DistributionPanel({ onSettingsChange }: DistributionPanelProps) {
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [sponsorshipEnabled, setSponsorshipEnabled] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [copied, setCopied] = useState(false);

  const popularTags = [
    "Family Friendly", "Action", "Comedy", "Drama", "Educational", 
    "Music", "Sports", "Nature", "Technology", "Travel"
  ];

  const ageGroups = ["All Ages", "Teen+", "Adult", "Mature"];

  const generateInviteToken = () => {
    const token = `meshtv_${Math.random().toString(36).substr(2, 12)}`;
    setInviteToken(token);
    onSettingsChange?.({
      visibility,
      sponsorshipEnabled,
      tags,
      inviteToken: token
    });
  };

  const copyToken = async () => {
    if (inviteToken) {
      await navigator.clipboard.writeText(inviteToken);
      setCopied(true);
      toast.success("Invite token copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setTagInput("");
      onSettingsChange?.({
        visibility,
        sponsorshipEnabled,
        tags: newTags,
        inviteToken
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onSettingsChange?.({
      visibility,
      sponsorshipEnabled,
      tags: newTags,
      inviteToken
    });
  };

  const handleVisibilityChange = (value: string) => {
    const newVisibility = value as "public" | "private";
    setVisibility(newVisibility);
    if (newVisibility === "private" && !inviteToken) {
      generateInviteToken();
    }
    onSettingsChange?.({
      visibility: newVisibility,
      sponsorshipEnabled,
      tags,
      inviteToken: newVisibility === "private" ? inviteToken : undefined
    });
  };

  const handleSponsorshipChange = (enabled: boolean) => {
    setSponsorshipEnabled(enabled);
    onSettingsChange?.({
      visibility,
      sponsorshipEnabled: enabled,
      tags,
      inviteToken
    });
  };

  return (
    <Card className="mesh-card backdrop-blur-lg border-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-secondary">
          <Globe className="w-5 h-5" />
          Distribution Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visibility Settings */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Content Visibility</Label>
          <RadioGroup value={visibility} onValueChange={handleVisibilityChange}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <RadioGroupItem value="public" id="public" />
              <Globe className="w-4 h-4 text-primary" />
              <div>
                <Label htmlFor="public" className="font-medium">Public Mesh Index</Label>
                <p className="text-sm text-muted-foreground">Available to everyone on the network</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-secondary/30 transition-colors">
              <RadioGroupItem value="private" id="private" />
              <Lock className="w-4 h-4 text-secondary" />
              <div>
                <Label htmlFor="private" className="font-medium">Private Channel</Label>
                <p className="text-sm text-muted-foreground">Invite-only via token</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Private Channel Token */}
        {visibility === "private" && (
          <div className="space-y-3 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Invite Token</Label>
              {!inviteToken && (
                <Button size="sm" onClick={generateInviteToken} variant="outline">
                  Generate Token
                </Button>
              )}
            </div>
            {inviteToken && (
              <div className="flex gap-2">
                <Input value={inviteToken} readOnly className="font-mono text-sm" />
                <Button size="sm" onClick={copyToken} variant="outline">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Sponsorship Settings */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <div>
              <Label className="font-medium">Enable Sponsorship</Label>
              <p className="text-sm text-muted-foreground">Allow ads to be paired with this content</p>
            </div>
          </div>
          <Switch 
            checked={sponsorshipEnabled} 
            onCheckedChange={handleSponsorshipChange}
          />
        </div>

        {/* Tags Input */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Tags className="w-4 h-4" />
            Content Tags
          </Label>
          
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === "Enter" && addTag(tagInput)}
              className="bg-input/50"
            />
            <Button onClick={() => addTag(tagInput)} size="sm" variant="outline">
              Add
            </Button>
          </div>

          {/* Current Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}

          {/* Popular Tags */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Popular Tags:</Label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge 
                  key={tag}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/20 hover:border-primary/50"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Age Groups */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Age Groups:</Label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((age) => (
                <Badge 
                  key={age}
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent/20 hover:border-accent/50"
                  onClick={() => addTag(age)}
                >
                  + {age}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Summary */}
        <div className="p-3 bg-muted/20 rounded-lg border border-border/30">
          <Label className="text-sm font-medium text-muted-foreground">Summary:</Label>
          <div className="mt-1 space-y-1 text-sm">
            <p>• Visibility: <span className="text-primary">{visibility === "public" ? "Public Network" : "Private Channel"}</span></p>
            <p>• Sponsorship: <span className="text-primary">{sponsorshipEnabled ? "Enabled" : "Disabled"}</span></p>
            <p>• Tags: <span className="text-primary">{tags.length || "None"}</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}