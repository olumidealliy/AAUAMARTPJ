import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonBadge,
  IonAccordion, IonAccordionGroup, IonSpinner, IonSelect,
  IonSelectOption, IonIcon, IonText
} from '@ionic/react';
import { listOutline } from 'ionicons/icons';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';

const STATUS_OPTIONS: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColor: Record<string, string> = {
  pending: 'warning', processing: 'primary',
  shipped: 'tertiary', delivered: 'success', cancelled: 'danger',
};

const SellerOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [currentUser]);

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('sellerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date(),
      deliveryTimeline: orders
        .find(o => o.id === orderId)
        ?.deliveryTimeline
        .concat({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          timestamp: new Date(),
          location: 'Seller',
          description: `Order status updated to ${status}`,
        }) ?? [],
    });
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const formatDate = (val: any) => {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return (
    <IonPage>
      <IonContent>
        <div className="flex items-center justify-center h-full gap-4">
          <IonSpinner name="crescent" color="primary" />
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary mb-1">Incoming Orders</h1>
          <p className="text-gray-500 text-sm mb-6">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IonIcon icon={listOutline} style={{ fontSize: 64, color: '#c5c5c5' }} />
              <IonText color="medium" className="mt-4">
                <h3 className="text-lg font-medium">No orders yet</h3>
                <p className="text-sm">Buyer orders will appear here.</p>
              </IonText>
            </div>
          ) : (
            <IonAccordionGroup>
              {orders.map(order => (
                <IonAccordion key={order.id} value={order.id}>
                  <IonItem slot="header" lines="none" className="rounded-xl mb-2" style={{ '--background': '#fff' }}>
                    <IonLabel>
                      <h3 className="font-semibold text-gray-800">#{order.trackingNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {order.items?.length ?? 0} item(s) · ₦{(order.totalAmount ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </IonLabel>
                    <IonBadge color={statusColor[order.status] ?? 'medium'} slot="end">
                      {order.status}
                    </IonBadge>
                  </IonItem>

                  <div slot="content" className="bg-white px-4 pb-4">
                    {/* Items */}
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Items Ordered</h4>
                    <IonList lines="none" className="mb-4">
                      {order.items?.map((item, i) => (
                        <IonItem key={i} className="pl-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <IonLabel>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} × ₦{item.price.toLocaleString()}
                            </p>
                          </IonLabel>
                          <span className="text-sm font-semibold text-primary">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </IonItem>
                      ))}
                    </IonList>

                    {/* Status updater */}
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Update Status</h4>
                    <IonSelect
                      value={order.status}
                      onIonChange={e => updateStatus(order.id, e.detail.value)}
                      interface="popover"
                      className="border rounded-xl px-3 bg-white"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <IonSelectOption key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </div>
                </IonAccordion>
              ))}
            </IonAccordionGroup>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SellerOrders;
