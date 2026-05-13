import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonBadge,
  IonSearchbar, IonChip, IonSpinner, IonIcon, IonText
} from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { User, UserRole } from '../../types';

const ROLE_FILTERS: Array<'all' | UserRole> = ['all', 'buyer', 'seller', 'admin'];
const badgeColor: Record<string, string> = { buyer: 'primary', seller: 'warning', admin: 'danger' };

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as User)));
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
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
          <h1 className="text-2xl font-bold text-primary mb-1">All Users</h1>
          <p className="text-gray-500 text-sm mb-4">{users.length} registered users</p>

          <IonSearchbar value={search} onIonInput={e => setSearch(e.detail.value ?? '')}
            placeholder="Search by name or email…" className="mb-3" style={{ '--border-radius': '12px' }} />

          <div className="flex gap-2 overflow-x-auto mb-4">
            {ROLE_FILTERS.map(r => (
              <IonChip key={r} color={roleFilter === r ? 'primary' : 'medium'}
                onClick={() => setRoleFilter(r)} className="cursor-pointer capitalize">
                {r}
              </IonChip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <IonIcon icon={peopleOutline} style={{ fontSize: 64, color: '#c5c5c5' }} />
              <IonText color="medium" className="mt-4">
                <p>No users found.</p>
              </IonText>
            </div>
          ) : (
            <IonList>
              {filtered.map(user => (
                <IonItem key={user.uid} lines="inset" style={{ '--background': '#fff', '--border-radius': '10px', marginBottom: 6 }}>
                  <div slot="start"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: user.role === 'seller' ? '#FF9800' : user.role === 'admin' ? '#F44336' : '#4CAF50' }}>
                    {(user.firstName?.[0] ?? '?').toUpperCase()}
                  </div>
                  <IonLabel>
                    <h3 className="font-medium text-gray-800">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                  </IonLabel>
                  <IonBadge color={badgeColor[user.role] ?? 'medium'} slot="end">
                    {user.role}
                  </IonBadge>
                </IonItem>
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;
