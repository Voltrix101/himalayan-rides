import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Car,
  Bike,
  Truck,
  Star,
  X,
  MapPin,
  Fuel,
  Settings,
  Users
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

export function VehiclesPage() {
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
    filterVehicles();
  }, [vehicles, searchTerm, selectedType]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehiclesData = await loadVehiclesData();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const loadVehiclesData = async (): Promise<Vehicle[]> => {
    try {
      // Try Firestore first
      const vehiclesRef = collection(db, 'vehicles');
      const snapshot = await getDocs(vehiclesRef);
      
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Vehicle));
      }
    } catch (error) {
      console.log('Firestore not available, using localStorage fallback');
    }

    // Fallback to localStorage or default data
    const storedVehicles = localStorage.getItem('vehicles');
    if (storedVehicles) {
      return JSON.parse(storedVehicles);
    }

    // Default sample vehicles if nothing exists
    const defaultVehicles: Vehicle[] = [
      {
        id: '1',
        name: 'Royal Enfield Himalayan',
        type: 'bike',
        region: 'Ladakh',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        rating: 4.8,
        fuel: 'Petrol',
        gearbox: 'Manual',
        features: ['ABS', 'Long Range Fuel Tank', 'All-Terrain Tires'],
        available: true
      },
      {
        id: '2',
        name: 'Mahindra Thar',
        type: 'suv',
        region: 'Spiti Valley',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500',
        rating: 4.6,
        fuel: 'Diesel',
        gearbox: 'Manual',
        seats: 4,
        features: ['4WD', 'High Ground Clearance', 'Bull Bar'],
        available: true
      }
    ];

    localStorage.setItem('vehicles', JSON.stringify(defaultVehicles));
    return defaultVehicles;
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.fuel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === selectedType);
    }

    setFilteredVehicles(filtered);
  };

  const resetForm = () => {
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
    setEditingVehicle(null);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      region: vehicle.region,
      price: vehicle.price,
      image: vehicle.image,
      rating: vehicle.rating,
      fuel: vehicle.fuel,
      gearbox: vehicle.gearbox,
      seats: vehicle.seats,
      features: [...vehicle.features],
      available: vehicle.available
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVehicle) {
        // Update existing vehicle
        try {
          const vehicleRef = doc(db, 'vehicles', editingVehicle.id);
          await updateDoc(vehicleRef, { ...formData } as any);
        } catch (error) {
          // Fallback to localStorage
          const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
          const index = storedVehicles.findIndex((v: Vehicle) => v.id === editingVehicle.id);
          if (index !== -1) {
            storedVehicles[index] = { ...editingVehicle, ...formData };
            localStorage.setItem('vehicles', JSON.stringify(storedVehicles));
          }
        }

        setVehicles(prev => prev.map(v => 
          v.id === editingVehicle.id ? { ...v, ...formData } : v
        ));
        toast.success('Vehicle updated successfully');
      } else {
        // Add new vehicle
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          ...formData
        };

        try {
          const docRef = await addDoc(collection(db, 'vehicles'), formData);
          newVehicle.id = docRef.id;
        } catch (error) {
          // Fallback to localStorage
          const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
          storedVehicles.push(newVehicle);
          localStorage.setItem('vehicles', JSON.stringify(storedVehicles));
        }

        setVehicles(prev => [...prev, newVehicle]);
        toast.success('Vehicle added successfully');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle');
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      try {
        await deleteDoc(doc(db, 'vehicles', vehicleId));
      } catch (error) {
        // Fallback to localStorage
        const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
        const filtered = storedVehicles.filter((v: Vehicle) => v.id !== vehicleId);
        localStorage.setItem('vehicles', JSON.stringify(filtered));
      }

      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const addFeature = () => {
    const feature = prompt('Enter feature name:');
    if (feature && !formData.features.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/20 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse">
              <div className="p-6">
                <div className="h-32 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Vehicles Management</h1>
          <p className="text-white/60">Manage your vehicle fleet</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vehicles by name, region, or fuel type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
            >
              <option value="all">All Types</option>
              <option value="bike">Bikes</option>
              <option value="car">Cars</option>
              <option value="suv">SUVs</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="overflow-hidden hover:scale-105 transition-transform duration-200">
              {/* Vehicle Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{vehicle.rating}</span>
                  </div>
                </div>
                <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${
                  vehicle.available 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {vehicle.available ? 'Available' : 'Unavailable'}
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{vehicle.name}</h3>
                  <span className="text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                    {vehicle.type.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-white/60 text-sm mb-4">{vehicle.region}</p>
                
                <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
                  <span>{vehicle.fuel}</span>
                  <span>•</span>
                  <span>{vehicle.gearbox}</span>
                  {vehicle.seats && (
                    <>
                      <span>•</span>
                      <span>{vehicle.seats} seats</span>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">₹{vehicle.price.toLocaleString()}/day</p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 2 && (
                      <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full">
                        +{vehicle.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(vehicle)}
                    variant="secondary"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(vehicle.id)}
                    variant="secondary"
                    className="px-3 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">No vehicles found</p>
          <p className="text-white/40 mb-6">
            {searchTerm || selectedType !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Add your first vehicle to get started'
            }
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      )}

      {/* Add/Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <GlassCard>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2">Vehicle Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'bike' | 'car' | 'suv' }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        required
                      >
                        <option value="bike">Bike</option>
                        <option value="car">Car</option>
                        <option value="suv">SUV</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Region *</label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Price per Day (₹) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-white/80 mb-2">Image URL *</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2">Fuel Type *</label>
                      <input
                        type="text"
                        value={formData.fuel}
                        onChange={(e) => setFormData(prev => ({ ...prev, fuel: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Gearbox *</label>
                      <input
                        type="text"
                        value={formData.gearbox}
                        onChange={(e) => setFormData(prev => ({ ...prev, gearbox: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Seats (Optional)</label>
                      <input
                        type="number"
                        value={formData.seats || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seats: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {/* Rating & Availability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2">Rating (1-5) *</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Availability</label>
                      <div className="flex items-center gap-4 pt-3">
                        <label className="flex items-center gap-2 text-white">
                          <input
                            type="radio"
                            name="available"
                            checked={formData.available}
                            onChange={() => setFormData(prev => ({ ...prev, available: true }))}
                            className="text-blue-500"
                          />
                          Available
                        </label>
                        <label className="flex items-center gap-2 text-white">
                          <input
                            type="radio"
                            name="available"
                            checked={!formData.available}
                            onChange={() => setFormData(prev => ({ ...prev, available: false }))}
                            className="text-blue-500"
                          />
                          Unavailable
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-white/80">Features</label>
                      <Button type="button" onClick={addFeature} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-white/10 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1">
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}
