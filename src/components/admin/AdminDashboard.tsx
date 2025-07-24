import { useState } from 'react';
import { PrivateAdminRoute } from './PrivateAdminRoute';
import { AdminLayout } from './AdminLayout';
import { DashboardHome } from './pages/DashboardHome';
import { BookingsPage } from './pages/BookingsPage';
import { UsersPage } from './pages/UsersPage';
import { EnhancedVehiclesPage } from './pages/EnhancedVehiclesPage';
import { RevenuePage } from './pages/RevenuePage';
import { DestinationsPage } from './pages/DestinationsPage';
import { ExperiencesPage } from './pages/ExperiencesPage';
import { BikeToursPage } from './pages/BikeToursPage';

export function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'bookings':
        return <BookingsPage />;
      case 'users':
        return <UsersPage />;
      case 'vehicles':
        return <EnhancedVehiclesPage />;
      case 'revenue':
        return <RevenuePage />;
      case 'destinations':
        return <DestinationsPage />;
      case 'experiences':
        return <ExperiencesPage />;
      case 'bikeTours':
        return <BikeToursPage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <PrivateAdminRoute>
      <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </AdminLayout>
    </PrivateAdminRoute>
  );
}
