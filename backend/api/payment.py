from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.dependency import get_db, user_requird
from core.config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from models.user import User
from models.sunscription_plan import Plan
from services.subscription_service import create_subscribe
from schemas.subscribe import SubscriptionCreate
from pydantic import BaseModel
import razorpay

router = APIRouter(prefix="/payment", tags=["Payment"])

# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class PaymentOrderRequest(BaseModel):
    plan_name: str

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_name: str

@router.post("/create-order")
def create_order(request: PaymentOrderRequest, current_user = Depends(user_requird), db: Session = Depends(get_db)):
    # Fetch user from DB
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if user is already Active
    if user.status == "Active":
        raise HTTPException(status_code=400, detail="User already has an active subscription")
        
    # Parse tier name (e.g. "standard:nonveg:breakfast" -> "standard")
    tier_name = request.plan_name.split(":")[0] if ":" in request.plan_name else request.plan_name
    
    # Query database for the plan's price
    plan = db.query(Plan).filter(Plan.plan_name == tier_name).first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Subscription plan '{tier_name}' not found")

    amount_in_paise = plan.price * 100
    order_data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": f"receipt_order_{user.id}"
    }
    
    try:
        razorpay_order = razorpay_client.order.create(data=order_data)
        return {
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment order: {str(e)}")

@router.post("/verify-payment")
def verify_payment(request: PaymentVerifyRequest, current_user = Depends(user_requird), db: Session = Depends(get_db)):
    # Verify the signature securely
    params_dict = {
        'razorpay_order_id': request.razorpay_order_id,
        'razorpay_payment_id': request.razorpay_payment_id,
        'razorpay_signature': request.razorpay_signature
    }
    
    try:
        razorpay_client.utility.verify_payment_signature(params_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Payment verification failed (invalid signature)")
        
    # Parse tier name (e.g. "standard:nonveg:breakfast" -> "standard")
    tier_name = request.plan_name.split(":")[0] if ":" in request.plan_name else request.plan_name
    
    # Query database for plan price and id to associate with subscription
    plan = db.query(Plan).filter(Plan.plan_name == tier_name).first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Subscription plan '{tier_name}' not found")

    # Payment is verified! Create subscription and activate user
    subscribe_data = SubscriptionCreate(
        meal_plan_name=request.plan_name,
        price=plan.price,
        plan_id=plan.id
    )
    
    try:
        result = create_subscribe(data=subscribe_data, current_user=current_user, db=db)
        return {
            "message": "Payment verified and subscription activated successfully!",
            "subscription_id": result["subscription_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error activating subscription: {str(e)}")

