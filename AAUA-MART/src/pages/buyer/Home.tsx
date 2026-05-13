import React, { useState, useEffect } from 'react';
import { 
  IonPage, IonContent, IonSearchbar, IonGrid, IonRow, IonCol, 
  IonCard, IonCardContent, IonImg, IonChip, IonLabel, IonBadge,
  IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product } from '../../types';

const categories = ['All', 'Agric', 'Livestock', 'Clothes'];

const BuyerHome: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchText, selectedCategory, products]);

  const fetchProducts = async () => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('availability', '==', true));
    const querySnapshot = await getDocs(q);
    const productsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    setProducts(productsData);
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchText) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
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
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">Welcome to AAUAMart</h1>
            <p className="text-gray-600">Fresh from the farm to your table</p>
          </div>

          {/* Search Bar */}
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search products..."
            className="mb-4"
            style={{ '--border-radius': '12px' }}
          />

          {/* Categories */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2">
              {categories.map(cat => (
                <IonChip
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  color={selectedCategory === cat ? 'primary' : 'medium'}
                  className="cursor-pointer"
                >
                  <IonLabel>{cat}</IonLabel>
                </IonChip>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <IonGrid>
            <IonRow>
              {filteredProducts.map(product => (
                <IonCol size="6" key={product.id}>
                  <IonCard className="h-full" style={{ borderRadius: '12px' }}>
                    <div className="relative">
                      <IonImg 
                        src={product.imageUrl} 
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      {!product.availability && (
                        <div className="absolute top-2 right-2">
                          <IonBadge color="danger">Out of Stock</IonBadge>
                        </div>
                      )}
                    </div>
                    <IonCardContent>
                      <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                      <p className="text-primary font-bold mb-2">{formatPrice(product.price)}</p>
                      <p className="text-sm text-gray-500">per {product.unit}</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BuyerHome;