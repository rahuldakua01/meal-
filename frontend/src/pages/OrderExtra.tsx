import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ExtraStoreItem } from '../context/AppContext';

interface OrderExtraProps {
  onToggleAuth: () => void;
}

interface CartItem extends ExtraStoreItem {
  quantity: number;
}

export const OrderExtra: React.FC<OrderExtraProps> = ({ onToggleAuth }) => {
  const { extraStore, currentUser, placeExtraOrder } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const categories = ['All', 'Snack', 'Beverage', 'Dessert', 'Special'];

  // Filter items
  const filteredItems = extraStore.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // Cart Management
  const addToCart = (item: ExtraStoreItem) => {
    if (!currentUser) {
      onToggleAuth();
      return;
    }

    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, amount: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gst;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutModal(true);
  };

  const handlePayment = () => {
    // Structure order items
    const orderItems = cart.map(item => ({
      name: item.name,
      price: item.price,
      qty: item.quantity
    }));

    placeExtraOrder(orderItems, grandTotal);
    setPaymentSuccess(true);

    setTimeout(() => {
      setPaymentSuccess(false);
      setCheckoutModal(false);
      clearCart();
    }, 1800);
  };

  return (
    <div>
      <div className="sub-header">
        <h1>Order Extra Food</h1>
        <p>Craving something special? Browse through our tuck shop and order snacks, beverages, and dessert add-ons.</p>
      </div>

      {/* Filter pills */}
      <div className="categories-bar no-scrollbar" style={{ marginBottom: '24px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}s
          </button>
        ))}
      </div>

      {/* Shop Layout: Grid + Cart Sidebar */}
      <div className="shop-layout">
        {/* Left Grid */}
        <div>
          <h3 className="section-title">
            <span>🍔</span> Menu Offerings ({activeCategory})
          </h3>
          <div className="meals-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {filteredItems.map(item => (
              <div key={item.id} className="meal-card" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: 'var(--bg-card)' }}>
                <div className="meal-thumbnail-wrapper" style={{ margin: '-12px -12px 12px -12px', borderBottom: '1px solid var(--border-color)' }}>
                  <img src={item.image} alt={item.name} className="meal-thumbnail" />
                  <span className={`meal-tag-badge ${item.type === 'veg' ? 'veg' : 'nonveg'}`}>
                    {item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', height: '36px', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-color)' }}>₹{item.price}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{item.calories} kcal</span>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => addToCart(item)}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Cart Right Sidebar */}
        <aside className="cart-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <ShoppingCart size={20} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Your Canteen Cart</h3>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              🍳 Your cart is empty.<br />Add delicious items from the menu!
            </div>
          ) : (
            <div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₹{item.price} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-pill)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button style={{ padding: '4px' }} onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button style={{ padding: '4px' }} onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button style={{ color: 'var(--danger)', padding: '4px' }} onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (5%)</span>
                  <span>₹{gst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--brand-color)' }}>₹{grandTotal}</span>
                </div>
              </div>

              <button className="btn btn-brand" style={{ width: '100%', gap: '8px' }} onClick={handleCheckout}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Cart Checkout Modal */}
      {checkoutModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setCheckoutModal(false)}>×</button>

            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
              Finalize Canteen Order
            </h3>

            {paymentSuccess ? (
              <div className="congrats-modal">
                <div className="success-icon-anim">✓</div>
                <h3 style={{ fontSize: '18px', color: 'var(--success)' }}>Order Placed Successfully!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>A digital coupon has been added to your profile drawer.</p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ marginBottom: '12px' }}>Choose Payment Method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Wallet */}
                    <div 
                      onClick={() => setPaymentMethod('wallet')}
                      style={{
                        padding: '12px 16px',
                        border: `1px solid ${paymentMethod === 'wallet' ? 'var(--brand-color)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: paymentMethod === 'wallet' ? 'rgba(255, 69, 58, 0.05)' : 'rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🪙</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>Hostel Ledger Wallet</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Deduct from student mess card</div>
                        </div>
                      </div>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMethod === 'wallet' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-color)' }} />}
                      </div>
                    </div>

                    {/* UPI */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      style={{
                        padding: '12px 16px',
                        border: `1px solid ${paymentMethod === 'upi' ? 'var(--brand-color)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: paymentMethod === 'upi' ? 'rgba(255, 69, 58, 0.05)' : 'rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>📱</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>UPI Scan & Pay</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>GPay, PhonePe, Paytm QR</div>
                        </div>
                      </div>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMethod === 'upi' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-color)' }} />}
                      </div>
                    </div>

                    {/* Card */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      style={{
                        padding: '12px 16px',
                        border: `1px solid ${paymentMethod === 'card' ? 'var(--brand-color)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: paymentMethod === 'card' ? 'rgba(255, 69, 58, 0.05)' : 'rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>💳</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>Credit / Debit Card</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Instant checkout via secure gateway</div>
                        </div>
                      </div>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMethod === 'card' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-color)' }} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional UI based on selection */}
                {paymentMethod === 'upi' && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '16px', 
                    border: '1px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    marginBottom: '20px',
                    backgroundColor: 'rgba(255,255,255,0.01)'
                  }}>
                    <QrCode size={120} style={{ color: '#fff', marginBottom: '8px' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Scan QR with GPay/PhonePe to pay ₹{grandTotal}</span>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    <input type="text" className="form-input" placeholder="Cardholder Name" />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" className="form-input" style={{ flex: 2 }} placeholder="Card Number (16-digits)" />
                      <input type="text" className="form-input" style={{ flex: 1 }} placeholder="MM/YY" />
                      <input type="text" className="form-input" style={{ flex: 1 }} placeholder="CVV" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '12px' }}>
                    <ShieldCheck size={16} />
                    <span>Balance Verified! Student Ledger has sufficient balance.</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <span style={{ fontWeight: 600 }}>Amount Due:</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-color)' }}>₹{grandTotal}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCheckoutModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-brand" style={{ flex: 1 }} onClick={handlePayment}>
                    Complete Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
