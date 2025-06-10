// Script específico para o módulo de Matemática
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('jogo-matematica')) {
        console.log('Inicializando módulo de Matemática...');
        iniciarJogoMatematica();
    }
});

// =======================
// Variáveis globais
// =======================
let desafiosMatematica      = [];
let desafioAtualMatematica  = null;
let indiceAtualMatematica   = 0;
let pontuacaoMatematica     = 0;
let totalAcertosMatematica  = 0;
const totalDesafiosMatematica = 50;

// =======================
// Inicialização do jogo
// =======================
function iniciarJogoMatematica() {
    const jogoContainer = document.getElementById('jogo-matematica');
    jogoContainer.innerHTML = '<p>Carregando desafios de Matemática...</p>';

    try {
        const dificuldade = config.carregarDificuldade();
        let desafiosDisponiveis;

        if (typeof desafiosMatematicaData === 'undefined' || !desafiosMatematicaData || !desafiosMatematicaData.easy) {
             throw new Error("'desafiosMatematicaData' não foi carregado corretamente ou está vazio em 'data_matematica.js'.");
        }

        switch (dificuldade) {
            case 'easy':
                desafiosDisponiveis = desafiosMatematicaData.easy;
                break;
            case 'medium':
                desafiosDisponiveis = [
                    ...desafiosMatematicaData.easy,
                    ...desafiosMatematicaData.medium
                ];
                break;
            default: // hard
                desafiosDisponiveis = [
                    ...desafiosMatematicaData.easy,
                    ...desafiosMatematicaData.medium,
                    ...desafiosMatematicaData.hard
                ];
        }

        desafiosMatematica = embaralharArray(desafiosDisponiveis).slice(0, totalDesafiosMatematica);

        if (!desafiosMatematica.length) {
            throw new Error('Nenhum desafio de matemática encontrado para a dificuldade selecionada. Verifique data_matematica.js');
        }

        console.log(`Desafios carregados: ${desafiosMatematica.length} (dificuldade: ${dificuldade})`);

        indiceAtualMatematica  = 0;
        pontuacaoMatematica    = 0;
        totalAcertosMatematica = 0;

        mostrarProximoDesafioMatematica();
    } catch (erro) {
        console.error('Erro ao carregar desafios de Matemática:', erro);
        jogoContainer.innerHTML = `
            <div class="erro-container">
                <p>Ocorreu um erro ao carregar os desafios de Matemática. Tente novamente.</p>
                <p class="erro-detalhe">Detalhes: ${erro.message}</p>
                <button class="botao-tentar" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
        if (window.registrarLog) {
            registrarLog('matematica', 'erro_inicializacao', { erro: erro.message });
        }
    }
}

// =======================
// Exibição de desafios
// =======================
function mostrarProximoDesafioMatematica() {
    if (indiceAtualMatematica >= totalDesafiosMatematica) {
        console.log('Todos os desafios de Matemática foram completados.');
        mostrarTelaFinalMatematica();
        return;
    }

    desafioAtualMatematica = desafiosMatematica[indiceAtualMatematica];
    console.log(
        `Mostrando desafio ${indiceAtualMatematica + 1}/${totalDesafiosMatematica}: "${desafioAtualMatematica.pergunta}"`
    );

    const jogoContainer = document.getElementById('jogo-matematica');

    // HTML principal do desafio
    let html = `
        <div class="desafio-container">
            <div class="progresso-container">
                <div class="progresso-texto">
                    Desafio ${indiceAtualMatematica + 1} de ${totalDesafiosMatematica}
                </div>
                <div class="progresso-barra">
                    <div class="progresso-preenchimento" style="width: ${
                        ((indiceAtualMatematica + 1) / totalDesafiosMatematica) * 100
                    }%"></div>
                </div>
            </div>

            <p class="pergunta">${desafioAtualMatematica.pergunta}</p>

            ${
                // Renderiza imagem se houver
                desafioAtualMatematica.imagem
                    ? `<div class="imagem-container-mat">
                           <img src="${desafioAtualMatematica.imagem}"
                                alt="Ilustração para ${desafioAtualMatematica.operacao}"
                                class="imagem-operacao">
                       </div>`
                    : ''
            }

            <div class="opcoes-matematica">
    `;

    // Opções de resposta
    const opcoes = embaralharArray([...desafioAtualMatematica.opcoes]);
    opcoes.forEach((op) => {
        html += `<button class="botao-matematica" data-resposta="${op}">${op}</button>`;
    });

    html += `
            </div>

            <div id="feedback-matematica" class="feedback" style="display:none;"></div>
            
            <div class="botoes-acao-matematica">
                <button id="botao-dica-mat" class="botao-dica"><span>💡</span> Mostrar Dica</button>
                <button id="botao-ouvir-pergunta-mat" class="botao-audio"><span>🔊</span> Ouvir Pergunta</button>
            </div>
        </div>
    `;

    jogoContainer.innerHTML = html;

    // Leitura em voz alta
    if (window.audioSystem) {
        // CORREÇÃO AQUI: Formata a pergunta para o TTS entender operações
        let perguntaParaTTS = desafioAtualMatematica.pergunta;
        if (desafioAtualMatematica.operacao === 'subtracao') {
            perguntaParaTTS = perguntaParaTTS.replace('-', ' menos ');
        } else if (desafioAtualMatematica.operacao === 'multiplicacao') {
            perguntaParaTTS = perguntaParaTTS.replace('×', ' vezes ');
        } else if (desafioAtualMatematica.operacao === 'divisao') {
            perguntaParaTTS = perguntaParaTTS.replace('÷', ' dividido por ');
        }
        audioSystem.speakText(perguntaParaTTS);
    }

    // Eventos das opções
    document.querySelectorAll('.botao-matematica').forEach((btn) => {
        btn.addEventListener('click', () => {
            audioSystem.play('click'); // Som de clique ao selecionar opção
            verificarRespostaMatematica(parseInt(btn.dataset.resposta, 10));
        });
    });

    // Evento de dica
    document.getElementById('botao-dica-mat').addEventListener('click', function () {
        const feedbackElem = document.getElementById('feedback-matematica');
        feedbackElem.style.display = 'flex'; // Exibe o feedback
        feedbackElem.className = 'feedback feedback-dica';
        feedbackElem.innerHTML = `<p><strong>Dica:</strong> ${desafioAtualMatematica.dica}</p>`;
        this.style.display = 'none'; // Esconde o botão de dica

        if (window.audioSystem && desafioAtualMatematica.dica) {
            audioSystem.speakText(`Dica: ${desafioAtualMatematica.dica}`);
        }
        if (window.registrarLog) {
            registrarLog('matematica', 'solicitar_dica', {
                pergunta: desafioAtualMatematica.pergunta,
                dica: desafioAtualMatematica.dica
            });
        }
    });

    // Evento para ouvir a pergunta novamente
    document.getElementById('botao-ouvir-pergunta-mat').addEventListener('click', function() {
        if (window.audioSystem) {
            // CORREÇÃO AQUI: Formata a pergunta para o TTS entender operações
            let perguntaParaTTS = desafioAtualMatematica.pergunta;
            if (desafioAtualMatematica.operacao === 'subtracao') {
                perguntaParaTTS = perguntaParaTTS.replace('-', ' menos ');
            } else if (desafioAtualMatematica.operacao === 'multiplicacao') {
                perguntaParaTTS = perguntaParaTTS.replace('×', ' vezes ');
            } else if (desafioAtualMatematica.operacao === 'divisao') {
                perguntaParaTTS = perguntaParaTTS.replace('÷', ' dividido por ');
            }
            audioSystem.speakText(perguntaParaTTS);
            audioSystem.play('click'); // Som de clique ao ouvir novamente
        }
        if (window.registrarLog) {
            registrarLog('matematica', 'repetir_pergunta', {
                pergunta: desafioAtualMatematica.pergunta
            });
        }
    });

    if (window.registrarLog) {
        registrarLog('matematica', 'mostrar_desafio', {
            pergunta: desafioAtualMatematica.pergunta,
            indice: indiceAtualMatematica + 1,
            dificuldade: config.carregarDificuldade()
        });
    }
}

// =======================
// Verificação de resposta
// =======================
function verificarRespostaMatematica(respostaUsuario) {
    const jogoContainer   = document.getElementById('jogo-matematica');
    const respostaCorreta = desafioAtualMatematica.resposta;
    const acertou         = respostaUsuario === respostaCorreta;

    // Remove todos os botões de opção e ação para evitar múltiplos cliques
    document.querySelectorAll('.botao-matematica').forEach(btn => btn.disabled = true);
    document.getElementById('botao-dica-mat').disabled = true;
    document.getElementById('botao-ouvir-pergunta-mat').disabled = true;


    const feedbackElem = document.getElementById('feedback-matematica');
    feedbackElem.style.display = 'flex'; // Garante que o feedback esteja visível

    if (acertou) {
        totalAcertosMatematica++;
        pontuacaoMatematica += 10;
        audioSystem?.play('correct');

        feedbackElem.className = 'feedback feedback-correto';
        feedbackElem.innerHTML = `<h2>Correto! 🎉</h2>
                                  <p>A resposta para "${desafioAtualMatematica.pergunta}" é <span class="destaque-acerto">${respostaCorreta}</span>.</p>
                                  <button id="botao-continuar-mat" class="botao-continuar">Continuar</button>`;

        let feedbackText = `Correto! A resposta é ${respostaCorreta}.`;
        audioSystem?.speakText(feedbackText);
        registrarLog?.('matematica', 'resposta_correta', {
            pergunta: desafioAtualMatematica.pergunta,
            resposta: respostaCorreta,
            pontuacao: pontuacaoMatematica,
            dificuldade: config.carregarDificuldade()
        });
    } else {
        audioSystem?.play('wrong');

        feedbackElem.className = 'feedback feedback-incorreto';
        feedbackElem.innerHTML = `<h2>Ops! Tente novamente 🤔</h2>
                                  <p>A resposta correta para "${desafioAtualMatematica.pergunta}" é:
                                  <span class="destaque-acerto">${respostaCorreta}</span>
                                  </p>
                                  <button id="botao-continuar-mat" class="botao-continuar">Continuar</button>`;

        let feedbackText = `Ops! A resposta correta é ${respostaCorreta}.`;
        audioSystem?.speakText(feedbackText);
        registrarLog?.('matematica', 'resposta_incorreta', {
            pergunta: desafioAtualMatematica.pergunta,
            resposta_correta: respostaCorreta,
            resposta_usuario: respostaUsuario,
            dificuldade: config.carregarDificuldade()
        });
    }

    // ANEXAR EVENTO DE CLIQUE AO BOTÃO 'CONTINUAR' APÓS ELE SER ADICIONADO AO DOM
    // Isso é crucial para que ele funcione.
    document
        .getElementById('botao-continuar-mat')
        .addEventListener('click', () => {
            audioSystem.play('click');
            indiceAtualMatematica++;
            mostrarProximoDesafioMatematica();
        });
}

// =======================
// Tela final
// =======================
function mostrarTelaFinalMatematica() {
    const jogoContainer = document.getElementById('jogo-matematica');

    try {
        const highScore = localStorage.getItem('highScoreMatematica') || 0;
        if (pontuacaoMatematica > highScore) {
            localStorage.setItem('highScoreMatematica', pontuacaoMatematica);
            console.log(`Novo recorde em Matemática: ${pontuacaoMatematica}`);
        }
    } catch (e) {
        console.warn('Não foi possível salvar a pontuação de Matemática:', e);
    }

    jogoContainer.innerHTML = `
        <div class="tela-final">
            <h2>Parabéns! 🏆</h2>
            <p>Você completou todos os desafios de Matemática!</p>
            <p class="pontuacao-final">Pontuação final: ${pontuacaoMatematica}</p>
            <p>Acertos: ${totalAcertosMatematica} de ${totalDesafiosMatematica}</p>
            <button id="botao-reiniciar-mat" class="botao-reiniciar">Jogar Novamente</button>
            <a href="index.html" class="botao-voltar-inicio">Voltar ao Início</a>
        </div>
    `;

    audioSystem?.speakText(
        `Parabéns! Você completou todos os desafios de Matemática! Pontuação final: ${pontuacaoMatematica}. ` +
        `Acertos: ${totalAcertosMatematica} de ${totalDesafiosMatematica}.`
    );

    document.getElementById('botao-reiniciar-mat').addEventListener('click', () => {
        audioSystem.play('click');
        iniciarJogoMatematica();
    });

    document.querySelector('.botao-voltar-inicio').addEventListener('click', () => {
        audioSystem.play('click');
    });


    registrarLog?.('matematica', 'completar_jogo', {
        pontuacao       : pontuacaoMatematica,
        acertos         : totalAcertosMatematica,
        total_desafios  : totalDesafiosMatematica,
        dificuldade: config.carregarDificuldade()
    });
}

// A função embaralharArray de config.js é usada aqui.
// Não é necessário definir novamente.