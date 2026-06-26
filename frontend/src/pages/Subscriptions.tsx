import React, { useState } from 'react';
import { Check, CheckCircle2, X, Save, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SubscriptionsProps {
  onToggleAuth: () => void;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({ onToggleAuth }) => {
  const { currentUser, subscribeToPlan, cancelSubscription, subscriptionPlans, updateSubscriptionPlan } = useApp();
  
  const [selectedPlan, setSelectedPlan] = useState<'base' | 'standard' | 'premium' | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [subPreference, setSubPreference] = useState<'veg' | 'nonveg'>('veg');
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState(false);

  // Admin Plan Edit states
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState(0);
  const [editPlanDesc, setEditPlanDesc] = useState('');
  const [editPlanFeatures, setEditPlanFeatures] = useState('');
  const [editPlanColor, setEditPlanColor] = useState('');
  const [editPlanGlow, setEditPlanGlow] = useState(false);

  const handleEditPlanClick = (plan: any) => {
    setEditingPlan(plan);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price);
    setEditPlanDesc(plan.description);
    setEditPlanFeatures(plan.features.join(', '));
    setEditPlanColor(plan.color);
    setEditPlanGlow(plan.glow);
  };

  const handleSavePlanEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const res = await updateSubscriptionPlan(editingPlan.id, {
      name: editPlanName,
      price: Number(editPlanPrice),
      description: editPlanDesc,
      features: editPlanFeatures.split(',').map(f => f.trim()).filter(Boolean),
      color: editPlanColor,
      glow: editPlanGlow
    });
    
    if (res && !res.success) {
      alert(res.message);
    } else {
      setEditingPlan(null);
    }
  };

  const plans = subscriptionPlans;

  const handleSelectPlan = (planId: 'base' | 'standard' | 'premium') => {
    if (!currentUser) {
      onToggleAuth();
      return;
    }

    if (currentUser.status === 'Active') {
      alert("You already have an active subscription! Please cancel your existing plan before choosing a new one.");
      return;
    }
    
    setSelectedPlan(planId);
    if (planId === 'premium') {
      setSelectedMeals(['breakfast', 'lunch', 'dinner']);
    } else {
      setSelectedMeals([]);
    }
  };

  const handleMealToggle = (meal: string) => {
    if (!selectedPlan) return;
    
    if (selectedPlan === 'base') {
      // Base allows exactly 1 meal selection
      setSelectedMeals([meal]);
    } else if (selectedPlan === 'standard') {
      // Standard allows up to 2 meal selections
      if (selectedMeals.includes(meal)) {
        setSelectedMeals(prev => prev.filter(m => m !== meal));
      } else {
        if (selectedMeals.length < 2) {
          setSelectedMeals(prev => [...prev, meal]);
        } else {
          // If already 2 selected, replace the oldest one
          setSelectedMeals(prev => [prev[1], meal]);
        }
      }
    }
  };

  const handleOpenCheckout = () => {
    if (!selectedPlan) return;

    // Validation checks
    if (selectedPlan === 'base' && selectedMeals.length !== 1) {
      alert('Please select exactly 1 meal slot for the Base Plan.');
      return;
    }
    if (selectedPlan === 'standard' && selectedMeals.length !== 2) {
      alert('Please select exactly 2 meal slots for the Standard Plan.');
      return;
    }

    setCheckoutModal(true);
  };

  const handleCompleteSubscription = async () => {
    if (!selectedPlan) return;
    
    setCheckoutModal(false);
    const result = await subscribeToPlan(selectedPlan, selectedMeals, subPreference);
    
    if (result.success) {
      setSuccessCelebration(true);
      // reset selection
      setTimeout(() => {
        setSuccessCelebration(false);
        setSelectedPlan(null);
        setSelectedMeals([]);
      }, 2500);
    } else {
      alert(result.message);
    }
  };

  const currentPlanDetails = plans.find(p => p.id === currentUser?.subscription?.tier);

  return (
    <div>
      <div className="sub-header">
        <h1>Hostel Meal Subscriptions</h1>
        <p>
          Fuel your studies with chef-prepared, clean meals. Choose the package that suits your budget and hunger needs.
        </p>
      </div>

      {/* Active subscription display */}
      {currentUser?.subscription && currentPlanDetails && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--success)',
          boxShadow: '0 4px 20px rgba(52, 199, 89, 0.15)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-success">ACTIVE SUBSCRIPTION</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Started on {currentUser.subscription.startDate}
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{currentPlanDetails.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Meals Covered: <span style={{ textTransform: 'capitalize', color: '#fff', fontWeight: 600 }}>
                {currentUser.subscription.meals.join(' + ')}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => {
              const tier = currentUser.subscription!.tier;
              if (tier !== 'none') {
                setSelectedPlan(tier);
                setSubPreference(currentUser.subscription!.preference);
                setSelectedMeals(currentUser.subscription!.meals);
              }
            }}>
              Reconfigure
            </button>
            <button className="btn btn-danger" onClick={cancelSubscription}>
              Cancel Plan
            </button>
          </div>
        </div>
      )}

      {/* Subscription Grid */}
      <div className="plans-grid">
        {plans.map(plan => {
          const isCurrent = currentUser?.subscription?.tier === plan.id;
          const isHighlighted = selectedPlan ? (selectedPlan === plan.id) : plan.glow;
          return (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.glow ? 'premium-glow' : ''}`}
              style={{
                borderColor: isHighlighted ? plan.color : 'var(--border-color)',
                transform: selectedPlan === plan.id ? 'scale(1.02)' : undefined,
                boxShadow: isHighlighted 
                  ? `0 4px 24px ${plan.color === 'var(--brand-color)' ? 'var(--brand-glow)' : plan.color + '26'}` 
                  : 'none'
              }}
            >
              <h3 className="plan-name" style={{ color: plan.color }}>{plan.name}</h3>
              <div className="plan-price">
                ₹{plan.price} <span>/ month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
                {plan.description}
              </p>

              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i} className="plan-feature-item">
                    <Check size={16} className="plan-feature-icon" style={{ color: plan.color }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {currentUser?.role === 'admin' ? (
                <button 
                  className="btn btn-brand" 
                  style={{ 
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={() => handleEditPlanClick(plan)}
                >
                  <Pencil size={14} />
                  Edit Plan (Admin)
                </button>
              ) : isCurrent ? (
                <div style={{ 
                  color: 'var(--success)', 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  padding: '10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(52, 199, 89, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} /> Currently Active
                </div>
              ) : (
                <button 
                  className="btn" 
                  style={{ 
                    backgroundColor: isHighlighted ? plan.color : 'var(--bg-pill)',
                    color: '#fff',
                    width: '100%',
                    border: '1px solid var(--border-color)'
                  }}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Select Plan
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Meal Selection Setup (For Base and Standard Plans) */}
      {selectedPlan && selectedPlan !== 'premium' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: `1px solid ${plans.find(p => p.id === selectedPlan)?.color}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: '40px',
          animation: 'modalSlideUp 0.3s ease'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            Configure Your {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {selectedPlan === 'base' 
              ? 'Choose exactly 1 meal slot that you want included in your monthly subscription:' 
              : 'Choose exactly 2 meal slots that you want included in your monthly subscription:'}
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {['breakfast', 'lunch', 'dinner'].map(meal => {
              const isChecked = selectedMeals.includes(meal);
              return (
                <div 
                  key={meal} 
                  onClick={() => handleMealToggle(meal)}
                  style={{
                    flex: '1 1 200px',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isChecked ? 'var(--text-primary)' : 'var(--border-color)'}`,
                    backgroundColor: isChecked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '2px solid var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isChecked ? 'var(--text-primary)' : 'transparent',
                    borderColor: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}>
                    {isChecked && <Check size={14} color="#0f0f0f" strokeWidth={3} />}
                  </div>
                  <div>
                    <div style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '15px' }}>{meal}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {meal === 'breakfast' && '7:30 AM - 9:30 AM'}
                      {meal === 'lunch' && '12:30 PM - 2:30 PM'}
                      {meal === 'dinner' && '7:30 PM - 9:30 PM'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diet Preference Selector */}
          <div style={{ marginBottom: '24px' }}>
            <span className="form-label">Plan Diet Preference</span>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '400px', marginTop: '8px' }}>
              <button
                type="button"
                className={`btn ${subPreference === 'veg' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSubPreference('veg')}
                style={{ flex: 1, height: '40px' }}
              >
                🟢 Vegetarian Only
              </button>
              <button
                type="button"
                className={`btn ${subPreference === 'nonveg' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSubPreference('nonveg')}
                style={{ flex: 1, height: '40px' }}
              >
                🔴 Non-Vegetarian & Veg
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => { setSelectedPlan(null); setSelectedMeals([]); }}>
              Cancel Selection
            </button>
            <button className="btn btn-primary" onClick={handleOpenCheckout}>
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Premium Plan Direct Payment Trigger */}
      {selectedPlan === 'premium' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--brand-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: '40px',
          animation: 'modalSlideUp 0.3s ease'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Configure Premium Feast Plan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            Your Premium Plan covers all 3 daily meals. Select your dietary preference for the warden kitchen:
          </p>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '400px' }}>
              <button
                type="button"
                className={`btn ${subPreference === 'veg' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSubPreference('veg')}
                style={{ flex: 1, height: '40px' }}
              >
                🟢 Vegetarian Only
              </button>
              <button
                type="button"
                className={`btn ${subPreference === 'nonveg' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSubPreference('nonveg')}
                style={{ flex: 1, height: '40px' }}
              >
                🔴 Non-Vegetarian & Veg
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => { setSelectedPlan(null); setSelectedMeals([]); }}>
              Cancel
            </button>
            <button className="btn btn-brand" onClick={() => setCheckoutModal(true)}>
              Pay & Subscribe (₹{plans.find(p => p.id === 'premium')?.price})
            </button>
          </div>
        </div>
      )}

      {/* Checkout Payment Modal */}
      {checkoutModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setCheckoutModal(false)}>×</button>
            
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
              Subscription Checkout
            </h3>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Selected Plan:</span>
                <span style={{ fontWeight: 600 }}>{plans.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Diet Preference:</span>
                <span style={{ fontWeight: 600 }}>{subPreference === 'veg' ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Meal Slots:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedMeals.join(', ')}</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                <span style={{ fontWeight: 600 }}>1 Month (Renewable)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Total Price:</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-color)' }}>
                ₹{plans.find(p => p.id === selectedPlan)?.price}
              </span>
            </div>

            <div style={{ 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'rgba(10, 132, 255, 0.05)', 
              border: '1px solid rgba(10, 132, 255, 0.2)',
              marginBottom: '24px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              💡 <strong>Instant Wallet Billing:</strong> This plan charges your hostel wallet instantly. You will receive email notifications and digital coupons in your profile drawer.
            </div>

            <button 
              className="btn btn-brand" 
              style={{ width: '100%', height: '44px', fontSize: '15px' }}
              onClick={handleCompleteSubscription}
            >
              Pay & Confirm Subscription
            </button>
          </div>
        </div>
      )}

      {/* Success Celebration Popup overlay */}
      {successCelebration && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <div className="congrats-modal" style={{ animation: 'bounceScale 0.4s ease' }}>
            <div className="success-icon-anim">🎉</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)' }}>Subscription Activated!</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
              You are now subscribed to the <strong>{selectedPlan?.toUpperCase()}</strong> plan. Check your email for confirmation!
            </p>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setEditingPlan(null)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
              Edit Plan: {editingPlan.name}
            </h3>

            <form onSubmit={handleSavePlanEdit}>
              <div className="form-group">
                <label className="form-label">Plan Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Price (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editPlanPrice}
                  onChange={(e) => setEditPlanPrice(Number(e.target.value))}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '80px', padding: '12px', resize: 'none' }}
                  value={editPlanDesc}
                  onChange={(e) => setEditPlanDesc(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Features (Comma-separated list)</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '100px', padding: '12px', resize: 'none' }}
                  value={editPlanFeatures}
                  onChange={(e) => setEditPlanFeatures(e.target.value)}
                  placeholder="Feature 1, Feature 2, Feature 3..."
                  required 
                />
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Separate each feature bullet point with a comma.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Theme Color (CSS Color / Hex)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editPlanColor}
                    onChange={(e) => setEditPlanColor(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                    <input 
                      type="checkbox" 
                      checked={editPlanGlow}
                      onChange={(e) => setEditPlanGlow(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--brand-color)' }}
                    />
                    <span>Highlight Plan (Glow)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingPlan(null)}>
                  Discard
                </button>
                <button type="submit" className="btn btn-brand" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
