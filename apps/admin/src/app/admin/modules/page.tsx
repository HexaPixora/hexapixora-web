"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@hexapixora/sdk/browser";
import { toast } from "sonner";
import { useHasPermission } from "@/stores/use-auth-store";
import { PageHeader } from "@hexapixora/ui/admin";
import { Button } from "@hexapixora/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@hexapixora/ui/dialog";
import { ModuleConfigForm } from "@/components/admin/module-config-form";
import { Settings2, Eye, Component } from "lucide-react";
import { MODULES, ModuleDefinition, groupedModules } from "@hexapixora/contracts/blocks/registry";
import { HeroBlock } from "@hexapixora/theme-hexa-noir/blocks/hero";
import { CtaBlock } from "@hexapixora/theme-hexa-noir/blocks/cta";
import { ServicesBlock } from "@hexapixora/theme-hexa-noir/blocks/services";
import { PortfolioBlock } from "@hexapixora/theme-hexa-noir/blocks/portfolio";
import { PortfolioHeroBlock } from "@hexapixora/theme-hexa-noir/blocks/portfolio-hero";
import { WhyChooseBlock } from "@hexapixora/theme-hexa-noir/blocks/why-choose";
import { OurStoryBlock } from "@hexapixora/theme-hexa-noir/blocks/our-story";
import { OurProcessBlock } from "@hexapixora/theme-hexa-noir/blocks/our-process";
import { WorkHeroBlock } from "@hexapixora/theme-hexa-noir/blocks/work-hero";
import { StoryHeroBlock } from "@hexapixora/theme-hexa-noir/blocks/story-hero";
import { TechStackBlock } from "@hexapixora/theme-hexa-noir/blocks/tech-stack";
import { SkillsShowcaseBlock } from "@hexapixora/theme-hexa-noir/blocks/skills-showcase";
import { LeaderBlock } from "@hexapixora/theme-hexa-noir/blocks/leader";
import { QuoteBlock } from "@hexapixora/theme-hexa-noir/blocks/quote";
import { RichTextBlock } from "@hexapixora/theme-hexa-noir/blocks/rich-text";
import { TeamBlock } from "@hexapixora/theme-hexa-noir/blocks/team";
import { FaqBlock } from "@hexapixora/theme-hexa-noir/blocks/faq";
import { StatsBlock } from "@hexapixora/theme-hexa-noir/blocks/stats";
import { AboutBlock } from "@hexapixora/theme-hexa-noir/blocks/about";
import { SliderBlock } from "@hexapixora/theme-hexa-noir/blocks/slider";
import { LogoTickerBlock } from "@hexapixora/theme-hexa-noir/blocks/logo-ticker";
import { GallerySyncBlock } from "@hexapixora/theme-hexa-noir/blocks/gallery-sync";
import { ContactFormBlock } from "@hexapixora/theme-hexa-noir/blocks/contact-form";

// Map for previews
const PREVIEW_MAP: Record<string, React.FC<any>> = {
  "HeroSection": HeroBlock,
  "CTASection": CtaBlock,
  "ServicesSection": ServicesBlock,
  "PortfolioSection": PortfolioBlock,
  "PortfolioHeroModule": PortfolioHeroBlock,
  "WhyChooseModule": WhyChooseBlock,
  "OurStoryModule": OurStoryBlock,
  "OurProcessModule": OurProcessBlock,
  "WorkHeroModule": WorkHeroBlock,
  "StoryHeroModule": StoryHeroBlock,
  "TechStackModule": TechStackBlock,
  "SkillsShowcaseModule": SkillsShowcaseBlock,
  "LeaderModule": LeaderBlock,
  "QuoteModule": QuoteBlock,
  "RichTextModule": RichTextBlock,
  "TeamSection": TeamBlock,
  "FAQSection": FaqBlock,
  "StatsSection": StatsBlock,
  "AboutSection": AboutBlock,
  "SplideSliderModule": SliderBlock,
  "SplideLogoTickerModule": LogoTickerBlock,
  "SplideGallerySyncModule": GallerySyncBlock,
  "ContactFormModule": ContactFormBlock,
};

export default function ModulesLibraryPage() {
  const canManage = useHasPermission("layouts");
  const [moduleDefaults, setModuleDefaults] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Modals state
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});
  const [previewId, setPreviewId] = useState<string | null>(null);

  const activeModuleDef = activeConfigId ? MODULES[activeConfigId] : null;

  useEffect(() => {
    apiClient.get("/layouts/module-defaults").then(res => {
      if (res.data?.data) {
        setModuleDefaults(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const openSettings = (moduleDef: ModuleDefinition) => {
    setActiveConfigId(moduleDef.type);
    const existingDefault = moduleDefaults[moduleDef.type];
    setEditingConfig(existingDefault || moduleDef.defaultConfig || {});
  };

  const saveSettings = async () => {
    if (!activeConfigId) return;
    
    setSaving(true);
    const updatedDefaults = {
      ...moduleDefaults,
      [activeConfigId]: editingConfig
    };
    
    try {
      await apiClient.put("/layouts/module-defaults", updatedDefaults);
      setModuleDefaults(updatedDefaults);
      setSaved(true);
      toast.success("Default content saved");
      setTimeout(() => setSaved(false), 3000);
      setActiveConfigId(null);
    } catch (err) {
      toast.error("Failed to save default content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Modules Library" description="Manage global default content for all builder components." />

      <div className="flex flex-col gap-10">
        {groupedModules().map((group) => (
          <div key={group.label}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-muted-foreground">
                {group.modules.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.modules.map((mod) => (
                <div key={mod.type} className="border rounded-xl p-5 bg-card flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Component size={20} />
                    </div>
                    <h3 className="font-semibold">{mod.label}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 flex-1">
                    {mod.description}
                  </p>

                  <div className="flex gap-2 mt-auto pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewId(mod.type)}>
                      <Eye size={15} className="mr-2" /> Preview
                    </Button>
                    <Button variant="default" size="sm" className="flex-1" onClick={() => openSettings(mod)}>
                      <Settings2 size={15} className="mr-2" /> Defaults
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Settings Modal */}
      <Dialog open={!!activeConfigId} onOpenChange={(open) => !open && setActiveConfigId(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Global Defaults: {activeModuleDef?.label}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              These settings will be used as a fallback if no specific content is provided in the page builder.
            </p>
          </DialogHeader>
          
          <div className="py-4">
            <ModuleConfigForm def={activeModuleDef} value={editingConfig} onChange={setEditingConfig} />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveConfigId(null)} disabled={saving}>Cancel</Button>
            {canManage && (
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Defaults"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto w-[90vw]">
          <DialogHeader>
            <DialogTitle>Preview: {previewId ? MODULES[previewId]?.label : ''}</DialogTitle>
          </DialogHeader>
          <div className="border rounded-xl overflow-hidden mt-4 bg-background">
            {previewId && PREVIEW_MAP[previewId] ? (
              React.createElement(PREVIEW_MAP[previewId], {
                config: moduleDefaults[previewId] || MODULES[previewId]?.defaultConfig
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground bg-muted/30">
                <p>Preview not available yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
