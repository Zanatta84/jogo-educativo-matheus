// Configurações globais do jogo
const config = {
    // Dificuldade padrão
    dificuldadePadrao: 'easy',
    
    // Função para carregar a dificuldade atual
    carregarDificuldade: function() {
        try {
            const dificuldadeSalva = localStorage.getItem('dificuldade');
            console.log(`Dificuldade carregada: ${dificuldadeSalva || this.dificuldadePadrao}`);
            return dificuldadeSalva || this.dificuldadePadrao;
        } catch (e) {
            console.warn('Não foi possível acessar localStorage para carregar dificuldade:', e);
            return this.dificuldadePadrao;
        }
    },
    
    // Função para salvar a dificuldade
    salvarDificuldade: function(dificuldade) {
        try {
            localStorage.setItem('dificuldade', dificuldade);
            console.log(`Dificuldade salva: ${dificuldade}`);
            return true;
        } catch (e) {
            console.warn('Não foi possível salvar a dificuldade:', e);
            return false;
        }
    },
    
    // Configurações de áudio
    audio: {
        volume: 0.7,
        mudo: false,
        velocidadeFala: 1.0
    },
    
    // Configurações de acessibilidade
    acessibilidade: {
        tamanhoFonte: 'normal', // 'pequeno', 'normal', 'grande', 'muito-grande'
        altoContraste: false,
        reducaoMovimento: false
    }
    // GARANTIA: NENHUMA definicoesClassesGramaticais AQUI.
};

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página inicial e inicializar seleção de dificuldade
    const botoesArea = document.querySelector('.botoes-area');
    if (botoesArea) {
        console.log('Inicializando configurações na página inicial (seleção de dificuldade)...');
        inicializarSelecaoDificuldade();
    }
});

// Função para inicializar a seleção de dificuldade
function inicializarSelecaoDificuldade() {
    const botoesDificuldade = document.querySelectorAll('.botao-dificuldade');
    if (botoesDificuldade.length === 0) {
        console.warn('Botões de dificuldade não encontrados');
        return;
    }
    
    // Carregar a dificuldade atual
    const dificuldadeAtual = config.carregarDificuldade();
    console.log(`Dificuldade atual para inicialização: ${dificuldadeAtual}`);
    
    // Atualizar a aparência dos botões
    botoesDificuldade.forEach(botao => {
        const dificuldade = botao.dataset.dificuldade;
        
        // Marcar o botão da dificuldade atual
        if (dificuldade === dificuldadeAtual) {
            botao.classList.add('selecionado');
            botao.setAttribute('aria-pressed', 'true');
        } else {
            botao.classList.remove('selecionado');
            botao.setAttribute('aria-pressed', 'false');
        }
        
        // Adicionar evento de clique
        botao.addEventListener('click', function() {
            // Remover classe 'selecionado' de todos os botões
            botoesDificuldade.forEach(b => {
                b.classList.remove('selecionado');
                b.setAttribute('aria-pressed', 'false');
            });
            
            // Adicionar classe 'selecionado' ao botão clicado
            this.classList.add('selecionado');
            this.setAttribute('aria-pressed', 'true');
            
            // Adicionar animação de seleção
            this.classList.add('animacao-selecao');
            setTimeout(() => {
                this.classList.remove('animacao-selecao');
            }, 500);
            
            // Salvar a dificuldade
            const novaDificuldade = this.dataset.dificuldade;
            config.salvarDificuldade(novaDificuldade);
            console.log(`Dificuldade alterada para: ${novaDificuldade}`);
            
            // Registrar no log
            if (window.registrarLog) {
                registrarLog('configuracao', 'alterar_dificuldade', {
                    dificuldade_anterior: dificuldadeAtual, // Usar a dificuldade que estava antes do clique
                    dificuldade_nova: novaDificuldade
                });
            }
        });
    });
}

// Função para embaralhar um array (algoritmo Fisher-Yates) - mantida aqui por ser um utilitário geral
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}