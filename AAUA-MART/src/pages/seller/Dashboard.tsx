import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard,
  IonCardContent, IonIcon, IonButton, IonCardHeader
} from '@ionic/react';
import { 
  addOutline, cubeOutline, cashOutline, peopleOutline,
  trendingUpOutline, trendingDownOutline 
} from 'ionicons/icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    uniqueBuyers: 0,
    ordersChange: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(new Array(12).fill(0));
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [currentUser]);

  const fetchStats = async () => {
    if (!currentUser) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('sellerId', '==', currentUser.uid)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => doc.data());

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const uniqueBuyers = new Set(orders.map(o => o.buyerId)).size;

    // Build real monthly revenue from actual order data
    const revenueByMonth = new Array(12).fill(0);
    orders.forEach(order => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const month = date.getMonth();
      revenueByMonth[month] += order.totalAmount ?? 0;
    });

    // Calculate orders change vs last month
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const lastMonth = orders.filter(o => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    }).length;
    const ordersChange = lastMonth === 0 ? 0 : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

    setStats({ totalOrders: orders.length, totalRevenue, uniqueBuyers, ordersChange });
    setMonthlyRevenue(revenueByMonth);
  };

  const quickActions = [
    { icon: addOutline, label: 'Add Product', color: '#4CAF50', path: '/seller/products/add' },
    { icon: cubeOutline, label: 'View Orders', color: '#2196F3', path: '/seller/orders' },
    { icon: peopleOutline, label: 'Manage Products', color: '#FF9800', path: '/seller/products' }
  ];

  const chartData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: 'Revenue (₦)',
        data: monthlyRevenue,
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) =>
            `₦${Number(value).toLocaleString()}`
        }
      }
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">Seller Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser?.firstName}</p>
          </div>

          <IonGrid className="mb-6">
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
                        <div className="flex items-center mt-1">
                          {stats.ordersChange >= 0 ? (
                            <IonIcon icon={trendingUpOutline} color="success" />
                          ) : (
                            <IonIcon icon={trendingDownOutline} color="danger" />
                          )}
                          <span className={`text-sm ml-1 ${stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.ordersChange}% vs last month
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <IonIcon icon={cubeOutline} style={{ fontSize: '24px', color: '#2E7D32' }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <h3 className="text-2xl font-bold mt-1">₦{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-sm text-gray-500 mt-1">All time</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <IonIcon icon={cashOutline} style={{ fontSize: '24px', color: '#2E7D32' }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">Unique Buyers</p>
                        <h3 className="text-2xl font-bold mt-1">{stats.uniqueBuyers}</h3>
                        <p className="text-sm text-gray-500 mt-1">Total customers</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <IonIcon icon={peopleOutline} style={{ fontSize: '24px', color: '#2E7D32' }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonCard className="mb-6">
            <IonCardHeader>
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
            </IonCardHeader>
            <IonCardContent>
              <Line data={chartData} options={chartOptions} />
            </IonCardContent>
          </IonCard>

          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <IonGrid>
              <IonRow>
                {quickActions.map((action, index) => (
                  <IonCol size="4" key={index}>
                    <IonCard 
                      button
                      onClick={() => navigate(action.path)}
                      className="quick-action-card"
                    >
                      <IonCardContent className="text-center">
                        <div 
                          className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: `${action.color}20` }}
                        >
                          <IonIcon icon={action.icon} style={{ fontSize: '24px', color: action.color }} />
                        </div>
                        <p className="text-sm font-medium">{action.label}</p>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SellerDashboard;

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    ordersChange: 0
  });
  const { currentUser } = useAuth();
  const history = useHistory();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!currentUser) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('sellerId', '==', currentUser.uid)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    setStats({
      totalOrders: orders.length,
      totalRevenue,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      ordersChange: 15 // Example percentage change
    });
  };

  const quickActions = [
    { icon: addOutline, label: 'Add Product', color: '#4CAF50', path: '/seller/products/add' },
    { icon: cubeOutline, label: 'View Orders', color: '#2196F3', path: '/seller/orders' },
    { icon: peopleOutline, label: 'Manage Products', color: '#FF9800', path: '/seller/products' }
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">Seller Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser?.firstName}</p>
          </div>

          {/* Stats Cards */}
          <IonGrid className="mb-6">
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
                        <div className="flex items-center mt-1">
                          {stats.ordersChange > 0 ? (
                            <IonIcon icon={trendingUpOutline} color="success" />
                          ) : (
                            <IonIcon icon={trendingDownOutline} color="danger" />
                          )}
                          <span className={`text-sm ml-1 ${stats.ordersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.ordersChange}% vs last month
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <IonIcon icon={cubeOutline} style={{ fontSize: '24px', color: '#2E7D32' }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <h3 className="text-2xl font-bold mt-1">₦{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-sm text-gray-500 mt-1">This month</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <IonIcon icon={cashOutline} style={{ fontSize: '24px', color: '#2E7D32' }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">Active Users</p>
                        <h3 className="text-2xl font-bold mt-1">{stats.activeUsers}</h3>
                        <p className="text-sm text-gray-500 mt-1">Unique customers</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <IonIcon icon={peopleOutline} style={{ fontSize: '24px', color: '#2E7D32' }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Revenue Chart */}
          <IonCard className="mb-6">
            <IonCardHeader>
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
            </IonCardHeader>
            <IonCardContent>
              <Line data={chartData} options={chartOptions} />
            </IonCardContent>
          </IonCard>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <IonGrid>
              <IonRow>
                {quickActions.map((action, index) => (
                  <IonCol size="4" key={index}>
                    <IonCard 
                      button
                      onClick={() => navigate(action.path)}
                      className="quick-action-card"
                    >
                      <IonCardContent className="text-center">
                        <div 
                          className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: `${action.color}20` }}
                        >
                          <IonIcon icon={action.icon} style={{ fontSize: '24px', color: action.color }} />
                        </div>
                        <p className="text-sm font-medium">{action.label}</p>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SellerDashboard;