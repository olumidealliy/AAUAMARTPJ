import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonBadge,
  IonChip, IonAccordion, IonAccordionGroup, IonSelect,
  IonSelectOption, IonSpinner, IonIcon, IonText, IonSearchbar
} from '@ionic/react';
import { listOutline } from 'ionicons/icons';
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Order } from '../../types';

const STATUS_OPTIONS: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColor: Record<string, string> = {
  pending: 'warning', processing: 'primary',
  shipped: 'tertiary', delivered: 'success', cancelled: 'danger',
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date() });
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const formatDate = (val: any) => {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const visible = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.trackingNumber?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <IonPage>
      <IonContent>
        <div className="flex items-center justify-center h-full">
          <IonSpinner name="crescent" color="primary" />
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary mb-1">All Orders</h1>
          <p className="text-gray-500 text-sm mb-4">{orders.length} total orders</p>

          <IonSearchbar value={search} onIonInput={e => setSearch(e.detail.value ?? '')}
            placeholder="Search by tracking number…" className="mb-3" style={{ '--border-radius': '12px' }} />

          <div className="flex gap-2 overflow-x-auto mb-4">
            {(['all', ...STATUS_OPTIONS] as const).map(s => (
              <IonChip key={s} color={filter === s ? 'primary' : 'medium'}
                onClick={() => setFilter(s)} className="cursor-pointer capitalize">
                {s}
              </IonChip>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <IonIcon icon={listOutline} style={{ fontSize: 64, color: '#c5c5c5' }} />
              <IonText color="medium" className="mt-4"><p>No orders found.</p></IonText>
            </div>
          ) : (
            <IonAccordionGroup>
              {visible.map(order => (
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
                    <IonList lines="none" className="mb-4">
                      {order.items?.map((item, i) => (
                        <IonItem key={i} className="pl-0">
                          <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                          <IonLabel>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.quantity} × ₦{item.price.toLocaleString()}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Update Status</h4>
                    <IonSelect value={order.status} onIonChange={e => updateStatus(order.id, e.detail.value)}
                      interface="popover" className="border rounded-xl px-3 bg-white">
                      {STATUS_OPTIONS.map(s => (
                        <IonSelectOption key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</IonSelectOption>
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

export default AdminOrders;
