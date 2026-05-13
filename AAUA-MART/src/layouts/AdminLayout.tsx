import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IonPage, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { gridOutline, peopleOutline, listOutline, personOutline } from 'ionicons/icons';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers     from '../pages/admin/Users';
import AdminOrders    from '../pages/admin/Orders';
import AdminProfile   from '../pages/admin/Profile';

const AdminLayout: React.FC = () => (
  <IonPage>
    <div style={{ flex: 1, overflow: 'auto' }}>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users"     element={<AdminUsers />}     />
        <Route path="/admin/orders"    element={<AdminOrders />}    />
        <Route path="/admin/profile"   element={<AdminProfile />}   />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </div>

    <IonTabBar slot="bottom" style={{ position: 'sticky', bottom: 0 }}>
      <IonTabButton tab="dashboard" href="/admin/dashboard">
        <IonIcon icon={gridOutline} />
        <IonLabel>Dashboard</IonLabel>
      </IonTabButton>
      <IonTabButton tab="users" href="/admin/users">
        <IonIcon icon={peopleOutline} />
        <IonLabel>Users</IonLabel>
      </IonTabButton>
      <IonTabButton tab="orders" href="/admin/orders">
        <IonIcon icon={listOutline} />
        <IonLabel>Orders</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/admin/profile">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonPage>
);

export default AdminLayout;
