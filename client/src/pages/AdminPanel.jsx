import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, TestTube, Radio } from 'lucide-react';
const AdminPanel = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        streamUrl: '',
        apiUrl: '',
        apiType: 'auto',
        stationId: '',
        frequency: '',
        location: '',
        genre: '',
        website: '',
        logo: '',
        isActive: true,
        sortOrder: 0,
    });
    // Fetch all radio stations
    const { data: stations, isLoading } = useQuery({
        queryKey: ['/api/admin/radio-stations'],
        retry: false,
    });
    // Create station mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            return await apiRequest('/api/admin/radio-stations', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/radio-stations'] });
            toast({
                title: "Station Created",
                description: "Radio station has been created successfully",
                variant: "default",
            });
            resetForm();
        },
        onError: (error) => {
            toast({
                title: "Creation Failed",
                description: error.message || "Failed to create radio station",
                variant: "destructive",
            });
        },
    });
    // Update station mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await apiRequest(`/api/admin/radio-stations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/radio-stations'] });
            toast({
                title: "Station Updated",
                description: "Radio station has been updated successfully",
                variant: "default",
            });
            resetForm();
        },
        onError: (error) => {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update radio station",
                variant: "destructive",
            });
        },
    });
    // Delete station mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await apiRequest(`/api/admin/radio-stations/${id}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/radio-stations'] });
            toast({
                title: "Station Deleted",
                description: "Radio station has been deleted successfully",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Deletion Failed",
                description: error.message || "Failed to delete radio station",
                variant: "destructive",
            });
        },
    });
    // Test station mutation
    const testMutation = useMutation({
        mutationFn: async (id) => {
            return await apiRequest(`/api/admin/radio-stations/${id}/test`, {
                method: 'POST',
            });
        },
        onSuccess: (data) => {
            toast({
                title: "Test Complete",
                description: data.message || "Station test completed",
                variant: data.status === 'success' ? "default" : "destructive",
            });
        },
        onError: (error) => {
            toast({
                title: "Test Failed",
                description: error.message || "Failed to test station",
                variant: "destructive",
            });
        },
    });
    // Initialize default stations mutation
    const initializeMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest('/api/admin/radio-stations/initialize', {
                method: 'POST',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/radio-stations'] });
            toast({
                title: "Stations Initialized",
                description: "Default radio stations have been created",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Initialization Failed",
                description: error.message || "Failed to initialize stations",
                variant: "destructive",
            });
        },
    });
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            streamUrl: '',
            apiUrl: '',
            apiType: 'auto',
            stationId: '',
            frequency: '',
            location: '',
            genre: '',
            website: '',
            logo: '',
            isActive: true,
            sortOrder: 0,
        });
        setIsCreating(false);
        setEditingStation(null);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingStation) {
            updateMutation.mutate({ id: editingStation.id, data: formData });
        }
        else {
            createMutation.mutate(formData);
        }
    };
    const handleEdit = (station) => {
        setEditingStation(station);
        setFormData({
            name: station.name,
            description: station.description || '',
            streamUrl: station.streamUrl,
            apiUrl: station.apiUrl || '',
            apiType: station.apiType,
            stationId: station.stationId,
            frequency: station.frequency || '',
            location: station.location || '',
            genre: station.genre || '',
            website: station.website || '',
            logo: station.logo || '',
            isActive: station.isActive,
            sortOrder: station.sortOrder,
        });
        setIsCreating(true);
    };
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this radio station?')) {
            deleteMutation.mutate(id);
        }
    };
    const handleTest = (id) => {
        testMutation.mutate(id);
    };
    if (isLoading) {
        return (<div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>);
    }
    return (<div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Radio className="h-8 w-8"/>
          Radio Station Admin
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4"/>
            Add Station
          </Button>
          <Button onClick={() => initializeMutation.mutate()} variant="outline" disabled={initializeMutation.isPending}>
            Initialize Defaults
          </Button>
        </div>
      </div>

      {/* Station Form */}
      {isCreating && (<Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingStation ? 'Edit Radio Station' : 'Add New Radio Station'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Station Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required/>
                </div>
                <div>
                  <Label htmlFor="stationId">Station ID *</Label>
                  <Input id="stationId" value={formData.stationId} onChange={(e) => setFormData({ ...formData, stationId: e.target.value })} placeholder="e.g., hot-97" required/>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input id="frequency" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} placeholder="e.g., 97.1 FM"/>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., New York"/>
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input id="genre" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} placeholder="e.g., Hip Hop"/>
                </div>
                <div>
                  <Label htmlFor="apiType">API Type</Label>
                  <Select value={formData.apiType} onValueChange={(value) => setFormData({ ...formData, apiType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto Detect</SelectItem>
                      <SelectItem value="triton">Triton Digital</SelectItem>
                      <SelectItem value="streamtheworld">StreamTheWorld</SelectItem>
                      <SelectItem value="somafm">SomaFM</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the station"/>
              </div>

              <div>
                <Label htmlFor="streamUrl">Stream URL *</Label>
                <Input id="streamUrl" value={formData.streamUrl} onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })} placeholder="https://stream.example.com/radio" required/>
              </div>

              <div>
                <Label htmlFor="apiUrl">API URL (for metadata)</Label>
                <Input id="apiUrl" value={formData.apiUrl} onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })} placeholder="https://api.example.com/nowplaying"/>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://station.com"/>
              </div>

              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="https://example.com/logo.png"/>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}/>
                  <Label htmlFor="active">Active</Label>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input id="sortOrder" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-20"/>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingStation ? 'Update' : 'Create'} Station
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>)}

      {/* Stations List */}
      <div className="space-y-4">
        {stations?.map((station) => (<Card key={station.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{station.name}</h3>
                    <Badge variant={station.isActive ? "default" : "secondary"}>
                      {station.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{station.apiType}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>ID:</strong> {station.stationId}</p>
                    {station.frequency && <p><strong>Frequency:</strong> {station.frequency}</p>}
                    {station.location && <p><strong>Location:</strong> {station.location}</p>}
                    {station.genre && <p><strong>Genre:</strong> {station.genre}</p>}
                    {station.description && <p><strong>Description:</strong> {station.description}</p>}
                    <p><strong>Stream URL:</strong> {station.streamUrl}</p>
                    {station.apiUrl && <p><strong>API URL:</strong> {station.apiUrl}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleTest(station.id)} disabled={testMutation.isPending}>
                    <TestTube className="h-4 w-4"/>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(station)}>
                    <Edit className="h-4 w-4"/>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(station.id)} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>))}
      </div>

      {(stations?.length || 0) === 0 && (<Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-4 opacity-50"/>
              <p>No radio stations configured yet.</p>
              <p className="mt-2">Click "Add Station" or "Initialize Defaults" to get started.</p>
            </div>
          </CardContent>
        </Card>)}
    </div>);
};
export default AdminPanel;
