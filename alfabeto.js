document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('jogo-alfabeto')) {
        iniciarAlfabeto();
    }
});

let indiceLetra = 0;

function iniciarAlfabeto() {
    indiceLetra = 0;
    mostrarLetra();
}

function mostrarLetra() {
    const container = document.getElementById('jogo-alfabeto');
    const dados = letrasAlfabeto[indiceLetra];

    container.innerHTML = `
        <div class="letra-atual">
            <span class="letra">${dados.letra}</span>
            <span class="palavra">${dados.palavra}</span>
        </div>
        <div class="controles-alfabeto">
            <button id="btn-ouvir" class="botao-audio">🔊 Ouvir</button>
            <button id="btn-proximo">Próximo</button>
        </div>
    `;

    document.getElementById('btn-ouvir').addEventListener('click', () => {
        if (window.audioSystem) {
            audioSystem.speakText(`${dados.letra}, de ${dados.palavra}`);
        }
    });

    document.getElementById('btn-proximo').addEventListener('click', proximaLetra);
}

function proximaLetra() {
    indiceLetra++;
    if (indiceLetra >= letrasAlfabeto.length) {
        const container = document.getElementById('jogo-alfabeto');
        container.innerHTML = `
            <p>Você chegou ao fim do alfabeto! Parabéns!</p>
            <button id="btn-reiniciar">Reiniciar</button>
        `;
        document.getElementById('btn-reiniciar').addEventListener('click', iniciarAlfabeto);
    } else {
        mostrarLetra();
    }
}
