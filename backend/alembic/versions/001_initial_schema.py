"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-24 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Initial tables created by Base.metadata.create_all() or Alembic
    pass

def downgrade() -> None:
    pass
