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
  Settings,
  Package,
  CreditCard,
  Save
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const { isAdmin, useMockData, setUseMockData, useLiveData, setUseLiveData, login } = useAdmin()
  const queryClient = useQueryClient()
  const [isAddingStation, setIsAddingStation] = useState(false)
  const [isTogglingDataMode, setIsTogglingDataMode] = useState(false)
  const [editingStation, setEditingStation] = useState<RadioStation | null>(null)

  // Handle data mode toggle with loading state
  const handleMockDataToggle = async (checked: boolean) => {
    setIsTogglingDataMode(true)
    try {
      setUseMockData(checked)
      // Invalidate all queries to force refetch with new data mode
      await queryClient.invalidateQueries({ queryKey: ['radioStations'] })
      await queryClient.invalidateQueries({ queryKey: ['activeListeners'] })
      await queryClient.invalidateQueries({ queryKey: ['userStats'] })
    } finally {
      setTimeout(() => setIsTogglingDataMode(false), 500) // Brief loading state
    }
  }

  const handleLiveDataToggle = async (checked: boolean) => {
    setIsTogglingDataMode(true)
    try {
      setUseLiveData(checked)
      // Invalidate all queries to force refetch with new data mode
      await queryClient.invalidateQueries({ queryKey: ['radioStations'] })
      await queryClient.invalidateQueries({ queryKey: ['activeListeners'] })
      await queryClient.invalidateQueries({ queryKey: ['userStats'] })
    } finally {
      setTimeout(() => setIsTogglingDataMode(false), 500) // Brief loading state
    }
  }

  const handleDeleteStation = async (stationId: string) => {
    try {
      // Mock delete functionality - in real app, this would call the API
      console.log('Deleting station:', stationId)
      // You can add actual delete logic here
    } catch (error) {
      console.error('Error deleting station:', error)
    }
  }


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
    queryKey: ['radioStations', useMockData],
    queryFn: async () => {
      const response = await fetch(`/api/admin/radio-stations?useMockData=${useMockData}`)
      if (!response.ok) throw new Error('Failed to fetch stations')
      return response.json()
    },
    refetchOnWindowFocus: false,
    staleTime: 0 // Always refetch when toggle changes
  })

  // Fetch active listeners
  const { data: activeListeners = [], isLoading: listenersLoading } = useQuery({
    queryKey: ['activeListeners', useMockData],
    queryFn: async () => {
      const response = await fetch(`/api/admin/active-listeners?useMockData=${useMockData}`)
      if (!response.ok) throw new Error('Failed to fetch active listeners')
      return response.json()
    },
    refetchOnWindowFocus: false,
    staleTime: 0 // Always refetch when toggle changes
  })

  // Fetch user statistics
  const { data: userStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', useMockData],
    queryFn: async () => {
      const response = await fetch(`/api/admin/user-statistics?useMockData=${useMockData}`)
      if (!response.ok) throw new Error('Failed to fetch user statistics')
      return response.json()
    },
    refetchOnWindowFocus: false,
    staleTime: 0 // Always refetch when toggle changes
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-0"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const username = formData.get('username') as string;
            const password = formData.get('password') as string;
            
            const success = await login(username, password);
            if (!success) {
              alert('Invalid credentials. Try admin/password');
            }
          }} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter password"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              <p>Admin credentials: adminAccess / password123</p>
            </div>
          </form>
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
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Mode Controls</h3>
            <div className="flex items-center gap-2">
              {isTogglingDataMode ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Switching...</span>
                </div>
              ) : (
                <>
                  <div className={`w-3 h-3 rounded-full ${useMockData ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {useMockData ? 'Mock Data Active' : 'Live Data Active'}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                    Test Mode (Mock Data)
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Using mock/test data</p>
                </div>
              </div>
              <Switch
                checked={useMockData}
                onCheckedChange={handleMockDataToggle}
                disabled={isTogglingDataMode}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
            
            {/* Live Data Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                    Live Data (Firebase)
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Using real Firebase data</p>
                </div>
              </div>
              <Switch
                checked={useLiveData}
                onCheckedChange={handleLiveDataToggle}
                disabled={isTogglingDataMode}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Admin Panel Tabs */}
        <Tabs defaultValue="radio-stations" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-1.5 h-14 shadow-lg border border-gray-600/50 backdrop-blur-sm">
            <TabsTrigger 
              value="radio-stations" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-out hover:bg-gray-700/50 hover:scale-[1.02] data-[state=active]:scale-[1.02] group"
            >
              <Radio className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium text-sm">Radio Stations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-out hover:bg-gray-700/50 hover:scale-[1.02] data-[state=active]:scale-[1.02] group"
            >
              <Package className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium text-sm">Products</span>
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-out hover:bg-gray-700/50 hover:scale-[1.02] data-[state=active]:scale-[1.02] group"
            >
              <Activity className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium text-sm">Performance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-out hover:bg-gray-700/50 hover:scale-[1.02] data-[state=active]:scale-[1.02] group"
            >
              <BarChart3 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium text-sm">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-out hover:bg-gray-700/50 hover:scale-[1.02] data-[state=active]:scale-[1.02] group"
            >
              <Settings className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium text-sm">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Radio Stations Tab */}
          <TabsContent value="radio-stations" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {/* Radio Stations Management */}
            <div className="flex justify-between items-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-600/30 backdrop-blur-sm">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Radio Stations Management</h3>
              <Button
                onClick={() => setIsAddingStation(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Add Station
              </Button>
            </div>

            {/* Stations List */}
            <div className="grid gap-4">
              {stations.map((station: any) => (
                <Card key={station.id} className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 backdrop-blur-sm hover:border-gray-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{station.name}</h4>
                        <Badge 
                          variant={station.isActive ? "default" : "secondary"}
                          className={`${station.isActive 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300'
                          } transition-all duration-200`}
                        >
                          {station.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{station.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Genre:</span> {station.genre}
                        </div>
                        <div>
                          <span className="font-medium">Country:</span> {station.country}
                        </div>
                        <div>
                          <span className="font-medium">Language:</span> {station.language}
                        </div>
                        <div>
                          <span className="font-medium">Bitrate:</span> {station.bitrate} kbps
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStation(station)}
                        className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/30 text-blue-400 hover:from-blue-500/20 hover:to-blue-600/20 hover:border-blue-400/50 hover:text-blue-300 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStation(station.id)}
                        className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30 text-red-400 hover:from-red-500/20 hover:to-red-600/20 hover:border-red-400/50 hover:text-red-300 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

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

          {/* Products Management Tab */}
          <TabsContent value="products" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-600/30 backdrop-blur-sm">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Stripe Products Management</h3>
              <Button
                onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <CreditCard className="h-4 w-4" />
                Manage in Stripe
              </Button>
            </div>

            {/* Subscription Products */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">Subscription Plans</h4>
              <div className="grid gap-4">
                <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 backdrop-blur-sm hover:border-gray-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-bold text-lg text-white">Rebel Plan</h5>
                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">Subscription</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">$10.00/month - Basic premium features</p>
                      <p className="text-xs text-gray-500">Product ID: prod_SYtaAhwYUbBRCN</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-400 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/50 backdrop-blur-sm hover:border-purple-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-bold text-lg text-white">Legend Plan</h5>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">Popular</Badge>
                        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">Subscription</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">$15.00/month - Advanced premium features</p>
                      <p className="text-xs text-gray-500">Product ID: prod_SYtb33Yg1ISFTP</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-400 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold">Icon Plan</h5>
                        <Badge variant="outline">Subscription</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">$5.00/month - Premium features</p>
                      <p className="text-xs text-gray-500">Product ID: prod_SYtbFUCPQe0qoz</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-400 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Merchandise Products */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-300">Merchandise</h4>
              <div className="grid gap-4">
                <Card className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold">T-Shirt</h5>
                        <Badge variant="outline">Merchandise</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">$25.00 - Premium cotton t-shirt</p>
                      <p className="text-xs text-gray-500">Product ID: prod_SYtbVypJilHtUK</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-400 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Product Management Actions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h4 className="text-md font-semibold mb-4">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}
                  className="justify-start"
                >
                  <Package className="h-4 w-4 mr-2" />
                  View All Products in Stripe
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://dashboard.stripe.com/prices', '_blank')}
                  className="justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Pricing
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Performance Monitoring Tab */}
          <TabsContent value="performance" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <AdminPerformanceDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-xl p-8 backdrop-blur-sm shadow-lg">
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Listeners */}
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-xl border border-gray-600/30 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group">
                  <h3 className="text-lg font-medium mb-2">Active Listeners</h3>
                  {listenersLoading ? (
                    <div className="animate-pin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-400">{activeListeners.length}</p>
                  )}
                </div>

                {/* User Statistics */}
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-xl border border-gray-600/30 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
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
          <TabsContent value="settings" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
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