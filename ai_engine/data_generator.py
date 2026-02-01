import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Configuration
NUM_DAYS = 100  # Generate data for the last 100 days
AVG_STUDENTS = 1500

def generate_mess_data():
    data = []
    start_date = datetime.now() - timedelta(days=NUM_DAYS)

    print("🍳 Cooking up fake data...")

    for i in range(NUM_DAYS):
        current_date = start_date + timedelta(days=i)
        day_of_week = current_date.weekday() # 0=Mon, 6=Sun
        is_weekend = day_of_week >= 5
        
        # Simulation Logic:
        # 1. More people skip mess on weekends (to eat outside)
        # 2. Special dinner (Wednesday) has higher attendance
        
        attendance_noise = random.randint(-100, 100)
        base_attendance = AVG_STUDENTS
        
        if is_weekend:
            base_attendance -= 300 # Weekend dip
        elif day_of_week == 2: # Wednesday Special
            base_attendance += 100
            
        final_attendance = base_attendance + attendance_noise
        
        # Waste Logic:
        # If attendance is unexpectedly low, waste is high.
        prepared_food_for = AVG_STUDENTS 
        waste_kg = max(0, (prepared_food_for - final_attendance) * 0.4 + random.uniform(10, 50))

        data.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "day_of_week": day_of_week,
            "is_weekend": 1 if is_weekend else 0,
            "event_type": "Special" if day_of_week == 2 else "Normal",
            "attendance": int(final_attendance),
            "waste_kg": round(waste_kg, 2)
        })

    df = pd.DataFrame(data)
    df.to_csv("mess_data.csv", index=False)
    print(f"✅ Generated {NUM_DAYS} days of data. Saved to 'mess_data.csv'.")
    print(df.head())

if __name__ == "__main__":
    generate_mess_data()