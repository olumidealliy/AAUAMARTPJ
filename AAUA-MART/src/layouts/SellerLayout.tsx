import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IonPage, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { speedometerOutline, cubeOutline, listOutline, personOutline } from 'ionicons/icons';
import SellerDashboard from '../pages/seller/Dashboard';
import SellerProducts  from '../pages/seller/Products';
import SellerOrders    from '../pages/seller/Orders';
import SellerProfile   from '../pages/seller/Profile';

const SellerLayout: React.FC = () => (
  <IonPage>
    <div style={{ flex: 1, overflow: 'auto' }}>
      <Routes>
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/products"  element={<SellerProducts />}  />
        <Route path="/seller/orders"    element={<SellerOrders />}    />
        <Route path="/seller/profile"   element={<SellerProfile />}   />
        <Route path="*" element={<Navigate to="/seller/dashboard" replace />} />
      </Routes>
    </div>

    <IonTabBar slot="bottom" style={{ position: 'sticky', bottom: 0 }}>
      <IonTabButton tab="dashboard" href="/seller/dashboard">
        <IonIcon icon={speedometerOutline} />
        <IonLabel>Dashboard</IonLabel>
      </IonTabButton>
      <IonTabButton tab="products" href="/seller/products">
        <IonIcon icon={cubeOutline} />
        <IonLabel>Products</IonLabel>
      </IonTabButton>
      <IonTabButton tab="orders" href="/seller/orders">
        <IonIcon icon={listOutline} />
        <IonLabel>Orders</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/seller/profile">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonPage>
);

export default SellerLayout;
