import React, { useState } from 'react';
import {
  IonPage, IonContent, IonItem, IonLabel, IonIcon,
  IonButton, IonAlert, IonCard, IonCardContent, IonBadge
} from '@ionic/react';
import { personOutline, mailOutline, callOutline, logOutOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';

const SellerProfile: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const initials = `${currentUser?.firstName?.[0] ?? ''}${currentUser?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          <div className="flex flex-col items-center py-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3"
              style={{ background: 'linear-gradient(135deg,#E65100,#FF9800)' }}>
              {initials}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{currentUser?.firstName} {currentUser?.lastName}</h2>
            <IonBadge color="warning" className="mt-2">{currentUser?.role}</IonBadge>
          </div>

          <IonCard className="mb-4">
            <IonCardContent className="p-0">
              <IonItem lines="inset">
                <IonIcon icon={personOutline} slot="start" color="warning" />
                <IonLabel>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <h3 className="font-medium">{currentUser?.firstName} {currentUser?.lastName}</h3>
                </IonLabel>
              </IonItem>
              <IonItem lines="inset">
                <IonIcon icon={mailOutline} slot="start" color="warning" />
                <IonLabel>
                  <p className="text-xs text-gray-400">Email</p>
                  <h3 className="font-medium">{currentUser?.email}</h3>
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon icon={callOutline} slot="start" color="warning" />
                <IonLabel>
                  <p className="text-xs text-gray-400">Phone</p>
                  <h3 className="font-medium">{currentUser?.phone || '—'}</h3>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          <IonCard className="mb-6">
            <IonCardContent>
              <div className="flex items-center gap-3">
                <IonIcon icon={shieldCheckmarkOutline} color="warning" style={{ fontSize: 24 }} />
                <div>
                  <p className="text-xs text-gray-400">Seller since</p>
                  <p className="font-medium text-gray-700">
                    {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton expand="block" color="danger" fill="outline" onClick={() => setShowAlert(true)}
            style={{ '--border-radius': '12px' }}>
            <IonIcon icon={logOutOutline} slot="start" />
            Sign Out
          </IonButton>

          <IonAlert isOpen={showAlert} onDidDismiss={() => setShowAlert(false)}
            header="Sign Out" message="Are you sure you want to sign out?"
            buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Sign Out', handler: signOut }]}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SellerProfile;
