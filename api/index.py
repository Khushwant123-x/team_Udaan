import sys
import os

file_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(file_dir)
cwd = os.getcwd()

for p in [cwd, file_dir, parent_dir]:
    if p and p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app
