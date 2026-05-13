import React from 'react';
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { personOutline, storefrontOutline, shieldOutline } from 'ionicons/icons';

const roles = [
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Shop fresh produce and products from local farmers',
    icon: personOutline,
    color: '#4CAF50'
  },
  {
    id: 'seller',
    title: 'Seller',
    description: 'Sell your agricultural products to a wider audience',
    icon: storefrontOutline,
    color: '#FF9800'
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Manage platform operations and users',
    icon: shieldOutline,
    color: '#F44336'
  }
];

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    navigate(`/login/${role}`);
  };

  return (
    <IonPage>
      <IonContent className="bg-secondary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-primary mb-2">Choose Your Role</h1>
            <p className="text-gray-600">Select how you want to use AAUAMart</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <IonCard 
                key={role.id}
                button
                onClick={() => handleRoleSelect(role.id)}
                className="cursor-pointer transform transition-transform hover:scale-105"
                style={{ borderRadius: '16px' }}
              >
                <IonCardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <ion-icon 
                        icon={role.icon} 
                        style={{ fontSize: '40px', color: role.color }}
                      />
                    </div>
                  </div>
                  <IonCardTitle className="text-xl font-semibold">
                    {role.title}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="text-center text-gray-600">
                  {role.description}
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RoleSelection;