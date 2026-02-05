import marshal
import dis
import struct
import time
import sys
import os
import importlib.util

def read_pyc(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    print(f"--- Analyzing {file_path} ---")

    with open(file_path, 'rb') as f:
        # Read the header
        # The size of the header varies by Python version.
        # Python 3.7+ uses 16 bytes.
        magic = f.read(4)
        bit_field = f.read(4)
        timestamp_bytes = f.read(4)
        size_bytes = f.read(4)

        try:
            timestamp = struct.unpack('<I', timestamp_bytes)[0]
            timestamp_str = time.ctime(timestamp)
            print(f"Timestamp: {timestamp_str}")
        except:
            print("Could not parse timestamp.")

        try:
            file_size = struct.unpack('<I', size_bytes)[0]
            print(f"Source Size: {file_size} bytes")
        except:
            print("Could not parse source size.")

        print(f"Magic Number: {magic.hex()}")

        # Unmarshal the code object
        try:
            code_obj = marshal.load(f)
            print("\n--- Disassembly ---")
            dis.dis(code_obj)
        except Exception as e:
            print(f"Error unmarshalling code object: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_file = sys.argv[1]
        read_pyc(target_file)
    else:
        print("Usage: python read_pyc.py <path_to_pyc_file>")
        # Example: Try to find a pyc file in the current directory to demo
        print("\nPlease provide a path to a .pyc file as an argument.")
