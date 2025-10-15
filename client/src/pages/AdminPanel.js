import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
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
            sortOrder: station.sortOrder || 0,
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
        return (_jsx("div", { className: "container mx-auto p-6", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }) }));
    }
    return (_jsxs("div", { className: "container mx-auto p-6 max-w-6xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [_jsx(Radio, { className: "h-8 w-8" }), "Radio Station Admin"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => setIsCreating(true), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add Station"] }), _jsx(Button, { onClick: () => initializeMutation.mutate(), variant: "outline", disabled: initializeMutation.isPending, children: "Initialize Defaults" })] })] }), isCreating && (_jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: editingStation ? 'Edit Radio Station' : 'Add New Radio Station' }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Station Name *" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "stationId", children: "Station ID *" }), _jsx(Input, { id: "stationId", value: formData.stationId, onChange: (e) => setFormData({ ...formData, stationId: e.target.value }), placeholder: "e.g., hot-97", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "frequency", children: "Frequency" }), _jsx(Input, { id: "frequency", value: formData.frequency, onChange: (e) => setFormData({ ...formData, frequency: e.target.value }), placeholder: "e.g., 97.1 FM" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "location", children: "Location" }), _jsx(Input, { id: "location", value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }), placeholder: "e.g., New York" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "genre", children: "Genre" }), _jsx(Input, { id: "genre", value: formData.genre, onChange: (e) => setFormData({ ...formData, genre: e.target.value }), placeholder: "e.g., Hip Hop" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "apiType", children: "API Type" }), _jsxs(Select, { value: formData.apiType, onValueChange: (value) => setFormData({ ...formData, apiType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "auto", children: "Auto Detect" }), _jsx(SelectItem, { value: "triton", children: "Triton Digital" }), _jsx(SelectItem, { value: "streamtheworld", children: "StreamTheWorld" }), _jsx(SelectItem, { value: "somafm", children: "SomaFM" }), _jsx(SelectItem, { value: "custom", children: "Custom" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Brief description of the station" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "streamUrl", children: "Stream URL *" }), _jsx(Input, { id: "streamUrl", value: formData.streamUrl, onChange: (e) => setFormData({ ...formData, streamUrl: e.target.value }), placeholder: "https://stream.example.com/radio", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "apiUrl", children: "API URL (for metadata)" }), _jsx(Input, { id: "apiUrl", value: formData.apiUrl, onChange: (e) => setFormData({ ...formData, apiUrl: e.target.value }), placeholder: "https://api.example.com/nowplaying" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "website", children: "Website" }), _jsx(Input, { id: "website", value: formData.website, onChange: (e) => setFormData({ ...formData, website: e.target.value }), placeholder: "https://station.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "logo", children: "Logo URL" }), _jsx(Input, { id: "logo", value: formData.logo, onChange: (e) => setFormData({ ...formData, logo: e.target.value }), placeholder: "https://example.com/logo.png" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "active", checked: formData.isActive, onCheckedChange: (checked) => setFormData({ ...formData, isActive: checked }) }), _jsx(Label, { htmlFor: "active", children: "Active" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sortOrder", children: "Sort Order" }), _jsx(Input, { id: "sortOrder", type: "number", value: formData.sortOrder, onChange: (e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 }), className: "w-20" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { type: "submit", disabled: createMutation.isPending || updateMutation.isPending, children: [editingStation ? 'Update' : 'Create', " Station"] }), _jsx(Button, { type: "button", variant: "outline", onClick: resetForm, children: "Cancel" })] })] }) })] })), _jsx("div", { className: "space-y-4", children: stations?.map((station) => (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: station.name }), _jsx(Badge, { variant: station.isActive ? "default" : "secondary", children: station.isActive ? "Active" : "Inactive" }), _jsx(Badge, { variant: "outline", children: station.apiType })] }), _jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "ID:" }), " ", station.stationId] }), station.frequency && _jsxs("p", { children: [_jsx("strong", { children: "Frequency:" }), " ", station.frequency] }), station.location && _jsxs("p", { children: [_jsx("strong", { children: "Location:" }), " ", station.location] }), station.genre && _jsxs("p", { children: [_jsx("strong", { children: "Genre:" }), " ", station.genre] }), station.description && _jsxs("p", { children: [_jsx("strong", { children: "Description:" }), " ", station.description] }), _jsxs("p", { children: [_jsx("strong", { children: "Stream URL:" }), " ", station.streamUrl] }), station.apiUrl && _jsxs("p", { children: [_jsx("strong", { children: "API URL:" }), " ", station.apiUrl] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleTest(station.id), disabled: testMutation.isPending, children: _jsx(TestTube, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleEdit(station), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "destructive", onClick: () => handleDelete(station.id), disabled: deleteMutation.isPending, children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }) }, station.id))) }), (stations?.length || 0) === 0 && (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center text-muted-foreground", children: [_jsx(Radio, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No radio stations configured yet." }), _jsx("p", { className: "mt-2", children: "Click \"Add Station\" or \"Initialize Defaults\" to get started." })] }) }) }))] }));
};
export default AdminPanel;
