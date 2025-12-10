/**
 * ============================================================================
 * SPRITE GENERATOR - Gerador de Spritesheet Pixel Art
 * ============================================================================
 *
 * Este arquivo gera um spritesheet de personagem pixel art programaticamente.
 * Isso é útil para entender como os frames de animação são organizados.
 *
 * ESTRUTURA DO SPRITESHEET:
 * -------------------------
 * O spritesheet é organizado em linhas (rows) e colunas (frames):
 *
 * Linha 0: Idle Down   (4 frames) - Personagem parado olhando para baixo
 * Linha 1: Idle Left   (4 frames) - Personagem parado olhando para esquerda
 * Linha 2: Idle Right  (4 frames) - Personagem parado olhando para direita
 * Linha 3: Idle Up     (4 frames) - Personagem parado olhando para cima
 * Linha 4: Walk Down   (6 frames) - Animação de andar para baixo
 * Linha 5: Walk Left   (6 frames) - Animação de andar para esquerda
 * Linha 6: Walk Right  (6 frames) - Animação de andar para direita
 * Linha 7: Walk Up     (6 frames) - Animação de andar para cima
 * Linha 8: Run Down    (6 frames) - Animação de correr para baixo
 * Linha 9: Run Left    (6 frames) - Animação de correr para esquerda
 * Linha 10: Run Right  (6 frames) - Animação de correr para direita
 * Linha 11: Run Up     (6 frames) - Animação de correr para cima
 *
 * TAMANHO DE CADA FRAME: 32x32 pixels
 * TOTAL DE FRAMES POR LINHA: 6 (máximo)
 * TOTAL DE LINHAS: 12
 */

class SpriteGenerator {
    constructor() {
        // Dimensões do frame individual
        this.frameWidth = 32;
        this.frameHeight = 32;

        // Quantidade de frames por linha
        this.framesPerRow = 6;

        // Total de linhas de animação
        this.totalRows = 12;

        // Cores do personagem (paleta pixel art)
        this.colors = {
            skin: '#f4c99b',        // Pele
            skinShadow: '#d4a574',   // Sombra da pele
            hair: '#4a3728',         // Cabelo
            hairHighlight: '#5c4333', // Destaque do cabelo
            shirt: '#3498db',        // Camisa
            shirtShadow: '#2980b9',  // Sombra da camisa
            pants: '#2c3e50',        // Calça
            pantsShadow: '#1a252f',  // Sombra da calça
            shoes: '#8b4513',        // Sapatos
            outline: '#2c2c2c',      // Contorno
            eyes: '#2c2c2c',         // Olhos
        };
    }

    /**
     * Gera o spritesheet completo como uma imagem base64
     * @returns {string} Data URL da imagem gerada
     */
    generateSpritesheet() {
        const canvas = document.createElement('canvas');
        canvas.width = this.frameWidth * this.framesPerRow;
        canvas.height = this.frameHeight * this.totalRows;

        const ctx = canvas.getContext('2d');

        // Limpa o canvas com transparência
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gera cada linha de animação
        this.generateIdleAnimations(ctx);
        this.generateWalkAnimations(ctx);
        this.generateRunAnimations(ctx);

        return canvas.toDataURL('image/png');
    }

    /**
     * ========================================================================
     * ANIMAÇÕES IDLE (PARADO)
     * ========================================================================
     *
     * O personagem parado tem uma animação sutil de "respiração"
     * onde ele se move ligeiramente para cima e para baixo.
     *
     * Frames: 4 por direção
     * Ciclo: frame0 -> frame1 -> frame2 -> frame3 -> frame2 -> frame1 (loop)
     */
    generateIdleAnimations(ctx) {
        const directions = ['down', 'left', 'right', 'up'];

        directions.forEach((direction, rowIndex) => {
            // Frame 0 e 2: posição normal
            // Frame 1 e 3: ligeiramente levantado (efeito de respiração)
            for (let frame = 0; frame < 4; frame++) {
                const x = frame * this.frameWidth;
                const y = rowIndex * this.frameHeight;

                // Offset Y para efeito de respiração (sobe 1 pixel nos frames 1 e 3)
                const breathOffset = (frame === 1 || frame === 3) ? -1 : 0;

                this.drawCharacter(ctx, x, y, direction, 'idle', frame, breathOffset);
            }
        });
    }

    /**
     * ========================================================================
     * ANIMAÇÕES WALK (ANDAR)
     * ========================================================================
     *
     * A animação de andar tem 6 frames que simulam o movimento das pernas.
     *
     * Frame 0: Posição inicial (pernas juntas)
     * Frame 1: Perna esquerda à frente
     * Frame 2: Pernas separadas (máximo)
     * Frame 3: Posição intermediária
     * Frame 4: Perna direita à frente
     * Frame 5: Pernas separadas (máximo)
     *
     * O corpo também balança levemente de um lado para outro.
     */
    generateWalkAnimations(ctx) {
        const directions = ['down', 'left', 'right', 'up'];

        directions.forEach((direction, dirIndex) => {
            const rowIndex = 4 + dirIndex; // Linhas 4-7

            for (let frame = 0; frame < 6; frame++) {
                const x = frame * this.frameWidth;
                const y = rowIndex * this.frameHeight;

                // Movimento de balanço vertical (simula passadas)
                const bounceOffset = (frame === 0 || frame === 3) ? 0 : -1;

                this.drawCharacter(ctx, x, y, direction, 'walk', frame, bounceOffset);
            }
        });
    }

    /**
     * ========================================================================
     * ANIMAÇÕES RUN (CORRER)
     * ========================================================================
     *
     * A animação de correr é similar à de andar, mas:
     * - O movimento é mais exagerado
     * - O corpo inclina mais na direção do movimento
     * - Os braços balançam mais
     *
     * Frames: 6 por direção
     */
    generateRunAnimations(ctx) {
        const directions = ['down', 'left', 'right', 'up'];

        directions.forEach((direction, dirIndex) => {
            const rowIndex = 8 + dirIndex; // Linhas 8-11

            for (let frame = 0; frame < 6; frame++) {
                const x = frame * this.frameWidth;
                const y = rowIndex * this.frameHeight;

                // Balanço mais pronunciado durante corrida
                const bounceOffset = (frame === 0 || frame === 3) ? 0 : -2;

                this.drawCharacter(ctx, x, y, direction, 'run', frame, bounceOffset);
            }
        });
    }

    /**
     * ========================================================================
     * DESENHO DO PERSONAGEM
     * ========================================================================
     *
     * Desenha um frame individual do personagem.
     *
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Posição X do frame
     * @param {number} y - Posição Y do frame
     * @param {string} direction - Direção (down, up, left, right)
     * @param {string} action - Ação (idle, walk, run)
     * @param {number} frame - Número do frame
     * @param {number} offsetY - Offset vertical para efeitos
     */
    drawCharacter(ctx, x, y, direction, action, frame, offsetY = 0) {
        // Centro do frame
        const centerX = x + this.frameWidth / 2;
        const baseY = y + this.frameHeight - 4 + offsetY; // Base dos pés

        // Calcula a posição das pernas baseado no frame e ação
        const legPositions = this.calculateLegPositions(action, frame);

        // Desenha na ordem correta (de trás para frente)
        if (direction === 'up') {
            // Olhando para cima: desenha cabelo por cima
            this.drawLegs(ctx, centerX, baseY, direction, legPositions);
            this.drawBody(ctx, centerX, baseY, direction);
            this.drawHead(ctx, centerX, baseY, direction);
            this.drawHairBack(ctx, centerX, baseY);
        } else if (direction === 'down') {
            // Olhando para baixo: desenha rosto
            this.drawLegs(ctx, centerX, baseY, direction, legPositions);
            this.drawBody(ctx, centerX, baseY, direction);
            this.drawHead(ctx, centerX, baseY, direction);
            this.drawFace(ctx, centerX, baseY);
            this.drawHairFront(ctx, centerX, baseY);
        } else {
            // Olhando para os lados
            this.drawLegs(ctx, centerX, baseY, direction, legPositions);
            this.drawBody(ctx, centerX, baseY, direction);
            this.drawArms(ctx, centerX, baseY, direction, action, frame);
            this.drawHead(ctx, centerX, baseY, direction);
            this.drawFaceSide(ctx, centerX, baseY, direction);
            this.drawHairSide(ctx, centerX, baseY, direction);
        }
    }

    /**
     * Calcula a posição das pernas para cada frame da animação
     */
    calculateLegPositions(action, frame) {
        if (action === 'idle') {
            // Pernas paradas, apenas leve variação
            return { leftX: -2, rightX: 2, leftY: 0, rightY: 0 };
        }

        // Sequência de movimento das pernas para walk/run
        const walkCycle = [
            { leftX: -2, rightX: 2, leftY: 0, rightY: 0 },     // Frame 0: neutro
            { leftX: -3, rightX: 3, leftY: -1, rightY: 1 },   // Frame 1: esquerda à frente
            { leftX: -4, rightX: 4, leftY: 0, rightY: 0 },    // Frame 2: máxima extensão
            { leftX: -2, rightX: 2, leftY: 0, rightY: 0 },     // Frame 3: neutro
            { leftX: -1, rightX: 1, leftY: 1, rightY: -1 },   // Frame 4: direita à frente
            { leftX: -4, rightX: 4, leftY: 0, rightY: 0 },    // Frame 5: máxima extensão
        ];

        const positions = walkCycle[frame] || walkCycle[0];

        // Amplifica o movimento para corrida
        if (action === 'run') {
            return {
                leftX: positions.leftX * 1.3,
                rightX: positions.rightX * 1.3,
                leftY: positions.leftY * 1.5,
                rightY: positions.rightY * 1.5
            };
        }

        return positions;
    }

    /**
     * Desenha as pernas do personagem
     */
    drawLegs(ctx, centerX, baseY, direction, positions) {
        const legHeight = 8;

        if (direction === 'left' || direction === 'right') {
            // Vista lateral: uma perna na frente, outra atrás
            const frontLegX = direction === 'left' ? positions.leftX : positions.rightX;
            const backLegX = direction === 'left' ? positions.rightX : positions.leftX;

            // Perna de trás
            this.drawPixelRect(ctx, centerX + backLegX - 2, baseY - legHeight - 2, 3, legHeight, this.colors.pantsShadow);
            this.drawPixelRect(ctx, centerX + backLegX - 2, baseY - 3, 3, 3, this.colors.shoes);

            // Perna da frente
            this.drawPixelRect(ctx, centerX + frontLegX - 2, baseY - legHeight, 3, legHeight, this.colors.pants);
            this.drawPixelRect(ctx, centerX + frontLegX - 2, baseY - 2, 3, 2, this.colors.shoes);
        } else {
            // Vista frontal/traseira
            // Perna esquerda
            this.drawPixelRect(ctx, centerX - 5, baseY - legHeight + positions.leftY, 4, legHeight, this.colors.pants);
            this.drawPixelRect(ctx, centerX - 5, baseY - 2 + positions.leftY, 4, 2, this.colors.shoes);

            // Perna direita
            this.drawPixelRect(ctx, centerX + 1, baseY - legHeight + positions.rightY, 4, legHeight, this.colors.pants);
            this.drawPixelRect(ctx, centerX + 1, baseY - 2 + positions.rightY, 4, 2, this.colors.shoes);
        }
    }

    /**
     * Desenha o corpo/torso do personagem
     */
    drawBody(ctx, centerX, baseY, direction) {
        const bodyTop = baseY - 18;

        // Corpo principal
        this.drawPixelRect(ctx, centerX - 5, bodyTop, 10, 10, this.colors.shirt);

        // Sombra do corpo
        if (direction === 'left') {
            this.drawPixelRect(ctx, centerX + 2, bodyTop, 3, 10, this.colors.shirtShadow);
        } else if (direction === 'right') {
            this.drawPixelRect(ctx, centerX - 5, bodyTop, 3, 10, this.colors.shirtShadow);
        } else {
            this.drawPixelRect(ctx, centerX - 5, bodyTop + 7, 10, 3, this.colors.shirtShadow);
        }
    }

    /**
     * Desenha os braços (para vistas laterais)
     */
    drawArms(ctx, centerX, baseY, direction, action, frame) {
        const armY = baseY - 16;

        // Calcula o balanço dos braços
        let armSwing = 0;
        if (action === 'walk' || action === 'run') {
            const swingAmount = action === 'run' ? 3 : 2;
            armSwing = Math.sin((frame / 6) * Math.PI * 2) * swingAmount;
        }

        if (direction === 'left') {
            // Braço visível do lado direito
            this.drawPixelRect(ctx, centerX + 4, armY + armSwing, 3, 6, this.colors.shirt);
            this.drawPixelRect(ctx, centerX + 4, armY + 5 + armSwing, 3, 2, this.colors.skin);
        } else if (direction === 'right') {
            // Braço visível do lado esquerdo
            this.drawPixelRect(ctx, centerX - 7, armY - armSwing, 3, 6, this.colors.shirt);
            this.drawPixelRect(ctx, centerX - 7, armY + 5 - armSwing, 3, 2, this.colors.skin);
        }
    }

    /**
     * Desenha a cabeça do personagem
     */
    drawHead(ctx, centerX, baseY, direction) {
        const headTop = baseY - 26;

        // Cabeça (formato arredondado em pixel art)
        this.drawPixelRect(ctx, centerX - 5, headTop + 1, 10, 7, this.colors.skin);
        this.drawPixelRect(ctx, centerX - 4, headTop, 8, 1, this.colors.skin);
        this.drawPixelRect(ctx, centerX - 4, headTop + 8, 8, 1, this.colors.skin);

        // Sombra da cabeça
        if (direction === 'left') {
            this.drawPixelRect(ctx, centerX + 3, headTop + 1, 2, 7, this.colors.skinShadow);
        } else if (direction === 'right') {
            this.drawPixelRect(ctx, centerX - 5, headTop + 1, 2, 7, this.colors.skinShadow);
        }
    }

    /**
     * Desenha o rosto (vista frontal)
     */
    drawFace(ctx, centerX, baseY) {
        const headTop = baseY - 26;

        // Olhos
        this.drawPixel(ctx, centerX - 3, headTop + 3, this.colors.eyes);
        this.drawPixel(ctx, centerX + 2, headTop + 3, this.colors.eyes);
    }

    /**
     * Desenha o rosto (vista lateral)
     */
    drawFaceSide(ctx, centerX, baseY, direction) {
        const headTop = baseY - 26;

        // Olho (apenas um visível)
        const eyeX = direction === 'left' ? centerX - 3 : centerX + 2;
        this.drawPixel(ctx, eyeX, headTop + 3, this.colors.eyes);
    }

    /**
     * Desenha o cabelo (vista frontal)
     */
    drawHairFront(ctx, centerX, baseY) {
        const headTop = baseY - 26;

        // Cabelo topo
        this.drawPixelRect(ctx, centerX - 5, headTop - 2, 10, 3, this.colors.hair);
        this.drawPixelRect(ctx, centerX - 4, headTop - 3, 8, 1, this.colors.hair);

        // Franja
        this.drawPixelRect(ctx, centerX - 4, headTop, 3, 2, this.colors.hair);
        this.drawPixelRect(ctx, centerX + 1, headTop, 3, 2, this.colors.hair);

        // Destaque
        this.drawPixel(ctx, centerX - 2, headTop - 2, this.colors.hairHighlight);
    }

    /**
     * Desenha o cabelo (vista traseira)
     */
    drawHairBack(ctx, centerX, baseY) {
        const headTop = baseY - 26;

        // Cabelo cobrindo toda a cabeça por trás
        this.drawPixelRect(ctx, centerX - 5, headTop - 2, 10, 10, this.colors.hair);
        this.drawPixelRect(ctx, centerX - 4, headTop - 3, 8, 1, this.colors.hair);

        // Destaque
        this.drawPixel(ctx, centerX, headTop - 1, this.colors.hairHighlight);
    }

    /**
     * Desenha o cabelo (vista lateral)
     */
    drawHairSide(ctx, centerX, baseY, direction) {
        const headTop = baseY - 26;

        // Cabelo topo
        this.drawPixelRect(ctx, centerX - 5, headTop - 2, 10, 3, this.colors.hair);
        this.drawPixelRect(ctx, centerX - 4, headTop - 3, 8, 1, this.colors.hair);

        // Cabelo lateral
        if (direction === 'left') {
            this.drawPixelRect(ctx, centerX + 3, headTop, 2, 5, this.colors.hair);
        } else {
            this.drawPixelRect(ctx, centerX - 5, headTop, 2, 5, this.colors.hair);
        }

        // Destaque
        this.drawPixel(ctx, centerX - 1, headTop - 2, this.colors.hairHighlight);
    }

    /**
     * Desenha um retângulo de pixels
     */
    drawPixelRect(ctx, x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
    }

    /**
     * Desenha um único pixel
     */
    drawPixel(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
}

// Exporta a classe para uso global
window.SpriteGenerator = SpriteGenerator;
