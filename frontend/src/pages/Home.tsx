import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MenuItem, DayMenu } from '../context/AppContext';

interface HomeProps {
  setActiveTab: (tab: string) => void;
  onToggleAuth: () => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab, onToggleAuth }) => {
  const { weeklyMenu, currentUser, extraStore, searchQuery, placeExtraOrder } = useApp();
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = new Date().getDay();
    return days[currentDayIndex];
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedMeal, setSelectedMeal] = useState<{ name: string; meal: MenuItem; slot: 'breakfast' | 'lunch' | 'dinner' } | null>(null);
  const [quickBuyItem, setQuickBuyItem] = useState<any | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Veg', 'Non-Veg'];

  // Retrieve menu for selected day
  const dayMenu = weeklyMenu[selectedDay.toLowerCase()] || weeklyMenu.monday;

  // Map slots for iteration
  const mealsList: { slotKey: keyof DayMenu; slotName: 'breakfast' | 'lunch' | 'dinner'; label: string; meal: MenuItem; time: string; }[] = [
    { slotKey: 'breakfastVeg', slotName: 'breakfast', label: 'Breakfast (Veg)', meal: dayMenu.breakfastVeg, time: '7:30 AM - 9:30 AM' },
    { slotKey: 'breakfastNonVeg', slotName: 'breakfast', label: 'Breakfast (Non-Veg)', meal: dayMenu.breakfastNonVeg, time: '7:30 AM - 9:30 AM' },
    { slotKey: 'lunchVeg', slotName: 'lunch', label: 'Lunch (Veg)', meal: dayMenu.lunchVeg, time: '12:30 PM - 2:30 PM' },
    { slotKey: 'lunchNonVeg', slotName: 'lunch', label: 'Lunch (Non-Veg)', meal: dayMenu.lunchNonVeg, time: '12:30 PM - 2:30 PM' },
    { slotKey: 'dinnerVeg', slotName: 'dinner', label: 'Dinner (Veg)', meal: dayMenu.dinnerVeg, time: '7:30 PM - 9:30 PM' },
    { slotKey: 'dinnerNonVeg', slotName: 'dinner', label: 'Dinner (Non-Veg)', meal: dayMenu.dinnerNonVeg, time: '7:30 PM - 9:30 PM' }
  ];

  // Filter based on search query and category
  const filteredMeals = mealsList.filter(item => {
    // Search filter
    const matchesSearch = item.meal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.slotName.includes(searchQuery.toLowerCase());
    
    // Category filter
    if (!matchesSearch) return false;
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Breakfast') return item.slotName === 'breakfast';
    if (activeCategory === 'Lunch') return item.slotName === 'lunch';
    if (activeCategory === 'Dinner') return item.slotName === 'dinner';
    if (activeCategory === 'Veg') return item.meal.type === 'veg';
    if (activeCategory === 'Non-Veg') return item.meal.type === 'nonveg';
    
    return true;
  });

  const checkMealSubscription = (slotName: 'breakfast' | 'lunch' | 'dinner', mealType: 'veg' | 'nonveg') => {
    if (!currentUser) return 'signin';
    if (currentUser.role === 'admin') return 'admin';
    if (!currentUser.subscription) return 'unsubscribed';
    
    // Vegetarian subscription preference does NOT cover non-veg meals
    if (currentUser.subscription.preference === 'veg' && mealType === 'nonveg') {
      return 'unsubscribed';
    }
    
    // Premium includes all
    if (currentUser.subscription.tier === 'premium') return 'subscribed';
    
    // Base/Standard check
    const isIncluded = currentUser.subscription.meals.includes(slotName);
    return isIncluded ? 'subscribed' : 'unsubscribed';
  };

  // Filter based on subscription plan if student has an active subscription
  const displayMeals = filteredMeals.filter(item => {
    if (!currentUser || currentUser.role === 'admin' || !currentUser.subscription) {
      return true;
    }
    const subStatus = checkMealSubscription(item.slotName, item.meal.type);
    return subStatus === 'subscribed';
  });

  const vegMeals = displayMeals.filter(item => item.meal.type === 'veg');
  const nonVegMeals = displayMeals.filter(item => item.meal.type === 'nonveg');

  const handleQuickBuy = (item: any) => {
    if (!currentUser) {
      onToggleAuth();
      return;
    }
    setQuickBuyItem(item);
  };

  const handleConfirmQuickBuy = () => {
    placeExtraOrder([{ name: quickBuyItem.name, price: quickBuyItem.price, qty: 1 }], quickBuyItem.price);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setQuickBuyItem(null);
    }, 1500);
  };

  // Featured Item details (Warden's Special from Wednesday Dinner)
  const featuredMeal = weeklyMenu.wednesday.dinnerVeg;

  return (
    <div>
      {/* Category Tag Pills (YouTube horizontal style) */}
      <div className="categories-bar no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hero Featured "Video Trailer" Banner */}
      <div className="hero-banner">
        <img 
          src={featuredMeal.image} 
          alt={featuredMeal.name} 
          className="hero-img"
        />
        <div className="hero-overlay">
          <span className="hero-badge">⭐ Warden's Pick of the Week</span>
          <h1 className="hero-title">{featuredMeal.name}</h1>
          <p className="hero-desc">
            {featuredMeal.description} Prepared with premium fresh ingredients every Wednesday night.
          </p>
          <div className="hero-actions">
            <button className="btn btn-brand" onClick={() => setActiveTab('subscriptions')}>
              <Sparkles size={16} />
              <span>Explore Plans</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setSelectedDay('wednesday')}>
              <Play size={16} />
              <span>View Wednesday Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector pills */}
      <div style={{ marginBottom: '24px' }}>
        <h3 className="section-title">
          <span>📅</span> Weekly Schedule (Select Day)
        </h3>
        <div className="categories-bar no-scrollbar" style={{ paddingTop: 0, paddingBottom: 0 }}>
          {daysOfWeek.map(day => (
            <button
              key={day}
              className={`category-pill ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
              style={{ 
                textTransform: 'capitalize',
                border: selectedDay === day ? 'none' : '1px solid var(--border-color)',
                backgroundColor: selectedDay === day ? 'var(--text-primary)' : 'rgba(255,255,255,0.02)'
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: YouTube-style Video Cards */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="section-title">
          <span>🍽️</span> Meals for {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
        </h3>
        {filteredMeals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)'
          }}>
            No meals match your active filters or search queries.
          </div>
        ) : (
          <div className="home-columns-container">
            {/* Left Column: Vegetarian Menu */}
            <div className="menu-column">
              <h4 className="column-header">
                <span style={{ color: 'var(--success)' }}>🟢</span> Vegetarian Menu
              </h4>
              {vegMeals.length === 0 ? (
                <div className="empty-column-msg">
                  No Vegetarian items match active filters.
                </div>
              ) : (
                <div className="menu-column-list">
                  {vegMeals.map(({ slotKey, slotName, label, meal, time }) => {
                    const subStatus = checkMealSubscription(slotName, meal.type);
                    return (
                      <div 
                        key={slotKey} 
                        className="meal-card horizontal-card"
                        onClick={() => setSelectedMeal({ name: label, meal, slot: slotName })}
                      >
                        <div className="meal-thumbnail-wrapper-horizontal">
                          <img src={meal.image} alt={meal.name} className="meal-thumbnail" />
                          <span className="meal-duration">{time.split(' - ')[0]}</span>
                        </div>
                        
                        <div className="meal-info-horizontal">
                          <div className="meal-details-horizontal">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <h4 className="meal-title-horizontal">{meal.name}</h4>
                              <span className="meal-type-dot veg" title="Vegetarian"></span>
                            </div>
                            <p className="meal-meta-horizontal" style={{ textTransform: 'capitalize' }}>
                              {label.split(' (')[0]} • {meal.calories} kcal
                            </p>
                            
                            {/* Subscription indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px' }}>
                              {subStatus === 'subscribed' ? (
                                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                                  <CheckCircle2 size={11} /> Included
                                </span>
                              ) : subStatus === 'unsubscribed' ? (
                                <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                                  <AlertCircle size={11} /> Extra Fee
                                </span>
                              ) : subStatus === 'admin' ? (
                                <span style={{ color: 'var(--brand-color)', fontWeight: 600 }}>
                                  🔧 Admin
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                                  Sign in
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Non-Vegetarian Menu */}
            <div className="menu-column">
              <h4 className="column-header">
                <span style={{ color: 'var(--danger)' }}>🔴</span> Non-Vegetarian Menu
              </h4>
              {nonVegMeals.length === 0 ? (
                <div className="empty-column-msg">
                  No Non-Vegetarian items match active filters.
                </div>
              ) : (
                <div className="menu-column-list">
                  {nonVegMeals.map(({ slotKey, slotName, label, meal, time }) => {
                    const subStatus = checkMealSubscription(slotName, meal.type);
                    return (
                      <div 
                        key={slotKey} 
                        className="meal-card horizontal-card"
                        onClick={() => setSelectedMeal({ name: label, meal, slot: slotName })}
                      >
                        <div className="meal-thumbnail-wrapper-horizontal">
                          <img src={meal.image} alt={meal.name} className="meal-thumbnail" />
                          <span className="meal-duration">{time.split(' - ')[0]}</span>
                        </div>
                        
                        <div className="meal-info-horizontal">
                          <div className="meal-details-horizontal">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <h4 className="meal-title-horizontal">{meal.name}</h4>
                              <span className="meal-type-dot nonveg" title="Non-Vegetarian"></span>
                            </div>
                            <p className="meal-meta-horizontal" style={{ textTransform: 'capitalize' }}>
                              {label.split(' (')[0]} • {meal.calories} kcal
                            </p>
                            
                            {/* Subscription indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px' }}>
                              {subStatus === 'subscribed' ? (
                                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                                  <CheckCircle2 size={11} /> Included
                                </span>
                              ) : subStatus === 'unsubscribed' ? (
                                <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                                  <AlertCircle size={11} /> Extra Fee
                                </span>
                              ) : subStatus === 'admin' ? (
                                <span style={{ color: 'var(--brand-color)', fontWeight: 600 }}>
                                  🔧 Admin
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                                  Sign in
                                </span>
                              )}
                            </div>

                            {/* Food Preference Warning */}
                            {meal.type === 'nonveg' && currentUser?.subscription?.preference === 'veg' && (
                              <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontSize: '10px', fontWeight: 600 }}>
                                ⚠️ Non-Veg (Preference: Veg)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* YouTube Shorts Carousel for Snacks */}
      <div className="shorts-container">
        <div className="shorts-header">
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            <span style={{ color: 'var(--brand-color)' }}>⚡</span> Quick Bites (Snack Shorts)
          </h3>
          <button style={{ color: 'var(--text-secondary)', fontSize: '13px' }} onClick={() => setActiveTab('extra')}>
            View All
          </button>
        </div>
        <div className="shorts-grid">
          {extraStore.slice(2, 7).map(item => (
            <div key={item.id} className="short-card" onClick={() => handleQuickBuy(item)}>
              <div className="short-thumbnail-wrapper">
                <img src={item.image} alt={item.name} className="short-thumbnail" />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '8px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>₹{item.price}</span>
                </div>
              </div>
              <div className="short-info">
                <h4 className="short-title">{item.name}</h4>
                <span className="short-views">
                  🔥 {Math.floor(item.price * 1.5)} ordered this week
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Detail Dialog Modal */}
      {selectedMeal && (
        <div className="modal-overlay" onClick={() => setSelectedMeal(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMeal(null)}>×</button>
            
            <img 
              src={selectedMeal.meal.image} 
              alt={selectedMeal.meal.name}
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span className={`badge ${selectedMeal.meal.type === 'veg' ? 'badge-success' : 'badge-danger'}`}>
                {selectedMeal.meal.type === 'veg' ? 'Veg' : 'Non-Veg'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {selectedMeal.meal.calories} Calories
              </span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', textTransform: 'capitalize' }}>
              {selectedMeal.slot}: {selectedMeal.meal.name}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              {selectedMeal.meal.description}
            </p>

            {selectedMeal.meal.type === 'nonveg' && currentUser?.subscription?.preference === 'veg' && (
              <div style={{ 
                padding: '12px', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'rgba(255, 59, 48, 0.1)', 
                border: '1px solid var(--danger)',
                marginBottom: '16px',
                color: 'var(--danger)',
                fontSize: '12px',
                fontWeight: 600
              }}>
                ⚠️ <strong>Dietary Warning:</strong> This is a Non-Vegetarian dish, but your subscription preference is set to Vegetarian Only.
              </div>
            )}

            <div style={{ 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color)',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Status on your plan:</div>
              {checkMealSubscription(selectedMeal.slot, selectedMeal.meal.type) === 'subscribed' ? (
                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                   <CheckCircle2 size={16} /> Fully covered under your current {currentUser?.subscription?.tier} plan! No charges.
                </div>
              ) : checkMealSubscription(selectedMeal.slot, selectedMeal.meal.type) === 'unsubscribed' ? (
                <div style={{ fontSize: '13px' }}>
                  <div style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertCircle size={16} /> Not covered. Buying this meal standalone requires a standard one-time fee.
                  </div>
                  <button 
                    className="btn btn-brand" 
                    onClick={() => {
                      setSelectedMeal(null);
                      setActiveTab('subscriptions');
                    }}
                    style={{ width: '100%' }}
                  >
                    Upgrade Plan to Include
                  </button>
                </div>
              ) : checkMealSubscription(selectedMeal.slot, selectedMeal.meal.type) === 'admin' ? (
                <div style={{ color: 'var(--brand-color)', fontSize: '13px', fontWeight: 600 }}>
                  🔧 You are logged in as admin. You can edit this item in the Admin Panel.
                </div>
              ) : (
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Log in to view if this meal is free under your hostel plan.</span>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setSelectedMeal(null);
                      onToggleAuth();
                    }}
                    style={{ width: '100%', marginTop: '12px' }}
                  >
                    Log In / Register
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedMeal(null)}>
                Close Details
              </button>
              {checkMealSubscription(selectedMeal.slot, selectedMeal.meal.type) === 'unsubscribed' && (
                <button 
                  className="btn btn-brand" 
                  style={{ flex: 1 }} 
                  onClick={() => {
                    handleQuickBuy({
                      name: `Single Meal: ${selectedMeal.meal.name} (${selectedMeal.slot})`,
                      price: 90, // flat rate for extra standalone meals
                      image: selectedMeal.meal.image
                    });
                    setSelectedMeal(null);
                  }}
                >
                  Buy Standalone (₹90)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Buy Dialog Modal */}
      {quickBuyItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Confirm Purchase
            </h3>

            {paymentSuccess ? (
              <div className="congrats-modal">
                <div className="success-icon-anim">✓</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--success)' }}>Payment Confirmed!</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your order will be ready at the canteen counter.</div>
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'center', 
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  marginBottom: '20px'
                }}>
                  <img src={quickBuyItem.image} alt={quickBuyItem.name} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{quickBuyItem.name}</div>
                    <div style={{ color: 'var(--brand-color)', fontWeight: 700, marginTop: '2px' }}>₹{quickBuyItem.price}</div>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  This amount will be deducted directly from your registered student account wallet or billed to your monthly invoice.
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setQuickBuyItem(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-brand" style={{ flex: 1 }} onClick={handleConfirmQuickBuy}>
                    Pay Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
