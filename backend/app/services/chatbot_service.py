"""
ACIAS — Chatbot Service
Natural-language interface for stakeholders to query ACIAS data and get AI-driven insights.
Upgraded to use Google Gemini AI with Function Calling natively resolving to backend logic.
"""
import os
import json
from typing import Dict, Any, List

from google import genai
from google.genai import types

from app.core.config import settings
from app.data.synthetic import get_kpi_summary, get_segment_summary, get_all_customers
from app.api.actions import _ensure_actions_loaded

# Tools for Gemini
def get_highest_risk_customers(limit: int = 5) -> str:
    """Returns the top customers with the highest churn probability.
    
    Args:
        limit (int): The number of top customers to return (default is 5).
    """
    from app.services.ml_insights import get_insights
    try:
        real_data = get_insights()
        critical = sorted(real_data, key=lambda x: x.get("churn_probability", 0.0), reverse=True)[:limit]
        res = []
        for c in critical:
            res.append({
                "customer_id": c["customer_id"], 
                "churn_probability": c["churn_probability"], 
                "segment": c.get("segment", "Unknown"),
                "recommended_action": c.get("recommended_action", "N/A")
            })
        return json.dumps(res)
    except Exception as e:
        return json.dumps([{"error": str(e)}])

def get_kpis() -> str:
    """Gets the overall platform KPI summary, MRR, NR, and total customers at risk."""
    return json.dumps(get_kpi_summary())

def get_segment_insights() -> str:
    """Gets the churn and MRR data aggregated by customer segment."""
    return json.dumps(get_segment_summary())

def get_pending_actions() -> str:
    """Returns a list of all currently pending or recommended actions to prevent churn."""
    actions = _ensure_actions_loaded()
    pending = [a for a in actions if a["status"] == "pending"]
    res = []
    for a in pending[:10]: # limit to 10
        res.append({"action_id": a["action_id"], "customer_id": a["customer_id"], "action": a["action_label"], "impact": a["predicted_revenue_impact"]})
    return json.dumps(res)

def get_customer_clv(customer_id: str) -> str:
    """Gets the CLV (Customer Lifetime Value) and metrics for a specific customer.
    
    Args:
        customer_id (str): The unique ID of the customer (e.g., CUST-10005).
    """
    customers = get_all_customers()
    for c in customers:
        if c["customer_id"].lower() == customer_id.lower():
            return json.dumps({"customer_id": c["customer_id"], "clv_12m": c["clv_12m"], "clv_24m": c["clv_24m"], "monthly_spend": c.get("mrr", 0)})
    return json.dumps({"error": "Customer not found"})


def process_chat(message: str, history: List[Any] = None) -> Dict[str, Any]:
    api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return {
            "response": "⚠️ **Configuration Error**\n\nThe Gemini API key is missing. Please add `GEMINI_API_KEY` to your environment variables or config to activate the AI Analyst.",
            "intent": "error",
            "confidence": 1.0,
            "data": None,
            "follow_up_suggestions": ["How do I set up the API key?"]
        }
        
    try:
        client = genai.Client(api_key=api_key)
        
        system_context = (
            "You are the ACIAS AI Analyst. You help customers understand their churn risk, segment data, and MRR. "
            "You MUST use the provided tools to lookup data dynamically when answering user questions. "
            "If a user asks 'Which customers are at highest churn risk?', use `get_highest_risk_customers`. "
            "If they ask 'What actions are pending?', use `get_pending_actions`. "
            "NEVER return static welcome messages, ALWAYS return real data. "
            "If the question doesn't match any tool, fallback to your general intelligence but still assist the user as the ACIAS AI Analyst. "
            "Format your response neatly in markdown. Do NOT expose internal JSON directly."
        )
        
        # Tools configuration
        tool_list = [get_highest_risk_customers, get_kpis, get_segment_insights, get_pending_actions, get_customer_clv]
        
        contents = []
        if history:
            for msg in history[-6:]: 
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(role=role, parts=[types.Part.from_text(text=msg.content)])
                )
        
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

        config = types.GenerateContentConfig(
            system_instruction=system_context,
            temperature=0.2,
            tools=tool_list,
        )

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=config
        )
        
        # Check if the model decided to call a function
        if response.function_calls:
            for fn_call in response.function_calls:
                fn_name = fn_call.name
                fn_args = fn_call.args
                # Map dynamically
                func_map = {f.__name__: f for f in tool_list}
                if fn_name in func_map:
                    try:
                        result_str = func_map[fn_name](**fn_args)
                    except Exception as e:
                        result_str = f'{{"error": "{str(e)}"}}'
                        
                    # Reply back with the function response so the model can generate the final answer
                    part = types.Part.from_function_response(
                        name=fn_name,
                        response={"result": result_str}
                    )
                    
                    # Append previous model response (the tool call) and the user response (the tool output)
                    contents.append(response.candidates[0].content)
                    contents.append(types.Content(role="user", parts=[part]))
                    
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=contents,
                        config=config
                    )

        return {
            "response": response.text,
            "intent": "data_query" if len(contents) > 2 else "general_qa",
            "confidence": 1.0,
            "data": None,
            "follow_up_suggestions": [
                "Which segment has the highest MRR at risk?",
                "Show me the top 5 at-risk customers",
                "What's our current NRR?"
            ]
        }
    except Exception as e:
        return {
            "response": f"⚠️ **AI Generation Error**\n\nFailed to answer query using AI Analyst: {str(e)}",
            "intent": "error",
            "confidence": 1.0,
            "data": None,
            "follow_up_suggestions": []
        }
