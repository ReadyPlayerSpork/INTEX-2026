import os
import re
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

class DatabaseClient:
    """
    Handles connections to the production PostgreSQL database and
    transforms data into the format expected by the ML pipelines.
    """

    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL")
        self._engine = None

    @property
    def engine(self):
        if self._engine is None and self.db_url:
            self._engine = create_engine(self.db_url)
        return self._engine

    def is_connected(self):
        """Check if production database is available."""
        if not self.engine:
            return False
        try:
            with self.engine.connect() as conn:
                return True
        except Exception:
            return False

    def to_snake_case(self, name: str) -> str:
        """Converts PascalCase or camelCase to snake_case."""
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()

    def fetch_data(self, table_name: str) -> pd.DataFrame:
        """Fetches a table from the DB or returns None if connection fails."""
        if not self.engine:
            print(f"[DB] No engine initialized for '{table_name}'")
            return None
        
        # Convert table name to snake_case for PostgreSQL
        db_table = self.to_snake_case(table_name)
        
        try:
            # Query without quotes to allow case-insensitive or default schema matching
            query = f"SELECT * FROM {db_table}"
            df = pd.read_sql(query, self.engine)
            if df.empty:
                print(f"[DB] Warning: Table '{db_table}' returned 0 rows.")
            return self.normalize_columns(df)
        except Exception as e:
            print(f"[DB] CRITICAL ERROR fetching table '{table_name}' (mapped to '{db_table}'): {e}")
            import traceback
            traceback.print_exc()
            return None


    def normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms snake_case DB columns to PascalCase for the ML pipelines.
        Example: resident_id -> ResidentId
        """
        def to_pascal(snake_str):
            if not snake_str:
                return snake_str
            # Handle standard snake_case conversion: user_id -> UserId, FirstName (from DB) -> FirstName
            components = snake_str.split("_")
            # Preserve existing case within components (e.g. FirstName stays FirstName)
            return "".join(word[0].upper() + word[1:] if word else "" for word in components)

        df.columns = [to_pascal(col) for col in df.columns]
        return df

# Singleton instance
db_client = DatabaseClient()
