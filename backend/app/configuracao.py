from sqlalchemy.orm import Session

from .models import ConfiguracaoApp


def obter_configuracao(db: Session) -> ConfiguracaoApp:
    """Configuração é uma linha única (id=1) criada sob demanda."""
    config = db.query(ConfiguracaoApp).filter(ConfiguracaoApp.id == 1).first()
    if not config:
        config = ConfiguracaoApp(id=1, requer_aprovacao_imovel=False)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config
