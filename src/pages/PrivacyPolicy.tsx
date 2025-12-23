import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Clock, Download, Trash2, Mail } from 'lucide-react';
import { DataExportButton } from '@/components/DataExportButton';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';
import { useAuth } from '@/hooks/useAuth';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-card p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{t('legal.privacyPolicy')}</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t('legal.privacyTitle')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t('legal.lastUpdated')}</p>
            <p className="text-sm text-muted-foreground">
              {t('legal.compliance')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.privacyFirst.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.privacy.privacyFirst.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('legal.privacy.locationData.title')}
              </h3>
              <p className="text-muted-foreground mb-3">
                <strong>{t('legal.privacy.locationData.notice')}</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>{t('legal.privacy.locationData.consent')}:</strong> {t('legal.privacy.locationData.consentDesc')}</li>
                <li><strong>{t('legal.privacy.locationData.minimization')}:</strong> {t('legal.privacy.locationData.minimizationDesc')}</li>
                <li><strong>{t('legal.privacy.locationData.purpose')}:</strong> {t('legal.privacy.locationData.purposeDesc')}</li>
                <li><strong>{t('legal.privacy.locationData.retention')}:</strong> {t('legal.privacy.locationData.retentionDesc')}</li>
                <li><strong>{t('legal.privacy.locationData.revocation')}:</strong> {t('legal.privacy.locationData.revocationDesc')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.dataCollected.title')}</h3>
              <p className="text-muted-foreground mb-2">{t('legal.privacy.dataCollected.intro')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>{t('legal.privacy.dataCollected.account')}:</strong> {t('legal.privacy.dataCollected.accountDesc')}</li>
                <li><strong>{t('legal.privacy.dataCollected.content')}:</strong> {t('legal.privacy.dataCollected.contentDesc')}</li>
                <li><strong>{t('legal.privacy.dataCollected.usage')}:</strong> {t('legal.privacy.dataCollected.usageDesc')}</li>
                <li><strong>{t('legal.privacy.dataCollected.device')}:</strong> {t('legal.privacy.dataCollected.deviceDesc')}</li>
                <li><strong>{t('legal.privacy.dataCollected.location')}:</strong> {t('legal.privacy.dataCollected.locationDesc')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('legal.privacy.retentionPeriods.title')}
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>{t('legal.privacy.retentionPeriods.account')}:</strong> {t('legal.privacy.retentionPeriods.accountDesc')}</li>
                <li><strong>{t('legal.privacy.retentionPeriods.location')}:</strong> {t('legal.privacy.retentionPeriods.locationDesc')}</li>
                <li><strong>{t('legal.privacy.retentionPeriods.viewStats')}:</strong> {t('legal.privacy.retentionPeriods.viewStatsDesc')}</li>
                <li><strong>{t('legal.privacy.retentionPeriods.content')}:</strong> {t('legal.privacy.retentionPeriods.contentDesc')}</li>
                <li><strong>{t('legal.privacy.retentionPeriods.mesh')}:</strong> {t('legal.privacy.retentionPeriods.meshDesc')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.dataStorage.title')}</h3>
              <p className="text-muted-foreground">
                <strong>{t('legal.privacy.dataStorage.local')}:</strong> {t('legal.privacy.dataStorage.localDesc')}<br />
                <strong>{t('legal.privacy.dataStorage.mesh')}:</strong> {t('legal.privacy.dataStorage.meshDesc')}<br />
                <strong>{t('legal.privacy.dataStorage.cloud')}:</strong> {t('legal.privacy.dataStorage.cloudDesc')}<br />
                <strong>{t('legal.privacy.dataStorage.thirdParty')}:</strong> {t('legal.privacy.dataStorage.thirdPartyDesc')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.noTracking.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.privacy.noTracking.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.offline.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.privacy.offline.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t('legal.privacy.yourRights.title')}
              </h3>
              <p className="text-muted-foreground mb-3">{t('legal.privacy.yourRights.intro')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>{t('legal.privacy.yourRights.access')}:</strong> {t('legal.privacy.yourRights.accessDesc')}</li>
                <li><strong>{t('legal.privacy.yourRights.portability')}:</strong> {t('legal.privacy.yourRights.portabilityDesc')}</li>
                <li><strong>{t('legal.privacy.yourRights.rectification')}:</strong> {t('legal.privacy.yourRights.rectificationDesc')}</li>
                <li><strong>{t('legal.privacy.yourRights.erasure')}:</strong> {t('legal.privacy.yourRights.erasureDesc')}</li>
                <li><strong>{t('legal.privacy.yourRights.restriction')}:</strong> {t('legal.privacy.yourRights.restrictionDesc')}</li>
                <li><strong>{t('legal.privacy.yourRights.object')}:</strong> {t('legal.privacy.yourRights.objectDesc')}</li>
                <li><strong>{t('legal.privacy.yourRights.withdraw')}:</strong> {t('legal.privacy.yourRights.withdrawDesc')}</li>
              </ul>
              
              {user && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                  <p className="text-sm font-medium text-foreground">{t('legal.privacy.yourRights.exercise')}</p>
                  <div className="flex flex-wrap gap-3">
                    <DataExportButton />
                    <DeleteAccountButton />
                  </div>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.ccpa.title')}</h3>
              <p className="text-muted-foreground mb-2">{t('legal.privacy.ccpa.intro')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>{t('legal.privacy.ccpa.know')}:</strong> {t('legal.privacy.ccpa.knowDesc')}</li>
                <li><strong>{t('legal.privacy.ccpa.delete')}:</strong> {t('legal.privacy.ccpa.deleteDesc')}</li>
                <li><strong>{t('legal.privacy.ccpa.optOut')}:</strong> {t('legal.privacy.ccpa.optOutDesc')}</li>
                <li><strong>{t('legal.privacy.ccpa.nonDiscrim')}:</strong> {t('legal.privacy.ccpa.nonDiscrimDesc')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.security.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.privacy.security.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.children.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.privacy.children.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('legal.privacy.contact.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('legal.privacy.contact.content')}<br /><br />
                <strong>{t('legal.privacy.contact.email')}:</strong> privacy@renkiva.app<br />
                <strong>{t('legal.privacy.contact.response')}:</strong> {t('legal.privacy.contact.responseDesc')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.privacy.updates.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.privacy.updates.content')}
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Renkiva. {t('legal.allRightsReserved')}</p>
          <p className="mt-2">
            <a href="/legal/terms-of-use" className="underline hover:text-foreground">{t('legal.termsOfUse')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
