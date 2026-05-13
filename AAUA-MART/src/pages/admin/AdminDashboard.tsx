import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard,
  IonCardContent, IonList, IonItem, IonLabel, IonBadge,
  IonSegment, IonSegmentButton, IonIcon, IonSpinner
} from '@ionic/react';
import { peopleOutline, cubeOutline, cashOutline, alertCircleOutline } from 'ionicons/icons';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [segment, setSegment] = useState('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersSnap, ordersSnap, recentSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10))),
      ]);

      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount ?? 0), 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

      setStats({
        totalUsers: usersSnap.size,
        totalOrders: ordersSnap.size,
        totalRevenue,
        pendingOrders,
      });
      setAllUsers(usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
      setAllOrders(orders);
      setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('AdminDashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users',    value: stats.totalUsers,                          icon: peopleOutline,       color: '#4CAF50' },
    { title: 'Total Orders',   value: stats.totalOrders,                         icon: cubeOutline,         color: '#2196F3' },
    { title: 'Total Revenue',  value: `₦${stats.totalRevenue.toLocaleString()}`, icon: cashOutline,         color: '#FF9800' },
    { title: 'Pending Orders', value: stats.pendingOrders,                       icon: alertCircleOutline,  color: '#F44336' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':    return 'warning';
      case 'processing': return 'primary';
      case 'shipped':    return 'tertiary';
      case 'delivered':  return 'success';
      case 'cancelled':  return 'danger';
      default:           return 'medium';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'seller': return 'warning';
      case 'admin':  return 'danger';
      default:       return 'primary';
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="flex items-center justify-center">
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <IonSpinner name="crescent" color="primary" />
            <p className="text-gray-500">Loading dashboard…</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-600">Manage platform operations</p>
          </div>

          <IonSegment
            value={segment}
            onIonChange={e => setSegment(e.detail.value as string)}
            className="mb-6"
          >
            <IonSegmentButton value="overview">Overview</IonSegmentButton>
            <IonSegmentButton value="users">Users</IonSegmentButton>
            <IonSegmentButton value="orders">Orders</IonSegmentButton>
          </IonSegment>

          {/* ─── OVERVIEW ─── */}
          {segment === 'overview' && (
            <>
              <IonGrid className="mb-6">
                <IonRow>
                  {statCards.map((card, i) => (
                    <IonCol size="6" sizeMd="3" key={i}>
                      <IonCard>
                        <IonCardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-500 text-sm">{card.title}</p>
                              <h3 className="text-xl font-bold mt-1">{card.value}</h3>
                            </div>
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${card.color}20` }}
                            >
                              <IonIcon icon={card.icon} style={{ fontSize: '20px', color: card.color }} />
                            </div>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>

              <IonCard>
                <IonCardContent>
                  <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                  {recentOrders.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No orders yet</p>
                  ) : (
                    <IonList>
                      {recentOrders.map(order => (
                        <IonItem key={order.id}>
                          <IonLabel>
                            <h3 className="font-medium">#{order.trackingNumber}</h3>
                            <p className="text-sm text-gray-500">
                              ₦{(order.totalAmount ?? 0).toLocaleString()}
                            </p>
                          </IonLabel>
                          <IonBadge color={getStatusColor(order.status)} slot="end">
                            {order.status}
                          </IonBadge>
                        </IonItem>
                      ))}
                    </IonList>
                  )}
                </IonCardContent>
              </IonCard>
            </>
          )}

          {/* ─── USERS ─── */}
          {segment === 'users' && (
            <IonCard>
              <IonCardContent>
                <h2 className="text-lg font-semibold mb-4">
                  All Users ({allUsers.length})
                </h2>
                {allUsers.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No users found</p>
                ) : (
                  <IonList>
                    {allUsers.map(user => (
                      <IonItem key={user.uid}>
                        <div
                          slot="start"
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                          style={{ background: '#2E7D32' }}
                        >
                          {(user.firstName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <IonLabel>
                          <h3 className="font-medium">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </IonLabel>
                        <IonBadge color={getRoleBadge(user.role)} slot="end">
                          {user.role}
                        </IonBadge>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {/* ─── ORDERS ─── */}
          {segment === 'orders' && (
            <IonCard>
              <IonCardContent>
                <h2 className="text-lg font-semibold mb-4">
                  All Orders ({allOrders.length})
                </h2>
                {allOrders.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No orders found</p>
                ) : (
                  <IonList>
                    {allOrders.map((order: any) => (
                      <IonItem key={order.id}>
                        <IonLabel>
                          <h3 className="font-medium">#{order.trackingNumber}</h3>
                          <p className="text-sm text-gray-500">
                            ₦{(order.totalAmount ?? 0).toLocaleString()} ·{' '}
                            {order.items?.length ?? 0} item(s)
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.createdAt?.toDate
                              ? order.createdAt.toDate().toLocaleDateString('en-NG')
                              : ''}
                          </p>
                        </IonLabel>
                        <IonBadge color={getStatusColor(order.status)} slot="end">
                          {order.status}
                        </IonBadge>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;