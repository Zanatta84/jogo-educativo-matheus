// Script principal para a página inicial
document.addEventListener("DOMContentLoaded", function() {
    console.log("Inicializando página inicial...");
    
    // Verificar se estamos na página inicial
    const botoesArea = document.querySelector(".botoes-area");
    if (botoesArea) {
        // Adicionar eventos aos botões de área
        const botoesAreaLinks = document.querySelectorAll(".botao-area");
        botoesAreaLinks.forEach(botao => {
            botao.addEventListener("click", function(e) {
                // Registrar no log
                if (window.registrarLog) {
                    registrarLog("navegacao", "selecionar_area", {
                        area: this.getAttribute("aria-label"),
                        url: this.getAttribute("href")
                    });
                }
                // Tocar som de clique
                if (window.audioSystem) {
                    audioSystem.play('click');
                }
            });
        });
        
        // A inicialização da seleção de dificuldade já está em config.js
        // A função `inicializarSelecaoDificuldade()` é chamada por `config.js`
    }
});