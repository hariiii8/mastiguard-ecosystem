"""
Augments the clinical mastitis dataset with 7 realistic synthetic behavioral/
rumination features derived from peer-reviewed dairy science correlations.

Features added:
  - Rumination_Time_min   (minutes/day)
  - Eating_Time_min       (minutes/day)
  - Lying_Time_hr         (hours/day)
  - Steps_Per_Day
  - SCC_K_cells_per_mL    (somatic cell count, thousands)
  - Milk_Conductivity_mS  (milli-Siemens/cm)
  - Milk_Yield_L          (litres/day)
"""

import numpy as np
import pandas as pd

SEED = 42
rng = np.random.default_rng(SEED)

DATA_IN  = "data/clinical_mastitis_cows_version1.csv"
DATA_OUT = "data/clinical_mastitis_cows_version1.csv"   # overwrite in-place

df = pd.read_csv(DATA_IN)
n  = len(df)
label = df["class1"].values          # 0 = healthy, 1 = mastitis

# ── helper ────────────────────────────────────────────────────────────────────
def clip_round(arr, lo, hi, decimals=1):
    return np.round(np.clip(arr, lo, hi), decimals)

# ── 1. Rumination_Time_min ────────────────────────────────────────────────────
# Healthy: ~520 min (Schirmann et al., 2012)
# Mastitis: drops to ~290 min (Kougioumtzis et al., 2014)
base_rum  = np.where(label == 0, 520.0, 295.0)
noise_rum = rng.normal(0, 40, n)
df["Rumination_Time_min"] = clip_round(base_rum + noise_rum, 80, 660)

# ── 2. Eating_Time_min ────────────────────────────────────────────────────────
# Healthy: ~380 min; Mastitis: ~255 min
base_eat  = np.where(label == 0, 380.0, 255.0)
# Correlated with rumination (r ≈ 0.6)
noise_eat = 0.6 * noise_rum + 0.4 * rng.normal(0, 45, n)
df["Eating_Time_min"] = clip_round(base_eat + noise_eat, 60, 540)

# ── 3. Lying_Time_hr ─────────────────────────────────────────────────────────
# Healthy: ~11.5 h; Mastitis: 13.5 h (pain-induced recumbency)
base_lie  = np.where(label == 0, 11.5, 13.5)
noise_lie = rng.normal(0, 1.2, n)
df["Lying_Time_hr"] = clip_round(base_lie + noise_lie, 6, 20)

# ── 4. Steps_Per_Day ─────────────────────────────────────────────────────────
# Healthy: ~3 000; Mastitis: ~1 300 (reduced mobility)
base_stp  = np.where(label == 0, 3000.0, 1300.0)
noise_stp = rng.normal(0, 400, n)
df["Steps_Per_Day"] = np.round(np.clip(base_stp + noise_stp, 200, 6000)).astype(int)

# ── 5. SCC_K_cells_per_mL ────────────────────────────────────────────────────
# Log-normal; healthy log10(SCC) ≈ 1.9 (≈80K), mastitis ≈ 3.3 (≈2 000K)
log_scc_mu    = np.where(label == 0, 1.90, 3.30)
log_scc_sigma = np.where(label == 0, 0.30, 0.35)
log_scc_noise = rng.normal(0, 1, n)
log_scc       = log_scc_mu + log_scc_sigma * log_scc_noise
df["SCC_K_cells_per_mL"] = clip_round(10 ** log_scc, 5, 9999, decimals=1)

# ── 6. Milk_Conductivity_mS ──────────────────────────────────────────────────
# Healthy: 3.5–5.5 mS/cm; Mastitis: 6.5–11.5 mS/cm (ionic leakage)
base_cond  = np.where(label == 0, 4.5, 8.0)
noise_cond = rng.normal(0, 0.8, n)
df["Milk_Conductivity_mS"] = clip_round(base_cond + noise_cond, 2.5, 14.0)

# ── 7. Milk_Yield_L ──────────────────────────────────────────────────────────
# Breed-specific baselines; mastitis suppresses yield by 20-55 %
breed_base = {
    "HF": 28.0, "Jersey": 20.0, "Sahiwal": 14.0,
    "Gir": 12.0, "Murrah": 10.0, "Red Sindhi": 11.0
}
base_yield = df["Breed"].map(breed_base).fillna(18.0).values.astype(float)
# Mastitis suppression: 20-55 % drop
suppression   = np.where(label == 0,
                          rng.uniform(0.95, 1.05, n),
                          rng.uniform(0.45, 0.80, n))
noise_yield   = rng.normal(0, 1.2, n)
df["Milk_Yield_L"] = clip_round(base_yield * suppression + noise_yield, 1.0, 55.0)

# ── Save ─────────────────────────────────────────────────────────────────────
df.to_csv(DATA_OUT, index=False)

print(f"Augmentation complete -> {DATA_OUT}")
print(f"Shape: {df.shape}")
print("\nNew columns added:")
new_cols = ["Rumination_Time_min","Eating_Time_min","Lying_Time_hr",
            "Steps_Per_Day","SCC_K_cells_per_mL","Milk_Conductivity_mS","Milk_Yield_L"]
for c in new_cols:
    h = df.loc[df.class1==0, c]
    m = df.loc[df.class1==1, c]
    print(f"  {c:30s}  healthy={h.mean():.1f}±{h.std():.1f}  mastitis={m.mean():.1f}±{m.std():.1f}")
