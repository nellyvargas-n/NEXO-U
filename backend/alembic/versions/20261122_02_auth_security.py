"""Seguridad NEXO U v1.4. Primero estampa el baseline de v1.2 en Neon existente.

Revision ID: 20261122_02
Revises: 20261122_01
"""
from alembic import op
import sqlalchemy as sa
revision='20261122_02'
down_revision='20261122_01'
branch_labels=None
depends_on=None

def upgrade():
    op.create_table('auth_attempts',
        sa.Column('id',sa.BigInteger,primary_key=True,autoincrement=True),
        sa.Column('key_hash',sa.String(64),nullable=False),
        sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_index('ix_auth_attempts_key_time','auth_attempts',['key_hash','created_at'])
    op.create_table('password_reset_tokens',
        sa.Column('id',sa.BigInteger,primary_key=True,autoincrement=True),
        sa.Column('user_id',sa.BigInteger,sa.ForeignKey('app_users.id',ondelete='CASCADE'),nullable=False),
        sa.Column('token_hash',sa.String(64),nullable=False,unique=True),
        sa.Column('expires_at',sa.DateTime(timezone=True),nullable=False),
        sa.Column('used_at',sa.DateTime(timezone=True)),
        sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_index('ix_password_reset_tokens_user_id','password_reset_tokens',['user_id'])

def downgrade():
    op.drop_index('ix_password_reset_tokens_user_id',table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')
    op.drop_index('ix_auth_attempts_key_time',table_name='auth_attempts')
    op.drop_table('auth_attempts')
