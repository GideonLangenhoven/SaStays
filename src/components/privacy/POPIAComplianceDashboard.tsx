
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Users, FileText, AlertTriangle, CheckCircle, Clock, Download, Trash2, Eye, Settings, RefreshCw, Search } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { POPIAComplianceStatus, DataAccessRequest, DataBreachIncident, PrivacyAuditEntry, CreateDataBreachRequest } from '@/types/popia';
import popiaService from '@/services/popiaService';

// Sub-components
const MetricCard = ({ label, value, icon: Icon, color, description }: { label: string, value: number, icon: React.ElementType, color: string, description: string }) => (
  <Card>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className={color}><Icon className="h-8 w-8" /></div>
    </CardContent>
  </Card>
);

const ComplianceScore = ({ status }: { status: POPIAComplianceStatus | null }) => {
  const calculateScore = () => {
    if (!status) return 0;
    let score = 100;
    if (status.pendingRequests > 0) score -= Math.min(status.pendingRequests * 5, 30);
    if (status.activeBreaches > 0) score -= Math.min(status.activeBreaches * 20, 50);
    const consentRatio = status.activeCustomers > 0 ? (status.activeConsents / status.activeCustomers) : 1;
    if (consentRatio < 0.8) score -= (0.8 - consentRatio) * 50;
    return Math.max(score, 0);
  };

  const getLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 80) return { label: 'Good', color: 'text-blue-600' };
    if (score >= 70) return { label: 'Fair', color: 'text-yellow-600' };
    if (score >= 60) return { label: 'Poor', color: 'text-orange-600' };
    return { label: 'Critical', color: 'text-red-600' };
  };

  const score = calculateScore();
  const level = getLevel(score);

  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Compliance Score</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{score}%</div>
            <div>
              <div className={`text-lg font-semibold ${level.color}`}>{level.label}</div>
              <Progress value={score} className="w-48" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-2">Last Updated</p>
          <p className="font-medium">{format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export const POPIAComplianceDashboard: React.FC<{ ownerId: string }> = ({ ownerId }) => {
  const [status, setStatus] = useState<POPIAComplianceStatus | null>(null);
  const [requests, setRequests] = useState<DataAccessRequest[]>([]);
  const [breaches, setBreaches] = useState<DataBreachIncident[]>([]);
  const [audits, setAudits] = useState<PrivacyAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusData, requestsData, breachesData, auditData] = await Promise.all([
        popiaService.getComplianceStatus(),
        popiaService.getDataAccessRequests(1, 10),
        popiaService.getDataBreaches(),
        popiaService.getAuditTrail(undefined, undefined, undefined, undefined, 1, 20)
      ]);
      setStatus(statusData);
      setRequests(requestsData.requests);
      setBreaches(breachesData);
      setAudits(auditData.entries);
    } catch (error) {
      toast.error('Failed to load compliance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">POPIA Compliance</h1><p className="text-muted-foreground">Data protection and compliance overview</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}><RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />Refresh</Button>
          <Button><Download className="h-4 w-4 mr-2" />Export Report</Button>
        </div>
      </div>

      <ComplianceScore status={status} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard label="Active Customers" value={status?.activeCustomers || 0} icon={Users} color="text-blue-600" description="Customers with active data" />
        <MetricCard label="Active Consents" value={status?.activeConsents || 0} icon={CheckCircle} color="text-green-600" description="Valid consent records" />
        <MetricCard label="Pending Requests" value={status?.pendingRequests || 0} icon={Clock} color="text-orange-600" description="Data access requests awaiting action" />
        <MetricCard label="Expiring Soon" value={status?.expiringSoon || 0} icon={AlertTriangle} color="text-red-600" description="Data expiring in 30 days" />
        <MetricCard label="Active Breaches" value={status?.activeBreaches || 0} icon={Shield} color="text-red-600" description="Unresolved security incidents" />
        <MetricCard label="Anonymized Data" value={status?.anonymizedCustomers || 0} icon={Users} color="text-gray-600" description="Anonymized customer records" />
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-4"><TabsTrigger value="requests">Data Requests</TabsTrigger><TabsTrigger value="breaches">Security Breaches</TabsTrigger><TabsTrigger value="audit">Audit Trail</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList>
        <TabsContent value="requests"><DataAccessRequestsTab requests={requests} /></TabsContent>
        <TabsContent value="breaches"><DataBreachesTab breaches={breaches} refreshData={loadData} /></TabsContent>
        <TabsContent value="audit"><AuditTrailTab audits={audits} /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

const DataAccessRequestsTab = ({ requests }: { requests: DataAccessRequest[] }) => (
  <Card>
    <CardHeader><CardTitle>Data Access Requests</CardTitle><CardDescription>Customer requests for data access, rectification, and erasure</CardDescription></CardHeader>
    <CardContent>
      {requests.length > 0 ? (
        <ul className="space-y-4">
          {requests.map(req => (
            <li key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium capitalize">{req.requestType.replace('_', ' ')} Request</p>
                <p className="text-sm text-muted-foreground">Requested {formatDistanceToNow(new Date(req.requestDate), { addSuffix: true })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={req.status === 'completed' ? 'default' : 'outline'}>{req.status}</Badge>
                <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-muted-foreground text-center py-8">No data access requests.</p>}
    </CardContent>
  </Card>
);

const DataBreachesTab = ({ breaches, refreshData }: { breaches: DataBreachIncident[], refreshData: () => void }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between"><div className="space-y-1.5"><CardTitle>Security Breaches</CardTitle><CardDescription>Data security incidents and breach management</CardDescription></div><ReportBreachDialog refreshData={refreshData} /></CardHeader>
    <CardContent>
      {breaches.length > 0 ? (
        <ul className="space-y-4">
          {breaches.map(br => (
            <li key={br.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{br.breachReference}</p>
                <p className="text-sm text-muted-foreground">Detected {formatDistanceToNow(new Date(br.detectionDate), { addSuffix: true })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={br.status === 'resolved' ? 'default' : 'destructive'}>{br.status}</Badge>
                <Badge variant="outline">{br.severityLevel}</Badge>
                <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-muted-foreground text-center py-8">No security breaches reported.</p>}
    </CardContent>
  </Card>
);

const AuditTrailTab = ({ audits }: { audits: PrivacyAuditEntry[] }) => (
  <Card>
    <CardHeader><CardTitle>Privacy Audit Trail</CardTitle><CardDescription>Log of all data processing activities</CardDescription></CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 mb-4"><Input placeholder="Search audit log..." /><Button variant="outline"><Search className="h-4 w-4" /></Button></div>
      <ScrollArea className="h-96">
        <ul className="space-y-2">
          {audits.map(log => (
            <li key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
              <div>
                <p className="font-medium capitalize">{log.actionType.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">Customer ID: {log.customerId} | Source: {log.actionSource}</p>
              </div>
              <p className="text-xs text-muted-foreground">{format(new Date(log.createdAt), 'MMM dd, HH:mm')}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </CardContent>
  </Card>
);

const SettingsTab = () => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card>
      <CardHeader><CardTitle>Data Retention</CardTitle><CardDescription>Manage automatic data cleanup policies</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between"><Label>Default Retention Period</Label><p className="font-medium">7 years</p></div>
        <Button variant="outline" className="w-full">Customize Policy</Button>
        <Button className="w-full"><Trash2 className="h-4 w-4 mr-2" />Run Manual Cleanup</Button>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Compliance Reports</CardTitle><CardDescription>Generate and download reports</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2"><Button variant="outline">JSON</Button><Button variant="outline">CSV</Button><Button variant="outline">PDF</Button></div>
        <Button variant="outline" className="w-full"><Settings className="h-4 w-4 mr-2" />Schedule Reports</Button>
      </CardContent>
    </Card>
  </div>
);

const ReportBreachDialog = ({ refreshData }: { refreshData: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateDataBreachRequest>({ detectionDate: new Date(), breachType: 'confidentiality', severityLevel: 'medium', affectedDataCategories: [], affectedIndividualsCount: 0, description: '', cause: '', immediateActions: '' });

  const handleSubmit = async () => {
    try {
      await popiaService.reportDataBreach(form);
      toast.success('Data breach reported.');
      setOpen(false);
      refreshData();
    } catch (error) {
      toast.error('Failed to report breach.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><AlertTriangle className="h-4 w-4 mr-2" />Report Breach</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Report a New Data Breach</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Detection Date</Label><Input type="datetime-local" defaultValue={format(form.detectionDate, "yyyy-MM-dd'T'HH:mm")} onChange={e => setForm(f => ({ ...f, detectionDate: new Date(e.target.value) }))} /></div>
            <div><Label>Severity</Label><Select value={form.severityLevel} onValueChange={(v: any) => setForm(f => ({ ...f, severityLevel: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label>Description</Label><Textarea placeholder="Describe the nature of the breach..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><Label>Immediate Actions</Label><Textarea placeholder="Actions taken to contain the breach..." value={form.immediateActions} onChange={e => setForm(f => ({ ...f, immediateActions: e.target.value }))} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Submit Report</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POPIAComplianceDashboard;
