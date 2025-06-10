// Script específico para a área de Português
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de Português
    if (document.getElementById('jogo-portugues-multipla-escolha') || document.getElementById('escrita-container')) {
        console.log('Inicializando área de Português...');
        inicializarModosPortugues();
    }
});

// Variáveis globais para o jogo de Português
let frasesPortuguesMultiplaEscolha = [];
let palavrasPortuguesEscrita = [];
let desafioAtualPortugues = null;
let indiceAtualPortugues = 0;
let pontuacaoPortugues = 0;
let totalAcertosPortugues = 0;
const totalDesafiosPortugues = 50; // Definindo o total de desafios para 50
let modoJogoAtual = 'multipla-escolha'; // 'multipla-escolha' ou 'escrita'
let dificuldadeAtualPortugues = 'easy'; // Padrão

// Elementos HTML
const jogoMultiplaEscolhaContainer = document.getElementById('jogo-portugues-multipla-escolha');
const escritaContainer = document.getElementById('escrita-container');
const btnMultiplaEscolha = document.getElementById('btn-multipla-escolha');
const btnEscrita = document.getElementById('btn-escrita');

// Função para inicializar os modos de jogo
function inicializarModosPortugues() {
    btnMultiplaEscolha.addEventListener('click', () => {
        audioSystem.play('click');
        alternarModoJogo('multipla-escolha');
    });

    btnEscrita.addEventListener('click', () => {
        audioSystem.play('click');
        alternarModoJogo('escrita');
    });

    // Iniciar com o modo padrão
    alternarModoJogo('multipla-escolha');
}

// Função para alternar entre os modos de jogo
function alternarModoJogo(modo) {
    modoJogoAtual = modo;
    console.log(`Alterando para o modo: ${modoJogoAtual}`);

    // Atualizar classes dos botões de modo
    btnMultiplaEscolha.classList.remove('modo-ativo');
    btnEscrita.classList.remove('modo-ativo');
    if (modo === 'multipla-escolha') {
        btnMultiplaEscolha.classList.add('modo-ativo');
        jogoMultiplaEscolhaContainer.style.display = 'block';
        escritaContainer.style.display = 'none';
        iniciarJogoPortuguesMultiplaEscolha();
    } else {
        btnEscrita.classList.add('modo-ativo');
        jogoMultiplaEscolhaContainer.style.display = 'none';
        escritaContainer.style.display = 'block';
        iniciarJogoPortuguesEscrita();
    }

    // Registrar no log
    if (window.registrarLog) {
        registrarLog('portugues', 'alternar_modo', { modo_novo: modoJogoAtual });
    }
}

// Função principal para iniciar o jogo de Português (Múltipla Escolha)
function iniciarJogoPortuguesMultiplaEscolha() {
    jogoMultiplaEscolhaContainer.innerHTML = '<p>Carregando desafios de Português (Múltipla Escolha)...</p>';

    try {
        dificuldadeAtualPortugues = config.carregarDificuldade();

        // **CRÍTICO: Verifica se frasesPortuguesData existe antes de usar**
        if (typeof frasesPortuguesData === 'undefined' || !frasesPortuguesData || !frasesPortuguesData.easy) {
             throw new Error("'frasesPortuguesData' não foi carregado corretamente ou está vazio em 'data_portugues.js'.");
        }

        let frasesDisponiveis = [];
        // Filtra por dificuldade de forma mais abrangente para ter pool suficiente
        if (dificuldadeAtualPortugues === 'easy') {
            frasesDisponiveis = frasesPortuguesData.easy;
        } else if (dificuldadeAtualPortugues === 'medium') {
            frasesDisponiveis = frasesPortuguesData.easy.concat(frasesPortuguesData.medium);
        } else { // hard
            frasesDisponiveis = frasesPortuguesData.easy.concat(frasesPortuguesData.medium).concat(frasesPortuguesData.hard);
        }

        // Embaralhar e selecionar os 50 primeiros desafios
        frasesPortuguesMultiplaEscolha = embaralharArray(frasesDisponiveis).slice(0, totalDesafiosPortugues);

        if (frasesPortuguesMultiplaEscolha.length === 0) {
            throw new Error("Nenhum desafio de múltipla escolha encontrado para a dificuldade selecionada. Verifique 'data_portugues.js'.");
        }

        console.log(`Desafios de Português (Múltipla Escolha) carregados: ${frasesPortuguesMultiplaEscolha.length} para a dificuldade ${dificuldadeAtualPortugues}`);

        indiceAtualPortugues = 0;
        pontuacaoPortugues = 0;
        totalAcertosPortugues = 0;
        mostrarProximaFraseMultiplaEscolha();

    } catch (erro) {
        console.error('Erro ao carregar os desafios de Português (Múltipla Escolha):', erro);
        jogoMultiplaEscolhaContainer.innerHTML = `
            <div class="erro-container">
                <p>Ocorreu um erro ao carregar os desafios de Português (Múltipla Escolha). Tente novamente.</p>
                <p class="erro-detalhe">Detalhes: ${erro.message}</p>
                <button class="botao-tentar" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
        if (window.registrarLog) {
            registrarLog('portugues', 'erro_inicializacao_multipla_escolha', { erro: erro.message });
        }
    }
}

// Função para mostrar a próxima frase/desafio (Múltipla Escolha)
function mostrarProximaFraseMultiplaEscolha() {
    if (indiceAtualPortugues >= totalDesafiosPortugues) {
        console.log('Todos os desafios de Português (Múltipla Escolha) foram completados');
        mostrarTelaFinalPortugues('multipla-escolha');
        return;
    }

    desafioAtualPortugues = frasesPortuguesMultiplaEscolha[indiceAtualPortugues];
    console.log(`Mostrando desafio ${indiceAtualPortugues + 1}/${totalDesafiosPortugues}: "${desafioAtualPortugues.frase}"`);

    let html = `
        <div class="desafio-container">
            <div class="progresso-container">
                <div class="progresso-texto">Desafio ${indiceAtualPortugues + 1} de ${totalDesafiosPortugues}</div>
                <div class="progresso-barra">
                    <div class="progresso-preenchimento" style="width: ${((indiceAtualPortugues + 1) / totalDesafiosPortugues) * 100}%"></div>
                </div>
            </div>
            
            <p class="frase-destaque">
                ${desafioAtualPortugues.frase.replace(new RegExp(desafioAtualPortugues.destaque, 'gi'), `<span class="destaque-palavra">${desafioAtualPortugues.destaque}</span>`)}
            </p>
            <p class="instrucao">Qual a classe gramatical da palavra destacada?</p>
            <div class="opcoes-portugues">
    `;

    // Embaralhar as opções da frase atual
    const opcoesEmbaralhadas = embaralharArray([...desafioAtualPortugues.opcoes]);

    opcoesEmbaralhadas.forEach(opcao => {
        html += `
            <button class="botao-portugues" data-classe="${opcao}">${opcao}</button>
        `;
    });

    html += `
            </div>
            <div id="feedback-multipla-escolha" class="feedback" style="display:none;"></div>
            <div class="botoes-acao-multipla-escolha">
                <button id="botao-dica-multipla" class="botao-dica"><span>💡</span> Mostrar Dica</button>
                <button id="botao-ouvir-frase-multipla" class="botao-audio"><span>🔊</span> Ouvir Frase</button>
            </div>
        </div>
    `;

    jogoMultiplaEscolhaContainer.innerHTML = html;

    // Falar a frase para acessibilidade
    if (window.audioSystem) {
        audioSystem.speakText(desafioAtualPortugues.frase);
    }

    // Adicionar eventos aos botões de opção
    document.querySelectorAll('.botao-portugues').forEach(botao => {
        botao.addEventListener('click', function() {
            audioSystem.play('click'); // Som de clique ao selecionar opção
            verificarRespostaPortuguesMultiplaEscolha(this.dataset.classe);
        });
    });

    // Adicionar evento ao botão de dica
    document.getElementById('botao-dica-multipla').addEventListener('click', function() {
        const feedbackElem = document.getElementById('feedback-multipla-escolha');
        feedbackElem.style.display = 'flex'; // Exibe o feedback
        feedbackElem.className = 'feedback feedback-dica';

        const dicaTexto = definicoesClassesGramaticais[desafioAtualPortugues.classe];
        feedbackElem.innerHTML = `<p><strong>Dica:</strong> ${dicaTexto}</p>`;
        this.style.display = 'none'; // Esconde o botão de dica

        if (window.audioSystem) {
            audioSystem.speakText(`Dica: ${dicaTexto}`);
        }
        if (window.registrarLog) {
            registrarLog('portugues', 'solicitar_dica_multipla_escolha', {
                frase: desafioAtualPortugues.frase,
                palavra: desafioAtualPortugues.palavra,
                classe_correta: desafioAtualPortugues.classe
            });
        }
    });

    // Evento para ouvir a frase novamente
    document.getElementById('botao-ouvir-frase-multipla').addEventListener('click', function() {
        if (window.audioSystem) {
            audioSystem.speakText(desafioAtualPortugues.frase);
            audioSystem.play('click'); // Som de clique ao ouvir novamente
        }
        if (window.registrarLog) {
            registrarLog('portugues', 'repetir_frase', {
                frase: desafioAtualPortugues.frase
            });
        }
    });

    if (window.registrarLog) {
        registrarLog('portugues', 'mostrar_desafio_multipla_escolha', {
            frase: desafioAtualPortugues.frase,
            palavra: desafioAtualPortugues.palavra,
            indice: indiceAtualPortugues + 1,
            dificuldade: dificuldadeAtualPortugues
        });
    }
}

// Função para verificar a resposta de Português (Múltipla Escolha)
function verificarRespostaPortuguesMultiplaEscolha(respostaUsuario) {
    const acertou = (respostaUsuario === desafioAtualPortugues.classe);

    // Desabilitar botões de opção e ação
    document.querySelectorAll('.botao-portugues').forEach(btn => btn.disabled = true);
    document.getElementById('botao-dica-multipla').disabled = true;
    document.getElementById('botao-ouvir-frase-multipla').disabled = true;

    const feedbackElem = document.getElementById('feedback-multipla-escolha');
    feedbackElem.style.display = 'flex'; // Garante que o feedback esteja visível


    if (acertou) {
        console.log('Resposta CORRETA (Múltipla Escolha)!');
        totalAcertosPortugues++;
        pontuacaoPortugues += 10;

        if (window.audioSystem) {
            audioSystem.play('correct');
        }

        feedbackElem.className = 'feedback feedback-correto';
        feedbackElem.innerHTML = `<h2>Correto! 🎉</h2>
                                  <p>A palavra "${desafioAtualPortugues.palavra}" é um(a) <span class="destaque-acerto">${desafioAtualPortugues.classe}</span>.</p>
                                  <button id="botao-continuar-multipla" class="botao-continuar">Continuar</button>`;
        
        if (window.audioSystem) {
            audioSystem.speakText(`Correto! A palavra ${desafioAtualPortugues.palavra} é um a ${desafioAtualPortugues.classe}.`);
        }
        if (window.registrarLog) {
            registrarLog('portugues', 'resposta_correta_multipla_escolha', {
                frase: desafioAtualPortugues.frase,
                palavra: desafioAtualPortugues.palavra,
                classe_correta: desafioAtualPortugues.classe,
                pontuacao: pontuacaoPortugues,
                dificuldade: dificuldadeAtualPortugues
            });
        }

    } else {
        console.log(`Resposta INCORRETA (Múltipla Escolha). Esperado: ${desafioAtualPortugues.classe}, Recebido: ${respostaUsuario}`);

        if (window.audioSystem) {
            audioSystem.play('wrong');
        }

        feedbackElem.className = 'feedback feedback-incorreto';
        feedbackElem.innerHTML = `<h2>Ops! Tente novamente 🤔</h2>
                                  <p>A palavra "${desafioAtualPortugues.palavra}" é um(a) <span class="destaque-acerto">${desafioAtualPortugues.classe}</span>.</p>
                                  <button id="botao-continuar-multipla" class="botao-continuar">Continuar</button>`;
        
        if (window.audioSystem) {
            audioSystem.speakText(`Ops! A palavra ${desafioAtualPortugues.palavra} é um a ${desafioAtualPortugues.classe}.`);
        }
        if (window.registrarLog) {
            registrarLog('portugues', 'resposta_incorreta_multipla_escolha', {
                frase: desafioAtualPortugues.frase,
                palavra: desafioAtualPortugues.palavra,
                classe_correta: desafioAtualPortugues.classe,
                resposta_usuario: respostaUsuario,
                dificuldade: dificuldadeAtualPortugues
            });
        }
    }

    document.getElementById('botao-continuar-multipla').addEventListener('click', function() {
        audioSystem.play('click');
        indiceAtualPortugues++;
        mostrarProximaFraseMultiplaEscolha();
    });
}

// --- Funções para o Modo Escrita ---
let tentativasEscrita = 0;
let palavraAtualEscrita = null;

function iniciarJogoPortuguesEscrita() {
    // Re-renderiza o container de escrita para limpar estados anteriores
    escritaContainer.innerHTML = `
        <div class="progresso-container">
            <div class="progresso-texto" id="progresso-escrita-texto">Desafio 1 de ${totalDesafiosPortugues}</div>
            <div class="progresso-barra">
                <div class="progresso-preenchimento" id="progresso-escrita-preenchimento" style="width: 0%"></div>
            </div>
        </div>
        <div class="escrita-imagem-container">
            <img id="escrita-imagem" src="assets/images/placeholder.png" alt="Imagem da palavra" class="escrita-imagem">
        </div>
        <div class="escrita-input-container">
            <input type="text" id="escrita-input" placeholder="Digite a palavra..." autocomplete="off">
            <button id="escrita-verificar" class="botao-verificar">Verificar</button>
        </div>
        <div class="escrita-botoes">
            <button id="escrita-dica" class="botao-dica"><span>💡</span> Mostrar Dica</button>
            <button id="escrita-ouvir" class="botao-audio"><span>🔊</span> Ouvir Palavra</button>
        </div>
        <div id="escrita-feedback" class="feedback"></div>
        <div id="escrita-tentativas" class="tentativas"></div>
    `;

    try {
        dificuldadeAtualPortugues = config.carregarDificuldade();
        
        // **CRÍTICO: Verifica se palavrasEscritaData existe antes de usar**
        if (typeof palavrasEscritaData === 'undefined' || !palavrasEscritaData || !palavrasEscritaData.easy) {
             throw new Error("'palavrasEscritaData' não foi carregado corretamente ou está vazio em 'data_portugues.js'.");
        }

        let palavrasDisponiveis;
        if (dificuldadeAtualPortugues === 'easy') {
            palavrasDisponiveis = palavrasEscritaData.easy;
        } else if (dificuldadeAtualPortugues === 'medium') {
            palavrasDisponiveis = palavrasEscritaData.easy.concat(palavrasEscritaData.medium);
        } else { // hard
            palavrasDisponiveis = palavrasEscritaData.easy.concat(palavrasEscritaData.medium).concat(palavrasEscritaData.hard);
        }

        // Embaralhar e selecionar os 50 primeiros desafios
        palavrasPortuguesEscrita = embaralharArray(palavrasDisponiveis).slice(0, totalDesafiosPortugues);

        if (palavrasPortuguesEscrita.length === 0) {
            throw new Error("Nenhum desafio de escrita encontrado para a dificuldade selecionada. Verifique 'data_portugues.js'.");
        }

        console.log(`Desafios de Português (Escrita) carregados: ${palavrasPortuguesEscrita.length} para a dificuldade ${dificuldadeAtualPortugues}`);

        indiceAtualPortugues = 0;
        pontuacaoPortugues = 0;
        totalAcertosPortugues = 0;
        mostrarProximaPalavraEscrita();

        document.getElementById('escrita-verificar').addEventListener('click', () => {
            audioSystem.play('click');
            verificarRespostaEscrita();
        });
        document.getElementById('escrita-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                audioSystem.play('click');
                verificarRespostaEscrita();
            }
        });
        document.getElementById('escrita-dica').addEventListener('click', () => {
            audioSystem.play('click');
            mostrarDicaEscrita();
        });
        document.getElementById('escrita-ouvir').addEventListener('click', () => {
            audioSystem.play('click');
            ouvirPalavraEscrita();
        });

    } catch (erro) {
        console.error('Erro ao carregar os desafios de Português (Escrita):', erro);
        escritaContainer.innerHTML = `
            <div class="erro-container">
                <p>Ocorreu um erro ao carregar os desafios de Português (Escrita). Verifique 'data_portugues.js' e as imagens.</p>
                <p class="erro-detalhe">Detalhes: ${erro.message}</p>
                <button class="botao-tentar" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
        if (window.registrarLog) {
            registrarLog('portugues', 'erro_inicializacao_escrita', { erro: erro.message });
        }
    }
}

function mostrarProximaPalavraEscrita() {
    if (indiceAtualPortugues >= totalDesafiosPortugues) {
        console.log('Todos os desafios de Português (Escrita) foram completados');
        mostrarTelaFinalPortugues('escrita');
        return;
    }

    palavraAtualEscrita = palavrasPortuguesEscrita[indiceAtualPortugues];
    tentativasEscrita = 0; // Resetar tentativas para a nova palavra

    document.getElementById('escrita-imagem').src = palavraAtualEscrita.imagem;
    document.getElementById('escrita-imagem').alt = `Imagem para a palavra: ${palavraAtualEscrita.palavra}`;
    document.getElementById('escrita-input').value = '';
    document.getElementById('escrita-input').focus();
    
    // Esconder feedback e tentativas até que a resposta seja dada
    document.getElementById('escrita-feedback').style.display = 'none';
    document.getElementById('escrita-feedback').innerHTML = '';
    document.getElementById('escrita-tentativas').innerHTML = '';

    // Reativar e exibir botões de dica e ouvir
    const escritaDicaBtn = document.getElementById('escrita-dica');
    const escritaOuvirBtn = document.getElementById('escrita-ouvir');
    const escritaVerificarBtn = document.getElementById('escrita-verificar');

    escritaDicaBtn.style.display = 'inline-flex';
    escritaOuvirBtn.style.display = 'inline-flex';
    escritaVerificarBtn.disabled = false;


    // Atualizar progresso
    document.getElementById('progresso-escrita-texto').textContent = `Desafio ${indiceAtualPortugues + 1} de ${totalDesafiosPortugues}`;
    document.getElementById('progresso-escrita-preenchimento').style.width = `${((indiceAtualPortugues + 1) / totalDesafiosPortugues) * 100}%`;

    console.log(`Mostrando desafio de escrita ${indiceAtualPortugues + 1}/${totalDesafiosPortugues}: "${palavraAtualEscrita.palavra}"`);
    ouvirPalavraEscrita(); // Pronuncia a palavra ao carregar

    if (window.registrarLog) {
        registrarLog('portugues', 'mostrar_desafio_escrita', {
            palavra: palavraAtualEscrita.palavra,
            indice: indiceAtualPortugues + 1,
            dificuldade: dificuldadeAtualPortugues
        });
    }
}

function verificarRespostaEscrita() {
    const inputElement = document.getElementById('escrita-input');
    const feedbackElement = document.getElementById('escrita-feedback');
    const tentativasElement = document.getElementById('escrita-tentativas');
    const respostaUsuario = inputElement.value.trim().toLowerCase();
    const respostaCorreta = palavraAtualEscrita.palavra.toLowerCase();

    feedbackElement.style.display = 'flex';

    if (respostaUsuario === respostaCorreta) {
        console.log('Resposta CORRETA (Escrita)!');
        totalAcertosPortugues++;
        pontuacaoPortugues += 20; // Pontuação maior para escrita
        if (window.audioSystem) {
            audioSystem.play('correct');
        }
        feedbackElement.className = 'feedback feedback-correto';
        feedbackElement.innerHTML = `<h2>Correto! 🎉</h2><p>A palavra é "<span class="destaque-acerto">${palavraAtualEscrita.palavra}</span>".</p><button id="botao-proxima-escrita" class="botao-continuar">Próxima</button>`;
        if (window.audioSystem) {
            audioSystem.speakText(`Correto! A palavra é ${palavraAtualEscrita.palavra}.`);
        }
        if (window.registrarLog) {
            registrarLog('portugues', 'resposta_correta_escrita', {
                palavra: palavraAtualEscrita.palavra,
                tentativas: tentativasEscrita,
                pontuacao: pontuacaoPortugues,
                dificuldade: dificuldadeAtualPortugues
            });
        }
        // Desabilitar input e botão de verificar
        inputElement.disabled = true;
        document.getElementById('escrita-verificar').disabled = true;
        document.getElementById('escrita-dica').disabled = true;
        document.getElementById('escrita-ouvir').disabled = true;


        document.getElementById('botao-proxima-escrita').addEventListener('click', () => {
            audioSystem.play('click');
            indiceAtualPortugues++;
            inputElement.disabled = false; // Reativar para o próximo desafio
            document.getElementById('escrita-verificar').disabled = false;
            document.getElementById('escrita-dica').disabled = false;
            document.getElementById('escrita-ouvir').disabled = false;
            mostrarProximaPalavraEscrita();
        });
    } else {
        tentativasEscrita++;
        if (tentativasEscrita < 3) { // Permite 3 tentativas
            console.log(`Resposta INCORRETA (Escrita). Tentativa ${tentativasEscrita}`);
            if (window.audioSystem) {
                audioSystem.play('wrong');
            }
            feedbackElement.className = 'feedback feedback-incorreto';
            feedbackElement.innerHTML = `<h2>Ops! Tente novamente 🤔</h2>`;
            tentativasElement.textContent = `Tentativas: ${tentativasEscrita}`;
            inputElement.value = '';
            inputElement.focus();
            if (window.audioSystem) {
                audioSystem.speakText(`Ops! Tente novamente.`);
            }
            if (window.registrarLog) {
                registrarLog('portugues', 'resposta_incorreta_escrita', {
                    palavra: palavraAtualEscrita.palavra,
                    resposta_usuario: respostaUsuario,
                    tentativa: tentativasEscrita,
                    dificuldade: dificuldadeAtualPortugues
                });
            }
        } else {
            console.log('Todas as tentativas esgotadas (Escrita).');
            if (window.audioSystem) {
                audioSystem.play('wrong');
            }
            feedbackElement.className = 'feedback feedback-incorreto';
            feedbackElement.innerHTML = `<h2>Game Over para esta palavra! 🙁</h2><p>A palavra correta era: <span class="destaque-acerto">${palavraAtualEscrita.palavra}</span></p><button id="botao-proxima-escrita" class="botao-continuar">Próxima</button>`;
            tentativasElement.textContent = '';
            if (window.audioSystem) {
                audioSystem.speakText(`A palavra correta era ${palavraAtualEscrita.palavra}.`);
            }
            if (window.registrarLog) {
                registrarLog('portugues', 'tentativas_esgotadas_escrita', {
                    palavra: palavraAtualEscrita.palavra,
                    resposta_usuario: respostaUsuario,
                    dificuldade: dificuldadeAtualPortugues
                });
            }
            // Desabilitar input e botão de verificar
            inputElement.disabled = true;
            document.getElementById('escrita-verificar').disabled = true;
            document.getElementById('escrita-dica').disabled = true;
            document.getElementById('escrita-ouvir').disabled = true;

            document.getElementById('botao-proxima-escrita').addEventListener('click', () => {
                audioSystem.play('click');
                indiceAtualPortugues++;
                inputElement.disabled = false; // Reativar para o próximo desafio
                document.getElementById('escrita-verificar').disabled = false;
                document.getElementById('escrita-dica').disabled = false;
                document.getElementById('escrita-ouvir').disabled = false;
                mostrarProximaPalavraEscrita();
            });
        }
    }
}

function mostrarDicaEscrita() {
    const feedbackElement = document.getElementById('escrita-feedback');
    feedbackElement.style.display = 'flex';
    feedbackElement.className = 'feedback feedback-dica';
    feedbackElement.innerHTML = `<p><strong>Dica:</strong> ${palavraAtualEscrita.dica}</p>`;
    if (window.audioSystem) {
        audioSystem.speakText(`Dica: ${palavraAtualEscrita.dica}`);
    }
    if (window.registrarLog) {
        registrarLog('portugues', 'solicitar_dica_escrita', {
            palavra: palavraAtualEscrita.palavra,
            dificuldade: dificuldadeAtualPortugues
        });
    }
}

function ouvirPalavraEscrita() {
    if (window.audioSystem && palavraAtualEscrita.pronuncia) {
        audioSystem.speakText(palavraAtualEscrita.pronuncia);
        if (window.registrarLog) {
            registrarLog('portugues', 'ouvir_palavra_escrita', {
                palavra: palavraAtualEscrita.palavra,
                dificuldade: dificuldadeAtualPortugues
            });
        }
    } else if (window.audioSystem && palavraAtualEscrita.palavra) {
         // Fallback para falar a própria palavra se 'pronuncia' não estiver definida
        audioSystem.speakText(palavraAtualEscrita.palavra);
        if (window.registrarLog) {
            registrarLog('portugues', 'ouvir_palavra_escrita_fallback', {
                palavra: palavraAtualEscrita.palavra,
                dificuldade: dificuldadeAtualPortugues
            });
        }
    }
}

// Função para mostrar a tela final de Português (para ambos os modos)
function mostrarTelaFinalPortugues(modo) {
    let container = modo === 'multipla-escolha' ? jogoMultiplaEscolhaContainer : escritaContainer;

    // Salvar pontuação no localStorage
    try {
        const highScoreKey = `highScorePortugues_${modo}`;
        const highScore = localStorage.getItem(highScoreKey) || 0;
        if (pontuacaoPortugues > highScore) {
            localStorage.setItem(highScoreKey, pontuacaoPortugues);
            console.log(`Novo recorde em Português (${modo}): ${pontuacaoPortugues}`);
        }
    } catch (e) {
        console.warn(`Não foi possível salvar a pontuação de Português (${modo}):`, e);
    }

    container.innerHTML = `
        <div class="tela-final">
            <h2>Parabéns! 🏆</h2>
            <p>Você completou todos os desafios de Português (${modo === 'multipla-escolha' ? 'Múltipla Escolha' : 'Escrita'})!</p>
            <p class="pontuacao-final">Pontuação final: ${pontuacaoPortugues}</p>
            <p>Acertos: ${totalAcertosPortugues} de ${totalDesafiosPortugues}</p>
            <button id="botao-reiniciar-port" class="botao-reiniciar">Jogar Novamente</button>
            <a href="index.html" class="botao-voltar-inicio">Voltar ao Início</a>
        </div>
    `;

    if (window.audioSystem) {
        audioSystem.speakText(`Parabéns! Você completou todos os desafios de Português! Pontuação final: ${pontuacaoPortugues}. Acertos: ${totalAcertosPortugues} de ${totalDesafiosPortugues}.`);
    }

    document.getElementById('botao-reiniciar-port').addEventListener('click', function() {
        audioSystem.play('click');
        if (modo === 'multipla-escolha') {
            iniciarJogoPortuguesMultiplaEscolha();
        } else {
            iniciarJogoPortuguesEscrita();
        }
    });

    document.querySelector('.botao-voltar-inicio').addEventListener('click', () => {
        audioSystem.play('click');
    });

    if (window.registrarLog) {
        registrarLog('portugues', 'completar_jogo', {
            modo: modo,
            dificuldade: dificuldadeAtualPortugues,
            pontuacao: pontuacaoPortugues,
            acertos: totalAcertosPortugues,
            total_desafios: totalDesafiosPortugues
        });
    }
}

// A função embaralharArray de config.js é usada aqui.
// Não é necessário definir novamente.