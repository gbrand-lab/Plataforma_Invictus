"""Cria (ou atualiza a senha d) o usuário administrador inicial.

Uso:
    python -m scripts.create_admin --nome "Nome" --email admin@invictus.com --senha "senha-forte"
"""
import argparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.auth import hash_senha
from app.database import Base, SessionLocal, engine
from app.models import Usuario


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--nome", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--senha", required=True)
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.email == args.email).first()
        if usuario:
            usuario.senha_hash = hash_senha(args.senha)
            usuario.nome = args.nome
            print(f"Senha atualizada para {args.email}")
        else:
            usuario = Usuario(nome=args.nome, email=args.email, senha_hash=hash_senha(args.senha), role="admin")
            db.add(usuario)
            print(f"Admin criado: {args.email}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
