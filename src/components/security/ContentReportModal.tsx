import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReportReason, ReportUtils, reportManager } from '@/security/report/ReportManager';
import { SafetyManifest } from '@/security/safetymanifest/ManifestSigner';
import { AlertTriangle, Send, Shield } from 'lucide-react';

interface ContentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: SafetyManifest | null;
  contentFile: File | null;
  onReportSubmitted: () => void;
}

export function ContentReportModal({
  isOpen,
  onClose,
  manifest,
  contentFile,
  onReportSubmitted
}: ContentReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason || !description.trim() || !manifest || !contentFile) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create report with mock reporter key handle
      const reporterKeyHandle = 'mock-reporter-key';
      
      const report = await reportManager.createReport(
        manifest,
        contentFile,
        reason as ReportReason,
        description,
        reporterKeyHandle
      );

      const submitted = await reportManager.submitReport(report);
      
      if (submitted) {
        onReportSubmitted();
        onClose();
        resetForm();
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } catch (err) {
      setError(`Report submission failed: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Report Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Info */}
          {manifest && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Content Information</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Hash: {Array.from(manifest.sha256.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('')}...</div>
                <div>NSFW Score: {manifest.nsfwScore.toFixed(3)}</div>
                <div>Timestamp: {new Date(manifest.timestamp).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Report Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason for Report <span className="text-destructive">*</span>
            </label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ReportReason).map((reasonValue) => (
                  <SelectItem key={reasonValue} value={reasonValue}>
                    {ReportUtils.getReasonDisplayName(reasonValue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the issue..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Your report will be reviewed by community moderators. No personal information is shared.
            </p>
          </div>

          {/* Privacy Notice */}
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Your identity remains anonymous. Only a cryptographic proof and content sample are shared with moderators.
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason || !description.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Report
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}