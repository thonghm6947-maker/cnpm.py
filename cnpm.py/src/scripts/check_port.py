import socket

def check_port(host, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.settimeout(1)
        result = s.connect_ex((host, port))
        if result == 0:
            print(f"Port {port} is OPEN")
        else:
            print(f"Port {port} is CLOSED (Error code: {result})")
    except Exception as e:
        print(f"Error checking port: {e}")
    finally:
        s.close()

if __name__ == "__main__":
    check_port('localhost', 9999)
