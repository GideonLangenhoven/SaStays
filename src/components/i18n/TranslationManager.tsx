// src/components/i18n/TranslationManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  Save,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Copy,
  Trash2,
  Languages,
  Eye,
  EyeOff
} from 'lucide-react';
import { useI18n, useTranslation } from '@/contexts/I18nContext';
import { Translation } from '@/types/i18n';
import { toast } from 'sonner';

interface TranslationEntry {
  key: string;
  value: string;
  category: string;
  isModified: boolean;
  isMissing: boolean;
}

interface TranslationManagerProps {
  adminMode?: boolean;
  className?: string;
}

export const TranslationManager: React.FC<TranslationManagerProps> = ({
  adminMode = false,
  className = ''
}) => {
  const { availableLanguages, currentLanguage, changeLanguage } = useI18n();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<TranslationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<TranslationEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadTranslations(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    filterTranslations();
  }, [translations, searchQuery, selectedCategory, showMissingOnly]);

  const loadTranslations = async (languageCode: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/src/translations/${languageCode}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${languageCode}`);
      }

      const data: Translation = await response.json();
      const entries = flattenTranslations(data);
      setTranslations(entries);
      
      // Extract categories
      const uniqueCategories = [...new Set(entries.map(entry => entry.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error('Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  const flattenTranslations = (obj: Translation, prefix = '', category = ''): TranslationEntry[] => {
    const entries: TranslationEntry[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const currentCategory = category || key;
      
      if (typeof value === 'string') {
        entries.push({
          key: fullKey,
          value,
          category: currentCategory,
          isModified: false,
          isMissing: !value.trim()
        });
      } else if (typeof value === 'object' && value !== null) {
        entries.push(...flattenTranslations(value, fullKey, currentCategory));
      }
    });
    
    return entries;
  };

  const filterTranslations = () => {
    let filtered = translations;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.key.toLowerCase().includes(query) ||
        entry.value.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    // Missing translations filter
    if (showMissingOnly) {
      filtered = filtered.filter(entry => entry.isMissing);
    }

    setFilteredTranslations(filtered);
  };

  const updateTranslation = (key: string, newValue: string) => {
    setTranslations(prev => prev.map(entry =>
      entry.key === key
        ? { ...entry, value: newValue, isModified: true, isMissing: !newValue.trim() }
        : entry
    ));
  };

  const saveTranslations = async () => {
    try {
      setLoading(true);
      const modifiedEntries = translations.filter(entry => entry.isModified);
      
      if (modifiedEntries.length === 0) {
        toast.info('No changes to save');
        return;
      }

      // Convert back to nested object structure
      const translationObject = unflattenTranslations(translations);
      
      // Here you would normally save to your backend
      // For demo purposes, we'll just show a success message
      console.log('Saving translations for', selectedLanguage, translationObject);
      
      toast.success(`Saved ${modifiedEntries.length} translation changes`);
      
      // Mark all as unmodified
      setTranslations(prev => prev.map(entry => ({ ...entry, isModified: false })));
    } catch (error) {
      console.error('Error saving translations:', error);
      toast.error('Failed to save translations');
    } finally {
      setLoading(false);
    }
  };

  const unflattenTranslations = (entries: TranslationEntry[]): Translation => {
    const result: Translation = {};
    
    entries.forEach(entry => {
      const keys = entry.key.split('.');
      let current = result;
      
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = entry.value;
        } else {
          if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key] as Translation;
        }
      });
    });
    
    return result;
  };

  const exportTranslations = () => {
    const translationObject = unflattenTranslations(translations);
    const dataStr = JSON.stringify(translationObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${selectedLanguage}.json`;
    link.click();
    
    toast.success('Translations exported successfully');
  };

  const importTranslations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const entries = flattenTranslations(importedData);
        setTranslations(entries);
        toast.success('Translations imported successfully');
      } catch (error) {
        console.error('Error importing translations:', error);
        toast.error('Failed to import translations');
      }
    };
    reader.readAsText(file);
  };

  const getTranslationStats = () => {
    const total = translations.length;
    const missing = translations.filter(entry => entry.isMissing).length;
    const modified = translations.filter(entry => entry.isModified).length;
    const completed = total - missing;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, missing, modified, completed, completionRate };
  };

  const stats = getTranslationStats();

  if (!adminMode) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Translation management is only available to administrators.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Translation Manager</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {stats.completionRate}% Complete
            </Badge>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="translations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="translations">Translations</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="translations" className="space-y-4">
            {/* Filters and Search */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search translations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <Button
                variant={showMissingOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMissingOnly(!showMissingOnly)}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Missing Only
              </Button>
            </div>

            {/* Translation List */}
            <ScrollArea className="h-96 border rounded-md">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading translations...</span>
                  </div>
                ) : filteredTranslations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No translations found
                  </div>
                ) : (
                  filteredTranslations.map((entry) => (
                    <div
                      key={entry.key}
                      className={`p-3 border rounded-md ${
                        entry.isModified ? 'border-orange-200 bg-orange-50' :
                        entry.isMissing ? 'border-red-200 bg-red-50' :
                        'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {entry.key}
                            </code>
                            <Badge variant="secondary" className="text-xs">
                              {entry.category}
                            </Badge>
                            {entry.isModified && (
                              <Badge variant="outline" className="text-xs text-orange-600">
                                Modified
                              </Badge>
                            )}
                            {entry.isMissing && (
                              <Badge variant="destructive" className="text-xs">
                                Missing
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm">
                            {entry.value || <span className="text-muted-foreground italic">No translation</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTranslations.length} of {translations.length} translations
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={exportTranslations}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={saveTranslations}
                  disabled={loading || stats.modified === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes ({stats.modified})
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold mb-2">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">Total Keys</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{stats.completed}</div>
                  <p className="text-sm text-muted-foreground">Translated</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">{stats.missing}</div>
                  <p className="text-sm text-muted-foreground">Missing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">{stats.modified}</div>
                  <p className="text-sm text-muted-foreground">Modified</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryEntries = translations.filter(entry => entry.category === category);
                    const categoryMissing = categoryEntries.filter(entry => entry.isMissing).length;
                    const categoryCompleted = categoryEntries.length - categoryMissing;
                    const categoryRate = Math.round((categoryCompleted / categoryEntries.length) * 100);

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">
                              {categoryCompleted}/{categoryEntries.length} ({categoryRate}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${categoryRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Import Translations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Import translations from a JSON file
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importTranslations}
                      className="block w-full text-sm border rounded-md p-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Export Translations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Export current translations as JSON
                    </p>
                    <Button onClick={exportTranslations} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export {selectedLanguage}.json
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Translation Dialog */}
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Translation</DialogTitle>
            </DialogHeader>
            {editingEntry && (
              <div className="space-y-4">
                <div>
                  <Label>Key</Label>
                  <Input value={editingEntry.key} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Translation</Label>
                  <Textarea
                    value={editingEntry.value}
                    onChange={(e) => updateTranslation(editingEntry.key, e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingEntry(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setEditingEntry(null)}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TranslationManager;