import { useNavigate } from 'react-router-dom';

export function useAppNavigation() {
  const navigate = useNavigate();

  const navigateToTrips = () => {
    navigate('/trips');
  };

  const navigateToExplore = () => {
    navigate('/explore');
  };

  const navigateToFleet = () => {
    navigate('/fleet');
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToAdmin = () => {
    navigate('/admin');
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return {
    navigateToTrips,
    navigateToExplore,
    navigateToFleet,
    navigateToHome,
    navigateToAdmin,
    navigateToDashboard,
    navigate, // Raw navigate function for custom navigation
  };
}
