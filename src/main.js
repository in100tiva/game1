/**
 * ============================================================================
 * MAIN.JS - Arquivo Principal de Inicialização do Phaser 3
 * ============================================================================
 *
 * Este é o ponto de entrada do jogo. Aqui configuramos o Phaser e
 * iniciamos o loop do jogo.
 *
 * CONFIGURAÇÃO DO PHASER:
 * -----------------------
 *
 * O objeto de configuração define:
 * - type: Renderizador (AUTO, CANVAS ou WEBGL)
 * - width/height: Dimensões do canvas do jogo
 * - parent: ID do elemento HTML que conterá o jogo
 * - physics: Sistema de física a ser usado
 * - scene: Cenas do jogo
 * - pixelArt: Otimizações para pixel art
 * - roundPixels: Arredonda posições para evitar blur
 */

// ============================================================================
// CONFIGURAÇÃO DO JOGO
// ============================================================================

const gameConfig = {
    // ========================================================================
    // TIPO DE RENDERIZAÇÃO
    // ========================================================================
    // Phaser.AUTO: Tenta usar WebGL, fallback para Canvas se não suportado
    // Phaser.WEBGL: Força WebGL (mais rápido, mais recursos)
    // Phaser.CANVAS: Força Canvas 2D (mais compatível)
    type: Phaser.AUTO,

    // ========================================================================
    // DIMENSÕES DO JOGO
    // ========================================================================
    width: 800,
    height: 600,

    // ========================================================================
    // CONTAINER HTML
    // ========================================================================
    // O jogo será inserido dentro deste elemento
    parent: 'game-container',

    // ========================================================================
    // CONFIGURAÇÃO DE FÍSICA
    // ========================================================================
    // O Phaser suporta vários sistemas de física:
    // - arcade: Simples e rápido (ideal para jogos 2D)
    // - matter: Físíca realista com corpos rígidos
    // - impact: Focado em plataformas
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // Sem gravidade (jogo top-down RPG)
            debug: false,        // Mude para true para ver hitboxes
        }
    },

    // ========================================================================
    // CENAS DO JOGO
    // ========================================================================
    // Lista de cenas que o jogo terá
    // A primeira cena da lista é iniciada automaticamente
    scene: [GameScene],

    // ========================================================================
    // CONFIGURAÇÕES DE PIXEL ART
    // ========================================================================
    // Essencial para jogos pixel art! Evita que o navegador
    // aplique antialiasing e borre os pixels.
    pixelArt: true,

    // Arredonda as posições para pixels inteiros
    // Evita "shimmer" ou pixels tremendo
    roundPixels: true,

    // ========================================================================
    // CONFIGURAÇÃO DE ESCALA
    // ========================================================================
    scale: {
        // Mode de escala (como o jogo se adapta à janela)
        // FIT: Mantém proporção, pode ter barras pretas
        // RESIZE: Redimensiona para preencher
        // NONE: Tamanho fixo
        mode: Phaser.Scale.FIT,

        // Centraliza o jogo no container
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    // ========================================================================
    // COR DE FUNDO
    // ========================================================================
    backgroundColor: '#1a1a2e',

    // ========================================================================
    // CONFIGURAÇÕES DE RENDERIZAÇÃO
    // ========================================================================
    render: {
        // Desativa antialiasing para manter pixels nítidos
        antialias: false,

        // Arredonda posições dos pixels
        pixelArt: true,

        // Desativa transparência do canvas (melhor performance)
        transparent: false,
    }
};

// ============================================================================
// INICIALIZAÇÃO DO JOGO
// ============================================================================

// Espera o DOM estar pronto antes de iniciar
window.addEventListener('DOMContentLoaded', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║     🎮  RPG PIXEL ART - EXEMPLO DE ANIMAÇÃO DE PERSONAGEM  🎮               ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Este exemplo demonstra como criar animações frame-a-frame no Phaser 3      ║
║                                                                              ║
║  CONTROLES:                                                                  ║
║    • Setas ou WASD - Mover personagem                                        ║
║    • SHIFT + Direção - Correr                                                ║
║                                                                              ║
║  ANIMAÇÕES:                                                                  ║
║    • IDLE: 4 frames a 4fps (efeito de respiração)                            ║
║    • WALK: 6 frames a 8fps (caminhada normal)                                ║
║    • RUN:  6 frames a 12fps (corrida rápida)                                 ║
║                                                                              ║
║  DICA: Abra o Console do navegador (F12) para ver logs de debug!            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);

    // Cria a instância do jogo
    const game = new Phaser.Game(gameConfig);

    // Disponibiliza globalmente para debug
    window.game = game;

    console.log('🚀 Jogo inicializado com sucesso!');
    console.log('💡 Use window.game para acessar a instância do Phaser no console');
});

/**
 * ============================================================================
 * EXPLICAÇÃO: COMO AS ANIMAÇÕES FUNCIONAM
 * ============================================================================
 *
 * 1. SPRITESHEET
 *    -------------
 *    Um spritesheet é uma imagem contendo todos os frames de animação
 *    organizados em uma grade. Exemplo:
 *
 *    ┌────┬────┬────┬────┬────┬────┐
 *    │ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │  ← Linha 0: Idle Down
 *    ├────┼────┼────┼────┼────┼────┤
 *    │ 6  │ 7  │ 8  │ 9  │ 10 │ 11 │  ← Linha 1: Idle Left
 *    ├────┼────┼────┼────┼────┼────┤
 *    │ ...                         │
 *    └─────────────────────────────┘
 *
 *    Cada célula é um frame de 32x32 pixels.
 *
 * 2. CARREGAMENTO
 *    -------------
 *    this.load.spritesheet('player', 'path/to/sprite.png', {
 *        frameWidth: 32,
 *        frameHeight: 32
 *    });
 *
 * 3. CRIAÇÃO DA ANIMAÇÃO
 *    --------------------
 *    this.anims.create({
 *        key: 'walk-down',           // Nome da animação
 *        frames: this.anims.generateFrameNumbers('player', {
 *            start: 24,              // Primeiro frame
 *            end: 29                 // Último frame
 *        }),
 *        frameRate: 8,               // Frames por segundo
 *        repeat: -1                  // -1 = loop infinito
 *    });
 *
 * 4. EXECUÇÃO DA ANIMAÇÃO
 *    ---------------------
 *    sprite.play('walk-down');       // Inicia a animação
 *    sprite.stop();                  // Para a animação
 *    sprite.anims.pause();           // Pausa mantendo o frame atual
 *
 * 5. TRANSIÇÕES
 *    -----------
 *    Para transições suaves, sempre verifique se a animação
 *    atual é diferente da nova antes de trocar:
 *
 *    if (sprite.anims.currentAnim?.key !== 'walk-down') {
 *        sprite.play('walk-down');
 *    }
 *
 * ============================================================================
 */
