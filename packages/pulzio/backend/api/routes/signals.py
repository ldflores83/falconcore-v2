from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_signals():
    return {
        "signals": [
            {
                "type": "churn_risk",
                "name": "Churn Risk",
                "description": "Predict customer churn",
                "status": "available"
            },
            {
                "type": "onboarding_risk",
                "name": "Onboarding Risk",
                "description": "Detect onboarding issues",
                "status": "coming_soon"
            },
            {
                "type": "expansion_opportunity",
                "name": "Expansion Opportunity",
                "description": "Identify upsell opportunities",
                "status": "coming_soon"
            }
        ]
    }
