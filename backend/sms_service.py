import requests
from datetime import datetime, timedelta

# Paste your Fast2SMS Dev API key here
FAST2SMS_API_KEY = "PASTE_YOUR_FAST2SMS_API_KEY_HERE"

# The 10-digit Indian number that will receive the alert (NO +91)
TARGET_MOBILE_NUMBER = "YOUR_10_DIGIT_PHONE_NUMBER"

# Cooldown Tracker: prevent spamming SMS every 8 seconds
alert_cooldown_tracker = {}
COOLDOWN_MINUTES = 15

def send_custom_sms(cow_id: str, risk_score: float, top_driver: str, metric_val: str):
    now = datetime.utcnow()

    # 1. Anti-spam debounce
    if cow_id in alert_cooldown_tracker:
        last_sent = alert_cooldown_tracker[cow_id]
        if now - last_sent < timedelta(minutes=COOLDOWN_MINUTES):
            print(f"[*] SMS debounced for {cow_id}. Last alert sent {int((now - last_sent).seconds / 60)}m ago.")
            return False

    # 2. Formulate your custom clinical message
    message_text = (
        f"AAROGYA ALERT: Cow {cow_id} flagged HIGH RISK ({int(risk_score * 100)}%). "
        f"Primary Driver: {top_driver} ({metric_val}). "
        f"Action: Isolate cow and withhold milk line from bulk tank."
    )

    # 3. Fast2SMS Quick SMS Endpoint
    url = "https://www.fast2sms.com/dev/bulkV2"
    payload = {
        "route": "q",                   # Quick SMS route allows custom text directly
        "message": message_text,
        "language": "english",
        "flash": 0,
        "numbers": TARGET_MOBILE_NUMBER.strip()
    }
    headers = {
        "authorization": FAST2SMS_API_KEY
    }

    try:
        response = requests.post(url, data=payload, headers=headers, timeout=5)
        res_data = response.json()
        
        if res_data.get("return") is True:
            print(f"[+] Custom SMS dispatched successfully to {TARGET_MOBILE_NUMBER}")
            alert_cooldown_tracker[cow_id] = now
            return True
        else:
            print(f"[!] Fast2SMS Error: {res_data.get('message')}")
            return False
    except Exception as e:
        print(f"[!] SMS Request Exception: {e}")
        return False
