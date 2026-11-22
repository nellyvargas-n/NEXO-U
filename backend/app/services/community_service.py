"""Solo publicaciones visibles en la consulta pública de comunidad."""
from sqlalchemy import select
from app.models.extended import CommunityPost


def visible_posts(db, limit: int = 30):
    return list(db.scalars(select(CommunityPost).where(CommunityPost.visible.is_(True))
        .order_by(CommunityPost.id.desc()).limit(min(max(limit,1),100))).all())
