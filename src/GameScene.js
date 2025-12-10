/**
 * ============================================================================
 * GAME SCENE - Cena Principal do Jogo
 * ============================================================================
 *
 * Esta é a cena principal onde o jogo acontece.
 *
 * CICLO DE VIDA DE UMA CENA PHASER:
 * ---------------------------------
 *
 * 1. init()      - Inicialização (recebe dados de outras cenas)
 * 2. preload()   - Carrega assets (imagens, sons, spritesheets)
 * 3. create()    - Cria objetos do jogo (sprites, textos, física)
 * 4. update()    - Loop principal (chamado ~60x por segundo)
 *
 * CONCEITOS IMPORTANTES:
 * ----------------------
 *
 * SPRITESHEET vs SPRITE:
 * - Sprite: Uma única imagem
 * - Spritesheet: Várias imagens em uma única textura (otimizado)
 *
 * FRAME RATE vs GAME LOOP:
 * - O update() roda a ~60fps
 * - A animação tem seu próprio frameRate (ex: 8fps para walk)
 * - Isso significa que o jogo atualiza ~60x/seg, mas a animação
 *   troca de frame apenas 8x/seg
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Referências que serão criadas
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.shiftKey = null;
        this.debugText = null;

        // Configuração do spritesheet (carregada do editor ou padrão)
        this.spriteConfig = null;
        this.useCustomSprite = false;
    }

    /**
     * ========================================================================
     * PRELOAD - Carregamento de Assets
     * ========================================================================
     *
     * Aqui carregamos todos os assets necessários antes do jogo começar.
     *
     * TIPOS DE CARREGAMENTO:
     * ----------------------
     * - this.load.image('key', 'path')         - Imagem simples
     * - this.load.spritesheet('key', 'path', { - Spritesheet
     *     frameWidth: 32,
     *     frameHeight: 32
     *   })
     * - this.load.audio('key', 'path')         - Áudio
     * - this.load.tilemapTiledJSON('key', 'path') - Tilemap
     */
    preload() {
        // ====================================================================
        // CARREGAMENTO DE TILES PARA O CENÁRIO
        // ====================================================================
        this.generateGroundTiles();

        // ====================================================================
        // VERIFICAR SPRITESHEET CUSTOMIZADO
        // ====================================================================
        // Verifica se existe um spritesheet salvo no editor
        // Se existir, usa ele; senão, gera um programaticamente

        this.loadSpriteConfig();

        if (this.useCustomSprite) {
            this.loadCustomSpritesheet();
        } else {
            this.generatePlayerSpritesheet();
        }
    }

    /**
     * Carrega a configuração do spritesheet do localStorage
     */
    loadSpriteConfig() {
        try {
            const savedConfig = localStorage.getItem('spritesheet_config');
            const savedImage = localStorage.getItem('spritesheet_image');

            if (savedConfig && savedImage) {
                this.spriteConfig = JSON.parse(savedConfig);
                this.useCustomSprite = true;
                console.log('📦 Configuração customizada encontrada!');
            } else {
                // Usa configuração padrão
                this.spriteConfig = {
                    frameWidth: 32,
                    frameHeight: 32,
                    animations: [
                        { action: 'idle', direction: 'down', row: 0, startFrame: 0, frameCount: 4, frameRate: 4 },
                        { action: 'idle', direction: 'left', row: 1, startFrame: 0, frameCount: 4, frameRate: 4 },
                        { action: 'idle', direction: 'right', row: 2, startFrame: 0, frameCount: 4, frameRate: 4 },
                        { action: 'idle', direction: 'up', row: 3, startFrame: 0, frameCount: 4, frameRate: 4 },
                        { action: 'walk', direction: 'down', row: 4, startFrame: 0, frameCount: 6, frameRate: 8 },
                        { action: 'walk', direction: 'left', row: 5, startFrame: 0, frameCount: 6, frameRate: 8 },
                        { action: 'walk', direction: 'right', row: 6, startFrame: 0, frameCount: 6, frameRate: 8 },
                        { action: 'walk', direction: 'up', row: 7, startFrame: 0, frameCount: 6, frameRate: 8 },
                        { action: 'run', direction: 'down', row: 8, startFrame: 0, frameCount: 6, frameRate: 12 },
                        { action: 'run', direction: 'left', row: 9, startFrame: 0, frameCount: 6, frameRate: 12 },
                        { action: 'run', direction: 'right', row: 10, startFrame: 0, frameCount: 6, frameRate: 12 },
                        { action: 'run', direction: 'up', row: 11, startFrame: 0, frameCount: 6, frameRate: 12 },
                    ]
                };
                this.useCustomSprite = false;
                console.log('🎨 Usando spritesheet gerado');
            }
        } catch (e) {
            console.error('Erro ao carregar configuração:', e);
            this.useCustomSprite = false;
        }
    }

    /**
     * Carrega o spritesheet customizado do localStorage
     */
    loadCustomSpritesheet() {
        const savedImage = localStorage.getItem('spritesheet_image');

        // Cria uma imagem a partir do data URL salvo
        const img = new Image();
        img.src = savedImage;

        // Quando a imagem carregar, adiciona ao Phaser
        img.onload = () => {
            // Cria um canvas temporário para a imagem
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Adiciona ao Phaser como spritesheet
            this.textures.addSpriteSheet('player', canvas, {
                frameWidth: this.spriteConfig.frameWidth,
                frameHeight: this.spriteConfig.frameHeight
            });

            console.log(`✅ Spritesheet customizado carregado: ${img.width}x${img.height}`);
        };
    }

    /**
     * Gera o spritesheet do personagem usando canvas
     *
     * NOTA: Este método usa textures.addSpriteSheet() que aceita
     * um canvas diretamente, evitando problemas com data URIs
     */
    generatePlayerSpritesheet() {
        const generator = new SpriteGenerator();

        // Cria o canvas com o spritesheet
        const canvas = document.createElement('canvas');
        canvas.width = 32 * 6;   // 6 frames por linha
        canvas.height = 32 * 12; // 12 linhas de animação
        const ctx = canvas.getContext('2d');

        // Gera cada frame do spritesheet
        this.generateAllFrames(ctx, generator);

        // ====================================================================
        // ADICIONANDO SPRITESHEET AO PHASER
        // ====================================================================
        // textures.addSpriteSheet() permite criar um spritesheet
        // diretamente de um canvas HTML5
        //
        // Parâmetros:
        // - 'player': key/nome da textura
        // - canvas: elemento canvas com a imagem
        // - { frameWidth, frameHeight }: dimensões de cada frame

        this.textures.addSpriteSheet('player', canvas, {
            frameWidth: 32,
            frameHeight: 32
        });

        console.log('✅ Spritesheet do personagem gerado com sucesso!');
    }

    /**
     * Gera todos os frames de animação no canvas
     */
    generateAllFrames(ctx, generator) {
        const frameWidth = 32;
        const frameHeight = 32;
        const framesPerRow = 6;

        // Configuração das animações
        const animations = [
            // IDLE (4 frames cada, linhas 0-3)
            { row: 0, direction: 'down', action: 'idle', frames: 4 },
            { row: 1, direction: 'left', action: 'idle', frames: 4 },
            { row: 2, direction: 'right', action: 'idle', frames: 4 },
            { row: 3, direction: 'up', action: 'idle', frames: 4 },
            // WALK (6 frames cada, linhas 4-7)
            { row: 4, direction: 'down', action: 'walk', frames: 6 },
            { row: 5, direction: 'left', action: 'walk', frames: 6 },
            { row: 6, direction: 'right', action: 'walk', frames: 6 },
            { row: 7, direction: 'up', action: 'walk', frames: 6 },
            // RUN (6 frames cada, linhas 8-11)
            { row: 8, direction: 'down', action: 'run', frames: 6 },
            { row: 9, direction: 'left', action: 'run', frames: 6 },
            { row: 10, direction: 'right', action: 'run', frames: 6 },
            { row: 11, direction: 'up', action: 'run', frames: 6 },
        ];

        // Gera cada frame
        animations.forEach(anim => {
            for (let frame = 0; frame < anim.frames; frame++) {
                const x = frame * frameWidth;
                const y = anim.row * frameHeight;

                // Calcula offset de animação
                let offsetY = 0;
                if (anim.action === 'idle') {
                    offsetY = (frame === 1 || frame === 3) ? -1 : 0;
                } else if (anim.action === 'walk') {
                    offsetY = (frame === 0 || frame === 3) ? 0 : -1;
                } else if (anim.action === 'run') {
                    offsetY = (frame === 0 || frame === 3) ? 0 : -2;
                }

                generator.drawCharacter(ctx, x, y, anim.direction, anim.action, frame, offsetY);
            }
        });
    }

    /**
     * Gera tiles simples para o chão do cenário
     */
    generateGroundTiles() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Tile de grama
        ctx.fillStyle = '#4a7c59';  // Verde escuro
        ctx.fillRect(0, 0, 32, 32);

        // Adiciona variação de cor (textura de grama)
        ctx.fillStyle = '#5a8c69';  // Verde mais claro
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 30;
            const y = Math.random() * 30;
            ctx.fillRect(x, y, 2, 2);
        }

        // Algumas folhinhas
        ctx.fillStyle = '#3a6c49';  // Verde mais escuro
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 28;
            const y = Math.random() * 28;
            ctx.fillRect(x, y, 3, 1);
        }

        this.textures.addCanvas('grass', canvas);
    }

    /**
     * ========================================================================
     * CREATE - Criação dos Objetos do Jogo
     * ========================================================================
     *
     * Aqui criamos todos os objetos que aparecerão no jogo.
     */
    create() {
        console.log('🎮 GameScene iniciada!');

        // ====================================================================
        // CONFIGURAÇÃO DO MUNDO
        // ====================================================================
        this.physics.world.setBounds(0, 0, 800, 600);

        // ====================================================================
        // CRIAÇÃO DO CENÁRIO
        // ====================================================================
        this.createBackground();

        // ====================================================================
        // CRIAÇÃO DO JOGADOR
        // ====================================================================
        // O jogador é criado no centro da tela
        // Passa a configuração do spritesheet para criar as animações corretas
        this.player = new Player(this, 400, 300, this.spriteConfig);

        // ====================================================================
        // CONFIGURAÇÃO DOS CONTROLES
        // ====================================================================
        this.setupControls();

        // ====================================================================
        // INTERFACE DE DEBUG
        // ====================================================================
        this.createDebugUI();

        // ====================================================================
        // INSTRUÇÕES NA TELA
        // ====================================================================
        this.createInstructions();

        console.log('✅ Todos os elementos criados!');
    }

    /**
     * Cria o fundo do cenário
     */
    createBackground() {
        // Preenche o fundo com tiles de grama
        for (let x = 0; x < 800; x += 32) {
            for (let y = 0; y < 600; y += 32) {
                const tile = this.add.image(x, y, 'grass');
                tile.setOrigin(0);

                // Adiciona leve variação de tom para quebrar a repetição
                tile.setTint(Phaser.Display.Color.GetColor(
                    70 + Math.random() * 20,
                    130 + Math.random() * 20,
                    90 + Math.random() * 20
                ));
            }
        }

        // Adiciona algumas decorações simples (círculos representando arbustos)
        this.createDecorations();
    }

    /**
     * Adiciona decorações ao cenário
     */
    createDecorations() {
        const graphics = this.add.graphics();

        // Cria alguns "arbustos" decorativos
        const bushPositions = [
            { x: 100, y: 150 },
            { x: 700, y: 100 },
            { x: 650, y: 450 },
            { x: 80, y: 500 },
            { x: 200, y: 350 },
            { x: 550, y: 250 },
        ];

        bushPositions.forEach(pos => {
            // Sombra
            graphics.fillStyle(0x2a5c39, 0.5);
            graphics.fillCircle(pos.x + 2, pos.y + 2, 15);

            // Arbusto
            graphics.fillStyle(0x3d8c4f, 1);
            graphics.fillCircle(pos.x, pos.y, 15);

            // Destaque
            graphics.fillStyle(0x5aac6f, 1);
            graphics.fillCircle(pos.x - 3, pos.y - 3, 6);
        });

        // Cria alguns caminhos de terra
        graphics.fillStyle(0x8b7355, 1);
        graphics.fillRect(350, 0, 100, 600);  // Caminho vertical
        graphics.fillRect(0, 280, 800, 40);   // Caminho horizontal

        // Textura do caminho
        graphics.fillStyle(0x9b8365, 1);
        for (let i = 0; i < 50; i++) {
            graphics.fillRect(
                350 + Math.random() * 100,
                Math.random() * 600,
                3, 3
            );
            graphics.fillRect(
                Math.random() * 800,
                280 + Math.random() * 40,
                3, 3
            );
        }
    }

    /**
     * ========================================================================
     * CONFIGURAÇÃO DOS CONTROLES
     * ========================================================================
     *
     * O Phaser oferece várias formas de capturar input do teclado:
     *
     * 1. createCursorKeys() - Cria objeto com setas + espaço + shift
     * 2. addKey() - Adiciona uma tecla específica
     * 3. addKeys() - Adiciona múltiplas teclas de uma vez
     */
    setupControls() {
        // Teclas direcionais (setas)
        this.cursors = this.input.keyboard.createCursorKeys();

        // Teclas WASD
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Tecla Shift (para correr)
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        console.log('🎮 Controles configurados: Setas/WASD + Shift para correr');
    }

    /**
     * Cria a interface de debug que mostra informações do personagem
     */
    createDebugUI() {
        // Fundo semi-transparente para o debug
        const debugBg = this.add.rectangle(10, 10, 200, 100, 0x000000, 0.7);
        debugBg.setOrigin(0);

        // Texto de debug
        this.debugText = this.add.text(15, 15, '', {
            fontSize: '12px',
            fontFamily: 'Courier New',
            color: '#4ecca3',
            lineSpacing: 4
        });

        // Atualiza o debug a cada 100ms para não sobrecarregar
        this.time.addEvent({
            delay: 100,
            callback: this.updateDebugText,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Atualiza o texto de debug
     */
    updateDebugText() {
        if (!this.player || !this.debugText) return;

        const info = this.player.getInfo();
        this.debugText.setText([
            `Estado: ${info.state}`,
            `Direção: ${info.direction}`,
            `Animação: ${info.currentAnimation}`,
            `Posição: (${Math.round(info.position.x)}, ${Math.round(info.position.y)})`,
            `Velocidade: (${Math.round(info.velocity.x)}, ${Math.round(info.velocity.y)})`
        ]);
    }

    /**
     * Cria instruções na tela
     */
    createInstructions() {
        const style = {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        };

        this.add.text(790, 10, 'SHIFT = Correr', style).setOrigin(1, 0);
    }

    /**
     * ========================================================================
     * UPDATE - Loop Principal do Jogo
     * ========================================================================
     *
     * Este método é chamado a cada frame (~60 vezes por segundo).
     * Aqui processamos inputs, atualizamos posições e verificamos colisões.
     *
     * @param {number} time - Tempo total desde o início do jogo
     * @param {number} delta - Tempo desde o último frame (em ms)
     */
    update(time, delta) {
        // Atualiza o jogador (processa movimento e animações)
        if (this.player) {
            this.player.update(this.cursors, this.wasd, this.shiftKey);
        }
    }
}

// Exporta a classe para uso global
window.GameScene = GameScene;
