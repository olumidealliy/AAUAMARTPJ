import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonThumbnail,
  IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonInput,
  IonSelect, IonSelectOption, IonToggle, IonTextarea, IonSpinner,
  IonAlert, IonBadge, IonCard, IonCardContent, IonText
} from '@ionic/react';
import {
  addOutline, trashOutline, createOutline, cubeOutline,
  checkmarkCircleOutline, closeCircleOutline
} from 'ionicons/icons';
import {
  collection, query, where, getDocs, addDoc, deleteDoc,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';

const EMPTY_FORM = {
  name: '', category: 'Agric' as Product['category'],
  price: '', unit: 'kg' as Product['unit'],
  description: '', availability: true,
};

const SellerProducts: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); }, [currentUser]);

  const fetchProducts = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), where('sellerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, category: p.category, price: String(p.price), unit: p.unit, description: p.description, availability: p.availability });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    if (!currentUser) return;
    setSaving(true);
    try {
      let imageUrl = editProduct?.imageUrl ?? '';
      if (imageFile) {
        const storageRef = ref(storage, `products/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const data = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        unit: form.unit,
        description: form.description,
        availability: form.availability,
        imageUrl,
        sellerId: currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      if (editProduct) {
        await updateDoc(doc(db, 'products', editProduct.id), data);
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
      }
      setShowModal(false);
      await fetchProducts();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  const toggleAvailability = async (product: Product) => {
    await updateDoc(doc(db, 'products', product.id), { availability: !product.availability });
    setProducts(ps => ps.map(p => p.id === product.id ? { ...p, availability: !p.availability } : p));
  };

  if (loading) return (
    <IonPage>
      <IonContent>
        <div className="flex items-center justify-center h-full gap-4">
          <IonSpinner name="crescent" color="primary" />
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="p-4 pb-20">
          <h1 className="text-2xl font-bold text-primary mb-1">My Products</h1>
          <p className="text-gray-500 text-sm mb-6">{products.length} product{products.length !== 1 ? 's' : ''}</p>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IonIcon icon={cubeOutline} style={{ fontSize: 64, color: '#c5c5c5' }} />
              <IonText color="medium" className="mt-4">
                <h3 className="text-lg font-medium">No products yet</h3>
                <p className="text-sm">Tap + to add your first product.</p>
              </IonText>
            </div>
          ) : (
            <IonList>
              {products.map(product => (
                <IonCard key={product.id} className="mb-3">
                  <IonCardContent className="p-0">
                    <IonItem lines="none">
                      <IonThumbnail slot="start" style={{ '--size': '64px', borderRadius: 8, overflow: 'hidden', margin: '8px' }}>
                        <img src={product.imageUrl || 'https://via.placeholder.com/64'} alt={product.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      </IonThumbnail>
                      <IonLabel>
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-primary font-bold">₦{product.price.toLocaleString()} / {product.unit}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </IonLabel>
                      <div className="flex flex-col items-end gap-2 pr-1">
                        <IonBadge color={product.availability ? 'success' : 'medium'}>
                          {product.availability ? 'Live' : 'Hidden'}
                        </IonBadge>
                        <div className="flex gap-1">
                          <IonButton fill="clear" size="small" onClick={() => openEdit(product)}>
                            <IonIcon icon={createOutline} />
                          </IonButton>
                          <IonButton fill="clear" size="small" color="danger" onClick={() => setDeleteId(product.id)}>
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                        </div>
                        <IonToggle
                          checked={product.availability}
                          onIonChange={() => toggleAvailability(product)}
                          color="success"
                          style={{ '--handle-width': '16px', '--handle-height': '16px', transform: 'scale(0.8)' }}
                        />
                      </div>
                    </IonItem>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          )}
        </div>

        {/* FAB */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ bottom: 72 }}>
          <IonFabButton color="primary" onClick={openAdd}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Add / Edit Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="p-5 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <IonButton fill="clear" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeCircleOutline} style={{ fontSize: 28 }} />
              </IonButton>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <IonInput value={form.name} onIonInput={e => setForm(f => ({ ...f, name: e.detail.value ?? '' }))} placeholder="e.g. Fresh Tomatoes" className="border rounded-xl px-3" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <IonSelect value={form.category} onIonChange={e => setForm(f => ({ ...f, category: e.detail.value }))} interface="popover" className="border rounded-xl px-3">
                <IonSelectOption value="Agric">Agric</IonSelectOption>
                <IonSelectOption value="Livestock">Livestock</IonSelectOption>
                <IonSelectOption value="Clothes">Clothes</IonSelectOption>
              </IonSelect>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                <IonInput type="number" value={form.price} onIonInput={e => setForm(f => ({ ...f, price: e.detail.value ?? '' }))} placeholder="500" className="border rounded-xl px-3" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <IonSelect value={form.unit} onIonChange={e => setForm(f => ({ ...f, unit: e.detail.value }))} interface="popover" className="border rounded-xl px-3">
                  <IonSelectOption value="kg">kg</IonSelectOption>
                  <IonSelectOption value="unit">unit</IonSelectOption>
                </IonSelect>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <IonTextarea value={form.description} onIonInput={e => setForm(f => ({ ...f, description: e.detail.value ?? '' }))} rows={3} placeholder="Describe your product…" className="border rounded-xl px-3" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} className="text-sm text-gray-600" />
              {editProduct?.imageUrl && !imageFile && (
                <img src={editProduct.imageUrl} alt="current" className="mt-2 h-20 rounded-lg object-cover" />
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <IonToggle checked={form.availability} onIonChange={e => setForm(f => ({ ...f, availability: e.detail.checked }))} color="success" />
              <label className="text-sm font-medium text-gray-700">Available for sale</label>
            </div>

            <IonButton expand="block" onClick={handleSave} disabled={saving || !form.name || !form.price} style={{ '--background': '#2E7D32', '--border-radius': '12px' }}>
              {saving ? <IonSpinner name="crescent" color="light" /> : (editProduct ? 'Save Changes' : 'Add Product')}
            </IonButton>
          </div>
        </IonModal>

        {/* Delete confirm */}
        <IonAlert
          isOpen={!!deleteId}
          onDidDismiss={() => setDeleteId(null)}
          header="Delete Product"
          message="Are you sure you want to delete this product? This cannot be undone."
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Delete', role: 'confirm', handler: () => deleteId && handleDelete(deleteId) }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default SellerProducts;
