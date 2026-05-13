import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonList, IonItem, IonAvatar, IonLabel,
  IonButton, IonIcon, IonText, IonAlert, IonToast
} from '@ionic/react';
import { trashOutline, addOutline, removeOutline } from 'ionicons/icons';
import { storage } from '../../services/storage';
import { CartItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckoutAlert, setShowCheckoutAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const cart = await storage.getCart();
    setCartItems(cart);
  };

  const updateQuantity = async (productId: string, change: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    await storage.saveCart(updatedCart);
  };

  const removeItem = async (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    await storage.saveCart(updatedCart);
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!currentUser || cartItems.length === 0) return;

    // Group items by seller so each seller gets their own order document
    const itemsBySeller: Record<string, CartItem[]> = {};
    cartItems.forEach(item => {
      if (!itemsBySeller[item.sellerId]) {
        itemsBySeller[item.sellerId] = [];
      }
      itemsBySeller[item.sellerId].push(item);
    });

    try {
      const orderPromises = Object.entries(itemsBySeller).map(([sellerId, items]) => {
        const sellerTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return addDoc(collection(db, 'orders'), {
          buyerId: currentUser.uid,
          sellerId,
          items,
          totalAmount: sellerTotal,
          status: 'pending',
          trackingNumber: `AAU-${Date.now()}-${sellerId.slice(0, 4)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          deliveryTimeline: [
            {
              status: 'Order Placed',
              timestamp: new Date(),
              location: 'Online',
              description: 'Your order has been placed successfully',
            },
          ],
        });
      });

      await Promise.all(orderPromises);
      await storage.clearCart();
      setShowToast(true);
      setTimeout(() => navigate('/track-order'), 2000);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <ion-icon name="cart-outline" style={{ fontSize: '80px', color: '#9E9E9E' }} />
            <IonText color="medium" className="mt-4 text-center">
              <h2>Your cart is empty</h2>
              <p>Start shopping to add items to your cart</p>
            </IonText>
            <IonButton 
              expand="block" 
              className="mt-6"
              onClick={() => navigate('/home')}
            >
              Browse Products
            </IonButton>
          </div>
        ) : (
          <>
            <IonList>
              {cartItems.map(item => (
                <IonItem key={item.productId} className="ion-margin-vertical">
                  <IonAvatar slot="start">
                    <img src={item.imageUrl} alt={item.name} />
                  </IonAvatar>
                  <IonLabel>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-primary">{formatPrice(item.price)}</p>
                    <div className="flex items-center mt-2">
                      <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <IonIcon icon={removeOutline} />
                      </IonButton>
                      <span className="mx-2 font-semibold">{item.quantity}</span>
                      <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <IonIcon icon={addOutline} />
                      </IonButton>
                    </div>
                  </IonLabel>
                  <IonButton 
                    fill="clear" 
                    color="danger"
                    onClick={() => removeItem(item.productId)}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>

            <div className="p-4 bg-white border-t">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <IonButton 
                expand="block" 
                className="ion-margin-top"
                onClick={() => setShowCheckoutAlert(true)}
              >
                Proceed to Checkout
              </IonButton>
            </div>
          </>
        )}

        <IonAlert
          isOpen={showCheckoutAlert}
          onDidDismiss={() => setShowCheckoutAlert(false)}
          header="Confirm Order"
          message={`Total amount: ${formatPrice(getTotal())}\n\nDo you want to proceed with your order?`}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Confirm', handler: handleCheckout }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Order placed successfully!"
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Cart;

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckoutAlert, setShowCheckoutAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { currentUser } = useAuth();
  const history = useHistory();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const cart = await storage.getCart();
    setCartItems(cart);
  };

  const updateQuantity = async (productId: string, change: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    await storage.saveCart(updatedCart);
  };

  const removeItem = async (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    await storage.saveCart(updatedCart);
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!currentUser) return;

    const order = {
      buyerId: currentUser.uid,
      sellerId: cartItems[0].sellerId,
      items: cartItems,
      totalAmount: getTotal(),
      status: 'pending',
      trackingNumber: `AAU-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveryTimeline: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          location: 'Online',
          description: 'Your order has been placed successfully'
        }
      ]
    };

    try {
      await addDoc(collection(db, 'orders'), order);
      await storage.clearCart();
      setShowToast(true);
      setTimeout(() => history.push('/track-order'), 2000);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <ion-icon name="cart-outline" style={{ fontSize: '80px', color: '#9E9E9E' }} />
            <IonText color="medium" className="mt-4 text-center">
              <h2>Your cart is empty</h2>
              <p>Start shopping to add items to your cart</p>
            </IonText>
            <IonButton 
              expand="block" 
              className="mt-6"
              onClick={() => history.push('/home')}
            >
              Browse Products
            </IonButton>
          </div>
        ) : (
          <>
            <IonList>
              {cartItems.map(item => (
                <IonItem key={item.productId} className="ion-margin-vertical">
                  <IonAvatar slot="start">
                    <img src={item.imageUrl} alt={item.name} />
                  </IonAvatar>
                  <IonLabel>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-primary">{formatPrice(item.price)}</p>
                    <div className="flex items-center mt-2">
                      <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <IonIcon icon={removeOutline} />
                      </IonButton>
                      <span className="mx-2 font-semibold">{item.quantity}</span>
                      <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <IonIcon icon={addOutline} />
                      </IonButton>
                    </div>
                  </IonLabel>
                  <IonButton 
                    fill="clear" 
                    color="danger"
                    onClick={() => removeItem(item.productId)}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>

            <div className="p-4 bg-white border-t">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <IonButton 
                expand="block" 
                className="ion-margin-top"
                onClick={() => setShowCheckoutAlert(true)}
              >
                Proceed to Checkout
              </IonButton>
            </div>
          </>
        )}

        <IonAlert
          isOpen={showCheckoutAlert}
          onDidDismiss={() => setShowCheckoutAlert(false)}
          header="Confirm Order"
          message={`Total amount: ${formatPrice(getTotal())}\n\nDo you want to proceed with your order?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Confirm',
              handler: handleCheckout
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Order placed successfully!"
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Cart;