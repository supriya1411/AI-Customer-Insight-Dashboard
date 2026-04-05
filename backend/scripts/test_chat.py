import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from app.services.chatbot_service import process_chat

def main():
    print("Testing chatbot...")
    res = process_chat("Which customers are at highest churn risk?")
    print("Response:", res["response"])

if __name__ == "__main__":
    main()
