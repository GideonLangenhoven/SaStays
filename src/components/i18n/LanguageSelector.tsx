// src/components/i18n/LanguageSelector.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  ChevronDown, 
  Check, 
  Languages, 
  Settings, 
  RefreshCw, 
  Download,
  Info,
  Star,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useI18n, useTranslation } from '@/contexts/I18nContext';
import { getLanguageConfig, isRTLLanguage } from '@/config/languages';
import { toast } from 'sonner';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'modal' | 'inline' | 'compact';
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  showFlags = true,
  showNativeNames = true,
  className = ''
}) => {
  const { 
    currentLanguage, 
    availableLanguages, 
    changeLanguage, 
    isLoading 
  } = useI18n();
  const { t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const currentConfig = getLanguageConfig(currentLanguage);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) return;

    try {
      setIsChanging(true);
      await changeLanguage(languageCode);
      toast.success(t('common.success'), {
        description: `Language changed to ${getLanguageConfig(languageCode).name}`
      });
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error(t('common.error'), {
        description: 'Failed to change language. Please try again.'
      });
    } finally {
      setIsChanging(false);
    }
  };

  const renderLanguageOption = (language: any, isSelected: boolean = false) => (
    <div className={`flex items-center justify-between p-2 rounded-md transition-colors ${
      isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-center space-x-3">
        {showFlags && (
          <span className="text-lg" role="img" aria-label={language.name}>
            {language.flag}
          </span>
        )}
        <div>
          <div className="font-medium">{language.name}</div>
          {showNativeNames && language.nativeName !== language.name && (
            <div className="text-sm text-muted-foreground">{language.nativeName}</div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {language.rtl && (
          <Badge variant="outline" className="text-xs">
            RTL
          </Badge>
        )}
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </div>
    </div>
  );

  // Compact variant - just the flag and dropdown
  if (variant === 'compact') {
    return (
      <Select value={currentLanguage} onValueChange={handleLanguageChange} disabled={isChanging}>
        <SelectTrigger className={`w-auto ${className}`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{currentConfig.flag}</span>
            <span className="text-sm font-medium">{currentConfig.code.toUpperCase()}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
                {language.rtl && (
                  <Badge variant="outline" className="text-xs ml-2">RTL</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <Select value={currentLanguage} onValueChange={handleLanguageChange} disabled={isChanging}>
        <SelectTrigger className={`w-48 ${className}`}>
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            {showFlags && <span>{currentConfig.flag}</span>}
            <span>{currentConfig.name}</span>
            {isChanging && <RefreshCw className="h-3 w-3 animate-spin" />}
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-2 w-full">
                {showFlags && <span>{language.flag}</span>}
                <div className="flex-1">
                  <div>{language.name}</div>
                  {showNativeNames && language.nativeName !== language.name && (
                    <div className="text-xs text-muted-foreground">{language.nativeName}</div>
                  )}
                </div>
                {language.rtl && (
                  <Badge variant="outline" className="text-xs">RTL</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Modal variant - full language selection modal
  if (variant === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className={`${className}`}>
            <Globe className="h-4 w-4 mr-2" />
            {showFlags && <span className="mr-2">{currentConfig.flag}</span>}
            <span>{currentConfig.name}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Languages className="h-5 w-5" />
              <span>Select Language</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Language Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Language</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLanguageOption(currentConfig, true)}
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Direction</Label>
                    <div className="flex items-center space-x-1 mt-1">
                      {currentConfig.rtl ? (
                        <>
                          <ArrowLeft className="h-3 w-3" />
                          <span>Right to Left</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3 w-3" />
                          <span>Left to Right</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date Format</Label>
                    <div className="mt-1">{currentConfig.dateFormat}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Grid */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Available Languages</Label>
              <ScrollArea className="h-64">
                <div className="grid gap-2">
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      disabled={isChanging || language.code === currentLanguage}
                      className="w-full text-left disabled:opacity-50"
                    >
                      {renderLanguageOption(language, language.code === currentLanguage)}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-details">Show Language Details</Label>
                <Switch
                  id="show-details"
                  checked={showDetails}
                  onCheckedChange={setShowDetails}
                />
              </div>
              
              {showDetails && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Language changes will be saved to your browser and persist across sessions. 
                    Some translations may be incomplete for newer languages.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {isChanging && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Changing language...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Inline variant - full inline selection
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Languages className="h-5 w-5" />
          <span>Language Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Current Language</Label>
          {renderLanguageOption(currentConfig, true)}
        </div>

        {/* Language Options */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Available Languages ({availableLanguages.length})
          </Label>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {availableLanguages
              .filter(lang => lang.code !== currentLanguage)
              .map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isChanging}
                  className="w-full text-left disabled:opacity-50 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {renderLanguageOption(language)}
                </button>
              ))}
          </div>
        </div>

        {/* Options */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Text Direction:</span>
            <span className="flex items-center space-x-1">
              {currentConfig.rtl ? (
                <>
                  <ArrowLeft className="h-3 w-3" />
                  <span>RTL</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-3 w-3" />
                  <span>LTR</span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Date Format:</span>
            <span>{currentConfig.dateFormat}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Currency:</span>
            <span>{currentConfig.currencyFormat.symbol}</span>
          </div>
        </div>

        {isChanging && (
          <div className="flex items-center justify-center space-x-2 py-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Applying changes...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;