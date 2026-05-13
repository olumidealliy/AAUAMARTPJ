import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel,
  IonBadge, IonCard, IonCardContent, IonSpinner, IonIcon,
  IonAccordion, IonAccordionGroup, IonText
} from '@ionic/react';
import { timeOutline, locationOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';

const statusColor: Record<string, string> = {
  pending:    'warning',
  processing: 'primary',
  shipped:    'tertiary',
  delivered:  'success',
  cancelled:  'danger',
};

const BuyerOrders: React.FC = () => {
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
        where('buyerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val: any) => {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return (
    <IonPage>
      <IonContent className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <IonSpinner name="crescent" color="primary" />
          <p className="text-gray-500">Loading your orders…</p>
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary mb-1">My Orders</h1>
          <p className="text-gray-500 text-sm mb-6">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 64, color: '#c5c5c5' }} />
              <IonText color="medium" className="mt-4">
                <h3 className="text-lg font-medium">No orders yet</h3>
                <p className="text-sm">Your placed orders will appear here.</p>
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
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Items</h4>
                    <IonList lines="none" className="mb-4">
                      {order.items?.map((item, i) => (
                        <IonItem key={i} className="pl-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <IonLabel>
                            <p className="font-medium text-gray-800">{item.name}</p>
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

                    {/* Delivery timeline */}
                    {order.deliveryTimeline?.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Tracking</h4>
                        <div className="relative pl-6">
                          {order.deliveryTimeline.map((event, i) => (
                            <div key={i} className="mb-4 relative">
                              <span
                                className="absolute -left-6 w-3 h-3 rounded-full border-2 border-white"
                                style={{ background: i === 0 ? '#2E7D32' : '#c5c5c5', top: 4 }}
                              />
                              {i < order.deliveryTimeline.length - 1 && (
                                <span
                                  className="absolute -left-5 top-4"
                                  style={{ width: 1, height: '100%', background: '#e0e0e0' }}
                                />
                              )}
                              <p className="font-medium text-gray-800 text-sm">{event.status}</p>
                              <p className="text-xs text-gray-500">{event.description}</p>
                              <div className="flex gap-3 mt-1 text-xs text-gray-400">
                                <span><IonIcon icon={timeOutline} className="mr-1" />{formatDate(event.timestamp)}</span>
                                {event.location && (
                                  <span><IonIcon icon={locationOutline} className="mr-1" />{event.location}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
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

export default BuyerOrders;
