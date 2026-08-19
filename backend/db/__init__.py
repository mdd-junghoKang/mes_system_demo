import os
import sys

from .config import DB_USER, PASSWORD, HOST, PORT, DB_NAME
from .models.base import Base
from .interface import Interface, AsyncSession

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

db = Interface()
