import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Car,
  Bike,
  Truck,
  Star,
  MapPin,
  Fuel,
  Settings,
  Users,
  IndianRupee
} from 'lucide-react';
import { AdminContentService } from '../../../services/adminContentService';
import { Vehicle } from '../../../types';
import toast from 'react-hot-toast';

interface VehicleFormData {
  name: string;
  type: 'bike' | 'car' | 'suv';
  region: string;
  price: number;
  image: string;
  rating: number;
  fuel: string;
  gearbox: string;
  seats?: number;
  features: string[];
  available: boolean;
}

export function EnhancedVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    type: 'bike',
    region: '',
    price: 0,
    image: '',
    rating: 4.5,
    fuel: '',
    gearbox: '',
    seats: undefined,
    features: [],
    available: true
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    let filtered = vehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === selectedType);
    }

    setFilteredVehicles(filtered);
  }, [searchTerm, selectedType, vehicles]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const vehicleList = await AdminContentService.getAllVehicles();
      setVehicles(vehicleList);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({
        name: '',
        type: 'bike',
        region: '',
        price: 0,
        image: '',
        rating: 4.5,
        fuel: '',
        gearbox: '',
        seats: undefined,
        features: [],
        available: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setFormData({
      name: '',
      type: 'bike',
      region: '',
      price: 0,
      image: '',
      rating: 4.5,
      fuel: '',
      gearbox: '',
      seats: undefined,
      features: [],
      available: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.region || !formData.fuel || !formData.gearbox) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingVehicle) {
        await AdminContentService.updateVehicle(editingVehicle.id, formData);
      } else {
        await AdminContentService.addVehicle(formData as Omit<Vehicle, 'id'>);
      }
      
      await loadVehicles();
      closeModal();
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (window.confirm(`Are you sure you want to delete "${vehicleName}"?`)) {
      try {
        await AdminContentService.deleteVehicle(vehicleId);
        await loadVehicles();
      } catch (error) {
        // Error already handled in service
      }
    }
  };

  const handleFeatureAdd = () => {
    const newFeature = prompt('Enter new feature:');
    if (newFeature && newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
    }
  };

  const handleFeatureRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bike': return <Bike className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      case 'suv': return <Truck className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const vehicleTypes = [
    { value: 'all', label: 'All Types', count: vehicles.length },
    { value: 'bike', label: 'Bikes', count: vehicles.filter(v => v.type === 'bike').length },
    { value: 'car', label: 'Cars', count: vehicles.filter(v => v.type === 'car').length },
    { value: 'suv', label: 'SUVs', count: vehicles.filter(v => v.type === 'suv').length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Fleet Management</h1>
          <p className="text-white/70 mt-1">Manage your entire vehicle inventory</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search vehicles by name, region, or features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value} className="bg-gray-800">
                {type.label} ({type.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Total Vehicles</h3>
          <p className="text-3xl font-bold text-orange-400 mt-2">{vehicles.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Available</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {vehicles.filter(v => v.available).length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Avg. Rating</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {vehicles.length > 0 ? (vehicles.reduce((sum, v) => sum + v.rating, 0) / vehicles.length).toFixed(1) : '0.0'}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Avg. Price</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            ₹{vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length) : 0}
          </p>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredVehicles.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* Vehicle Image */}
              <div className="relative h-48 bg-gradient-to-r from-orange-500/20 to-red-500/20">
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getVehicleIcon(vehicle.type)}
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                  vehicle.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {vehicle.available ? 'Available' : 'Unavailable'}
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  {getVehicleIcon(vehicle.type)}
                  {vehicle.type.toUpperCase()}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{vehicle.name}</h3>
                
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-1 text-white/70">
                    <MapPin className="w-4 h-4" />
                    {vehicle.region}
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                    <Fuel className="w-4 h-4" />
                    {vehicle.fuel}
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                    <Settings className="w-4 h-4" />
                    {vehicle.gearbox}
                  </div>
                  {vehicle.seats && (
                    <div className="flex items-center gap-1 text-white/70">
                      <Users className="w-4 h-4" />
                      {vehicle.seats} seats
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white/70 text-sm">{vehicle.rating}</span>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-white/50 text-xs mb-1">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 3 && (
                      <span className="text-white/50 text-xs">+{vehicle.features.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-5 h-5 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{vehicle.price}</span>
                    <span className="text-white/50 text-sm">/day</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(vehicle)}
                    className="flex-1 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
                    className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No vehicles found</h3>
          <p className="text-white/70 mb-6">
            {searchTerm || selectedType !== 'all' 
              ? 'No vehicles match your search criteria' 
              : 'Get started by adding your first vehicle'
            }
          </p>
          {!searchTerm && selectedType === 'all' && (
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              Add First Vehicle
            </button>
          )}
        </div>
      )}

      {/* Vehicle Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/20 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Vehicle Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter vehicle name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'bike' | 'car' | 'suv' }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="bike" className="bg-gray-800">Bike</option>
                        <option value="car" className="bg-gray-800">Car</option>
                        <option value="suv" className="bg-gray-800">SUV</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Region *
                      </label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Ladakh, Spiti, Sikkim"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Price per Day (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1500"
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/vehicle-image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Fuel Type *
                      </label>
                      <input
                        type="text"
                        value={formData.fuel}
                        onChange={(e) => setFormData(prev => ({ ...prev, fuel: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Petrol, Diesel, Electric"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Gearbox *
                      </label>
                      <input
                        type="text"
                        value={formData.gearbox}
                        onChange={(e) => setFormData(prev => ({ ...prev, gearbox: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Manual, Automatic"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Seats {formData.type === 'bike' ? '(Optional)' : '*'}
                      </label>
                      <input
                        type="number"
                        value={formData.seats || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seats: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="4"
                        min="1"
                        required={formData.type !== 'bike'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 4.5 }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-8">
                      <input
                        type="checkbox"
                        id="available"
                        checked={formData.available}
                        onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="available" className="text-white/70 text-sm font-medium">
                        Available for Booking
                      </label>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-white/70 text-sm font-medium">
                        Features
                      </label>
                      <button
                        type="button"
                        onClick={handleFeatureAdd}
                        className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Add Feature
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleFeatureRemove(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
