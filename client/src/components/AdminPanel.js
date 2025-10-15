import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { Plus, Edit, Trash2, Radio, X, Activity, BarChart3, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPerformanceDashboard from './AdminPerformanceDashboard';
export default function AdminPanel({ onClose }) {
    const { user } = useFirebaseAuth();
    const { isAdmin, useMockData, setUseMockData, useLiveData, setUseLiveData } = useAdmin();
    const queryClient = useQueryClient();
    const [isAddingStation, setIsAddingStation] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        genre: '',
        country: '',
        language: '',
        bitrate: 128
    });
    // Fetch radio stations
    const { data: stations = [], isLoading } = useQuery({
        queryKey: ['radioStations'],
        queryFn: async () => {
            const response = await fetch(`/api/admin/radio-stations?useMockData=${useMockData}`);
            if (!response.ok)
                throw new Error('Failed to fetch stations');
            return response.json();
        }
    });
    // Fetch active listeners
    const { data: activeListeners = [], isLoading: listenersLoading } = useQuery({
        queryKey: ['activeListeners', useMockData],
        queryFn: async () => {
            const response = await fetch(`/api/admin/active-listeners?useMockData=${useMockData}`);
            if (!response.ok)
                throw new Error('Failed to fetch active listeners');
            return response.json();
        }
    });
    // Fetch user statistics
    const { data: userStats = [], isLoading: statsLoading } = useQuery({
        queryKey: ['userStats', useMockData],
        queryFn: async () => {
            const response = await fetch(`/api/admin/user-statistics?useMockData=${useMockData}`);
            if (!response.ok)
                throw new Error('Failed to fetch user statistics');
            return response.json();
        }
    });
    // Add new station mutation
    const addStationMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('/api/admin/radio-stations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Failed to add radio station');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['radioStations'] });
            setIsAddingStation(false);
            setFormData({
                name: '',
                url: '',
                genre: '',
                country: '',
                language: '',
                bitrate: 128
            });
        }
    });
    // Edit station mutation
    const editStationMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(`/api/admin/radio-stations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Failed to update radio station');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['radioStations'] });
            setEditingStation(null);
            setFormData({
                name: '',
                url: '',
                genre: '',
                country: '',
                language: '',
                bitrate: 128
            });
        }
    });
    // Delete station mutation
    const deleteStationMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`/api/admin/radio-stations/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete radio station');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['radioStations'] });
        }
    });
    // Toggle station status mutation
    const toggleStationStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }) => {
            const response = await fetch(`/api/admin/radio-stations/${id}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive })
            });
            if (!response.ok) {
                throw new Error('Failed to toggle station status');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['radioStations'] });
        }
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingStation) {
            editStationMutation.mutate({ id: editingStation.id, data: formData });
        }
        else {
            addStationMutation.mutate(formData);
        }
    };
    const handleEdit = (station) => {
        setEditingStation(station);
        setFormData({
            name: station.name,
            url: station.url,
            genre: station.genre,
            country: station.country,
            language: station.language,
            bitrate: station.bitrate
        });
    };
    const handleCancel = () => {
        setEditingStation(null);
        setIsAddingStation(false);
        setFormData({
            name: '',
            url: '',
            genre: '',
            country: '',
            language: '',
            bitrate: 128
        });
    };
    if (!isAdmin) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8", children: _jsx("div", { className: "max-w-6xl mx-auto", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Access Denied" }), _jsx("p", { className: "text-xl", children: "You don't have permission to access the admin panel." })] }) }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Admin Panel" }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-0", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold mb-3 text-gray-900 dark:text-white", children: "Data Mode Controls" }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: useMockData, onCheckedChange: setUseMockData, className: "data-[state=checked]:bg-blue-600" }), _jsx(Label, { htmlFor: "test-mode", className: "text-sm font-medium", children: "Test Mode (Mock Data)" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: useLiveData, onCheckedChange: setUseLiveData, className: "data-[state=checked]:bg-green-600" }), _jsx(Label, { htmlFor: "live-data", className: "text-sm font-medium", children: "Live Data (Firebase)" })] })] }), _jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-2", children: useLiveData ? 'Using real Firebase data' : 'Using mock/test data' })] }), _jsxs(Tabs, { defaultValue: "radio-stations", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4 bg-gray-700", children: [_jsxs(TabsTrigger, { value: "radio-stations", className: "flex items-center gap-2", children: [_jsx(Radio, { className: "h-4 w-4" }), "Radio Stations"] }), _jsxs(TabsTrigger, { value: "performance", className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-4 w-4" }), "Performance"] }), _jsxs(TabsTrigger, { value: "analytics", className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), "Analytics"] }), _jsxs(TabsTrigger, { value: "settings", className: "flex items-center gap-2", children: [_jsx(Settings, { className: "h-4 w-4" }), "Settings"] })] }), _jsxs(TabsContent, { value: "radio-stations", className: "space-y-6", children: [(isAddingStation || editingStation) && (_jsxs("div", { className: "bg-gray-800/50 border border-gray-700 rounded-lg p-6", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: editingStation ? 'Edit Radio Station' : 'Add New Radio Station' }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "URL" }), _jsx("input", { type: "url", value: formData.url, onChange: (e) => setFormData({ ...formData, url: e.target.value }), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Genre" }), _jsx("input", { type: "text", value: formData.genre, onChange: (e) => setFormData({ ...formData, genre: e.target.value }), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Country" }), _jsx("input", { type: "text", value: formData.country, onChange: (e) => setFormData({ ...formData, country: e.target.value }), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Language" }), _jsx("input", { type: "text", value: formData.language, onChange: (e) => setFormData({ ...formData, language: e.target.value }), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Bitrate" }), _jsx("input", { type: "number", value: formData.bitrate, onChange: (e) => setFormData({ ...formData, bitrate: parseInt(e.target.value) }), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent", min: "32", max: "320", required: true })] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "submit", className: "bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-0", children: addStationMutation.isPending || editStationMutation.isPending ? 'Saving...' : 'Save' }), _jsx("button", { type: "button", onClick: handleCancel, className: "bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-0", children: "Cancel" })] })] })] })), !isAddingStation && !editingStation && (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Radio Stations" }), _jsxs("button", { onClick: () => setIsAddingStation(true), className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-0 flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add Station"] })] })), _jsx("div", { className: "bg-gray-800/50 border border-gray-700 rounded-lg p-6", children: isLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-300", children: "Loading stations..." })] })) : stations.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-300", children: [_jsx(Radio, { className: "w-16 h-16 mx-auto mb-4 text-gray-600" }), _jsx("p", { children: "No radio stations found." })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-700", children: [_jsx("th", { className: "text-left py-3 px-4", children: "Name" }), _jsx("th", { className: "text-left py-3 px-4", children: "Genre" }), _jsx("th", { className: "text-left py-3 px-4", children: "Country" }), _jsx("th", { className: "text-left py-3 px-4", children: "Language" }), _jsx("th", { className: "text-left py-3 px-4", children: "Bitrate" }), _jsx("th", { className: "text-left py-3 px-4", children: "Status" }), _jsx("th", { className: "text-left py-3 px-4", children: "Actions" })] }) }), _jsx("tbody", { children: stations.map((station) => (_jsxs("tr", { className: "border-b border-gray-700/50 hover:bg-gray-700/30", children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: station.name }), _jsx("div", { className: "text-sm text-gray-400 truncate max-w-xs", children: station.url })] }) }), _jsx("td", { className: "py-3 px-4", children: station.genre }), _jsx("td", { className: "py-3 px-4", children: station.country }), _jsx("td", { className: "py-3 px-4", children: station.language }), _jsxs("td", { className: "py-3 px-4", children: [station.bitrate, " kbps"] }), _jsx("td", { className: "py-3 px-4", children: _jsx("button", { onClick: () => toggleStationStatusMutation.mutate({
                                                                        id: station.id,
                                                                        isActive: !station.isActive
                                                                    }), disabled: toggleStationStatusMutation.isPending, className: `px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-0 ${station.isActive
                                                                        ? 'bg-green-600/20 text-green-400 border border-green-500/50'
                                                                        : 'bg-red-600/20 text-red-400 border border-red-500/50'}`, children: station.isActive ? 'Active' : 'Inactive' }) }), _jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEdit(station), className: "bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-0", title: "Edit", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => deleteStationMutation.mutate(station.id), disabled: deleteStationMutation.isPending, className: "bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-0", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, station.id))) })] }) })) })] }), _jsx(TabsContent, { value: "performance", className: "mt-6", children: _jsx(AdminPerformanceDashboard, {}) }), _jsx(TabsContent, { value: "analytics", className: "mt-6", children: _jsxs("div", { className: "bg-gray-800/50 border border-gray-700 rounded-lg p-6", children: [_jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Analytics Dashboard" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-gray-700/50 p-4 rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Active Listeners" }), listenersLoading ? (_jsx("div", { className: "animate-pin rounded-full h-8 w-8 border-b-2 border-purple-500" })) : (_jsx("p", { className: "text-3xl font-bold text-purple-400", children: activeListeners.length }))] }), _jsxs("div", { className: "bg-gray-700/50 p-4 rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Total Users" }), statsLoading ? (_jsx("div", { className: "animate-pin rounded-full h-8 w-8 border-b-2 border-purple-500" })) : (_jsx("p", { className: "text-3xl font-bold text-blue-400", children: userStats.length }))] }), _jsxs("div", { className: "bg-gray-700/50 p-4 rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Radio Stations" }), isLoading ? (_jsx("div", { className: "animate-pin rounded-full h-8 w-8 border-b-2 border-purple-500" })) : (_jsx("p", { className: "text-3xl font-bold text-green-400", children: stations.length }))] })] })] }) }), _jsx(TabsContent, { value: "settings", className: "mt-6", children: _jsxs("div", { className: "bg-gray-800/50 border border-gray-700 rounded-lg p-6", children: [_jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Admin Settings" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-700/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: "Performance Monitoring" }), _jsx("p", { className: "text-sm text-gray-400", children: "Track site performance and user experience" })] }), _jsx(Switch, { checked: true, disabled: true, className: "data-[state=checked]:bg-green-600" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-700/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: "Firebase Integration" }), _jsx("p", { className: "text-sm text-gray-400", children: "Real-time data synchronization" })] }), _jsx(Switch, { checked: useLiveData, onCheckedChange: setUseLiveData, className: "data-[state=checked]:bg-green-600" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-700/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: "Test Mode" }), _jsx("p", { className: "text-sm text-gray-400", children: "Use mock data for testing" })] }), _jsx(Switch, { checked: useMockData, onCheckedChange: setUseMockData, className: "data-[state=checked]:bg-blue-600" })] })] })] }) })] })] }) }));
}
