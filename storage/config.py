from agno.db.sqlite import SqliteDb
from agno.memory import MemoryManager
from config import STORAGE_DB

# Shared database instance for all components
_shared_db = None


def get_db() -> SqliteDb:
    """Get shared database instance for all components."""
    global _shared_db
    if _shared_db is None:
        _shared_db = SqliteDb(db_file=STORAGE_DB)
    return _shared_db


def get_memory_manager() -> MemoryManager:
    """Get memory manager instance."""
    return MemoryManager(db=get_db())
