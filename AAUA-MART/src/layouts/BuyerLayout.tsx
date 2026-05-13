import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { homeOutline, cartOutline, listOutline, personOutline } from 'ionicons/icons';
import BuyerHome    from '../pages/buyer/Home';
import Cart         from '../pages/buyer/Cart';
import BuyerOrders  from '../pages/buyer/Orders';
import BuyerProfile from '../pages/buyer/Profile';

const BuyerLayout: React.FC = () => (
  <IonPage>
    <div style={{ flex: 1, overflow: 'auto' }}>
      <Routes>
        <Route path="/home"    element={<BuyerHome />}    />
        <Route path="/cart"    element={<Cart />}         />
        <Route path="/orders"  element={<BuyerOrders />}  />
        <Route path="/profile" element={<BuyerProfile />} />
        <Route path="*"        element={<Navigate to="/home" replace />} />
      </Routes>
    </div>

    <IonTabBar slot="bottom" style={{ position: 'sticky', bottom: 0 }}>
      <IonTabButton tab="home" href="/home">
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton tab="cart" href="/cart">
        <IonIcon icon={cartOutline} />
        <IonLabel>Cart</IonLabel>
      </IonTabButton>
      <IonTabButton tab="orders" href="/orders">
        <IonIcon icon={listOutline} />
        <IonLabel>Orders</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/profile">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonPage>
);

export default BuyerLayout;
