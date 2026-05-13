import React from 'react';
import { IonPage, IonContent, IonButton } from '@ionic/react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center">
            <div className="mb-8 animate-bounce">
              <svg className="w-32 h-32 mx-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-2">AAUAMart</h1>
            <p className="text-lg text-gray-700 mb-12">Connecting Farmer to Consumer</p>
            <IonButton 
              expand="block" 
              className="ion-margin-top"
              style={{
                '--background': '#2E7D32',
                '--border-radius': '12px',
                '--padding-top': '20px',
                '--padding-bottom': '20px'
              }}
              onClick={() => navigate('/role-selection')}
            >
              Get Started
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SplashScreen;