// Sistema de log para o jogo
const logSystem = {
    // Estado do sistema
    enabled: true,
    
    // Inicializar o sistema de log
    init: function() {
        try {
            // Verificar se o localStorage está disponível
            if (typeof localStorage === 'undefined') {
                console.warn('localStorage não disponível. Log será apenas em console.');
                return;
            }
            
            console.log('Sistema de log inicializado');
        } catch (e) {
            console.error('Erro ao inicializar sistema de log:', e);
        }
    }
};

// Função para registrar eventos no log
function registrarLog(modulo, acao, dados) {
    // Verificar se o log está habilitado
    if (!logSystem.enabled) {
        return;
    }
    
    // Criar objeto de log
    const logEntry = {
        timestamp: new Date().toISOString(),
        modulo: modulo,
        acao: acao,
        dados: dados || {}
    };
    
    // Registrar no console
    console.log(`LOG: ${modulo} - ${acao}`, dados);
    
    // Tentar salvar no localStorage
    try {
        // Obter logs existentes
        let logs = [];
        const logsString = localStorage.getItem('mateuszinho_logs');
        if (logsString) {
            logs = JSON.parse(logsString);
        }
        
        // Adicionar novo log
        logs.push(logEntry);
        
        // Limitar tamanho (manter apenas os últimos 100 logs)
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }
        
        // Salvar de volta no localStorage
        localStorage.setItem('mateuszinho_logs', JSON.stringify(logs));
    } catch (e) {
        console.warn('Não foi possível salvar log no localStorage:', e);
    }
}

// Inicializar o sistema de log quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    logSystem.init();
    
    // Registrar início da sessão
    registrarLog('sistema', 'inicio_sessao', {
        url: window.location.pathname,
        userAgent: navigator.userAgent
    });
});