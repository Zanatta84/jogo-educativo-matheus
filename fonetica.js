// Script específico para a área de Fonética (Desafio dos Sons)
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de Fonética
    if (document.getElementById('jogo-fonetica')) {
        console.log('Inicializando área de Fonética (Desafio dos Sons)...');
        iniciarJogoFonetica();
    }
});

// Variáveis globais para o jogo de Fonética
let desafiosFoneticaSelecionados = [];
let desafioAtual = null;
let indiceAtual = 0;
let pontuacao = 0;
let totalAcertos = 0;
const totalDesafiosPorModulo = 50; // AJUSTADO PARA 50 DESAFIOS (era 10 para testes)
let dificuldadeAtual = 'easy'; // Padrão

// Função principal para iniciar o jogo de Fonética
function iniciarJogoFonetica() {
    const jogoContainer = document.getElementById("jogo-fonetica");
    jogoContainer.innerHTML = '<p>Carregando desafio dos sons...</p>';
    
    try {
        dificuldadeAtual = config.carregarDificuldade();
        
        if (typeof desafiosFonetica === 'undefined' || !Array.isArray(desafiosFonetica)) {
            throw new Error("Variável 'desafiosFonetica' não encontrada ou não é um array. Verifique 'data_fonetica.js'.");
        }

        let desafiosFiltradosPorDificuldade;

        if (dificuldadeAtual === 'easy') {
            desafiosFiltradosPorDificuldade = desafiosFonetica.filter(d => d.dificuldade === 'easy');
        } else if (dificuldadeAtual === 'medium') {
            desafiosFiltradosPorDificuldade = desafiosFonetica.filter(d => d.dificuldade === 'easy' || d.dificuldade === 'medium');
        } else { // hard
            desafiosFiltradosPorDificuldade = desafiosFonetica; // Usa todos os desafios disponíveis
        }

        // Embaralha o pool de desafios e seleciona a quantidade definida para a rodada
        // Garante que o número de desafios não exceda o disponível após a filtragem
        desafiosFoneticaSelecionados = embaralharArray(desafiosFiltradosPorDificuldade).slice(0, totalDesafiosPorModulo);
        
        if (desafiosFoneticaSelecionados.length === 0) {
            throw new Error("Nenhum desafio encontrado para a dificuldade selecionada. Verifique 'data_fonetica.js' e a atribuição de dificuldade.");
        }

        console.log(`Desafios de Fonética carregados com sucesso: ${desafiosFoneticaSelecionados.length} desafios para a dificuldade ${dificuldadeAtual}`);
        
        indiceAtual = 0;
        pontuacao = 0;
        totalAcertos = 0;
        mostrarProximoDesafio();
        
        // Pré-carregar áudios específicos do desafio se a Howler.js estiver inicializada
        const checkHowlerReadyInterval = setInterval(() => {
            if (audioSystem.howlerReady) {
                clearInterval(checkHowlerReadyInterval);
                console.log('Howler.js pronto, iniciando pré-carregamento de áudios específicos do módulo de Fonética...');
                desafiosFoneticaSelecionados.slice(0, Math.min(10, desafiosFoneticaSelecionados.length)).forEach(desafio => {
                    const audioPath = desafio.audio;
                    if (audioPath && !audioSystem.sounds[audioPath]) {
                        audioSystem.sounds[audioPath] = new Howl({
                            src: [audioPath],
                            volume: config.audio.volume,
                            preload: false
                        });
                        audioSystem.sounds[audioPath].load();
                    }
                });
            }
        }, 100);
        

    } catch (erro) {
        console.error('Erro ao carregar os desafios de Fonética:', erro);
        jogoContainer.innerHTML = `
            <div class="erro-container">
                <p>Ocorreu um erro ao carregar os desafios. Certifique-se de que os arquivos de áudio estão na pasta correta e que a dificuldade foi atribuída no arquivo de dados.</p>
                <p class="erro-detalhe">Detalhes: ${erro.message}</p>
                <button class="botao-tentar" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
        
        if (window.registrarLog) {
            registrarLog('fonetica', 'erro_inicializacao', {
                erro: erro.message
            });
        }
    }
}

// Função para mostrar o próximo desafio
function mostrarProximoDesafio() {
    if (indiceAtual >= totalDesafiosPorModulo) {
        console.log('Todos os desafios de Fonética foram completados');
        mostrarTelaFinal();
        return;
    }
    
    desafioAtual = desafiosFoneticaSelecionados[indiceAtual];
    console.log(`Mostrando desafio ${indiceAtual + 1}/${totalDesafiosPorModulo}: "${desafioAtual.palavra}" (${desafioAtual.tipo})`);
    
    const jogoContainer = document.getElementById('jogo-fonetica');
    
    const palavraComLacuna = desafioAtual.lacuna.replace('__', '<span class="lacuna">__</span>');
    
    let html = `
        <div class="desafio-container">
            <div class="progresso-container">
                <div class="progresso-texto">Desafio ${indiceAtual + 1} de ${totalDesafiosPorModulo}</div>
                <div class="progresso-barra">
                    <div class="progresso-preenchimento" style="width: ${((indiceAtual + 1) / totalDesafiosPorModulo) * 100}%"></div>
                </div>
            </div>
            
            <div class="palavra-container">
                ${palavraComLacuna}
            </div>
            
            <div class="imagem-container">
                <img src="${desafioAtual.imagem}" alt="Imagem representando a palavra ${desafioAtual.palavra}" class="imagem-palavra">
            </div>
            
            <p class="instrucao">Complete a palavra com a opção correta:</p>
            
            <div class="opcoes-fonetica">
    `;
    
    const opcoesGeradas = gerarOpcoesParaDesafio(desafioAtual);
    
    opcoesGeradas.forEach((opcao) => {
        html += `
            <button class="botao-fonetica" data-opcao="${opcao}">
                ${opcao}
            </button>
        `;
    });
    
    html += `
            </div>
            
            <div id="feedback-fonetica" class="feedback" style="display:none;"></div>

            <div class="botoes-acao-fonetica">
                <button id="botao-dica-fonetica" class="botao-dica"><span>💡</span> Mostrar Dica</button>
                <button id="botao-repetir-audio-fonetica" class="botao-audio"><span>🔊</span> Ouvir Novamente</button>
            </div>
        </div>
    `;
    
    jogoContainer.innerHTML = html;
    
    const audioPath = desafioAtual.audio;
    if (audioPath) {
        audioSystem.play(audioPath); 
    } else {
        audioSystem.speakText(desafioAtual.palavra); 
    }
    
    // Anexar event listeners APÓS o HTML ser inserido
    document.querySelectorAll('.botao-fonetica').forEach(botao => {
        botao.addEventListener('click', function() {
            audioSystem.play('click'); 
            verificarResposta(this.dataset.opcao);
        });
    });
    
    document.getElementById('botao-dica-fonetica').addEventListener('click', function() {
        audioSystem.play('click'); 
        const feedbackElem = document.getElementById('feedback-fonetica');
        feedbackElem.style.display = 'flex'; 
        feedbackElem.className = 'feedback feedback-dica';

        const dicaTexto = gerarDicaParaTipo(desafioAtual.tipo);
        feedbackElem.innerHTML = `<p><strong>Dica:</strong> <span class="tipo-fonetico">${desafioAtual.tipo}</span> - ${dicaTexto}</p>`;
        this.style.display = 'none'; // Esconde o botão de dica
        
        audioSystem.speakText(`Dica: ${dicaTexto}`);
        
        if (window.registrarLog) {
            registrarLog('fonetica', 'solicitar_dica', {
                palavra: desafioAtual.palavra,
                tipo: desafioAtual.tipo,
                dificuldade: dificuldadeAtual
            });
        }
    });

    document.getElementById('botao-repetir-audio-fonetica').addEventListener('click', function() {
        audioSystem.play('click'); 
        if (desafioAtual) {
            console.log('Repetindo áudio da palavra atual');
            const audioPath = desafioAtual.audio;
            if (audioPath) {
                audioSystem.play(audioPath);
            } else {
                audioSystem.speakText(desafioAtual.palavra);
            }
            
            if (window.registrarLog) {
                registrarLog('fonetica', 'repetir_audio', {
                    palavra: desafioAtual.palavra,
                    tipo: desafioAtual.tipo,
                    dificuldade: dificuldadeAtual
                });
            }
        }
    });
    
    // Pré-carregar o próximo áudio para o smooth transition
    if (indiceAtual + 1 < desafiosFoneticaSelecionados.length) {
        const proximoDesafio = desafiosFoneticaSelecionados[indiceAtual + 1];
        const proximoAudioPath = proximoDesafio.audio;
        if (proximoAudioPath) {
            if (!audioSystem.sounds[proximoAudioPath]) {
                 audioSystem.sounds[proximoAudioPath] = new Howl({
                    src: [proximoAudioPath],
                    volume: config.audio.volume,
                    preload: true,
                    onload: () => console.log(`Áudio do próximo desafio carregado: ${proximoAudioPath}`)
                });
            } else {
                audioSystem.sounds[proximoAudioPath].load();
            }
            console.log(`Pré-carregando áudio para o próximo desafio: ${proximoAudioPath}`);
        }
    }


    if (window.registrarLog) {
        registrarLog('fonetica', 'mostrar_desafio', {
            palavra: desafioAtual.palavra,
            tipo: desafioAtual.tipo,
            dificuldade: dificuldadeAtual,
            indice: indiceAtual + 1
        });
    }
}

// Função para gerar opções baseadas no tipo do desafio
function gerarOpcoesParaDesafio(desafio) {
    let opcoes = [];
    let opcaoCorreta = '';
    
    const lacunaDupla = /__/;
    const lacunaSimples = /_/;

    if (desafio.tipo === 'Dígrafo' || desafio.tipo === 'Encontro Consonantal') {
        const palavraOriginal = desafio.palavra;
        const palavraComLacuna = desafio.lacuna;
        
        let match = palavraComLacuna.match(lacunaDupla);
        if (match) {
            let posicaoLacuna = match.index;
            opcaoCorreta = palavraOriginal.substring(posicaoLacuna, posicaoLacuna + 2).toLowerCase();
            opcoes.push(opcaoCorreta);
            
            const digrafosEConsonantaisComuns = [
                'ch', 'lh', 'nh', 'rr', 'ss', 'qu', 'gu', 'sc', 'xc', 'mp', 'nt', 'mb', 'ns',
                'br', 'bl', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'vr',
                'gn', 'ps', 'pt', 'ct', 'ft', 'tm', 'dv', 'bs'
            ];
            
            while (opcoes.length < 4) {
                let falsaOpcao = '';
                const disponiveis = digrafosEConsonantaisComuns.filter(opt => opt !== opcaoCorreta && !opcoes.includes(opt));
                if (disponiveis.length > 0) {
                    falsaOpcao = disponiveis[Math.floor(Math.random() * disponiveis.length)];
                } else {
                    const consoantes = 'bcdfghjklmnpqrstvwxyz';
                    for (let i = 0; i < 2; i++) {
                        falsaOpcao += consoantes.charAt(Math.floor(Math.random() * consoantes.length));
                    }
                }
                if (!opcoes.includes(falsaOpcao) && falsaOpcao !== '') {
                    opcoes.push(falsaOpcao);
                }
            }
        }
    } else if (desafio.tipo === 'Hiato') {
        const palavraOriginal = desafio.palavra;
        const palavraComLacuna = desafio.lacuna;
        
        let match = palavraComLacuna.match(lacunaSimples);
        if (match) {
            let posicaoLacuna = match.index;
            opcaoCorreta = palavraOriginal.charAt(posicaoLacuna).toLowerCase();
            opcoes.push(opcaoCorreta);
            
            const vogaisPossiveis = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú', 'ã', 'õ'];
            
            while (opcoes.length < 4) {
                const disponiveis = vogaisPossiveis.filter(v => v !== opcaoCorreta && !opcoes.includes(v));
                if (disponiveis.length > 0) {
                    opcoes.push(disponiveis[Math.floor(Math.random() * disponiveis.length)]);
                } else {
                    const vogalAleatoria = ['a', 'e', 'i', 'o', 'u'][Math.floor(Math.random() * 5)];
                    if (!opcoes.includes(vogalAleatoria)) {
                        opcoes.push(vogalAleatoria);
                    }
                }
            }
        }
    }
    
    // Garante que há 4 opções e que a correta está sempre presente
    // Adicionado uma verificação para garantir que opcaoCorreta não seja vazia antes de adicionar
    if (opcaoCorreta !== '' && !opcoes.includes(opcaoCorreta)) {
        // Se, por algum motivo, a opção correta não foi adicionada (ex: bug na geração de falsas), a
        // adiciona e remove a primeira falsa para manter 4 opções.
        if (opcoes.length === 4) {
             opcoes[Math.floor(Math.random() * 4)] = opcaoCorreta; // Substitui uma aleatória
        } else {
            opcoes.push(opcaoCorreta); // Apenas adiciona se tiver menos de 4
        }
    }
    // Preenche com aleatórias se ainda não houver 4 opções
    while (opcoes.length < 4) {
        let randomChar;
        if (desafio.tipo === 'Hiato') {
            randomChar = ['a', 'e', 'i', 'o', 'u'][Math.floor(Math.random() * 5)];
        } else {
            const consoantes = 'bcdfghjklmnpqrstvwxyz';
            randomChar = consoantes.charAt(Math.floor(Math.random() * consoantes.length)) + consoantes.charAt(Math.floor(Math.random() * consoantes.length));
        }
        if (!opcoes.includes(randomChar)) {
            opcoes.push(randomChar);
        }
    }

    return embaralharArray(opcoes);
}


// Função para gerar dica baseada no tipo do desafio
function gerarDicaParaTipo(tipo) {
    switch (tipo) {
        case 'Dígrafo':
            return 'Duas letras que juntas representam um único som. Exemplos: CH, LH, NH, RR, SS, QU, GU, SC, XC.';
        case 'Hiato':
            return 'Duas vogais em sílabas diferentes que são pronunciadas separadamente. Exemplos: sa-ú-de, po-e-ta, ri-o.';
        case 'Encontro Consonantal':
            return 'Duas ou mais consoantes juntas na mesma palavra, onde cada uma mantém seu próprio som. Exemplos: BR, PL, DR, PR, TR, GR, TL, CR.';
        default:
            return 'Observe com atenção como a palavra é pronunciada.';
    }
}

// Função para verificar a resposta
function verificarResposta(respostaUsuario) {
    const jogoContainer = document.getElementById('jogo-fonetica');
    let respostaCorreta = '';
    
    // Determinar a resposta correta com base no tipo e na palavra
    if (desafioAtual.tipo === 'Dígrafo' || desafioAtual.tipo === 'Encontro Consonantal') {
        const palavraOriginal = desafioAtual.palavra;
        const palavraComLacuna = desafioAtual.lacuna;
        
        let posicaoLacuna = palavraComLacuna.indexOf('__');
        
        if (posicaoLacuna !== -1) {
            respostaCorreta = palavraOriginal.substring(posicaoLacuna, posicaoLacuna + 2).toLowerCase();
        } else {
            // Tenta lidar com casos de lacunas de 1 ou 3 letras se a lacuna de 2 não for encontrada
            let singleUnder = palavraComLacuna.indexOf('_');
            if (singleUnder !== -1) { // Pode ser um hiato com lacuna de 1 sublinhado
                respostaCorreta = palavraOriginal.charAt(singleUnder).toLowerCase();
            } else { // Fallback mais genérico se a lacuna não for padrão
                const diff = findDiff(palavraOriginal, palavraComLacuna.replace('__', ''));
                if (diff) {
                    respostaCorreta = diff.toLowerCase();
                } else {
                    console.error("Não foi possível determinar a resposta correta para a palavra:", desafioAtual.palavra, "com lacuna:", desafioAtual.lacuna);
                    // Último recurso: tenta chutar baseado no tipo, ou usa uma string vazia
                    respostaCorreta = (desafioAtual.tipo === 'Dígrafo' || desafioAtual.tipo === 'Encontro Consonantal') ? '__' : '_'; 
                }
            }
        }
    } else if (desafioAtual.tipo === 'Hiato') {
        const palavraOriginal = desafioAtual.palavra;
        const palavraComLacuna = desafioAtual.lacuna;
        
        let posicaoLacuna = palavraComLacuna.indexOf('_');
        
        if (posicaoLacuna !== -1) {
            respostaCorreta = palavraOriginal.charAt(posicaoLacuna).toLowerCase();
        } else {
            console.error("Lacuna '_' não encontrada para Hiato:", desafioAtual.palavra, "com lacuna:", desafioAtual.lacuna);
            respostaCorreta = ''; // Fallback para string vazia
        }
    }
    
    // Desabilitar botões de opção e ação
    document.querySelectorAll('.botao-fonetica').forEach(btn => btn.disabled = true);
    const botaoDicaFonetica = document.getElementById('botao-dica-fonetica');
    const botaoRepetirAudioFonetica = document.getElementById('botao-repetir-audio-fonetica');
    if (botaoDicaFonetica) botaoDicaFonetica.disabled = true;
    if (botaoRepetirAudioFonetica) botaoRepetirAudioFonetica.disabled = true;


    const feedbackElem = document.getElementById('feedback-fonetica');
    feedbackElem.style.display = 'flex'; 

    const acertou = respostaUsuario.toLowerCase() === respostaCorreta.toLowerCase(); // Garante comparação case-insensitive

    if (acertou) {
        console.log('Resposta CORRETA!');
        totalAcertos++;
        pontuacao += 10;
        
        if (window.audioSystem && audioSystem.initialized) {
            audioSystem.play('correct');
        }
        
        feedbackElem.className = 'feedback feedback-correto';
        feedbackElem.innerHTML = `<h2>Correto! 🎉</h2>
                                  <p>Muito bem! A palavra é <span class="destaque-acerto">${desafioAtual.palavra}</span></p>
                                  <div class="explicacao">
                                      <p><strong>${desafioAtual.tipo}:</strong> ${gerarExplicacaoParaTipo(desafioAtual.tipo, desafioAtual.palavra, respostaCorreta)}</p>
                                  </div>
                                  <button id="botao-continuar" class="botao-continuar">Continuar</button>`;
        
        audioSystem.speakText(`Correto! Muito bem! A palavra é ${desafioAtual.palavra}.`);
        
        if (window.registrarLog) {
            registrarLog('fonetica', 'resposta_correta', {
                palavra: desafioAtual.palavra,
                resposta: respostaCorreta,
                tipo: desafioAtual.tipo,
                dificuldade: dificuldadeAtual,
                pontuacao: pontuacao
            });
        }
    } else {
        console.log(`Resposta INCORRETA. Esperado: ${respostaCorreta}, Recebido: ${respostaUsuario}`);
        
        if (window.audioSystem && audioSystem.initialized) {
            audioSystem.play('wrong');
        }
        
        feedbackElem.className = 'feedback feedback-incorreto';
        feedbackElem.innerHTML = `<h2>Ops! Tente novamente 🤔</h2>
                                  <p>A resposta correta é: <span class="destaque-acerto">${respostaCorreta}</span></p>
                                  <p>A palavra completa é: <span class="destaque-acerto">${desafioAtual.palavra}</span></p>
                                  <div class="explicacao">
                                      <p><strong>${desafioAtual.tipo}:</strong> ${gerarExplicacaoParaTipo(desafioAtual.tipo, desafioAtual.palavra, respostaCorreta)}</p>
                                  </div>
                                  <button id="botao-continuar" class="botao-continuar">Continuar</button>`;
        
        audioSystem.speakText(`Ops! A resposta correta é ${respostaCorreta}. A palavra completa é ${desafioAtual.palavra}.`);
        
        if (window.registrarLog) {
            registrarLog('fonetica', 'resposta_incorreta', {
                palavra: desafioAtual.palavra,
                resposta_correta: respostaCorreta,
                resposta_usuario: respostaUsuario,
                tipo: desafioAtual.tipo,
                dificuldade: dificuldadeAtual
            });
        }
    }
    
    // ANEXAR EVENTO DE CLIQUE AO BOTÃO 'CONTINUAR' APÓS ELE SER ADICIONADO AO DOM
    // Isso é crucial para que ele funcione.
    document.getElementById('botao-continuar').addEventListener('click', function() {
        audioSystem.play('click');
        console.log('Avançando para o próximo desafio');
        indiceAtual++; 
        mostrarProximoDesafio();
    });
}

function findDiff(original, partial) {
    if (original.length <= partial.length) return null;
    let diff = '';
    let originalIdx = 0;
    let partialIdx = 0;

    while (originalIdx < original.length && partialIdx < partial.length) {
        if (original[originalIdx].toLowerCase() === partial[partialIdx].toLowerCase()) {
            originalIdx++;
            partialIdx++;
        } else {
            diff += original[originalIdx];
            originalIdx++;
        }
    }
    diff += original.substring(originalIdx); // Adiciona o restante da string original se houver
    return diff;
}


function gerarExplicacaoParaTipo(tipo, palavra, resposta) {
    switch (tipo) {
        case 'Dígrafo':
            return `Na palavra "${palavra}", "${resposta}" é um dígrafo, ou seja, duas letras que juntas formam um único som.`;
        case 'Hiato':
            return `Na palavra "${palavra}", temos um hiato, que são duas vogais em sílabas diferentes que são pronunciadas separadamente.`;
        case 'Encontro Consonantal':
            return `Na palavra "${palavra}", "${resposta}" é um encontro consonantal, ou seja, duas ou mais consoantes juntas na mesma palavra, onde cada uma mantém seu próprio som.`;
        default:
            return `A palavra "${palavra}" contém "${resposta}" como parte importante de sua estrutura fonética.`;
    }
}

// Função para mostrar a tela final
function mostrarTelaFinal() {
    const jogoContainer = document.getElementById('jogo-fonetica');
    
    try {
        const highScore = localStorage.getItem('highScoreFonetica') || 0;
        if (pontuacao > highScore) {
            localStorage.setItem('highScoreFonetica', pontuacao);
            console.log(`Novo recorde em Fonética: ${pontuacao}`);
        }
    } catch (e) {
        console.warn('Não foi possível salvar a pontuação:', e);
    }
    
    jogoContainer.innerHTML = `
        <div class="tela-final">
            <h2>Parabéns! 🏆</h2>
            <p>Você completou todos os desafios de Fonética!</p>
            <p class="pontuacao-final">Pontuação final: ${pontuacao}</p>
            <p>Acertos: ${totalAcertos} de ${totalDesafiosPorModulo}</p>
            <button id="botao-reiniciar" class="botao-reiniciar">Jogar Novamente</button>
            <a href="index.html" class="botao-voltar-inicio">Voltar ao Início</a>
        </div>
    `;
    
    audioSystem.speakText(`Parabéns! Você completou todos os desafios de Fonética! Pontuação final: ${pontuacao}. Acertos: ${totalAcertos} de ${totalDesafiosPorModulo}.`);
    
    document.getElementById('botao-reiniciar').addEventListener('click', function() {
        audioSystem.play('click');
        console.log('Reiniciando jogo de Fonética');
        indiceAtual = 0;
        pontuacao = 0;
        totalAcertos = 0;
        
        embaralharArray(desafiosFoneticaSelecionados);
        
        mostrarProximoDesafio();
    });

    document.querySelector('.botao-voltar-inicio').addEventListener('click', () => {
        audioSystem.play('click');
    });
    
    if (window.registrarLog) {
        registrarLog('fonetica', 'completar_jogo', {
            dificuldade: dificuldadeAtual,
            pontuacao: pontuacao,
            acertos: totalAcertos,
            total_desafios: totalDesafiosPorModulo
        });
    }
}