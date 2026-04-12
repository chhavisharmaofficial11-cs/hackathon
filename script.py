import sys
import json
import random
import time

def generate_data():
    # Simulate a small delay for computation
    time.sleep(0.1)
    
    # Generate mock array of length 12 for the graphs
    data = []
    for i in range(1, 13):
        data.append({
            "time": i,
            "value": max(0, 10 + random.uniform(-5, 5)),
            "value2": max(0, 5 + random.uniform(-3, 3)),
            "value3": max(0, 20 + random.uniform(-2, 2)),
        })
    
    # Generate mock system metrics
    system_metrics = {
        "cpu": max(5, min(100, 40 + random.uniform(-10, 10))),
        "memory": max(20, min(100, 60 + random.uniform(-5, 5))),
        "gpu": max(5, min(100, 30 + random.uniform(-8, 8))),
        "bandwidth": max(30, min(100, 80 + random.uniform(-5, 5))),
        "latency": max(5, min(200, 20 + random.uniform(-10, 10))),
    }

    output = {
        "data": data,
        "systemMetrics": system_metrics
    }
    
    # Output as JSON
    print(json.dumps(output))

if __name__ == "__main__":
    generate_data()
