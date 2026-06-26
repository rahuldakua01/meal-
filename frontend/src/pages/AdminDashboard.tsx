import React, { useState, useRef, useEffect } from 'react';
import { Users, DollarSign, Pencil, Save, X, Utensils, CheckCircle, FolderOpen, Camera, Link, UploadCloud, CameraOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MenuItem, DayMenu } from '../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { weeklyMenu, users, orders, updateWeeklyMenu, extraStore, addExtraStoreItem, deleteExtraStoreItem, subscriptionPlans, updateSubscriptionPlan } = useApp();

  const [editingSlot, setEditingSlot] = useState<{ day: string; slotKey: keyof DayMenu; meal: MenuItem } | null>(null);
  
  // Subscription Plan Edit states
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState(0);
  const [editPlanDesc, setEditPlanDesc] = useState('');
  const [editPlanFeatures, setEditPlanFeatures] = useState('');
  const [editPlanColor, setEditPlanColor] = useState('');
  const [editPlanGlow, setEditPlanGlow] = useState(false);
  
  // Edit Form Fields
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCalories, setEditCalories] = useState(0);
  const [editImage, setEditImage] = useState('');
  const [editType, setEditType] = useState<'veg' | 'nonveg'>('veg');

  // Uploader & Webcam state hooks
  const [uploadTab, setUploadTab] = useState<'folder' | 'camera' | 'url'>('folder');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States and refs for adding extra items
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraDesc, setExtraDesc] = useState('');
  const [extraCalories, setExtraCalories] = useState(150);
  const [extraPrice, setExtraPrice] = useState(60);
  const [extraType, setExtraType] = useState<'veg' | 'nonveg'>('veg');
  const [extraCategory, setExtraCategory] = useState<'snack' | 'dessert' | 'beverage' | 'special'>('snack');
  const [extraImage, setExtraImage] = useState('');
  
  // Extra item uploader state
  const [extraUploadTab, setExtraUploadTab] = useState<'folder' | 'camera' | 'url'>('folder');
  const [isExtraCameraActive, setIsExtraCameraActive] = useState(false);
  const [extraCameraError, setExtraCameraError] = useState('');
  const extraVideoRef = useRef<HTMLVideoElement>(null);
  const extraStreamRef = useRef<MediaStream | null>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  // Start webcam stream
  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 360, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Error opening webcam:', err);
      setCameraError(err.message || 'Could not access camera. Please check browser permissions.');
      setIsCameraActive(false);
    }
  };

  // Stop webcam stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from webcam
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image frame to match feed mirror preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setEditImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle local file load
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Stop camera when switching tabs or closing modal
  useEffect(() => {
    if (uploadTab !== 'camera' || !editingSlot) {
      stopCamera();
    }
  }, [uploadTab, editingSlot]);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start webcam stream for extra uploader
  const startExtraCamera = async () => {
    setExtraCameraError('');
    setIsExtraCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 360, facingMode: 'user' } 
      });
      extraStreamRef.current = stream;
      if (extraVideoRef.current) {
        extraVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Error opening extra webcam:', err);
      setExtraCameraError(err.message || 'Could not access camera. Please check browser permissions.');
      setIsExtraCameraActive(false);
    }
  };

  // Stop webcam stream for extra uploader
  const stopExtraCamera = () => {
    if (extraStreamRef.current) {
      extraStreamRef.current.getTracks().forEach(track => track.stop());
      extraStreamRef.current = null;
    }
    setIsExtraCameraActive(false);
  };

  // Capture frame from webcam for extra uploader
  const captureExtraPhoto = () => {
    if (extraVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image frame to match feed mirror preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(extraVideoRef.current, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setExtraImage(dataUrl);
        stopExtraCamera();
      }
    }
  };

  // Handle local file load for extra uploader
  const processExtraFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setExtraImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExtraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExtraFile(file);
    }
  };

  const handleExtraDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleExtraDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExtraFile(file);
    }
  };

  // Stop extra camera when switching tabs or closing modal
  useEffect(() => {
    if (extraUploadTab !== 'camera' || !isAddingExtra) {
      stopExtraCamera();
    }
  }, [extraUploadTab, isAddingExtra]);

  // Cleanup extra stream on component unmount
  useEffect(() => {
    return () => {
      if (extraStreamRef.current) {
        extraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSaveExtraItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!extraImage) {
      alert('Please upload an image, capture a photo, or enter a URL before saving.');
      return;
    }

    addExtraStoreItem({
      name: extraName,
      description: extraDesc,
      calories: Number(extraCalories),
      price: Number(extraPrice),
      type: extraType,
      category: extraCategory,
      image: extraImage,
    });

    setIsAddingExtra(false);
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Calculations
  const totalStudents = users.filter(u => u.role === 'user').length;
  const activeSubs = users.filter(u => u.role === 'user' && u.subscription && u.subscription.status === 'active');
  
  const monthlyRevenue = activeSubs.reduce((acc, user) => {
    const tier = user.subscription?.tier;
    if (!tier || tier === 'none') return acc;
    const plan = subscriptionPlans.find(p => p.id === tier);
    return acc + (plan ? plan.price : 0);
  }, 0);

  const extraSalesToday = orders
    .filter(o => o.type === 'extra')
    .reduce((acc, ord) => acc + ord.total, 0);

  const handleEditClick = (day: string, slotKey: keyof DayMenu, meal: MenuItem) => {
    setEditingSlot({ day, slotKey, meal });
    setEditName(meal.name);
    setEditDesc(meal.description);
    setEditCalories(meal.calories);
    setEditImage(meal.image);
    setEditType(meal.type);
    setUploadTab(meal.image.startsWith('data:') ? 'folder' : 'url');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    if (!editImage) {
      alert('Please upload an image, capture a photo, or enter a URL before saving.');
      return;
    }

    const updatedMeal: MenuItem = {
      name: editName,
      description: editDesc,
      calories: Number(editCalories),
      image: editImage,
      type: editType
    };

    updateWeeklyMenu(editingSlot.day, editingSlot.slotKey, updatedMeal);
    setEditingSlot(null);
  };

  const handleEditPlanClick = (plan: any) => {
    setEditingPlan(plan);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price);
    setEditPlanDesc(plan.description);
    setEditPlanFeatures(plan.features.join(', '));
    setEditPlanColor(plan.color);
    setEditPlanGlow(plan.glow);
  };

  const handleSavePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    updateSubscriptionPlan(editingPlan.id, {
      name: editPlanName,
      price: Number(editPlanPrice),
      description: editPlanDesc,
      features: editPlanFeatures.split(',').map(f => f.trim()).filter(Boolean),
      color: editPlanColor,
      glow: editPlanGlow
    });
    setEditingPlan(null);
  };

  return (
    <div>
      <div className="sub-header" style={{ marginBottom: '32px' }}>
        <h1>Warden Admin Panel</h1>
        <p>Manage the hostel weekly schedule, review subscriptions, and track extra food orders.</p>
      </div>

      {/* Metric Widgets */}
      <div className="admin-grid">
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-card-lbl">Total Students</span>
            <Users size={20} color="var(--info)" />
          </div>
          <div className="admin-card-val">{totalStudents}</div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-card-lbl">Active Plans</span>
            <CheckCircle size={20} color="var(--success)" />
          </div>
          <div className="admin-card-val">{activeSubs.length}</div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-card-lbl">Monthly Revenue</span>
            <DollarSign size={20} color="var(--brand-color)" />
          </div>
          <div className="admin-card-val">₹{monthlyRevenue}</div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-card-lbl">Extra Canteen Sales</span>
            <Utensils size={20} color="var(--warning)" />
          </div>
          <div className="admin-card-val">₹{extraSalesToday}</div>
        </div>
      </div>

      {/* Weekly Menu Planner */}
      <div style={{ marginBottom: '40px' }}>
        <h3 className="section-title">
          <span>📅</span> Weekly Menu Scheduler (Mon - Sun)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
          Click the edit pen icon inside any meal slot to change the food menu for that day of the week.
        </p>

        <div className="week-grid">
          {daysOfWeek.map(day => {
            const dayMenu = weeklyMenu[day] || weeklyMenu.monday;
            return (
              <div key={day} className="day-column">
                <div className="day-header">{day}</div>
                
                {[
                  { key: 'breakfastVeg' as const, label: 'Breakfast (Veg)', meal: dayMenu.breakfastVeg, isVeg: true },
                  { key: 'breakfastNonVeg' as const, label: 'Breakfast (Non-Veg)', meal: dayMenu.breakfastNonVeg, isVeg: false },
                  { key: 'lunchVeg' as const, label: 'Lunch (Veg)', meal: dayMenu.lunchVeg, isVeg: true },
                  { key: 'lunchNonVeg' as const, label: 'Lunch (Non-Veg)', meal: dayMenu.lunchNonVeg, isVeg: false },
                  { key: 'dinnerVeg' as const, label: 'Dinner (Veg)', meal: dayMenu.dinnerVeg, isVeg: true },
                  { key: 'dinnerNonVeg' as const, label: 'Dinner (Non-Veg)', meal: dayMenu.dinnerNonVeg, isVeg: false }
                ].map(({ key: slotKey, label, meal, isVeg }) => (
                  <div key={slotKey} className="meal-slot">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="meal-slot-label" style={{ fontSize: '11px', fontWeight: 600 }}>{label}</span>
                      <button onClick={() => handleEditClick(day, slotKey, meal)} style={{ color: 'var(--info)' }}>
                        <Pencil size={12} />
                      </button>
                    </div>
                    <div className="meal-slot-name" style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {meal.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isVeg ? '🟢 Veg Only' : '🔴 Non-Veg'}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Plans Manager */}
      <div style={{ marginBottom: '40px' }}>
        <h3 className="section-title">
          <span>📋</span> Subscription Plans Manager
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
          Update plan names, pricing tiers, descriptions, and feature bullet points shown to students.
        </p>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plan Details</th>
                <th>Price (₹ / month)</th>
                <th>Meals count</th>
                <th>Features List</th>
                <th>Status / Glow</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionPlans.map(plan => (
                <tr key={plan.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: plan.color }}>{plan.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '300px' }}>
                      {plan.description}
                    </div>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--brand-color)' }}>
                    ₹{plan.price}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {plan.mealCount} meals/day
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {plan.features.map((feat, i) => (
                        <div key={i}>• {feat}</div>
                      ))}
                    </div>
                  </td>
                  <td>
                    {plan.glow ? (
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>⭐ Highlighted</span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '10px' }}>Standard</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleEditPlanClick(plan)}
                    >
                      <Pencil size={12} style={{ marginRight: '6px' }} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lower Dashboard Area: Users list & sales orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Student Database */}
        <div>
          <h3 className="section-title">
            <span>👥</span> Student Subscriptions Directory
          </h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Contact info</th>
                  <th>Active Plan</th>
                  <th>Meals Covered</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'user' && u.subscription).map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div>{user.email}</div>
                      <div>{user.phone}</div>
                    </td>
                    <td>
                      {user.subscription ? (
                        <span className={`badge ${
                          user.subscription.tier === 'premium' 
                            ? 'badge-danger' 
                            : user.subscription.tier === 'standard' 
                            ? 'badge-warning' 
                            : 'badge-info'
                        }`} style={{ textTransform: 'uppercase' }}>
                          {user.subscription.preference === 'veg' ? '🟢 VEG ' : '🔴 NON-VEG '} {user.subscription.tier}
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#2a2a2a', color: 'var(--text-secondary)' }}>None</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                      {user.subscription ? user.subscription.meals.join(' + ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Canteen Orders Log */}
        <div>
          <h3 className="section-title">
            <span>📝</span> Live Orders Log (Add-on Food Purchases)
          </h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Details</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.date}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {order.items.map((it, i) => (
                          <div key={i}>• {it.name} x{it.qty}</div>
                        ))}
                      </div>
                      <span className={`badge ${order.type === 'subscription' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '9px', padding: '1px 6px', marginTop: '4px' }}>
                        {order.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-color)' }}>
                      ₹{order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Canteen Extra Items & Canteen Shop Manager */}
      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            <span>🍔</span> Canteen Tuck Shop Menu & Extra Meals
          </h3>
          <button 
            className="btn btn-brand" 
            onClick={() => {
              setIsAddingExtra(true);
              setExtraName('');
              setExtraDesc('');
              setExtraCalories(150);
              setExtraPrice(60);
              setExtraType('veg');
              setExtraCategory('snack');
              setExtraImage('');
              setExtraUploadTab('folder');
              setIsExtraCameraActive(false);
              setExtraCameraError('');
            }}
          >
            + Add New Canteen Item
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', marginTop: '-12px' }}>
          Manage the active list of add-on meals, quick snacks, beverages, and special sides available for students to buy standalone.
        </p>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item Image</th>
                <th>Item Details</th>
                <th>Classification</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {extraStore.map(item => (
                <tr key={item.id}>
                  <td>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '64px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.type === 'veg' ? 'badge-success' : 'badge-danger'}`}>
                      {item.type === 'veg' ? '🟢 VEG' : '🔴 NON-VEG'}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '13px', fontWeight: 500 }}>
                    {item.category}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--brand-color)' }}>
                    ₹{item.price}
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${item.name} from the canteen menu?`)) {
                          deleteExtraStoreItem(item.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Menu Modal */}
      {editingSlot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setEditingSlot(null)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', textTransform: 'capitalize' }}>
              Edit Menu: {editingSlot.day} - {editingSlot.slotKey.replace('Veg', ' (Veg)').replace('NonVeg', ' (Non-Veg)')}
            </h3>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '80px', padding: '12px', resize: 'none' }}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Calories (kcal)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editCalories}
                    onChange={(e) => setEditCalories(Number(e.target.value))}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Food Classification</label>
                  <select 
                    className="form-input" 
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as 'veg' | 'nonveg')}
                    style={{ paddingRight: '12px', background: '#121212' }}
                  >
                    <option value="veg">🟢 Veg Only</option>
                    <option value="nonveg">🔴 Non-Veg</option>
                  </select>
                </div>
              </div>

              {/* Image Source Selection */}
              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Dish Image</label>
                
                {/* Tabs */}
                <div className="image-source-tabs">
                  <button 
                    type="button" 
                    className={`source-tab-btn ${uploadTab === 'folder' ? 'active' : ''}`}
                    onClick={() => setUploadTab('folder')}
                  >
                    <FolderOpen size={14} style={{ marginRight: '6px' }} />
                    Folder
                  </button>
                  <button 
                    type="button" 
                    className={`source-tab-btn ${uploadTab === 'camera' ? 'active' : ''}`}
                    onClick={() => setUploadTab('camera')}
                  >
                    <Camera size={14} style={{ marginRight: '6px' }} />
                    Camera
                  </button>
                  <button 
                    type="button" 
                    className={`source-tab-btn ${uploadTab === 'url' ? 'active' : ''}`}
                    onClick={() => setUploadTab('url')}
                  >
                    <Link size={14} style={{ marginRight: '6px' }} />
                    URL Link
                  </button>
                </div>

                {/* Tab Content: Folder */}
                {uploadTab === 'folder' && (
                  <div>
                    <div 
                      className="file-dropzone"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud size={32} className="file-dropzone-icon" />
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Drag & Drop Image here</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>or click to browse from system</div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                )}

                {/* Tab Content: Camera */}
                {uploadTab === 'camera' && (
                  <div className="camera-feed-container">
                    {cameraError ? (
                      <div className="camera-error-message">
                        <CameraOff size={32} />
                        <div>{cameraError}</div>
                        <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={startCamera}>
                          Try Again
                        </button>
                      </div>
                    ) : isCameraActive ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="camera-feed-video" />
                        <div className="camera-controls">
                          <button type="button" className="camera-btn" onClick={capturePhoto}>
                            Take Photo
                          </button>
                          <button type="button" className="camera-btn" onClick={stopCamera} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                            Turn Off
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Camera size={32} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Camera is turned off</span>
                        <button type="button" className="btn btn-brand" style={{ padding: '6px 16px', fontSize: '12px' }} onClick={startCamera}>
                          Start Camera
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content: URL */}
                {uploadTab === 'url' && (
                  <input 
                    type="url" 
                    className="form-input" 
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                )}

                {/* Selected Preview details card */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Preview</span>
                  {editImage ? (
                    <div className="upload-preview-card">
                      <img src={editImage} alt="Dish Preview" className="upload-preview-thumbnail" />
                      <div className="upload-preview-details">
                        <div className="upload-preview-title">Image is selected</div>
                        <div className="upload-preview-size">
                          {editImage.startsWith('data:') ? 'Local Custom Image' : 'Remote Image Link'}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn"
                        style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 700, padding: '4px 8px' }}
                        onClick={() => setEditImage('')}
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '12px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      No image loaded yet. Please select or capture one.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingSlot(null)}>
                  Discard
                </button>
                <button type="submit" className="btn btn-brand" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>Save Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Canteen Item Modal */}
      {isAddingExtra && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setIsAddingExtra(false)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
              Add New Canteen Extra Item
            </h3>

            <form onSubmit={handleSaveExtraItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={extraName}
                  onChange={(e) => setExtraName(e.target.value)}
                  placeholder="e.g. Masala Chai / Paneer Sandwich"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '80px', padding: '12px', resize: 'none' }}
                  value={extraDesc}
                  onChange={(e) => setExtraDesc(e.target.value)}
                  placeholder="Tell students about this delicious canteen offering..."
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={extraPrice}
                    onChange={(e) => setExtraPrice(Number(e.target.value))}
                    min={1}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Calories (kcal)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={extraCalories}
                    onChange={(e) => setExtraCalories(Number(e.target.value))}
                    min={0}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={extraCategory}
                    onChange={(e) => setExtraCategory(e.target.value as any)}
                    style={{ paddingRight: '12px', background: '#121212' }}
                  >
                    <option value="snack">🍔 Snack</option>
                    <option value="beverage">☕ Beverage</option>
                    <option value="dessert">🍰 Dessert</option>
                    <option value="special">⭐ Special Meal</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Diet Classification</label>
                  <select 
                    className="form-input" 
                    value={extraType}
                    onChange={(e) => setExtraType(e.target.value as any)}
                    style={{ paddingRight: '12px', background: '#121212' }}
                  >
                    <option value="veg">🟢 Veg Only</option>
                    <option value="nonveg">🔴 Non-Veg</option>
                  </select>
                </div>
              </div>

              {/* Image Source Selection */}
              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Dish Image</label>
                
                {/* Tabs */}
                <div className="image-source-tabs">
                  <button 
                    type="button" 
                    className={`source-tab-btn ${extraUploadTab === 'folder' ? 'active' : ''}`}
                    onClick={() => setExtraUploadTab('folder')}
                  >
                    <FolderOpen size={14} style={{ marginRight: '6px' }} />
                    Folder
                  </button>
                  <button 
                    type="button" 
                    className={`source-tab-btn ${extraUploadTab === 'camera' ? 'active' : ''}`}
                    onClick={() => setExtraUploadTab('camera')}
                  >
                    <Camera size={14} style={{ marginRight: '6px' }} />
                    Camera
                  </button>
                  <button 
                    type="button" 
                    className={`source-tab-btn ${extraUploadTab === 'url' ? 'active' : ''}`}
                    onClick={() => setExtraUploadTab('url')}
                  >
                    <Link size={14} style={{ marginRight: '6px' }} />
                    URL Link
                  </button>
                </div>

                {/* Tab Content: Folder */}
                {extraUploadTab === 'folder' && (
                  <div>
                    <div 
                      className="file-dropzone"
                      onDragOver={handleExtraDragOver}
                      onDrop={handleExtraDrop}
                      onClick={() => extraFileInputRef.current?.click()}
                    >
                      <UploadCloud size={32} className="file-dropzone-icon" />
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Drag & Drop Image here</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>or click to browse from system</div>
                      <input 
                        type="file" 
                        ref={extraFileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleExtraFileChange}
                      />
                    </div>
                  </div>
                )}

                {/* Tab Content: Camera */}
                {extraUploadTab === 'camera' && (
                  <div className="camera-feed-container">
                    {extraCameraError ? (
                      <div className="camera-error-message">
                        <CameraOff size={32} />
                        <div>{extraCameraError}</div>
                        <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={startExtraCamera}>
                          Try Again
                        </button>
                      </div>
                    ) : isExtraCameraActive ? (
                      <>
                        <video ref={extraVideoRef} autoPlay playsInline className="camera-feed-video" />
                        <div className="camera-controls">
                          <button type="button" className="camera-btn" onClick={captureExtraPhoto}>
                            Take Photo
                          </button>
                          <button type="button" className="camera-btn" onClick={stopExtraCamera} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                            Turn Off
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Camera size={32} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Camera is turned off</span>
                        <button type="button" className="btn btn-brand" style={{ padding: '6px 16px', fontSize: '12px' }} onClick={startExtraCamera}>
                          Start Camera
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content: URL */}
                {extraUploadTab === 'url' && (
                  <input 
                    type="url" 
                    className="form-input" 
                    value={extraImage}
                    onChange={(e) => setExtraImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                )}

                {/* Selected Preview details card */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Preview</span>
                  {extraImage ? (
                    <div className="upload-preview-card">
                      <img src={extraImage} alt="Dish Preview" className="upload-preview-thumbnail" />
                      <div className="upload-preview-details">
                        <div className="upload-preview-title">Image is selected</div>
                        <div className="upload-preview-size">
                          {extraImage.startsWith('data:') ? 'Local Custom Image' : 'Remote Image Link'}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn"
                        style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 700, padding: '4px 8px' }}
                        onClick={() => setExtraImage('')}
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '12px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      No image loaded yet. Please select or capture one.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddingExtra(false)}>
                  Discard
                </button>
                <button type="submit" className="btn btn-brand" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>Save Canteen Item</span>
                </button>
              </div>
            </form>
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
