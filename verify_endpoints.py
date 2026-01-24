import urllib.request

paths = [
    'http://localhost:9999/',
    'http://localhost:9999/docs',
    'http://localhost:9999/swagger.json',
    'http://localhost:9999/api/auth/check'
]

for path in paths:
    try:
        with urllib.request.urlopen(path) as response:
            print(f"Path: {path} - Status: {response.status}")
            print(f"  Content Type: {response.headers.get('Content-Type')}")
    except urllib.error.HTTPError as e:
        print(f"Path: {path} - Status: {e.code}")
    except Exception as e:
        print(f"Path: {path} - Error: {e}")
