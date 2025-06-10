// Sistema de áudio para o jogo
const audioSystem = {
    initialized: false,
    sounds: {},
    voicesLoaded: false,
    howlerReady: false, // Flag para indicar se Howler.js está pronto e inicializado
    
    // Função para inicializar o sistema de áudio (Howler.js e síntese de voz)
    init: function() {
        if (this.initialized) {
            console.log('Sistema de áudio já inicializado.');
            return;
        }

        try {
            // Verifica se Howl (de Howler.js) está disponível
            if (typeof Howl !== 'undefined') {
                this.howlerReady = true; // Howler.js está carregado
                this.sounds = {
                    correct: new Howl({
                        src: ['assets/audio/correct.mp3', 'assets/audio/correct.ogg'],
                        volume: config.audio.volume,
                        preload: true,
                        onload: () => console.log('Som "correct" carregado.'),
                        onloaderror: (id, err) => console.error(`Erro ao carregar "correct" (${id}):`, err)
                    }),
                    wrong: new Howl({
                        src: ['assets/audio/wrong.mp3', 'assets/audio/wrong.ogg'],
                        volume: config.audio.volume,
                        preload: true,
                        onload: () => console.log('Som "wrong" carregado.'),
                        onloaderror: (id, err) => console.error(`Erro ao carregar "wrong" (${id}):`, err)
                    }),
                    click: new Howl({
                        src: ['assets/audio/click.mp3', 'assets/audio/click.ogg'],
                        volume: config.audio.volume * 0.7,
                        preload: true,
                        onload: () => console.log('Som "click" carregado.'),
                        onloaderror: (id, err) => console.error(`Erro ao carregar "click" (${id}):`, err)
                    })
                };
                console.log('Howler.js carregado e sons básicos pré-carregados.');
            } else {
                console.warn('Biblioteca Howler.js não encontrada. Sons curtos (correct, wrong, click) não funcionarão.');
                this.howlerReady = false;
            }
           
            this.setupSpeechSynthesis(); // Configura a síntese de voz

            this.initialized = true; // Marca o sistema de áudio como inicializado
            console.log('Sistema de áudio principal inicializado.');

        } catch (e) {
            console.error('Erro geral ao inicializar sistema de áudio:', e);
            this.initialized = false;
        }
    },
    
    // Configura a síntese de voz
    setupSpeechSynthesis: function() {
        if (!('speechSynthesis' in window)) {
            console.warn('Síntese de voz não suportada neste navegador.');
            return;
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            this.voicesLoaded = true;
            console.log('Vozes da síntese de voz já carregadas.');
        } else {
            // Espera o evento 'onvoiceschanged' para garantir que as vozes estão disponíveis
            window.speechSynthesis.onvoiceschanged = () => {
                this.voicesLoaded = true;
                console.log('Vozes da síntese de voz carregadas via onvoiceschanged.');
            };
        }
    },

    // Reproduzir um som pelo ID ou caminho de arquivo
    play: function(soundIdOrPath) {
        // Inicializa se não estiver, mas não espera. Isso permite que a chamada a `play`
        // seja feita logo, e a lógica interna gerencia a prontidão.
        if (!this.initialized) {
            console.warn('Sistema de áudio não inicializado. Tentando inicializar para reprodução.');
            this.init(); 
            if (!this.initialized) {
                console.error('Falha na inicialização do sistema de áudio. Não é possível reproduzir som.');
                return;
            }
        }
        
        if (config.audio.mudo) {
            console.log('Áudio mudo, som não reproduzido.');
            return;
        }
        
        if (!this.howlerReady) {
            console.warn('Howler.js ainda não está pronto para reprodução de som via Howler. Tentando fallback para TTS se aplicável.');
            // Se for um caminho de áudio (fonética), tenta TTS como fallback imediato
            if (soundIdOrPath.startsWith('assets/audio/')) {
                const textFallback = soundIdOrPath.split('/').pop().replace(/\.mp3|\.ogg/, '').replace(/_/, ' '); // Tenta falar o nome do arquivo, ajustando _
                this.speakText(textFallback);
            }
            return; 
        }

        try {
            // Tenta reproduzir sons pré-carregados ou carrega sons de fonética
            if (this.sounds[soundIdOrPath]) {
                this.sounds[soundIdOrPath].play();
                console.log(`Som reproduzido: ${soundIdOrPath}`);
            } 
            else if (soundIdOrPath.startsWith('assets/audio/fonetica/')) { // Específico para áudios de fonética
                // Se ainda não foi criado o objeto Howl para este caminho, crie e reproduza
                if (!this.sounds[soundIdOrPath]) {
                    this.sounds[soundIdOrPath] = new Howl({
                        src: [soundIdOrPath],
                        volume: config.audio.volume,
                        preload: true,
                        onload: function() {
                            audioSystem.sounds[soundIdOrPath].play();
                            console.log(`Som dinâmico carregado e reproduzido: ${soundIdOrPath}`);
                        },
                        onloaderror: function(id, err) {
                            console.error(`Erro ao carregar som dinâmico ${soundIdOrPath}:`, err);
                            const textFallback = soundIdOrPath.split('/').pop().replace(/\.mp3|\.ogg/, '').replace(/_/, ' ');
                            audioSystem.speakText(textFallback); // Fallback para TTS se o áudio falhar
                        }
                    });
                } else {
                    this.sounds[soundIdOrPath].play(); // Se já existe, apenas toque
                    console.log(`Som dinâmico já carregado, reproduzindo: ${soundIdOrPath}`);
                }
            } else {
                console.warn(`Som não encontrado: ${soundIdOrPath}. Não é um ID de som ou caminho de arquivo reconhecido para Howler.js.`);
            }
        } catch (e) {
            console.error(`Erro ao reproduzir som ${soundIdOrPath}:`, e);
        }
    },
    
    // Falar texto usando síntese de voz do navegador
    speakText: function(text) {
        if (!this.initialized) {
            console.warn('Sistema de áudio não inicializado para síntese de voz. Tentando inicializar agora.');
            this.init(); 
            if (!this.initialized) { 
                console.error('Falha na inicialização do sistema de áudio para síntese de voz.');
                return;
            }
        }
        
        if (config.audio.mudo) {
            console.log('Áudio mudo, texto não falado.');
            return;
        }
        
        if (!('speechSynthesis' in window)) {
            console.error('Síntese de voz não suportada neste navegador.');
            return;
        }
        
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Garante que a voz PT-BR seja selecionada assim que as vozes estiverem disponíveis
        const setPtBrVoice = () => {
            if (!this.voicesLoaded) { // Tenta carregar vozes se ainda não estiverem prontas
                this.setupSpeechSynthesis(); 
                if (!this.voicesLoaded) { // Se ainda não carregou, tenta de novo em breve
                    setTimeout(setPtBrVoice, 200); 
                    return;
                }
            }
            const voices = window.speechSynthesis.getVoices();
            const ptVoice = voices.find(voice => 
                voice.lang.includes('pt-BR') || voice.lang.includes('pt-PT')
            );
            if (ptVoice) {
                utterance.voice = ptVoice;
                console.log('Voz PT-BR/PT-PT encontrada e selecionada:', ptVoice.name);
            } else {
                console.warn('Nenhuma voz PT-BR/PT-PT encontrada, usando voz padrão do navegador.');
            }
        };

        setPtBrVoice(); // Chama a função imediatamente
        
        utterance.lang = 'pt-BR'; 
        utterance.rate = config.audio.velocidadeFala; 
        utterance.pitch = 1.0; 
        
        utterance.onstart = () => console.log(`Início da fala: "${text}"`);
        utterance.onend = () => console.log(`Fim da fala: "${text}"`);
        utterance.onerror = (event) => console.error(`Erro na síntese de voz para "${text}":`, event.error);

        window.speechSynthesis.speak(utterance);
    },
    
    // Altera o volume de todos os sons (afeta Howler.js)
    setVolume: function(volume) {
        volume = Math.max(0, Math.min(1, volume)); 
        config.audio.volume = volume; 
        
        if (this.howlerReady) {
            for (const soundId in this.sounds) {
                if (this.sounds.hasOwnProperty(soundId)) {
                    this.sounds[soundId].volume(volume);
                }
            }
            Howler.volume(volume); 
        }
        console.log(`Volume alterado para: ${volume}`);
    },
    
    // Alterna o estado mudo do áudio
    toggleMute: function() {
        config.audio.mudo = !config.audio.mudo;
        if (this.howlerReady) {
            Howler.mute(config.audio.mudo); 
        }
        window.speechSynthesis.cancel(); 
        console.log(`Áudio ${config.audio.mudo ? 'mudo' : 'ativado'}`);
        return config.audio.mudo;
    }
};

// EXPOR O audioSystem GLOBALMENTE ANTES DO DOMContentLoaded
// Isso é CRÍTICO para que outros scripts possam acessá-lo imediatamente.
window.audioSystem = audioSystem;

// Agora, inicialize audioSystem quando o DOM estiver completamente carregado.
document.addEventListener('DOMContentLoaded', function() {
    // A flag audioSystem.howlerReady será definida por typeof Howl.
    // howler.min.js DEVE ser carregado VIA <script> TAG NO HTML, ANTES DE audio.js.
    if (typeof Howl !== 'undefined') {
        audioSystem.howlerReady = true;
    } else {
        console.warn('Howler.js não foi carregado via HTML. Funções de áudio baseadas em Howler.js não funcionarão.');
        audioSystem.howlerReady = false;
    }
    audioSystem.init(); // Inicializa o sistema de áudio
});