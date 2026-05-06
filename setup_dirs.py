import os

# Create directory structure
dirs = [
    'templates',
    'static',
    'static/css',
    'static/js'
]

for dir_path in dirs:
    full_path = os.path.join(os.getcwd(), dir_path)
    os.makedirs(full_path, exist_ok=True)
    print(f"Created: {full_path}")

print("Project structure created successfully!")
