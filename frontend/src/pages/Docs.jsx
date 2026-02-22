import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useComponents } from '../contexts/ComponentsContext';
import './Docs.css';

const TOC_IDS = [
  'o-que-e-o-belier',
  'por-que-usar',
  'o-que-o-belier-nao-e',
  'como-usar',
  '1-encontrar-um-componente',
  '2-abrir-a-documentacao-do-componente',
  '3-copiar-ou-exportar',
  'governanca',
  'status-dos-componentes',
  'responsaveis-e-revisao',
  'boas-praticas',
  'para-quem-desenvolve',
  'para-quem-designa-define-padrao',
  'faq',
  'contato-e-manutencao',
];

const FAQ_ITEMS = [
  {
    question: 'Se não é um pacote, por que o código está aqui?',
    answer: 'Porque o objetivo é documentar e padronizar a implementação, reduzindo retrabalho. O código exibido representa exemplos de uso e versões aprovadas, servindo como referência confiável.',
  },
  {
    question: 'Posso copiar e colar direto?',
    answer: 'Você pode usar como ponto de partida, mas sempre respeitando: as dependências descritas, o status (evite rascunhos) e a versão recomendada.',
  },
  {
    question: 'Como eu peço uma alteração?',
    answer: 'Abra o componente, crie um comentário descrevendo: o problema, o impacto e a sugestão de solução. Se necessário, registre uma nova versão e encaminhe para revisão.',
  },
];

function DocAccordionItem({ title, description, children, open, onToggle }) {
  return (
    <div className={`docs-accordion-item ${open ? 'docs-accordion-item-open' : ''}`}>
      <button
        type="button"
        className="docs-accordion-header"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={undefined}
      >
        <div className="docs-accordion-header-text">
          <span className="docs-accordion-title">{title}</span>
          {description && <span className="docs-accordion-desc">{description}</span>}
        </div>
        <span className="docs-accordion-icon" aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && children && (
        <div className="docs-accordion-body">
          <div className="docs-accordion-body-inner">
            <span className="docs-accordion-icon docs-accordion-icon-orange" aria-hidden>+</span>
            <div className="docs-accordion-body-content">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Docs() {
  const [activeId, setActiveId] = useState('');
  const [faqOpen, setFaqOpen] = useState(null);
  const { components } = useComponents();
  const firstComponentId = components.length > 0 ? components[0].id : null;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.25, 0.5, 0.75] }
    );
    TOC_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="page docs-page detail-content-grid">
      <div className="docs-content">
        <header className="docs-header">
          <h1 id="topo" className="page-title">Docs — Belier</h1>
          <p className="docs-intro">
            O Belier é um portal de documentação e governança de componentes de interface. Centralize componentes, variações, padrões de uso e exemplos de código para padronizar, reutilizar e evoluir a UI com consistência.
          </p>
          <div className="docs-callout docs-callout-highlights">
            <div className="docs-callout-item">
              <strong>Documentação</strong>
              <span>Preview + exemplos</span>
            </div>
            <div className="docs-callout-item">
              <strong>Governança</strong>
              <span>Status + versões + comentários</span>
            </div>
            <div className="docs-callout-item">
              <strong>Export</strong>
              <span>Copiar snippet / baixar versão</span>
            </div>
          </div>
        </header>

        <section id="o-que-e-o-belier" className="docs-section">
          <h2>O que é o Belier</h2>
          <p>
            O Belier é um portal de documentação e governança de componentes de interface. Ele centraliza componentes, variações, padrões de uso e exemplos de código em um só lugar, para que a equipe consiga padronizar, reutilizar e evoluir a UI com consistência.
          </p>
          <ul className="docs-list-bullets">
            <li>Preview do componente (visual)</li>
            <li>Exemplos de uso (código pronto para referência)</li>
            <li>Props/variantes e recomendações</li>
            <li>Histórico de versões e mudanças (changelog)</li>
            <li>Comentários e alinhamentos de equipe</li>
            <li>Status (Rascunho / Publicado / Arquivado)</li>
            <li>Export (copiar snippet e/ou baixar versão)</li>
          </ul>
        </section>

        <section id="por-que-usar" className="docs-section">
          <h2>Por que usar</h2>
          <p>
            Quando cada pessoa implementa componentes “do seu jeito”, a interface fica inconsistente, o retrabalho aumenta e o time perde tempo discutindo decisões repetidas.
          </p>
          <ul className="docs-list-bullets">
            <li>reduzir inconsistências visuais e comportamentais</li>
            <li>acelerar desenvolvimento com exemplos e decisões já documentadas</li>
            <li>evitar retrabalho (componentes reutilizáveis e evolutivos)</li>
            <li>criar rastreabilidade: quem mudou, quando mudou e por quê</li>
            <li>organizar colaboração: comentários, solicitações e status</li>
          </ul>
        </section>

        <section id="o-que-o-belier-nao-e" className="docs-section">
          <h2>O que o Belier não é</h2>
          <div className="docs-callout docs-callout-info">
            <p>
              O Belier não é uma biblioteca distribuída via pacote (ex.: npm) no modelo “instalar e importar”. Ele é um portal interno de referência, onde os exemplos de código servem como documentação e base de implementação.
            </p>
          </div>
          <p><strong>O que você copia/baixa aqui é:</strong></p>
          <ul className="docs-list-bullets">
            <li>exemplo de uso e estrutura recomendada</li>
            <li>snippet da versão (HTML/XHTML/CSS/JS conforme o caso)</li>
            <li>documentação gerada (README, props, variações, changelog)</li>
          </ul>
        </section>

        <section id="como-usar" className="docs-section">
          <h2>Como usar (fluxo rápido)</h2>
          <div className="docs-stepper">
            <div className="docs-stepper-card" id="1-encontrar-um-componente">
              <h3>1) Encontrar um componente</h3>
              <p>Acesse Components e use a busca para localizar pelo nome ou tag.</p>
              <ul className="docs-list-bullets">
                <li>confirmar o padrão correto antes de implementar</li>
                <li>comparar variações e estados</li>
                <li>reutilizar a versão mais atual do componente</li>
              </ul>
            </div>
            <div className="docs-stepper-card" id="2-abrir-a-documentacao-do-componente">
              <h3>2) Abrir a documentação do componente</h3>
              <p>Na página do componente, você verá:</p>
              <ul className="docs-list-bullets docs-list-sections">
                <li><strong>Preview</strong> — Visualize o componente em funcionamento e compare variações.</li>
                <li><strong>Código (Exemplos)</strong> — Veja exemplos prontos (por versão) e copie trechos quando fizer sentido.</li>
                <li><strong>Versões</strong> — Cada componente pode ter versões para manter evolução organizada. Use sempre a versão mais recente publicada, quando existir.</li>
                <li><strong>Comentários</strong> — Use comentários para registrar decisões (“por que isso foi feito assim”), discutir mudanças e pedir revisão antes de publicar.</li>
              </ul>
            </div>
            <div className="docs-stepper-card" id="3-copiar-ou-exportar">
              <h3>3) Copiar ou exportar</h3>
              <p>Quando precisar implementar:</p>
              <ul className="docs-list-bullets">
                <li>Copie o snippet do exemplo (para iniciar mais rápido)</li>
                <li>ou baixe a versão para ter os arquivos organizados (ex.: component.html, component.css, README.md)</li>
              </ul>
              <div className="docs-callout docs-callout-note">
                <p><strong>Observação:</strong> alguns exemplos pressupõem dependências (framework, classes CSS, tokens ou dados). Essas dependências são descritas na documentação do componente.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="governanca" className="docs-section">
          <h2>Governança (status e responsabilidades)</h2>
          <div className="docs-two-cards">
            <div className="docs-card" id="status-dos-componentes">
              <h3>Status dos componentes</h3>
              <ul className="docs-list-badges">
                <li><span className="docs-badge docs-badge-draft">Rascunho</span> — em construção. Pode mudar a qualquer momento.</li>
                <li><span className="docs-badge docs-badge-published">Publicado</span> — versão recomendada para uso. Estável e revisada.</li>
                <li><span className="docs-badge docs-badge-archived">Arquivado</span> — não recomendado para novos usos (mantido por histórico).</li>
              </ul>
            </div>
            <div className="docs-card" id="responsaveis-e-revisao">
              <h3>Responsáveis e revisão</h3>
              <p>Cada componente possui um responsável. Mudanças relevantes devem:</p>
              <ul className="docs-list-bullets">
                <li>registrar uma nova versão</li>
                <li>descrever o que mudou no changelog</li>
                <li>(opcional) passar por revisão via comentários antes de publicar</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="boas-praticas" className="docs-section">
          <h2>Boas práticas de uso</h2>
          <div className="docs-two-cards">
            <div className="docs-card" id="para-quem-desenvolve">
              <h3>Para quem desenvolve</h3>
              <ul className="docs-list-bullets">
                <li>Prefira sempre componentes Publicados</li>
                <li>Leia a seção “Como usar” e “Variações” antes de copiar snippet</li>
                <li>Se precisar alterar comportamento visual, proponha via comentário e versão</li>
              </ul>
            </div>
            <div className="docs-card" id="para-quem-designa-define-padrao">
              <h3>Para quem desenha/define padrão</h3>
              <ul className="docs-list-bullets">
                <li>Documente variações e estados (hover, disabled, loading etc.)</li>
                <li>Registre decisões importantes no changelog</li>
                <li>Mantenha componentes consistentes entre si (tokens, espaçamento e tipografia)</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="faq" className="docs-section">
          <h2>FAQ</h2>
          <div className="docs-accordion">
            {FAQ_ITEMS.map((item, i) => (
              <DocAccordionItem
                key={i}
                title={item.question}
                description={null}
                open={faqOpen === i}
                onToggle={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <p className="docs-accordion-answer">{item.answer}</p>
              </DocAccordionItem>
            ))}
          </div>
        </section>

        <section id="contato-e-manutencao" className="docs-section">
          <h2>Contato e manutenção</h2>
          <p>Se você encontrou inconsistências ou precisa de um novo componente:</p>
          <ul className="docs-list-bullets">
            <li>abra um comentário no componente mais próximo</li>
            <li>ou crie uma solicitação interna (conforme o fluxo do projeto)</li>
          </ul>
          {firstComponentId ? (
            <Link to={`/components/${firstComponentId}`} className="btn btn-primary docs-cta">Ir para Componentes</Link>
          ) : (
            <span className="btn btn-primary docs-cta" aria-disabled>Ir para Componentes</span>
          )}
        </section>

        <footer className="docs-footer">
          <p>Belier — portal de documentação de componentes</p>
          <p>
            <a href="https://www.figma.com/design/GMc5W9MzhauUNkxVmB8BRs/Belier-Design-System?node-id=6777-13085&t=gVghlPnWsIbJyCMZ-1" target="_blank" rel="noopener noreferrer">Figma</a>
            {' · '}
            <Link to="/changelog">ChangeLog</Link>
          </p>
        </footer>
      </div>

      <aside className="detail-toc" aria-label="Sumário">
        <div className="detail-toc-inner">
          <p className="detail-toc-title">Sumário</p>
          <ul className="detail-toc-list">
            <li><a href="#o-que-e-o-belier" className={`detail-toc-link ${activeId === 'o-que-e-o-belier' ? 'active' : ''}`}>O que é o Belier</a></li>
            <li><a href="#por-que-usar" className={`detail-toc-link ${activeId === 'por-que-usar' ? 'active' : ''}`}>Por que usar</a></li>
            <li><a href="#o-que-o-belier-nao-e" className={`detail-toc-link ${activeId === 'o-que-o-belier-nao-e' ? 'active' : ''}`}>O que o Belier não é</a></li>
            <li>
              <a href="#como-usar" className={`detail-toc-link ${activeId === 'como-usar' ? 'active' : ''}`}>Como usar</a>
              <ul className="detail-toc-sublist">
                <li><a href="#1-encontrar-um-componente" className={`detail-toc-link ${activeId === '1-encontrar-um-componente' ? 'active' : ''}`}>1) Encontrar um componente</a></li>
                <li><a href="#2-abrir-a-documentacao-do-componente" className={`detail-toc-link ${activeId === '2-abrir-a-documentacao-do-componente' ? 'active' : ''}`}>2) Abrir a documentação</a></li>
                <li><a href="#3-copiar-ou-exportar" className={`detail-toc-link ${activeId === '3-copiar-ou-exportar' ? 'active' : ''}`}>3) Copiar ou exportar</a></li>
              </ul>
            </li>
            <li>
              <a href="#governanca" className={`detail-toc-link ${activeId === 'governanca' ? 'active' : ''}`}>Governança</a>
              <ul className="detail-toc-sublist">
                <li><a href="#status-dos-componentes" className={`detail-toc-link ${activeId === 'status-dos-componentes' ? 'active' : ''}`}>Status dos componentes</a></li>
                <li><a href="#responsaveis-e-revisao" className={`detail-toc-link ${activeId === 'responsaveis-e-revisao' ? 'active' : ''}`}>Responsáveis e revisão</a></li>
              </ul>
            </li>
            <li>
              <a href="#boas-praticas" className={`detail-toc-link ${activeId === 'boas-praticas' ? 'active' : ''}`}>Boas práticas</a>
              <ul className="detail-toc-sublist">
                <li><a href="#para-quem-desenvolve" className={`detail-toc-link ${activeId === 'para-quem-desenvolve' ? 'active' : ''}`}>Para quem desenvolve</a></li>
                <li><a href="#para-quem-designa-define-padrao" className={`detail-toc-link ${activeId === 'para-quem-designa-define-padrao' ? 'active' : ''}`}>Para quem desenha</a></li>
              </ul>
            </li>
            <li><a href="#faq" className={`detail-toc-link ${activeId === 'faq' ? 'active' : ''}`}>FAQ</a></li>
            <li><a href="#contato-e-manutencao" className={`detail-toc-link ${activeId === 'contato-e-manutencao' ? 'active' : ''}`}>Contato e manutenção</a></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
