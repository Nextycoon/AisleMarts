# Models package initialization
# Import existing models for backwards compatibility
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from models import UserDoc, ProductDoc, OrderDoc, CategoryDoc, OrderItem