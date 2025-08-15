import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import { useAdmin } from '../contexts/AdminContext'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Radio,
  X,
  Activity,
  BarChart3,
  Settings
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminPerformanceDashboard from './AdminPerformanceDashboard'

interface RadioStation {
  id: string
  name: string
  url: string
  genre: string
  country: string
  language: string
  bitrate: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface RadioStationFormData {
  name: string
  url: string
  genre: string
  country: string
  language: string
  bitrate: number
}

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { user } = useFirebaseAuth()
  const { isAdmin, useMockData, setUseMockData, useLiveData, setUseLiveData } = useAdmin()
  const queryClient = useQueryClient()
  const [isAddingStation, setIsAddingStation] = useState(false)
  const [editingStation, setEditingStation] = useState<RadioStation | null>(null)
  const [formData, setFormData] = useState<RadioStationFormData>({
    name: '',
    url: '',
    genre: '',
    country: '',
    language: '',
    bitrate: 128
  })

  // Fetch radio stations
  const { data: stations = [], isLoading } = useQuery({
    queryKey: ['radioStations'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/radio-stations?useMockData=${useMockData}`)
      if (!response.ok) throw new Error('Failed to fetch stations')
      return response.json()
    }
  })

  // Fetch active listeners
  const { data: activeListeners = [], isLoading: listenersLoading } = useQuery({
    queryKey: ['activeListeners', useMockData],
    queryFn: async () => {
      const response = await fetch(`/api/admin/active-listeners?useMockData=${useMockData}`)
      if (!response.ok) throw new Error('Failed to fetch active listeners')
      return response.json()
    }
  })

  // Fetch user statistics
  const { data: userStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', useMockData],
    queryFn: async () => {
      const response = await fetch(`/api/admin/user-statistics?useMockData=${useMockData}`)
      if (!response.ok) throw new Error('Failed to fetch user statistics')
      return response.json()
    }
  })

  // Add new station mutation
  const addStationMutation = useMutation({
    mutationFn: async (data: RadioStationFormData) => {
      const response = await fetch('/api/admin/radio-stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error('Failed to add radio station')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStations'] })
      setIsAddingStation(false)
      setFormData({
        name: '',
        url: '',
        genre: '',
        country: '',
        language: '',
        bitrate: 128
      })
    }
  })

  // Edit station mutation
  const editStationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RadioStationFormData }) => {
      const response = await fetch(`/api/admin/radio-stations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error('Failed to update radio station')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStations'] })
      setEditingStation(null)
      setFormData({
        name: '',
        url: '',
        genre: '',
        country: '',
        language: '',
        bitrate: 128
      })
    }
  })

  // Delete station mutation
  const deleteStationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/radio-stations/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete radio station')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStations'] })
    }
  })

  // Toggle station status mutation
  const toggleStationStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/radio-stations/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })
      if (!response.ok) {
        throw new Error('Failed to toggle station status')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStations'] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingStation) {
      editStationMutation.mutate({ id: editingStation.id, data: formData })
    } else {
      addStationMutation.mutate(formData)
    }
  }

  const handleEdit = (station: RadioStation) => {
    setEditingStation(station)
    setFormData({
      name: station.name,
      url: station.url,
      genre: station.genre,
      country: station.country,
      language: station.language,
      bitrate: station.bitrate
    })
  }

  const handleCancel = () => {
    setEditingStation(null)
    setIsAddingStation(false)
    setFormData({
      name: '',
      url: '',
      genre: '',
      country: '',
      language: '',
      bitrate: 128
    })
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-xl">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-0"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Data Mode Toggles */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Data Mode Controls</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={useMockData}
                onCheckedChange={setUseMockData}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="test-mode" className="text-sm font-medium">
                Test Mode (Mock Data)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={useLiveData}
                onCheckedChange={setUseLiveData}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="live-data" className="text-sm font-medium">
                Live Data (Firebase)
              </Label>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {useLiveData ? 'Using real Firebase data' : 'Using mock/test data'}
          </p>
        </div>

        {/* Admin Panel Tabs */}
        <Tabs defaultValue="radio-stations" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-700">
            <TabsTrigger value="radio-stations" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Radio Stations
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Radio Stations Tab */}
          <TabsContent value="radio-stations" className="space-y-6">
            {/* Add/Edit Station Form */}
            {(isAddingStation || editingStation) && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {editingStation ? 'Edit Radio Station' : 'Add New Radio Station'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">URL</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Genre</label>
                      <input
                        type="text"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Language</label>
                      <input
                        type="text"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bitrate</label>
                      <input
                        type="number"
                        value={formData.bitrate}
                        onChange={(e) => setFormData({ ...formData, bitrate: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="32"
                        max="320"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-0"
                    >
                      {addStationMutation.isPending || editStationMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-0"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Station Button */}
            {!isAddingStation && !editingStation && (
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Radio Stations</h2>
                <button
                  onClick={() => setIsAddingStation(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-0 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Station
                </button>
              </div>
            )}

            {/* Radio Stations List */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-4 text-gray-300">Loading stations...</p>
                </div>
              ) : stations.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <Radio className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p>No radio stations found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Genre</th>
                        <th className="text-left py-3 px-4">Country</th>
                        <th className="text-left py-3 px-4">Language</th>
                        <th className="text-left py-3 px-4">Bitrate</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.map((station: RadioStation) => (
                        <tr key={station.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{station.name}</div>
                              <div className="text-sm text-gray-400 truncate max-w-xs">{station.url}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{station.genre}</td>
                          <td className="py-3 px-4">{station.country}</td>
                          <td className="py-3 px-4">{station.language}</td>
                          <td className="py-3 px-4">{station.bitrate} kbps</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleStationStatusMutation.mutate({
                                id: station.id,
                                isActive: !station.isActive
                              })}
                              disabled={toggleStationStatusMutation.isPending}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-0 ${
                                station.isActive
                                  ? 'bg-green-600/20 text-green-400 border border-green-500/50'
                                  : 'bg-red-600/20 text-red-400 border border-red-500/50'
                              }`}
                            >
                              {station.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(station)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-0"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteStationMutation.mutate(station.id)}
                                disabled={deleteStationMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-0"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Performance Monitoring Tab */}
          <TabsContent value="performance" className="mt-6">
            <AdminPerformanceDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Listeners */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Active Listeners</h3>
                  {listenersLoading ? (
                    <div className="animate-pin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-400">{activeListeners.length}</p>
                  )}
                </div>

                {/* User Statistics */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Total Users</h3>
                  {statsLoading ? (
                    <div className="animate-pin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  ) : (
                    <p className="text-3xl font-bold text-blue-400">{userStats.length}</p>
                  )}
                </div>

                {/* Radio Stations */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Radio Stations</h3>
                  {isLoading ? (
                    <div className="animate-pin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  ) : (
                    <p className="text-3xl font-bold text-green-400">{stations.length}</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Admin Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Performance Monitoring</h3>
                    <p className="text-sm text-gray-400">Track site performance and user experience</p>
                  </div>
                  <Switch checked={true} disabled className="data-[state=checked]:bg-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Firebase Integration</h3>
                    <p className="text-sm text-gray-400">Real-time data synchronization</p>
                  </div>
                  <Switch checked={useLiveData} onCheckedChange={setUseLiveData} className="data-[state=checked]:bg-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Test Mode</h3>
                    <p className="text-sm text-gray-400">Use mock data for testing</p>
                  </div>
                  <Switch checked={useMockData} onCheckedChange={setUseMockData} className="data-[state=checked]:bg-blue-600" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}