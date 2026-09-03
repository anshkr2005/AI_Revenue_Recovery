from datetime import datetime, timezone
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agent import CustomerSupportAgent
from app.database import get_db
from app.models import RecoveryAction


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="RevenueOS AI API",
    description="AI-powered revenue risk and recovery platform",
    version="0.3.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# AGENT
# =========================================================

agent = CustomerSupportAgent()


# =========================================================
# HELPERS
# =========================================================

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize_action(action: RecoveryAction) -> dict:
    """
    Convert a SQLAlchemy RecoveryAction object
    into a JSON-safe dictionary.
    """

    return {
        "id": str(action.id),
        "customer": action.customer,
        "action_type": action.action_type,
        "description": action.description,
        "priority": action.priority,
        "owner": action.owner,
        "status": action.status,
        "created_at": (
            action.created_at.isoformat()
            if action.created_at
            else None
        ),
        "updated_at": (
            action.updated_at.isoformat()
            if action.updated_at
            else None
        ),
    }


# =========================================================
# RECOVERY ACTION TYPES
# =========================================================

ActionType = Literal[
    "Email",
    "Phone Call",
    "Payment Follow-up",
    "Account Review",
    "Retention Offer",
]

ActionStatus = Literal[
    "Pending",
    "In Progress",
    "Completed",
    "Cancelled",
]


# =========================================================
# REQUEST MODELS
# =========================================================

class AnalyzeRequest(BaseModel):
    data: dict


class RecoveryActionCreate(BaseModel):
    customer: str = Field(
        min_length=1,
        max_length=200,
    )

    action_type: ActionType

    description: str = Field(
        min_length=1,
        max_length=2000,
    )

    priority: Literal[
        "High",
        "Medium",
        "Low",
    ] = "Medium"

    owner: str = Field(
        default="Revenue Team",
        max_length=100,
    )


class RecoveryActionUpdate(BaseModel):
    status: ActionStatus


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "RevenueOS AI API",
        "version": "0.3.0",
        "timestamp": utc_now(),
    }


# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():
    return {
        "name": "RevenueOS AI API",
        "version": "0.3.0",
        "status": "running",
        "docs": "/docs",
    }


# =========================================================
# DEMO ANALYSIS
# =========================================================

@app.get("/api/v1/demo")
async def demo():

    demo_data = {
        "customers": [
            {
                "name": "Acme Corp",
                "industry": "Technology",
                "contract_value": 50000,
                "invoice_status": "Overdue",
                "payment_status": "Failed",
                "customer_satisfaction": "Low",
                "support_tickets": 3,
                "renewal_status": "At Risk",
                "negotiation_days": 45,
            },
            {
                "name": "Globex Inc",
                "industry": "Manufacturing",
                "contract_value": 25000,
                "invoice_status": "Paid",
                "payment_status": "Successful",
                "customer_satisfaction": "High",
                "support_tickets": 0,
                "renewal_status": "Healthy",
                "negotiation_days": 5,
            },
        ]
    }

    try:

        result = agent.run(demo_data)

        return {
            "success": True,
            "generated_at": utc_now(),
            "data": result,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Demo analysis failed: {str(exc)}",
        )


# =========================================================
# REVENUE ANALYSIS
# =========================================================

@app.post("/api/v1/analyze")
async def analyze(request: AnalyzeRequest):

    try:

        result = agent.run(request.data)

        return {
            "success": True,
            "generated_at": utc_now(),
            "data": result,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(exc)}",
        )


# =========================================================
# CREATE RECOVERY ACTION
# =========================================================

@app.post("/api/v1/recovery-actions")
async def create_recovery_action(
    action: RecoveryActionCreate,
    db: Session = Depends(get_db),
):

    new_action = RecoveryAction(
        customer=action.customer,
        action_type=action.action_type,
        description=action.description,
        priority=action.priority,
        owner=action.owner,
        status="Pending",
    )

    try:

        db.add(new_action)

        db.commit()

        db.refresh(new_action)

        return {
            "success": True,
            "action": serialize_action(new_action),
        }

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create recovery action: {str(exc)}",
        )


# =========================================================
# GET RECOVERY ACTIONS
# =========================================================

@app.get("/api/v1/recovery-actions")
async def get_recovery_actions(
    status: str | None = Query(
        default=None,
        description="Filter by action status",
    ),
    customer: str | None = Query(
        default=None,
        description="Filter by customer name",
    ),
    db: Session = Depends(get_db),
):

    query = db.query(RecoveryAction)

    # Status filter
    if status:
        query = query.filter(
            RecoveryAction.status.ilike(status)
        )

    # Customer filter
    if customer:
        query = query.filter(
            RecoveryAction.customer.ilike(customer)
        )

    actions = query.order_by(
        RecoveryAction.created_at.desc()
    ).all()

    return {
        "success": True,
        "count": len(actions),
        "actions": [
            serialize_action(action)
            for action in actions
        ],
    }


# =========================================================
# UPDATE RECOVERY ACTION
# =========================================================

@app.patch("/api/v1/recovery-actions/{action_id}")
async def update_recovery_action(
    action_id: int,
    update: RecoveryActionUpdate,
    db: Session = Depends(get_db),
):

    action = (
        db.query(RecoveryAction)
        .filter(RecoveryAction.id == action_id)
        .first()
    )

    if not action:

        raise HTTPException(
            status_code=404,
            detail="Recovery action not found",
        )

    try:

        action.status = update.status

        db.commit()

        db.refresh(action)

        return {
            "success": True,
            "action": serialize_action(action),
        }

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update recovery action: {str(exc)}",
        )


# =========================================================
# DELETE RECOVERY ACTION
# =========================================================

@app.delete("/api/v1/recovery-actions/{action_id}")
async def delete_recovery_action(
    action_id: int,
    db: Session = Depends(get_db),
):

    action = (
        db.query(RecoveryAction)
        .filter(RecoveryAction.id == action_id)
        .first()
    )

    if not action:

        raise HTTPException(
            status_code=404,
            detail="Recovery action not found",
        )

    deleted_action = serialize_action(action)

    try:

        db.delete(action)

        db.commit()

        return {
            "success": True,
            "message": "Recovery action deleted",
            "action": deleted_action,
        }

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete recovery action: {str(exc)}",
        )


# =========================================================
# LOCAL DEVELOPMENT
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app.fastapi_server:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )