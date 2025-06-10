import os
import json5
from gtts import gTTS
import time

# --- Configurações ---
# Caminho base do seu projeto (onde este script Python está)
BASE_PATH = os.path.dirname(os.path.abspath(__file__))

# Caminhos para os arquivos de dados (relativos ao BASE_PATH)
DATA_FONETICA_PATH = os.path.join(BASE_PATH, 'data_fonetica.js')
DATA_PORTUGUES_PATH = os.path.join(BASE_PATH, 'data_portugues.js')

# Caminhos para as pastas de áudio de saída (relativos ao BASE_PATH)
OUTPUT_FONETICA_AUDIO_DIR = os.path.join(BASE_PATH, 'assets', 'audio', 'fonetica')
OUTPUT_PORTUGUES_AUDIO_DIR = os.path.join(BASE_PATH, 'assets', 'audio', 'palavras') # Se usar áudio para palavras de escrita

# Idioma para a síntese de voz
LANG = 'pt'

# --- Funções Auxiliares ---

def clean_js_content(js_content):
    """
    Remove comentários de linha única e de múltiplas linhas de um conteúdo JS.
    Isso ajuda json5 a parsear corretamente se houverem comentários.
    """
    # Remove comentários de linha única (ignora linhas vazias)
    cleaned_lines = []
    for line in js_content.splitlines():
        if '//' in line:
            line = line.split('//')[0]
        cleaned_lines.append(line)
    cleaned = os.linesep.join(cleaned_lines)
    
    # Remove comentários de múltiplas linhas
    while '/*' in cleaned and '*/' in cleaned:
        start = cleaned.find('/*')
        end = cleaned.find('*/', start)
        if start != -1 and end != -1:
            cleaned = cleaned[:start] + cleaned[end+2:]
        else:
            break
            
    # Remove linhas que possam ter ficado vazias ou com apenas whitespace
    cleaned = os.linesep.join([line.strip() for line in cleaned.splitlines() if line.strip()])
    
    return cleaned


def load_js_data(filepath, variable_name):
    """
    Carrega o conteúdo de um arquivo .js, extrai a variável JavaScript e a parseia como JSON.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # O json5 pode lidar com JSONs mais flexíveis (como comentários JS),
        # mas a declaração 'const varName = ...' precisa ser removida.
        start_marker = f"const {variable_name} = "
        start_index = content.find(start_marker)
        if start_index == -1:
            raise ValueError(f"Variável '{variable_name}' não encontrada no arquivo {filepath}")
        
        # Encontrar o início do objeto JSON após a declaração da variável
        content_after_var = content[start_index + len(start_marker):].strip()
        
        # Tenta encontrar o final do objeto JSON (usando contagem de chaves para robustez)
        brace_count = 0
        bracket_count = 0 # Adicionado para lidar com arrays no topo
        end_index = -1
        
        # Detecta se é um objeto ou um array no início da variável
        is_array = content_after_var.startswith('[')

        for i, char in enumerate(content_after_var):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
            elif char == '[': # Contagem de colchetes para arrays
                bracket_count += 1
            elif char == ']': # Contagem de colchetes para arrays
                bracket_count -= 1
            
            # Condição de parada: ambos os contadores zeraram (se o tipo for array, só bracket importa no final)
            if (is_array and bracket_count == 0 and char == ']') or \
               (not is_array and brace_count == 0 and char == '}'):
                end_index = i
                break
        
        if end_index == -1:
            raise ValueError(f"Não foi possível encontrar o final do objeto/array JSON para '{variable_name}' em {filepath}")
        
        json_str_raw = content_after_var[:end_index + 1].strip()

        # Limpa os comentários ANTES de passar para json5.loads, para evitar problemas
        json_str_cleaned = clean_js_content(json_str_raw)

        data = json5.loads(json_str_cleaned)
        return data
    except Exception as e:
        print(f"Erro ao carregar ou parsear {filepath}: {e}")
        return None

def generate_audio(text, output_dir, filename):
    """
    Gera um arquivo MP3 para o texto dado.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Criada pasta: {output_dir}")

    filepath = os.path.join(output_dir, filename)
    
    if os.path.exists(filepath):
        print(f"Áudio '{filename}' já existe, pulando geração.")
        return

    try:
        tts = gTTS(text=text, lang=LANG, slow=False)
        tts.save(filepath)
        print(f"Gerado: {filename} ({text})") # Adicionado a palavra no log
        time.sleep(0.5) # Pequeno atraso para evitar bloqueio da API
    except Exception as e:
        print(f"Falha ao gerar áudio para '{text}' ({filename}): {e}")

# --- Processamento ---

def process_fonetica_data():
    """Processa o data_fonetica.js para gerar áudios."""
    print("\n--- Processando áudios do módulo de Fonética ---")
    fonetica_data = load_js_data(DATA_FONETICA_PATH, "desafiosFonetica")

    if fonetica_data:
        for item in fonetica_data:
            palavra = item.get("palavra")
            audio_path = item.get("audio") # Ex: assets/audio/fonetica/força.mp3
            
            if palavra and audio_path:
                filename = os.path.basename(audio_path) # Ex: força.mp3
                generate_audio(palavra, OUTPUT_FONETICA_AUDIO_DIR, filename)
            else:
                print(f"Aviso: Item de fonética sem 'palavra' ou 'audio' completo: {item}")
    else:
        print("Dados de fonética não puderam ser carregados. Verifique se 'desafiosFonetica' está bem formatado.")

def process_portugues_escrita_data():
    """Processa a seção palavrasEscritaData do data_portugues.js para gerar áudios."""
    print("\n--- Processando áudios do módulo de Português (Escrita) ---")
    
    try:
        with open(DATA_PORTUGUES_PATH, 'r', encoding='utf-8') as f:
            content = f.read()

        start_marker_frases = "const frasesPortuguesData = {"
        start_index_frases = content.find(start_marker_frases)
        
        start_marker_palavras = "const palavrasEscritaData = {"
        start_index_palavras = content.find(start_marker_palavras)

        if start_index_palavras == -1:
            print("Aviso: Variável 'palavrasEscritaData' não encontrada em data_portugues.js. Pulando.")
            return

        # Extrai apenas o trecho que contém palavrasEscritaData
        content_for_palavras = content[start_index_palavras:]
        
        # Encontra o final do objeto palavrasEscritaData
        brace_count = 0
        end_index_palavras = -1
        # Inicia a contagem de chaves a partir do primeiro '{' da variável
        started_counting = False
        for i, char in enumerate(content_for_palavras):
            if char == '{':
                brace_count += 1
                started_counting = True
            elif char == '}':
                brace_count -= 1
            
            if started_counting and brace_count == 0 and char == '}':
                end_index_palavras = i
                break
        
        if end_index_palavras == -1:
            raise ValueError("Não foi possível encontrar o final do objeto JSON para 'palavrasEscritaData'.")
        
        # Extrai a string JSON (apenas o objeto entre {})
        json_str_raw = content_for_palavras[content_for_palavras.find('{'): end_index_palavras + 1]
        
        # Limpa comentários para json5
        palavras_data = json5.loads(clean_js_content(json_str_raw))

        for difficulty_level in ["easy", "medium", "hard"]:
            if difficulty_level in palavras_data:
                for item in palavras_data[difficulty_level]:
                    palavra = item.get("palavra")
                    # O nome do arquivo MP3 será a própria palavra + .mp3
                    # Normaliza o nome do arquivo para remover acentos e espaços
                    filename = (
                        palavra.lower()
                        .replace(' ', '_')
                        .replace('.', '')
                        .replace('?', '')
                        .replace('!', '')
                        .replace(':', '')
                        .replace('-', '')
                        .replace('ã', 'a')
                        .replace('õ', 'o')
                        .replace('ç', 'c')
                        .replace('á', 'a')
                        .replace('é', 'e')
                        .replace('í', 'i')
                        .replace('ó', 'o')
                        .replace('ú', 'u')
                        .replace('â', 'a')
                        .replace('ê', 'e')
                        .replace('ô', 'o')
                    ) + ".mp3"
                    
                    # Usa o próprio `palavra` para a geração do áudio
                    generate_audio(palavra, OUTPUT_PORTUGUES_AUDIO_DIR, filename)
            else:
                print(f"Aviso: Dificuldade '{difficulty_level}' não encontrada em palavrasEscritaData.")
    except Exception as e:
        print(f"Erro ao processar palavrasEscritaData: {e}")
        print(f"Detalhes do erro: {e}")
        print(f"Conteúdo raw do JSON extraído para palavrasEscritaData (pode estar incompleto): {json_str_raw[:200]}...") # Ajuda a depurar
        print(f"Conteúdo limpo: {clean_js_content(json_str_raw)[:200]}...")

# --- Execução Principal ---
if __name__ == "__main__":
    print("Iniciando geração de áudios para o jogo Mateuszinho Aventura...")
    
    # Processar áudios para Fonética
    process_fonetica_data()
    
    # Processar áudios para Português (modo Escrita)
    process_portugues_escrita_data()
    
    print("\nGeração de áudios concluída. Verifique as pastas de áudio.")