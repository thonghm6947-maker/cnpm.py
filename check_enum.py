import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'src'))

try:
    from infrastructure.models.careermate.job_post_model import JobStatus
    print(f"Loading JobStatus...")
    print(f"JobStatus.PENDING value: {JobStatus.PENDING.value}")
    print(f"JobStatus['PENDING'] value: {JobStatus['PENDING'].value}")
    
    print("Testing _missing_ behavior:")
    try:
        s = JobStatus('pending')
        print(f"JobStatus('pending') -> {s} (value={s.value})")
    except Exception as e:
        print(f"JobStatus('pending') FAILED: {e}")

    try:
        s = JobStatus('PENDING')
        print(f"JobStatus('PENDING') -> {s} (value={s.value})")
    except Exception as e:
        print(f"JobStatus('PENDING') FAILED: {e}")

except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
