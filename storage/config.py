from agno.storage.sqlite import SqliteStorage
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.memory.v2.memory import Memory
from config import STORAGE_DB

# Storage and Memory
memory_db = SqliteMemoryDb(table_name="memory", db_file=STORAGE_DB)

def get_storage(table_name: str) -> SqliteStorage:
    """Get storage instance for a specific table."""
    return SqliteStorage(table_name=table_name, db_file=STORAGE_DB)

def get_memory() -> Memory:
    """Get memory instance."""
    return Memory(db=memory_db)