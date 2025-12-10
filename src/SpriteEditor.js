/**
 * ============================================================================
 * SPRITE EDITOR - Editor Visual de Spritesheet
 * ============================================================================
 *
 * Editor interativo para configurar animações de spritesheet.
 * Permite:
 * - Carregar imagem do spritesheet
 * - Definir tamanho dos frames
 * - Mapear cada linha para uma animação
 * - Visualizar animações em tempo real
 * - Salvar configuração para uso no jogo
 */

class SpriteEditor {
    constructor() {
        // Configuração
        this.config = new SpriteConfig();

        // Estado
        this.image = null;
        this.zoom = 3;
        this.selectedRow = -1;
        this.previewAction = 'idle';
        this.previewDirection = 'down';
        this.previewFps = 8;
        this.previewFrame = 0;
        this.previewInterval = null;

        // Elementos DOM
        this.elements = {
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('file-input'),
            frameWidth: document.getElementById('frame-width'),
            frameHeight: document.getElementById('frame-height'),
            zoom: document.getElementById('zoom'),
            zoomValue: document.getElementById('zoom-value'),
            spritesheetCanvas: document.getElementById('spritesheet-canvas'),
            gridOverlay: document.getElementById('grid-overlay'),
            spritesheetContainer: document.getElementById('spritesheet-container'),
            spriteInfo: document.getElementById('sprite-info'),
            animationList: document.getElementById('animation-list'),
            previewCanvas: document.getElementById('preview-canvas'),
            previewFps: document.getElementById('preview-fps'),
            fpsValue: document.getElementById('fps-value'),
            saveConfig: document.getElementById('save-config'),
            exportConfig: document.getElementById('export-config'),
            status: document.getElementById('status'),
        };

        // Contextos de canvas
        this.ctx = this.elements.spritesheetCanvas.getContext('2d');
        this.gridCtx = this.elements.gridOverlay.getContext('2d');
        this.previewCtx = this.elements.previewCanvas.getContext('2d');

        // Inicializa
        this.init();
    }

    /**
     * Inicialização do editor
     */
    init() {
        this.setupEventListeners();
        this.renderAnimationList();
        this.loadSavedSpritesheet();
        this.startPreviewAnimation();

        console.log('🎨 Sprite Editor inicializado!');
    }

    /**
     * Configura todos os event listeners
     */
    setupEventListeners() {
        // Upload de arquivo
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadImage(e.target.files[0]);
            }
        });

        // Drag and drop
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files[0]) {
                this.loadImage(e.dataTransfer.files[0]);
            }
        });

        // Frame size
        this.elements.frameWidth.addEventListener('change', () => this.updateFrameSize());
        this.elements.frameHeight.addEventListener('change', () => this.updateFrameSize());

        // Zoom
        this.elements.zoom.addEventListener('input', (e) => {
            this.zoom = parseInt(e.target.value);
            this.elements.zoomValue.textContent = `${this.zoom}x`;
            this.renderSpritesheet();
        });

        // Click no spritesheet para selecionar linha
        this.elements.spritesheetCanvas.addEventListener('click', (e) => {
            this.handleSpritesheetClick(e);
        });

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Preview controls
        document.querySelectorAll('#action-buttons button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#action-buttons button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.previewAction = e.target.dataset.action;
                this.previewFrame = 0;
            });
        });

        document.querySelectorAll('#direction-buttons button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#direction-buttons button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.previewDirection = e.target.dataset.direction;
                this.previewFrame = 0;
            });
        });

        // Preview FPS
        this.elements.previewFps.addEventListener('input', (e) => {
            this.previewFps = parseInt(e.target.value);
            this.elements.fpsValue.textContent = `${this.previewFps} FPS`;
            this.restartPreviewAnimation();
        });

        // Save/Export
        this.elements.saveConfig.addEventListener('click', () => this.saveConfiguration());
        this.elements.exportConfig.addEventListener('click', () => this.exportConfiguration());
    }

    /**
     * Carrega uma imagem do arquivo
     */
    loadImage(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.config.saveSpritesheetData(e.target.result);
                this.renderSpritesheet();
                this.showStatus('Imagem carregada com sucesso!', 'success');
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    /**
     * Carrega spritesheet salvo anteriormente
     */
    loadSavedSpritesheet() {
        if (this.config.spritesheetData) {
            const img = new Image();
            img.onload = () => {
                this.image = img;

                // Carrega dimensões salvas
                this.elements.frameWidth.value = this.config.config.frameWidth;
                this.elements.frameHeight.value = this.config.config.frameHeight;

                this.renderSpritesheet();
                this.showStatus('Spritesheet anterior carregado!', 'success');
            };
            img.src = this.config.spritesheetData;
        }
    }

    /**
     * Renderiza o spritesheet no canvas
     */
    renderSpritesheet() {
        if (!this.image) return;

        const canvas = this.elements.spritesheetCanvas;
        const grid = this.elements.gridOverlay;

        // Ajusta tamanho do canvas
        canvas.width = this.image.width * this.zoom;
        canvas.height = this.image.height * this.zoom;
        grid.width = canvas.width;
        grid.height = canvas.height;

        // Posiciona o grid overlay
        grid.style.position = 'absolute';
        grid.style.top = '0';
        grid.style.left = '0';

        // Desenha imagem com zoom (pixel perfect)
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);

        // Desenha grid
        this.renderGrid();

        // Atualiza info
        this.updateSpriteInfo();
    }

    /**
     * Renderiza o grid sobre o spritesheet
     */
    renderGrid() {
        const frameWidth = parseInt(this.elements.frameWidth.value) * this.zoom;
        const frameHeight = parseInt(this.elements.frameHeight.value) * this.zoom;
        const canvas = this.elements.gridOverlay;

        this.gridCtx.clearRect(0, 0, canvas.width, canvas.height);
        this.gridCtx.strokeStyle = 'rgba(78, 204, 163, 0.5)';
        this.gridCtx.lineWidth = 1;

        // Linhas verticais
        for (let x = 0; x <= canvas.width; x += frameWidth) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, canvas.height);
            this.gridCtx.stroke();
        }

        // Linhas horizontais
        for (let y = 0; y <= canvas.height; y += frameHeight) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(canvas.width, y);
            this.gridCtx.stroke();
        }

        // Destaca linha selecionada
        if (this.selectedRow >= 0) {
            const y = this.selectedRow * frameHeight;
            this.gridCtx.fillStyle = 'rgba(78, 204, 163, 0.3)';
            this.gridCtx.fillRect(0, y, canvas.width, frameHeight);
        }
    }

    /**
     * Atualiza informações do sprite
     */
    updateSpriteInfo() {
        if (!this.image) return;

        const fw = parseInt(this.elements.frameWidth.value);
        const fh = parseInt(this.elements.frameHeight.value);
        const cols = Math.floor(this.image.width / fw);
        const rows = Math.floor(this.image.height / fh);

        this.elements.spriteInfo.innerHTML = `
            <strong>Imagem:</strong> ${this.image.width} x ${this.image.height} px<br>
            <strong>Frames:</strong> ${cols} colunas × ${rows} linhas<br>
            <strong>Total:</strong> ${cols * rows} frames
        `;

        // Atualiza config
        this.config.config.frameWidth = fw;
        this.config.config.frameHeight = fh;
    }

    /**
     * Atualiza quando o tamanho do frame muda
     */
    updateFrameSize() {
        this.renderSpritesheet();
        this.renderAnimationList();
    }

    /**
     * Trata clique no spritesheet
     */
    handleSpritesheetClick(e) {
        if (!this.image) return;

        const rect = this.elements.spritesheetCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const frameHeight = parseInt(this.elements.frameHeight.value) * this.zoom;

        this.selectedRow = Math.floor(y / frameHeight);
        this.renderGrid();

        // Scroll para a animação correspondente na lista
        console.log(`Linha ${this.selectedRow} selecionada`);
    }

    /**
     * Renderiza a lista de animações configuráveis
     */
    renderAnimationList() {
        const container = this.elements.animationList;
        container.innerHTML = '';

        // Agrupa por ação
        AVAILABLE_ACTIONS.forEach(action => {
            const div = document.createElement('div');
            div.className = 'animation-item';

            let directionsHtml = '';
            AVAILABLE_DIRECTIONS.forEach(dir => {
                const anim = this.config.getAnimation(action.id, dir.id) || {
                    row: 0,
                    startFrame: 0,
                    frameCount: 4,
                    frameRate: action.defaultFps
                };

                directionsHtml += `
                    <tr>
                        <td>${dir.name}</td>
                        <td>
                            <input type="number"
                                class="anim-row"
                                data-action="${action.id}"
                                data-direction="${dir.id}"
                                value="${anim.row}"
                                min="0" max="99">
                        </td>
                        <td>
                            <input type="number"
                                class="anim-frames"
                                data-action="${action.id}"
                                data-direction="${dir.id}"
                                value="${anim.frameCount}"
                                min="1" max="20">
                        </td>
                        <td>
                            <input type="number"
                                class="anim-fps"
                                data-action="${action.id}"
                                data-direction="${dir.id}"
                                value="${anim.frameRate}"
                                min="1" max="30">
                        </td>
                    </tr>
                `;
            });

            div.innerHTML = `
                <h4>
                    ${action.name}
                    <span class="badge">${action.defaultFps} FPS padrão</span>
                </h4>
                <table class="mapping-table">
                    <thead>
                        <tr>
                            <th>Direção</th>
                            <th>Linha</th>
                            <th>Frames</th>
                            <th>FPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${directionsHtml}
                    </tbody>
                </table>
            `;

            container.appendChild(div);
        });

        // Adiciona event listeners para os inputs
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => this.handleAnimationChange(e));
        });
    }

    /**
     * Trata mudanças nos inputs de animação
     */
    handleAnimationChange(e) {
        const action = e.target.dataset.action;
        const direction = e.target.dataset.direction;
        const value = parseInt(e.target.value);

        if (e.target.classList.contains('anim-row')) {
            this.config.updateAnimation(action, direction, { row: value });
        } else if (e.target.classList.contains('anim-frames')) {
            this.config.updateAnimation(action, direction, { frameCount: value });
        } else if (e.target.classList.contains('anim-fps')) {
            this.config.updateAnimation(action, direction, { frameRate: value });
        }
    }

    /**
     * Troca entre abas
     */
    switchTab(tabId) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    }

    /**
     * Inicia animação de preview
     */
    startPreviewAnimation() {
        this.previewInterval = setInterval(() => {
            this.renderPreviewFrame();
        }, 1000 / this.previewFps);
    }

    /**
     * Reinicia animação de preview
     */
    restartPreviewAnimation() {
        if (this.previewInterval) {
            clearInterval(this.previewInterval);
        }
        this.startPreviewAnimation();
    }

    /**
     * Renderiza um frame do preview
     */
    renderPreviewFrame() {
        if (!this.image) {
            // Sem imagem, mostra placeholder
            this.previewCtx.fillStyle = '#2d4a3e';
            this.previewCtx.fillRect(0, 0, 96, 96);
            this.previewCtx.fillStyle = '#4ecca3';
            this.previewCtx.font = '12px sans-serif';
            this.previewCtx.textAlign = 'center';
            this.previewCtx.fillText('Carregue uma', 48, 40);
            this.previewCtx.fillText('imagem', 48, 55);
            return;
        }

        const anim = this.config.getAnimation(this.previewAction, this.previewDirection);
        if (!anim) return;

        const fw = this.config.config.frameWidth;
        const fh = this.config.config.frameHeight;

        // Avança frame
        this.previewFrame = (this.previewFrame + 1) % anim.frameCount;

        // Calcula posição no spritesheet
        const sx = (anim.startFrame + this.previewFrame) * fw;
        const sy = anim.row * fh;

        // Limpa canvas
        this.previewCtx.fillStyle = '#2d4a3e';
        this.previewCtx.fillRect(0, 0, 96, 96);

        // Desenha frame centralizado e com zoom
        this.previewCtx.imageSmoothingEnabled = false;
        const scale = Math.min(96 / fw, 96 / fh) * 0.8;
        const dx = (96 - fw * scale) / 2;
        const dy = (96 - fh * scale) / 2;

        this.previewCtx.drawImage(
            this.image,
            sx, sy, fw, fh,
            dx, dy, fw * scale, fh * scale
        );
    }

    /**
     * Salva configuração e imagem
     */
    saveConfiguration() {
        if (!this.image) {
            this.showStatus('Carregue uma imagem primeiro!', 'error');
            return;
        }

        // Coleta todas as configurações dos inputs
        document.querySelectorAll('.animation-item input').forEach(input => {
            const action = input.dataset.action;
            const direction = input.dataset.direction;
            const value = parseInt(input.value);

            if (input.classList.contains('anim-row')) {
                this.config.updateAnimation(action, direction, { row: value });
            } else if (input.classList.contains('anim-frames')) {
                this.config.updateAnimation(action, direction, { frameCount: value });
            } else if (input.classList.contains('anim-fps')) {
                this.config.updateAnimation(action, direction, { frameRate: value });
            }
        });

        // Salva
        if (this.config.saveConfig()) {
            this.showStatus('Configuração salva! Vá para o jogo para testar.', 'success');
        } else {
            this.showStatus('Erro ao salvar configuração.', 'error');
        }
    }

    /**
     * Exporta configuração como JSON
     */
    exportConfiguration() {
        const json = this.config.exportJSON();

        // Cria download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spritesheet-config.json';
        a.click();
        URL.revokeObjectURL(url);

        this.showStatus('Configuração exportada!', 'success');
    }

    /**
     * Mostra status
     */
    showStatus(message, type) {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
        this.elements.status.style.display = 'block';

        setTimeout(() => {
            this.elements.status.style.display = 'none';
        }, 3000);
    }
}

// Inicializa o editor quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.spriteEditor = new SpriteEditor();
});
