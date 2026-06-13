import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Filter, Download } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ days: 7, limit: 50 });
  const { get } = useApi();

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await get(`/admin/audit-logs/?days=${filters.days}&limit=${filters.limit}`);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'bg-blue-500/10 text-blue-600';
    if (action.includes('created')) return 'bg-green-500/10 text-green-600';
    if (action.includes('deleted') || action.includes('blocked')) return 'bg-red-500/10 text-red-600';
    if (action.includes('approved')) return 'bg-green-500/10 text-green-600';
    if (action.includes('rejected')) return 'bg-orange-500/10 text-orange-600';
    return 'bg-gray-500/10 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Audit Logs
            </h1>
            <p className="text-muted-foreground">System activity and security logs</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium">Time Period</label>
                <div className="flex gap-2 mt-2">
                  {[7, 14, 30, 90].map((days) => (
                    <Button
                      key={days}
                      variant={filters.days === days ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, days })}
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Results</label>
                <div className="flex gap-2 mt-2">
                  {[50, 100, 200].map((limit) => (
                    <Button
                      key={limit}
                      variant={filters.limit === limit ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, limit })}
                    >
                      {limit}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log ({logs.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No logs found</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getActionColor(log.action_code)}>
                            {log.action}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">User:</span> {log.user.name} ({log.user.email})
                          </p>
                          
                          {log.target_user && (
                            <p className="text-sm">
                              <span className="font-medium">Target:</span> {log.target_user.name} ({log.target_user.email})
                            </p>
                          )}
                          
                          {log.description && (
                            <p className="text-sm text-muted-foreground mt-2">{log.description}</p>
                          )}
                          
                          {log.ip_address && (
                            <p className="text-xs text-muted-foreground mt-2">
                              IP: {log.ip_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
