import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUse() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-card p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{t('legal.termsOfUse')}</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">{t('legal.termsTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('legal.lastUpdated')}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.terms.acceptance.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.terms.acceptance.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.terms.content.title')}</h3>
              <p className="text-muted-foreground mb-2">{t('legal.terms.content.intro')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t('legal.terms.content.item1')}</li>
                <li>{t('legal.terms.content.item2')}</li>
                <li>{t('legal.terms.content.item3')}</li>
                <li>{t('legal.terms.content.item4')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.terms.offline.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.terms.offline.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.terms.privacyData.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.terms.privacyData.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.terms.liability.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.terms.liability.content')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('legal.terms.changes.title')}</h3>
              <p className="text-muted-foreground">
                {t('legal.terms.changes.content')}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
