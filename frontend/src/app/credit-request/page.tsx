"use client";

import { useEffect, useRef } from 'react';
import Head from 'next/head';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const CreditRequestPage = () => {
  const spendingChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (spendingChartRef.current) {
      const spendingChartCtx = spendingChartRef.current.getContext('2d');
      if (spendingChartCtx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const spendingData = {
          labels: ['Vertex AI', 'Gemini API'],
          datasets: [{
            label: 'Custo em R$',
            data: [179.20, 94.82],
            backgroundColor: [
              '#00A6ED',
              '#84D44A',
            ],
            borderColor: '#f8fafc',
            borderWidth: 4,
            hoverOffset: 8
          }]
        };

        const spendingConfig = {
          type: 'doughnut' as const,
          data: spendingData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: {
                position: 'bottom' as const,
                labels: {
                  padding: 20,
                  font: {
                    size: 14,
                    family: 'Inter'
                  }
                }
              },
              title: {
                display: false
              },
              tooltip: {
                callbacks: {
                  title: function(tooltipItems: any) {
                    const item = tooltipItems[0];
                    let label = item.chart.data.labels[item.dataIndex];
                    if (Array.isArray(label)) {
                      return label.join(' ');
                    } else {
                      return label;
                    }
                  },
                  label: function(context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed !== null) {
                      label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                    }
                    return label;
                  }
                }
              }
            }
          }
        };
        
        chartInstance.current = new Chart(spendingChartCtx, spendingConfig);
      }
    }

    const agentCards = document.querySelectorAll('.agent-card');
    agentCards.forEach(card => {
        card.addEventListener('mouseenter', () => card.classList.add('border-blue-400'));
        card.addEventListener('mouseleave', () => card.classList.remove('border-blue-400'));
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>SFAI Solutions - Solicitação de Crédito Google Cloud</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f8fafc;
        }
        .chart-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          height: 400px;
          max-height: 400px;
        }
      `}</style>
      <main className="container mx-auto p-4 md:p-8 text-gray-800">
        
        <header className="text-center py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Solicitação de Crédito Google Cloud</h1>
            <p className="mt-4 text-xl text-blue-600 font-semibold">SFAI Solutions</p>
            <p className="mt-2 max-w-2xl mx-auto text-gray-600">Um infográfico sobre nossa jornada, nossa visão com o produto Cocreator e como os créditos do Google Cloud são essenciais para transformarmos nosso protótipo em uma solução escalável.</p>
        </header>

        <section id="company-overview" className="mb-16 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Visão Geral da SFAI Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 text-wrap">R$200/mês</p>
                    <p className="mt-2 text-gray-700">Orçamento de Investimento</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-4xl font-bold text-blue-600">Pre-Seed</p>
                    <p className="mt-2 text-gray-700">Estágio Atual</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-4xl font-bold text-blue-600">100%</p>
                    <p className="mt-2 text-gray-700">Foco em IA com Google</p>
                </div>
            </div>
            <p className="text-center mt-6 text-gray-600">Somos uma empresa em estágio inicial, operando com um orçamento limitado, financiado por investimento familiar, com uma visão ambiciosa para revolucionar a criação de conteúdo.</p>
        </section>

        <section id="cocreator-vision" className="mb-16">
            <div className="text-center">
                 <h2 className="text-3xl font-bold mb-2">Nossa Visão: O Cocreator</h2>
                 <p className="max-w-3xl mx-auto text-gray-600">Capacitar criadores de conteúdo, profissionais de marketing e educadores a transformar qualquer tópico ou URL em um vídeo envolvente e compartilhável instantaneamente. O Cocreator é uma plataforma micro-SaaS que automatiza todo o pipeline de criação de conteúdo.</p>
            </div>
        </section>

        <section id="ai-engine" className="mb-16 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Como Funciona: Nosso Motor de IA Multiagente</h2>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="agent-card text-center p-4 border-2 border-gray-200 rounded-lg w-full md:w-48 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <p className="text-2xl">📝</p>
                    <h3 className="font-bold">Agente de Planejamento</h3>
                    <p className="text-sm text-gray-500">Pesquisa o tópico e cria um esboço.</p>
                </div>
                <div className="text-2xl text-blue-500 font-bold hidden md:block">&rarr;</div>
                 <div className="text-2xl text-blue-500 font-bold md:hidden">&darr;</div>
                <div className="agent-card text-center p-4 border-2 border-gray-200 rounded-lg w-full md:w-48 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <p className="text-2xl">✍️</p>
                    <h3 className="font-bold">Agente Escritor</h3>
                    <p className="text-sm text-gray-500">Escreve o roteiro completo a partir do esboço.</p>
                </div>
                 <div className="text-2xl text-blue-500 font-bold hidden md:block">&rarr;</div>
                 <div className="text-2xl text-blue-500 font-bold md:hidden">&darr;</div>
                <div className="agent-card text-center p-4 border-2 border-gray-200 rounded-lg w-full md:w-48 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <p className="text-2xl">🎨🗣️</p>
                    <h3 className="font-bold">Agente Multimídia</h3>
                    <p className="text-sm text-gray-500">Gera imagens e narrações sincronizadas.</p>
                </div>
                 <div className="text-2xl text-blue-500 font-bold hidden md:block">&rarr;</div>
                 <div className="text-2xl text-blue-500 font-bold md:hidden">&darr;</div>
                <div className="agent-card text-center p-4 border-2 border-gray-200 rounded-lg w-full md:w-48 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                     <p className="text-2xl">🎬</p>
                    <h3 className="font-bold">Agente de Vídeo</h3>
                    <p className="text-sm text-gray-500">Monta todos os ativos em um vídeo final.</p>
                </div>
            </div>
             <p className="text-center mt-6 text-gray-600">O núcleo de nossa aplicação é um sistema sofisticado construído com o <strong>Google Agent Development Kit (ADK)</strong> e modelos <strong>Gemini</strong>, atualmente em estado de protótipo funcional.</p>
        </section>


        <section id="billing-analysis" className="mb-16">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                    <h2 className="text-3xl font-bold mb-4">O Gargalo: Nosso Compromisso com o Google Cloud</h2>
                    <p className="text-gray-600 mb-4">Estamos em um ponto crítico. Nosso protótipo local provou o conceito, mas escalar para a nuvem é essencial. Nossos gastos até agora demonstram nosso profundo investimento no ecossistema de IA do Google.</p>
                    <p className="text-gray-600">A grande maioria de nossas despesas foi com as tecnologias que são o coração do Cocreator. Este gráfico visualiza nosso gasto total de <strong>R$274,02</strong>, destacando nossa dependência e compromisso com a Vertex AI e a API Gemini.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-bold text-center mb-4">Análise de Custos em IA</h3>
                    <div className="chart-container">
                        <canvas ref={spendingChartRef}></canvas>
                    </div>
                </div>
            </div>
        </section>

        <section id="credits-usage" className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-2">O Caminho a Seguir: Como os Créditos Serão Usados</h2>
            <p className="max-w-3xl mx-auto text-gray-600 mb-8">Os créditos do Google Cloud não são apenas um alívio financeiro; são o catalisador que nos permitirá dar os próximos passos cruciais.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                    <p className="text-4xl mb-4">💻</p>
                    <h3 className="text-xl font-bold mb-2">Finalizar o Desenvolvimento</h3>
                    <p className="text-gray-600">Executar as tarefas computacionais intensivas dos agentes de multimídia e vídeo, que exigem poder de processamento em nuvem para renderização.</p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                    <p className="text-4xl mb-4">🚀</p>
                    <h3 className="text-xl font-bold mb-2">Implantar e Escalar</h3>
                    <p className="text-gray-600">Mover nosso frontend e backend para o <strong>Google Cloud Run</strong>, garantindo uma infraestrutura serverless, escalável e confiável para nossos usuários.</p>
                </div>
                 <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                    <p className="text-4xl mb-4">💡</p>
                    <h3 className="text-xl font-bold mb-2">Desenvolver Soluções Futuras</h3>
                    <p className="text-gray-600">Utilizar a <strong>Vertex AI</strong> para criar soluções de codificação personalizadas para clientes, abrindo novos fluxos de receita e inovação.</p>
                </div>
            </div>
        </section>

        <footer className="text-center py-10 border-t">
            <h2 className="text-2xl font-bold">Uma Parceria para o Futuro</h2>
            <p className="max-w-3xl mx-auto text-gray-600 mt-2">Uma pequena ajuda, um pequeno impulso da Google neste momento poderia significar um grande avanço e um impacto significativo no futuro.</p>
            <p className="max-w-3xl mx-auto text-gray-600 mt-2">Estamos confiantes de que, com o apoio dos créditos do Google Cloud, podemos lançar o Cocreator com sucesso e construir uma parceria duradoura e de sucesso com o Google.</p>
        </footer>

      </main>
    </>
  );
};

export default CreditRequestPage;
