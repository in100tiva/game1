/**
 * ============================================================================
 * SPRITE EDITOR CONFIG - Configuração de Animações do Spritesheet
 * ============================================================================
 *
 * Este arquivo define a estrutura de configuração para mapear
 * as animações do spritesheet.
 *
 * ESTRUTURA:
 * ----------
 * Cada animação tem:
 * - action: Nome da ação (idle, walk, run, attack, etc.)
 * - direction: Direção (down, left, right, up)
 * - row: Linha no spritesheet (0-indexed)
 * - startFrame: Frame inicial na linha
 * - frameCount: Quantidade de frames
 * - frameRate: Velocidade da animação (FPS)
 */

// Configuração padrão das animações
const DEFAULT_ANIMATION_CONFIG = {
    // Dimensões do frame
    frameWidth: 32,
    frameHeight: 32,

    // Mapeamento de animações
    // Cada animação mapeia para uma linha do spritesheet
    animations: [
        // IDLE - Personagem parado
        { action: 'idle', direction: 'down',  row: 0, startFrame: 0, frameCount: 4, frameRate: 4 },
        { action: 'idle', direction: 'left',  row: 1, startFrame: 0, frameCount: 4, frameRate: 4 },
        { action: 'idle', direction: 'right', row: 2, startFrame: 0, frameCount: 4, frameRate: 4 },
        { action: 'idle', direction: 'up',    row: 3, startFrame: 0, frameCount: 4, frameRate: 4 },

        // WALK - Personagem andando
        { action: 'walk', direction: 'down',  row: 4, startFrame: 0, frameCount: 6, frameRate: 8 },
        { action: 'walk', direction: 'left',  row: 5, startFrame: 0, frameCount: 6, frameRate: 8 },
        { action: 'walk', direction: 'right', row: 6, startFrame: 0, frameCount: 6, frameRate: 8 },
        { action: 'walk', direction: 'up',    row: 7, startFrame: 0, frameCount: 6, frameRate: 8 },

        // RUN - Personagem correndo
        { action: 'run', direction: 'down',  row: 8,  startFrame: 0, frameCount: 6, frameRate: 12 },
        { action: 'run', direction: 'left',  row: 9,  startFrame: 0, frameCount: 6, frameRate: 12 },
        { action: 'run', direction: 'right', row: 10, startFrame: 0, frameCount: 6, frameRate: 12 },
        { action: 'run', direction: 'up',    row: 11, startFrame: 0, frameCount: 6, frameRate: 12 },
    ]
};

// Lista de ações disponíveis
const AVAILABLE_ACTIONS = [
    { id: 'idle', name: 'Idle (Parado)', defaultFps: 4 },
    { id: 'walk', name: 'Walk (Andar)', defaultFps: 8 },
    { id: 'run', name: 'Run (Correr)', defaultFps: 12 },
    { id: 'attack', name: 'Attack (Atacar)', defaultFps: 10 },
    { id: 'hurt', name: 'Hurt (Dano)', defaultFps: 6 },
    { id: 'death', name: 'Death (Morte)', defaultFps: 6 },
    { id: 'jump', name: 'Jump (Pular)', defaultFps: 8 },
    { id: 'cast', name: 'Cast (Magia)', defaultFps: 8 },
];

// Direções disponíveis
const AVAILABLE_DIRECTIONS = [
    { id: 'down', name: '↓ Baixo' },
    { id: 'left', name: '← Esquerda' },
    { id: 'right', name: '→ Direita' },
    { id: 'up', name: '↑ Cima' },
];

/**
 * Classe para gerenciar a configuração do spritesheet
 */
class SpriteConfig {
    constructor() {
        this.config = this.loadConfig() || { ...DEFAULT_ANIMATION_CONFIG };
        this.spritesheetData = this.loadSpritesheetData();
    }

    /**
     * Carrega a configuração salva do localStorage
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem('spritesheet_config');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Erro ao carregar configuração:', e);
            return null;
        }
    }

    /**
     * Salva a configuração no localStorage
     */
    saveConfig() {
        try {
            localStorage.setItem('spritesheet_config', JSON.stringify(this.config));
            console.log('✅ Configuração salva com sucesso!');
            return true;
        } catch (e) {
            console.error('Erro ao salvar configuração:', e);
            return false;
        }
    }

    /**
     * Carrega os dados do spritesheet (imagem em base64)
     */
    loadSpritesheetData() {
        try {
            return localStorage.getItem('spritesheet_image');
        } catch (e) {
            return null;
        }
    }

    /**
     * Salva a imagem do spritesheet no localStorage
     */
    saveSpritesheetData(dataUrl) {
        try {
            localStorage.setItem('spritesheet_image', dataUrl);
            this.spritesheetData = dataUrl;
            return true;
        } catch (e) {
            console.error('Erro ao salvar spritesheet (pode ser muito grande):', e);
            return false;
        }
    }

    /**
     * Atualiza uma animação específica
     */
    updateAnimation(action, direction, updates) {
        const anim = this.config.animations.find(
            a => a.action === action && a.direction === direction
        );

        if (anim) {
            Object.assign(anim, updates);
        } else {
            // Adiciona nova animação
            this.config.animations.push({
                action,
                direction,
                row: 0,
                startFrame: 0,
                frameCount: 4,
                frameRate: 8,
                ...updates
            });
        }
    }

    /**
     * Obtém configuração de uma animação
     */
    getAnimation(action, direction) {
        return this.config.animations.find(
            a => a.action === action && a.direction === direction
        );
    }

    /**
     * Obtém todas as animações de uma ação
     */
    getAnimationsByAction(action) {
        return this.config.animations.filter(a => a.action === action);
    }

    /**
     * Reseta para configuração padrão
     */
    reset() {
        this.config = { ...DEFAULT_ANIMATION_CONFIG };
        localStorage.removeItem('spritesheet_config');
        localStorage.removeItem('spritesheet_image');
        this.spritesheetData = null;
    }

    /**
     * Exporta configuração como JSON
     */
    exportJSON() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Importa configuração de JSON
     */
    importJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.config = imported;
            this.saveConfig();
            return true;
        } catch (e) {
            console.error('Erro ao importar JSON:', e);
            return false;
        }
    }

    /**
     * Verifica se tem um spritesheet customizado carregado
     */
    hasCustomSpritesheet() {
        return !!this.spritesheetData;
    }
}

// Exporta globalmente
window.SpriteConfig = SpriteConfig;
window.DEFAULT_ANIMATION_CONFIG = DEFAULT_ANIMATION_CONFIG;
window.AVAILABLE_ACTIONS = AVAILABLE_ACTIONS;
window.AVAILABLE_DIRECTIONS = AVAILABLE_DIRECTIONS;
