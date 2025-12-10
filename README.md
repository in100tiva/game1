# 🎮 RPG Pixel Art - Exemplo de Animação de Personagem

Um exemplo didático de como criar animações de personagem frame-a-frame usando **Phaser 3** para jogos 2D estilo RPG pixel art.

## 📸 Funcionalidades

- **Movimento em 4 direções**: Cima, baixo, esquerda, direita
- **3 estados de animação**: Idle (parado), Walk (andar), Run (correr)
- **Spritesheet gerado programaticamente**: Entenda como os frames são organizados
- **Código comentado**: Explicações detalhadas de cada conceito

## 🚀 Como Executar

### Opção 1: Servidor Local (Recomendado)

```bash
# Com Python 3
python -m http.server 8000

# Ou com Node.js (npx)
npx serve .

# Ou com PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

### Opção 2: Live Server (VS Code)

1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito no `index.html`
3. Selecione "Open with Live Server"

## 🎮 Controles

| Tecla | Ação |
|-------|------|
| ↑ ↓ ← → ou W A S D | Movimento |
| SHIFT + Direção | Correr |

## 📁 Estrutura do Projeto

```
game1/
├── index.html              # Página principal
├── src/
│   ├── main.js             # Inicialização do Phaser
│   ├── GameScene.js        # Cena principal do jogo
│   ├── Player.js           # Classe do jogador com animações
│   └── SpriteGenerator.js  # Gerador de spritesheet
└── assets/
    ├── sprites/            # (Para sprites externos)
    └── maps/               # (Para mapas/tilemaps)
```

## 🎨 Sistema de Animação

### Estrutura do Spritesheet

O spritesheet é organizado em uma grade de **6 colunas x 12 linhas**:

```
Linha 0-3:   IDLE (4 frames cada)  → down, left, right, up
Linha 4-7:   WALK (6 frames cada)  → down, left, right, up
Linha 8-11:  RUN  (6 frames cada)  → down, left, right, up
```

### Frame Rates

| Animação | Frames | FPS | Descrição |
|----------|--------|-----|-----------|
| Idle | 4 | 4 | Respiração suave |
| Walk | 6 | 8 | Caminhada natural |
| Run | 6 | 12 | Corrida rápida |

### Criando Animações no Phaser 3

```javascript
// 1. Carregar o spritesheet
this.load.spritesheet('player', 'sprite.png', {
    frameWidth: 32,
    frameHeight: 32
});

// 2. Criar a animação
this.anims.create({
    key: 'walk-down',
    frames: this.anims.generateFrameNumbers('player', {
        start: 24,  // Frame inicial
        end: 29     // Frame final
    }),
    frameRate: 8,
    repeat: -1      // -1 = loop infinito
});

// 3. Executar a animação
sprite.play('walk-down');
```

## 📚 Conceitos Importantes

### 1. Spritesheet vs Sprite Atlas

- **Spritesheet**: Grade uniforme de frames do mesmo tamanho
- **Sprite Atlas**: Múltiplos sprites de tamanhos diferentes + JSON com coordenadas

### 2. Cálculo de Frames

Para um spritesheet de 6 colunas:
```
frame = (linha * colunas) + coluna
Exemplo: Linha 4, Coluna 2 = (4 * 6) + 2 = frame 26
```

### 3. Normalização de Velocidade Diagonal

```javascript
// Sem normalização: diagonal = √2 × velocidade (~1.41x mais rápido)
// Com normalização: diagonal = velocidade (correto)
sprite.body.velocity.normalize().scale(speed);
```

## 🔧 Customização

### Alterar Cores do Personagem

Edite as cores no arquivo `SpriteGenerator.js`:

```javascript
this.colors = {
    skin: '#f4c99b',        // Pele
    hair: '#4a3728',         // Cabelo
    shirt: '#3498db',        // Camisa
    pants: '#2c3e50',        // Calça
    shoes: '#8b4513',        // Sapatos
};
```

### Ajustar Velocidades

Edite as velocidades no arquivo `Player.js`:

```javascript
this.walkSpeed = 100;    // Pixels por segundo
this.runSpeed = 180;
```

## 📖 Recursos de Aprendizado

- [Documentação Phaser 3](https://photonstorm.github.io/phaser3-docs/)
- [Exemplos Phaser 3](https://phaser.io/examples)
- [Tutorial de Animações](https://phaser.io/tutorials/making-your-first-phaser-3-game)

## 📝 Licença

MIT - Sinta-se livre para usar, modificar e aprender!
