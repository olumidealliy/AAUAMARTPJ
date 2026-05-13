import React from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './pages/SplashScreen';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BuyerLayout from './layouts/BuyerLayout';
import SellerLayout from './layouts/SellerLayout';
import AdminLayout from './layouts/AdminLayout';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/global.css';

setupIonicReact();

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  switch (currentUser.role) {
    case 'buyer':
      return <BuyerLayout />;
    case 'seller':
      return <SellerLayout />;
    case 'admin':
      return <AdminLayout />;
    default:
      return <Navigate to="/" />;
  }
};

const App: React.FC = () => {
  return (
    <IonApp>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </IonApp>
  );
};

export default App;