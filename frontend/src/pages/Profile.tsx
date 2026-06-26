import React from 'react';
import { useApp } from '../context/AppContext';

export const Profile: React.FC = () => {
  const { currentUser, orders, weeklyMenu } = useApp();

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to view your profile and orders.</p>
      </div>
    );
  }

  // Filter orders for current user
  const myOrders = orders.filter(o => o.userId === currentUser.id);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const checkCoveredStatus = (slot: string, mealType: 'veg' | 'nonveg') => {
    if (currentUser.role === 'admin') return true;
    if (!currentUser.subscription) return false;
    // Vegetarian subscription preference does NOT cover non-veg meals
    if (currentUser.subscription.preference === 'veg' && mealType === 'nonveg') {
      return false;
    }
    if (currentUser.subscription.tier === 'premium') return true;
    return currentUser.subscription.meals.includes(slot.toLowerCase());
  };

  const getExpiryDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '—';
      date.setMonth(date.getMonth() + 1);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return '—';
    }
  };

  return (
    <div>
      <div className="sub-header" style={{ marginBottom: '32px' }}>
        <h1>My Student Profile</h1>
        <p>Manage your account credentials, view active subscription maps, and track canteen billing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {/* Left Side: Profile Details Card */}
        <div className="plan-card" style={{ padding: '24px', backgroundColor: 'var(--bg-card)', alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: currentUser.role === 'admin' 
                ? 'var(--brand-gradient)' 
                : 'linear-gradient(135deg, #0a84ff 0%, #30b0c7 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '16px'
            }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{currentUser.name}</h2>
            <span className="badge badge-info" style={{ marginTop: '8px', textTransform: 'uppercase' }}>
              {currentUser.role}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email Address</span>
              <span style={{ fontWeight: 600 }}>{currentUser.email}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone Number</span>
              <span style={{ fontWeight: 600 }}>{currentUser.phone}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Subscription Diet Preference</span>
              <span style={{ fontWeight: 600 }}>
                {currentUser.subscription 
                  ? (currentUser.subscription.preference === 'veg' ? '🟢 Vegetarian Only' : '🔴 Non-Vegetarian & Veg')
                  : 'N/A (No Active Subscription)'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Active Meal plan</span>
              {currentUser.subscription ? (
                <div style={{ marginTop: '4px' }}>
                  <span className="badge badge-success" style={{ textTransform: 'uppercase', marginRight: '6px' }}>
                    {currentUser.subscription.tier} plan
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    ({currentUser.subscription.meals.length} meals/day)
                  </span>
                </div>
              ) : (
                <span className="badge" style={{ backgroundColor: '#2a2a2a', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  No Active Subscription
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Visual Weekly Meal calendar coverage */}
        <div className="plan-card" style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
          <h3 className="section-title" style={{ fontSize: '18px', marginBottom: '8px' }}>
            <span>🗓️</span> Your Weekly Meal Coverage Map
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Meals highlighted in green are fully covered by your plan. Yellow meals require single token checkout.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {daysOfWeek.map(day => {
              const dayMenu = weeklyMenu[day] || weeklyMenu.monday;
              const pref = currentUser.subscription?.preference || 'veg';
              
              const breakfastMeal = pref === 'veg' ? dayMenu.breakfastVeg : dayMenu.breakfastNonVeg;
              const isBreakfastCovered = checkCoveredStatus('breakfast', breakfastMeal.type);
              
              const lunchMeal = pref === 'veg' ? dayMenu.lunchVeg : dayMenu.lunchNonVeg;
              const isLunchCovered = checkCoveredStatus('lunch', lunchMeal.type);
              
              const dinnerMeal = pref === 'veg' ? dayMenu.dinnerVeg : dayMenu.dinnerNonVeg;
              const isDinnerCovered = checkCoveredStatus('dinner', dinnerMeal.type);
              
              return (
                <div key={day} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <div style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '13px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                    {day.slice(0, 3)}
                  </div>
                  
                  {/* Breakfast */}
                  <div style={{
                    padding: '6px',
                    borderRadius: '4px',
                    backgroundColor: isBreakfastCovered ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 204, 0, 0.05)',
                    border: `1px solid ${isBreakfastCovered ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 204, 0, 0.1)'}`,
                    marginBottom: '6px',
                    fontSize: '11px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 700, opacity: 0.7 }}>BF</div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                      {breakfastMeal.name}
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: isBreakfastCovered ? 'var(--success)' : 'var(--warning)' }}>
                      {isBreakfastCovered ? '✓ Covered' : '+ Pay extra'}
                    </span>
                  </div>

                  {/* Lunch */}
                  <div style={{
                    padding: '6px',
                    borderRadius: '4px',
                    backgroundColor: isLunchCovered ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 204, 0, 0.05)',
                    border: `1px solid ${isLunchCovered ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 204, 0, 0.1)'}`,
                    marginBottom: '6px',
                    fontSize: '11px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 700, opacity: 0.7 }}>LH</div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                      {lunchMeal.name}
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: isLunchCovered ? 'var(--success)' : 'var(--warning)' }}>
                      {isLunchCovered ? '✓ Covered' : '+ Pay extra'}
                    </span>
                  </div>

                  {/* Dinner */}
                  <div style={{
                    padding: '6px',
                    borderRadius: '4px',
                    backgroundColor: isDinnerCovered ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 204, 0, 0.05)',
                    border: `1px solid ${isDinnerCovered ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 204, 0, 0.1)'}`,
                    fontSize: '11px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 700, opacity: 0.7 }}>DN</div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                      {dinnerMeal.name}
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: isDinnerCovered ? 'var(--success)' : 'var(--warning)' }}>
                      {isDinnerCovered ? '✓ Covered' : '+ Pay extra'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Canteen Orders & Receipts history */}
      <div>
        <h3 className="section-title">
          <span>🧾</span> Billing Receipts & Order History
        </h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Order Date</th>
                <th>Purchased Items</th>
                <th>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                myOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>{order.id}</td>
                    <td>{order.date}</td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        {order.items.map((it, i) => (
                          <div key={i}>• {it.name} x{it.qty}</div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className={`badge ${order.type === 'subscription' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {order.type}
                        </span>
                        {order.type === 'subscription' && (
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Expires: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getExpiryDate(order.date)}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--brand-color)' }}>₹{order.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
