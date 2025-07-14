# Knapsack no Rolê: Utilizando o algoritmo de Knapsack para gerar roteiros turístico
 <div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
</div>

## 🎥 Vídeo Explicativo
- [Vídeo 1 - Organização e Funcionamento do Códgio -  Kauan](https://www.youtube.com/watch?v=Zd9Fg8jqi0c)
- [Video 2 - Funcionalidades do Aplicativo Knapsack no Role - Edilberto]()


Neste vídeo, será apresentada uma explicação detalhada sobre o funcionamento do algoritmo de Knapsack aplicado ao planejamento de roteiros turísticos, demonstrando como otimizar a seleção de atrações considerando tempo, orçamento e preferências pessoais.

## 📋 Sobre o Projeto

**Knapsack no Rolê** é uma aplicação web que utiliza o clássico algoritmo da **Mochila (Knapsack Problem)** para otimizar roteiros turísticos. O sistema considera múltiplas variáveis como tempo disponível, orçamento, horários de funcionamento e preferências pessoais para criar o roteiro mais eficiente possível.

## 👤 Equipe

<table>
  <tr>
    <td align="center" width="50%">
      <img src="https://avatars.githubusercontent.com/u/69125218?v=4" width="20%" alt="Edilberto Almeida Cantuária" />
      <br />
      <strong>Edilberto Almeida Cantuária</strong>
      <br />
      <em>Engenharia de Software/FCTE</em>
      <br />
      <em>Matrícula: 222014984</em>
      <br />
      <a href="mailto:edilbertounbfga@gmail.com">edilbertounbfga@gmail.com</a>
    </td>
    <td align="center" width="50%">
      <img src="https://avatars.githubusercontent.com/u/43351064?v=4" width="20%" alt="Kauan de Torres Eiras" />
      <br />
      <strong>Kauan de Torres Eiras</strong>
      <br />
      <em>Engenharia de Software/FCTE</em>
      <br />
      <em>Matrícula: 232014727</em>
      <br />
      <a href="mailto:232014727@aluno.unb.br">232014727@aluno.unb.br</a>
    </td>
  </tr>
</table>

## 🎯 Funcionalidades

### Otimização Inteligente

- **Algoritmo de Knapsack 3D**: Considera tempo, custo e benefício simultaneamente
- **Distribuição por Dias**: Organiza atrações respeitando horários de funcionamento
- **Otimização de Rotas**: Utiliza TSP (Traveling Salesman Problem) para minimizar deslocamentos
- **Priorização Personalizada**: Permite marcar atrações favoritas com peso extra


### ️ Visualização Interativa

- **Mapa Dinâmico**: Visualização das rotas otimizadas com Leaflet
- **Rotas Reais**: Integração com OSRM para cálculo de rotas reais
- **Legenda Visual**: Diferenciação por cores para cada dia do roteiro
- **Exportação para Google Maps**: Links diretos para navegação


### Modos de Transporte

- **Modo Carro**: Otimização para deslocamentos de veículo
- **Modo Caminhada**: Rotas pedestres com distâncias apropriadas
- **Custos de Transporte**: Cálculo automático de custos de deslocamento


### Gerenciamento de Roteiros

- **Salvamento Local**: Armazenamento no localStorage do navegador
- **Carregamento Rápido**: Acesso instantâneo aos roteiros salvos
- **Múltiplos Planos**: Gerencie diferentes roteiros para diferentes ocasiões


### ️ Múltiplas Cidades

- **Brasília, DF**: Capital federal com atrações governamentais e culturais
- **Rio de Janeiro, RJ**: Cidade maravilhosa com praias e pontos turísticos icônicos
- **São Paulo, SP**: Metrópole cultural com museus, parques e gastronomia


## 🧮 Algoritmos Implementados

### Problema da Mochila 3D (3D Knapsack)

O algoritmo principal utiliza programação dinâmica para resolver uma variação tridimensional do problema da mochila:

```typescript
// Dimensões consideradas:
// - Tempo disponível (horas)
// - Orçamento disponível (R$)
// - Benefício das atrações (pontuação)

dp[i][t][c] = max(
  dp[i-1][t][c],                    // Não incluir item i
  dp[i-1][t-tempo[i]][c-custo[i]] + beneficio[i]  // Incluir item i
)
```

**Características:**

- **Complexidade**: O(n × T × C) onde n = número de atrações, T = tempo total, C = custo total
- **Otimalidade**: Garante a solução ótima considerando todas as restrições
- **Escalabilidade**: Utiliza escala de tempo em meia-hora para maior precisão


### Problema do Caixeiro Viajante (TSP)

Após a seleção das atrações, o algoritmo aplica a heurística do **Vizinho Mais Próximo**:

```typescript
// Heurística do Vizinho Mais Próximo
while (unvisited.size > 0) {
  let nearestNeighbor = null;
  let minTime = Infinity;
  
  for (const neighbor of unvisitedAttractions) {
    const time = distances[current][neighbor];
    if (time < minTime) {
      minTime = time;
      nearestNeighbor = neighbor;
    }
  }
  // Adiciona vizinho mais próximo à rota
}
```

**Características:**

- **Complexidade**: O(n²) para n atrações
- **Aproximação**: Boa solução para o problema NP-difícil do TSP
- **Praticidade**: Adequado para conjuntos pequenos a médios de atrações


### Distribuição por Horários

Algoritmo especializado que considera horários de funcionamento:

```typescript
// Ordena por horário de fechamento (mais cedo primeiro)
const sortedAttractions = attractions.sort((a, b) => {
  if (a.closes !== b.closes) {
    return a.closes - b.closes;
  }
  return b.tempo - a.tempo; // Depois por duração (maior primeiro)
});
```

**Características:**

- **Restrições Temporais**: Respeita horários de abertura e fechamento
- **Otimização de Tempo**: Prioriza atrações que fecham mais cedo
- **Flexibilidade**: Permite configurar horas diferentes para cada dia


## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn


### Instalação

1. Clone o repositório:

    ```shellscript
    git clone https://github.com/projeto-de-algoritmos-2025/Knapsack-no-Role
    cd knapsack-no-role
    ```


2. Instale as dependências:

    ```shellscript
    cd code
    yarn install
    ```

3. Realizar o build do projeto:

   ```shellscript
   yarn run build
   ```

4. Execute em modo de desenvolvimento:

    ```shellscript
    yarn dev
    ```


5. Acesse no navegador:

    ```plaintext
    http://localhost:3000
    ```

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 15** (App Router)
- **React 19** (Server Components)
- **TypeScript 5** (Type Safety)
- **TailwindCSS 3.4** (Styling)
- **Shadcn/ui** (Componentes)
- **Lucide React** (Ícones)


### Mapas e Geolocalização

- **Leaflet 1.9** (Mapas interativos)
- **React-Leaflet** (Integração React)
- **OSRM API** (Cálculo de rotas reais)
- **OpenStreetMap** (Dados cartográficos)


### Algoritmos e Estruturas

- **Programação Dinâmica** (Knapsack 3D)
- **Heurísticas de Otimização** (TSP)
- **Estruturas de Dados** (Sets, Maps, Arrays)


## 🎓 Uso Educacional

Esta aplicação é ideal para:

- **Estudantes de Algoritmos** aprendendo programação dinâmica
- **Professores de Otimização** demonstrando problemas NP
- **Desenvolvedores** interessados em algoritmos aplicados
- **Turistas** planejando viagens eficientes


### Conceitos Abordados

- Problema da Mochila (Knapsack Problem)
- Programação Dinâmica
- Problema do Caixeiro Viajante (TSP)
- Otimização Combinatória
- Heurísticas de Aproximação
- Complexidade Algorítmica


## 🎮 Como Usar

### 1. Configuração Inicial

- Selecione a cidade de destino
- Escolha o modo de transporte (carro ou caminhada)
- Defina o número de dias da viagem
- Configure as horas disponíveis por dia
- Estabeleça o orçamento total


### 2. Personalização

- Filtre atrações por categoria
- Marque atrações prioritárias com estrela
- Exclua locais já visitados
- Ajuste parâmetros conforme necessário


### 3. Otimização

- Clique em "Gerar Roteiro Inteligente"
- Aguarde o processamento do algoritmo
- Visualize o roteiro otimizado no mapa
- Analise as métricas de benefício, tempo e custo


### 4. Gerenciamento

- Salve roteiros interessantes
- Carregue planos salvos anteriormente
- Exporte para Google Maps
- Compartilhe com outros viajantes


## 📈 Exemplos de Uso

```javascript
// Configuração de exemplo para Brasília
Cidade: "Brasília, DF"
Dias: 3
Horas por dia: [8, 6, 4]
Orçamento: R$ 500,00
Modo: "Carro"

// Atrações priorizadas
Prioritárias: [
  "Cristo Redentor",
  "Congresso Nacional", 
  "Catedral Metropolitana"
]

// Resultado esperado
Benefício Total: ~280 pontos
Tempo Total: 18 horas
Custo Total: R$ 450,00
Atrações Selecionadas: 12
```

## 📍 Dados das Cidades

### Brasília, DF

- **14 atrações** catalogadas
- **4 restaurantes** recomendados
- **6 categorias**: Monumento, Cultural, Natureza, Governamental, Lazer, Vida Noturna
- **Coordenadas centrais**: -15.793889, -47.882778


### Rio de Janeiro, RJ

- **8 atrações** catalogadas
- **4 restaurantes** recomendados
- **6 categorias**: Praia, Monumento, Cultural, Natureza, Lazer, Vida Noturna
- **Coordenadas centrais**: -22.9068, -43.1729


### São Paulo, SP

- **7 atrações** catalogadas
- **4 restaurantes** recomendados
- **5 categorias**: Cultural, Parque, Gastronomia, Lazer, Vida Noturna
- **Coordenadas centrais**: -23.5505, -46.6333


## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-cidade`)
3. Faça commit das alterações (`git commit -m 'Adiciona dados de Recife'`)
4. Faça push para a branch (`git push origin feature/nova-cidade`)
5. Abra um Pull Request


### Ideias para Contribuições

- **Novas Cidades**: Adicionar dados de outras cidades brasileiras
- **Algoritmos Avançados**: Implementar algoritmos mais sofisticados (Genetic Algorithm, Simulated Annealing)
- **APIs Reais**: Integração com APIs de turismo (TripAdvisor, Google Places)
- **Modo Offline**: Funcionalidade para uso sem internet
- **Compartilhamento**: Sistema de compartilhamento de roteiros
- **Avaliações**: Sistema de feedback dos usuários
- **Clima**: Integração com previsão do tempo
- **Eventos**: Consideração de eventos sazonais


## 🏆 Reconhecimentos


- Algoritmo de Knapsack baseado nos trabalhos clássicos de programação dinâmica
- Heurística TSP inspirada em Christofides e outros pesquisadores
- Interface moderna inspirada em aplicativos de viagem contemporâneos
- Dados turísticos baseados em fontes oficiais de turismo

---

<div align="center">
  <p>Desenvolvido com ❤️ por Edilberto Almeida Cantuária e Kauan de Torres Eiras</p>
  <p>Universidade de Brasília - Faculdade do Gama</p>
</div>

</div>
