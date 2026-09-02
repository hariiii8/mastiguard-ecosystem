import time
import random
import requests
from datetime import datetime, timezone

API_ENDPOINT = "http://127.0.0.1:8000/api/v1/telemetry"
TOTAL_COWS = 54
HIGH_RISK_COWS = {"COW_03", "COW_12", "COW_27", "COW_39", "COW_48", "COW_52"}

def generate_cow_telemetry(cow_num: int) -> dict:
    cow_id = f"COW_{cow_num:02d}"
    is_high_risk = cow_id in HIGH_RISK_COWS
    
    # Months after giving birth (DIM stage)
    months = ((cow_num % 5) + 1)
    
    if is_high_risk:
        # Clinical Mastitis Profile (quarter swelling in Front-Left/Front-Right, fever, firmness, pain, visible clots)
        iu_base = random.uniform(192.0, 205.0)
        eu_normal = random.uniform(225.0, 240.0)
        eu_swollen = random.uniform(275.0, 320.0)
        
        # Quarter asymmetric swelling
        if cow_num % 2 == 0:
            eu_fl, eu_fr = eu_swollen, eu_normal + random.uniform(5.0, 15.0)
            eu_rl, eu_rr = eu_normal + random.uniform(0.0, 8.0), eu_normal
        else:
            eu_fl, eu_fr = eu_normal + random.uniform(5.0, 15.0), eu_swollen
            eu_rl, eu_rr = eu_normal, eu_normal + random.uniform(0.0, 8.0)
            
        temp = round(random.uniform(39.4, 40.6), 2)
        hardness = 1.0
        pain = 1.0
        milk_vis = 1.0
        prev_mastitis = 1.0
    else:
        # Baseline Healthy Cohort
        iu_base = random.uniform(190.0, 204.0)
        eu_fl = random.uniform(215.0, 245.0)
        eu_fr = random.uniform(215.0, 245.0)
        eu_rl = random.uniform(215.0, 245.0)
        eu_rr = random.uniform(215.0, 245.0)
        
        temp = round(random.uniform(38.3, 38.7), 2)
        hardness = 0.0
        pain = 0.0
        milk_vis = 0.0
        prev_mastitis = 0.0
        
    return {
        "cow_id": cow_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "Months_after_giving_birth": float(months),
        "Previous_Mastits_status": prev_mastitis,
        "IUFL": round(iu_base + random.uniform(-2.0, 2.0), 1),
        "EUFL": round(eu_fl, 1),
        "IUFR": round(iu_base + random.uniform(-2.0, 2.0), 1),
        "EUFR": round(eu_fr, 1),
        "IURL": round(iu_base + random.uniform(-2.0, 2.0), 1),
        "EURL": round(eu_rl, 1),
        "IURR": round(iu_base + random.uniform(-2.0, 2.0), 1),
        "EURR": round(eu_rr, 1),
        "Temperature": temp,
        "Hardness": hardness,
        "Pain": pain,
        "Milk_visibility": milk_vis
    }

def main():
    print(f"[*] Starting ESP32 IoT Edge Telemetry Simulator...")
    print(f"[*] Total Herd Size: {TOTAL_COWS} cattle (COW_01 to COW_{TOTAL_COWS:02d})")
    print(f"[*] Fixed High-Risk Cohort: {sorted(list(HIGH_RISK_COWS))}")
    print(f"[*] Target Ingestion API: {API_ENDPOINT}")
    
    cycle = 1
    while True:
        cycle_start = time.time()
        sent_in_cycle = 0
        
        for cow_num in range(1, TOTAL_COWS + 1):
            payload = generate_cow_telemetry(cow_num)
            try:
                resp = requests.post(API_ENDPOINT, json=payload, timeout=2.0)
                if resp.status_code == 200:
                    sent_in_cycle += 1
            except Exception as e:
                # Wait if server is booting
                pass
            time.sleep(0.04) # 40ms per cow
            
        elapsed = time.time() - cycle_start
        print(f"[Cycle {cycle}] Streamed {sent_in_cycle}/{TOTAL_COWS} cattle biometrics in {elapsed:.2f}s. Next cycle in 3s...")
        cycle += 1
        time.sleep(3.0)

if __name__ == "__main__":
    main()
