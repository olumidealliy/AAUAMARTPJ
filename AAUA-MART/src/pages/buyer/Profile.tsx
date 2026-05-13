import React, { useState } from 'react';
import {
  IonPage, IonContent, IonItem, IonLabel, IonIcon,
  IonButton, IonAlert, IonCard, IonCardContent, IonBadge
} from '@ionic/react';
import {
  personOutline, mailOutline, callOutline,
  logOutOutline, shieldCheckmarkOutline
} from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';

const BuyerProfile: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [showSignOutAlert, setShowSignOutAlert] = useState(false);

  const initials = `${currentUser?.firstName?.[0] ?? ''}${currentUser?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4">
          {/* Avatar */}
          <div className="flex flex-col items-center py-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3"
              style={{ background: 'linear-gradient(135deg,#2E7D32,#4CAF50)' }}
            >
              {initials}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <IonBadge color="success" className="mt-2">{currentUser?.role}</IonBadge>
          </div>

          {/* Info */}
          <IonCard className="mb-4">
            <IonCardContent className="p-0">
              <IonItem lines="inset">
                <IonIcon icon={personOutline} slot="start" color="primary" />
                <IonLabel>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <h3 className="font-medium">{currentUser?.firstName} {currentUser?.lastName}</h3>
                </IonLabel>
              </IonItem>
              <IonItem lines="inset">
                <IonIcon icon={mailOutline} slot="start" color="primary" />
                <IonLabel>
                  <p className="text-xs text-gray-400">Email</p>
                  <h3 className="font-medium">{currentUser?.email}</h3>
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon icon={callOutline} slot="start" color="primary" />
                <IonLabel>
                  <p className="text-xs text-gray-400">Phone</p>
                  <h3 className="font-medium">{currentUser?.phone || '—'}</h3>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Account joined */}
          <IonCard className="mb-6">
            <IonCardContent>
              <div className="flex items-center gap-3">
                <IonIcon icon={shieldCheckmarkOutline} color="success" style={{ fontSize: 24 }} />
                <div>
                  <p className="text-xs text-gray-400">Member since</p>
                  <p className="font-medium text-gray-700">
                    {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            onClick={() => setShowSignOutAlert(true)}
            style={{ '--border-radius': '12px' }}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Sign Out
          </IonButton>

          <IonAlert
            isOpen={showSignOutAlert}
            onDidDismiss={() => setShowSignOutAlert(false)}
            header="Sign Out"
            message="Are you sure you want to sign out?"
            buttons={[
              { text: 'Cancel', role: 'cancel' },
              { text: 'Sign Out', role: 'confirm', handler: signOut }
            ]}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BuyerProfile;
