/**
 * ============================================================================
 * PLAYER CLASS - Classe do Jogador com Sistema de Animação
 * ============================================================================
 *
 * Esta classe gerencia o personagem jogável, incluindo:
 * - Movimento em 4 direções
 * - Troca entre estados (idle, walk, run)
 * - Sistema de animação frame-a-frame
 * - Física básica de movimento
 *
 * CONCEITOS IMPORTANTES:
 * ----------------------
 *
 * 1. SPRITESHEET:
 *    Um spritesheet é uma imagem única contendo todos os frames de animação.
 *    Cada frame tem tamanho fixo (32x32 pixels neste caso).
 *
 * 2. ANIMAÇÕES NO PHASER:
 *    - create: Define a animação com key, frames, frameRate e repeat
 *    - play: Inicia uma animação específica
 *    - anims.isPlaying: Verifica se uma animação está rodando
 *
 * 3. ESTADOS DO PERSONAGEM:
 *    - idle: Parado (animação sutil de respiração)
 *    - walk: Andando (velocidade normal)
 *    - run: Correndo (velocidade aumentada, animação mais rápida)
 *
 * 4. DIREÇÕES:
 *    - down: Olhando/movendo para baixo (linha 0/4/8 do spritesheet)
 *    - left: Olhando/movendo para esquerda (linha 1/5/9)
 *    - right: Olhando/movendo para direita (linha 2/6/10)
 *    - up: Olhando/movendo para cima (linha 3/7/11)
 */

class Player {
    /**
     * Construtor do Player
     * @param {Phaser.Scene} scene - Referência à cena do Phaser
     * @param {number} x - Posição inicial X
     * @param {number} y - Posição inicial Y
     */
    constructor(scene, x, y) {
        this.scene = scene;

        // ====================================================================
        // CONFIGURAÇÕES DE MOVIMENTO
        // ====================================================================
        this.walkSpeed = 100;    // Velocidade ao andar (pixels por segundo)
        this.runSpeed = 180;     // Velocidade ao correr

        // ====================================================================
        // ESTADO ATUAL DO PERSONAGEM
        // ====================================================================
        this.currentState = 'idle';      // Estado atual: idle, walk, run
        this.currentDirection = 'down';   // Direção atual: up, down, left, right
        this.isMoving = false;            // Flag de movimento

        // ====================================================================
        // CRIAÇÃO DO SPRITE
        // ====================================================================
        // O sprite é criado usando a textura 'player' que será carregada na cena
        this.sprite = scene.physics.add.sprite(x, y, 'player');

        // Configura o sprite
        this.sprite.setScale(2);  // Escala 2x para melhor visualização do pixel art

        // Configura a física do corpo
        this.sprite.body.setSize(16, 16);      // Hitbox menor que o sprite
        this.sprite.body.setOffset(8, 16);     // Centraliza a hitbox nos pés

        // Evita que o personagem saia dos limites do mundo
        this.sprite.setCollideWorldBounds(true);

        // ====================================================================
        // CRIAÇÃO DAS ANIMAÇÕES
        // ====================================================================
        this.createAnimations();

        // Inicia com a animação idle olhando para baixo
        this.sprite.play('idle-down');
    }

    /**
     * ========================================================================
     * CRIAÇÃO DAS ANIMAÇÕES
     * ========================================================================
     *
     * Este método cria todas as animações do personagem.
     *
     * ANATOMIA DE UMA ANIMAÇÃO PHASER:
     * --------------------------------
     *
     * scene.anims.create({
     *     key: 'nome-da-animacao',        // Identificador único
     *     frames: scene.anims.generateFrameNumbers('textura', {
     *         start: 0,                    // Frame inicial no spritesheet
     *         end: 5                       // Frame final no spritesheet
     *     }),
     *     frameRate: 10,                   // Frames por segundo
     *     repeat: -1                       // -1 = loop infinito, 0 = uma vez
     * });
     *
     * CÁLCULO DOS FRAMES:
     * -------------------
     * Para um spritesheet de 6 colunas:
     * - Linha 0: frames 0-5
     * - Linha 1: frames 6-11
     * - Linha 2: frames 12-17
     * - etc.
     *
     * Fórmula: frameInicial = linha * framesPerRow
     */
    createAnimations() {
        const framesPerRow = 6;  // Número de frames por linha no spritesheet

        // ====================================================================
        // ANIMAÇÕES IDLE (PARADO)
        // ====================================================================
        // Frame rate baixo (4 fps) para animação suave de respiração
        // Usa apenas 4 frames (0-3) de cada linha

        const idleConfig = {
            frameRate: 4,
            repeat: -1
        };

        // Idle Down (Linha 0)
        this.createAnimation('idle-down', 0, 3, idleConfig);

        // Idle Left (Linha 1)
        this.createAnimation('idle-left', 6, 9, idleConfig);

        // Idle Right (Linha 2)
        this.createAnimation('idle-right', 12, 15, idleConfig);

        // Idle Up (Linha 3)
        this.createAnimation('idle-up', 18, 21, idleConfig);

        // ====================================================================
        // ANIMAÇÕES WALK (ANDAR)
        // ====================================================================
        // Frame rate médio (8 fps) para movimento de caminhada
        // Usa 6 frames de cada linha

        const walkConfig = {
            frameRate: 8,
            repeat: -1
        };

        // Walk Down (Linha 4)
        this.createAnimation('walk-down', 24, 29, walkConfig);

        // Walk Left (Linha 5)
        this.createAnimation('walk-left', 30, 35, walkConfig);

        // Walk Right (Linha 6)
        this.createAnimation('walk-right', 36, 41, walkConfig);

        // Walk Up (Linha 7)
        this.createAnimation('walk-up', 42, 47, walkConfig);

        // ====================================================================
        // ANIMAÇÕES RUN (CORRER)
        // ====================================================================
        // Frame rate alto (12 fps) para movimento rápido de corrida
        // Usa 6 frames de cada linha

        const runConfig = {
            frameRate: 12,
            repeat: -1
        };

        // Run Down (Linha 8)
        this.createAnimation('run-down', 48, 53, runConfig);

        // Run Left (Linha 9)
        this.createAnimation('run-left', 54, 59, runConfig);

        // Run Right (Linha 10)
        this.createAnimation('run-right', 60, 65, runConfig);

        // Run Up (Linha 11)
        this.createAnimation('run-up', 66, 71, runConfig);

        console.log('✅ Todas as animações foram criadas com sucesso!');
        this.logAnimationInfo();
    }

    /**
     * Helper para criar uma animação
     */
    createAnimation(key, startFrame, endFrame, config) {
        // Verifica se a animação já existe (evita erros em recarga de cena)
        if (this.scene.anims.exists(key)) {
            return;
        }

        this.scene.anims.create({
            key: key,
            frames: this.scene.anims.generateFrameNumbers('player', {
                start: startFrame,
                end: endFrame
            }),
            frameRate: config.frameRate,
            repeat: config.repeat
        });
    }

    /**
     * Exibe informações sobre as animações no console (para debug/aprendizado)
     */
    logAnimationInfo() {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║               MAPA DE ANIMAÇÕES DO PERSONAGEM                  ║
╠════════════════════════════════════════════════════════════════╣
║  IDLE (4 frames, 4 fps):                                       ║
║    idle-down  : frames 0-3   (linha 0)                         ║
║    idle-left  : frames 6-9   (linha 1)                         ║
║    idle-right : frames 12-15 (linha 2)                         ║
║    idle-up    : frames 18-21 (linha 3)                         ║
╠════════════════════════════════════════════════════════════════╣
║  WALK (6 frames, 8 fps):                                       ║
║    walk-down  : frames 24-29 (linha 4)                         ║
║    walk-left  : frames 30-35 (linha 5)                         ║
║    walk-right : frames 36-41 (linha 6)                         ║
║    walk-up    : frames 42-47 (linha 7)                         ║
╠════════════════════════════════════════════════════════════════╣
║  RUN (6 frames, 12 fps):                                       ║
║    run-down   : frames 48-53 (linha 8)                         ║
║    run-left   : frames 54-59 (linha 9)                         ║
║    run-right  : frames 60-65 (linha 10)                        ║
║    run-up     : frames 66-71 (linha 11)                        ║
╚════════════════════════════════════════════════════════════════╝
        `);
    }

    /**
     * ========================================================================
     * ATUALIZAÇÃO DO PERSONAGEM (chamado a cada frame)
     * ========================================================================
     *
     * Este método é chamado no update() da cena principal.
     * Ele processa os inputs e atualiza o estado do personagem.
     *
     * @param {object} cursors - Objeto de teclas direcionais do Phaser
     * @param {object} wasd - Objeto de teclas WASD
     * @param {Phaser.Input.Keyboard.Key} shiftKey - Tecla Shift
     */
    update(cursors, wasd, shiftKey) {
        // ====================================================================
        // DETECTA INPUTS DE MOVIMENTO
        // ====================================================================
        const left = cursors.left.isDown || wasd.left.isDown;
        const right = cursors.right.isDown || wasd.right.isDown;
        const up = cursors.up.isDown || wasd.up.isDown;
        const down = cursors.down.isDown || wasd.down.isDown;
        const isRunning = shiftKey.isDown;

        // ====================================================================
        // DETERMINA A VELOCIDADE
        // ====================================================================
        const speed = isRunning ? this.runSpeed : this.walkSpeed;

        // ====================================================================
        // PROCESSA O MOVIMENTO
        // ====================================================================
        // Reset da velocidade
        this.sprite.body.setVelocity(0);

        // Movimento horizontal
        if (left) {
            this.sprite.body.setVelocityX(-speed);
        } else if (right) {
            this.sprite.body.setVelocityX(speed);
        }

        // Movimento vertical
        if (up) {
            this.sprite.body.setVelocityY(-speed);
        } else if (down) {
            this.sprite.body.setVelocityY(speed);
        }

        // ====================================================================
        // NORMALIZA VELOCIDADE DIAGONAL
        // ====================================================================
        // Sem isso, mover diagonalmente seria ~41% mais rápido
        this.sprite.body.velocity.normalize().scale(speed);

        // ====================================================================
        // ATUALIZA DIREÇÃO E ANIMAÇÃO
        // ====================================================================
        this.updateAnimation(left, right, up, down, isRunning);
    }

    /**
     * ========================================================================
     * ATUALIZAÇÃO DA ANIMAÇÃO
     * ========================================================================
     *
     * Este método determina qual animação tocar baseado no estado atual.
     *
     * LÓGICA DE PRIORIDADE DE DIREÇÃO:
     * --------------------------------
     * Quando múltiplas teclas são pressionadas (movimento diagonal),
     * priorizamos horizontal sobre vertical para uma sensação mais natural.
     */
    updateAnimation(left, right, up, down, isRunning) {
        let newDirection = this.currentDirection;
        let newState = 'idle';

        // Detecta se está movendo
        const isMoving = left || right || up || down;

        if (isMoving) {
            // Determina a nova direção (prioridade: horizontal > vertical)
            if (left) {
                newDirection = 'left';
            } else if (right) {
                newDirection = 'right';
            } else if (up) {
                newDirection = 'up';
            } else if (down) {
                newDirection = 'down';
            }

            // Determina o estado (walk ou run)
            newState = isRunning ? 'run' : 'walk';
        }

        // ====================================================================
        // TROCA DE ANIMAÇÃO
        // ====================================================================
        // Só troca a animação se o estado ou direção mudou
        // Isso evita reiniciar a animação a cada frame

        if (newState !== this.currentState || newDirection !== this.currentDirection) {
            this.currentState = newState;
            this.currentDirection = newDirection;

            // Monta o nome da animação (ex: "walk-left", "run-up")
            const animationKey = `${newState}-${newDirection}`;

            // Toca a nova animação
            this.sprite.play(animationKey);

            // Log para debug (descomente para ver as trocas de animação)
            // console.log(`🎬 Animação: ${animationKey}`);
        }
    }

    /**
     * ========================================================================
     * MÉTODOS AUXILIARES
     * ========================================================================
     */

    /**
     * Retorna a posição atual do personagem
     */
    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    /**
     * Define a posição do personagem
     */
    setPosition(x, y) {
        this.sprite.setPosition(x, y);
    }

    /**
     * Retorna o estado atual (idle, walk, run)
     */
    getState() {
        return this.currentState;
    }

    /**
     * Retorna a direção atual (up, down, left, right)
     */
    getDirection() {
        return this.currentDirection;
    }

    /**
     * Retorna informações completas do personagem (para debug)
     */
    getInfo() {
        return {
            position: this.getPosition(),
            state: this.currentState,
            direction: this.currentDirection,
            velocity: {
                x: this.sprite.body.velocity.x,
                y: this.sprite.body.velocity.y
            },
            currentAnimation: this.sprite.anims.currentAnim?.key || 'none'
        };
    }
}

// Exporta a classe para uso global
window.Player = Player;
