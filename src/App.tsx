import { useMemo, useState } from 'react';
import { generatePlanSketch } from './api/client';
import { ResultCard } from './components/ResultCard';
import { StepPill } from './components/StepPill';
import { TypeCard } from './components/TypeCard';
import type { GenerateResult, GenerationStep, OutputType } from './types';

const OUTPUT_OPTIONS: Array<{ type: OutputType; description: string }> = [
  {
    type: '功能分区图',
    description: '强调地块功能、结构层级和颜色区分，适合方案汇报和概念阶段表达。'
  },
  {
    type: '流线分析图',
    description: '突出人流、车流、慢行与关键节点，适合展示组织逻辑与动线关系。'
  },
  {
    type: '鸟瞰表达图',
    description: '生成偏视觉化的总体鸟瞰效果，适合快速验证空间氛围与体块关系。'
  }
];

const STEP_LABELS = ['上传参考', '选择类型', '补充描述', '生成结果'];

function App() {
  const [step, setStep] = useState<GenerationStep>('welcome');
  const [outputType, setOutputType] = useState<OutputType>('功能分区图');
  const [description, setDescription] = useState('温和的城市设计表达，强化公共空间、开放界面和慢行系统，配色偏沙色与蓝绿色。');
  const [referenceImageName, setReferenceImageName] = useState('');
  const [referenceImageDataUrl, setReferenceImageDataUrl] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');

  const currentStepIndex = useMemo(() => {
    if (step === 'welcome') return 1;
    if (step === 'editing') return 3;
    if (step === 'generating') return 4;
    return 4;
  }, [step]);

  const canGenerate = Boolean(referenceImageDataUrl && outputType && description.trim());

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === 'string' ? reader.result : '';
      setReferenceImageName(file.name);
      setReferenceImageDataUrl(data);
      setStep('editing');
      setError('');
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!canGenerate) {
      setError('请先上传参考图，并补充生成说明。');
      return;
    }

    setStep('generating');
    setError('');

    try {
      const generated = await generatePlanSketch({
        outputType,
        description,
        referenceImageName,
        referenceImageDataUrl
      });
      setResult(generated);
      setStep('result');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '生成失败，请稍后重试。');
      setStep('editing');
    }
  }

  function resetFlow() {
    setStep('welcome');
    setResult(null);
    setError('');
  }

  return (
    <div className="app-shell">
      <div className="background-orb orb-left" />
      <div className="background-orb orb-right" />

      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">PlanSketch MVP</span>
          <h1>把底图、截图和手绘，快速变成更像产品的规划表达图。</h1>
          <p>
            面向城乡规划、建筑概念表达和方案汇报的 AI 图像生成原型。当前版本完成前端流程与 mock 后端接口，方便后续接入图像理解、Prompt 生成和实际生图服务。
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => setStep('editing')}>
              开始生成
            </button>
            <a href="#workspace" className="secondary-link">
              查看工作台
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <span className="panel-tag">MVP Workflow</span>
          <div className="step-pills">
            {STEP_LABELS.map((label, index) => (
              <StepPill key={label} label={label} index={index + 1} active={index + 1 <= currentStepIndex} />
            ))}
          </div>
          <div className="hero-metrics">
            <div>
              <strong>3</strong>
              <span>表达类型</span>
            </div>
            <div>
              <strong>Mock</strong>
              <span>后端可替换</span>
            </div>
            <div>
              <strong>0</strong>
              <span>登录依赖</span>
            </div>
          </div>
        </div>
      </header>

      <main id="workspace" className="workspace-grid">
        <section className="workspace-panel form-panel">
          <div className="section-heading">
            <span>Workspace</span>
            <h2>生成流程</h2>
          </div>

          <label className="upload-panel">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div>
              <span className="upload-kicker">上传参考图</span>
              <h3>支持底图、截图、手绘、CAD 截图</h3>
              <p>推荐上传结构清晰的 JPG / PNG，方便后续接入图像理解服务。</p>
              <strong>{referenceImageName || '点击或拖拽上传文件'}</strong>
            </div>
          </label>

          {referenceImageDataUrl ? (
            <div className="reference-preview">
              <img src={referenceImageDataUrl} alt="参考图预览" />
              <div>
                <span className="preview-tag">Reference</span>
                <p>{referenceImageName}</p>
              </div>
            </div>
          ) : null}

          <div className="field-block">
            <div className="field-label-row">
              <h3>选择输出类型</h3>
              <span>Step 02</span>
            </div>
            <div className="type-grid">
              {OUTPUT_OPTIONS.map((option) => (
                <TypeCard
                  key={option.type}
                  type={option.type}
                  description={option.description}
                  selected={option.type === outputType}
                  onClick={setOutputType}
                />
              ))}
            </div>
          </div>

          <div className="field-block">
            <div className="field-label-row">
              <h3>补充描述</h3>
              <span>Step 03</span>
            </div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="例如：突出公共空间、保留现状水系、强调轴线关系，整体偏竞赛图纸风格。"
              rows={6}
            />
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          <div className="action-row">
            <button type="button" className="primary-btn" onClick={handleGenerate} disabled={step === 'generating'}>
              {step === 'generating' ? '生成中...' : '生成表达图'}
            </button>
            <button type="button" className="ghost-btn" onClick={resetFlow}>
              重置
            </button>
          </div>
        </section>

        <section className="workspace-panel result-panel">
          <div className="section-heading">
            <span>Output</span>
            <h2>{step === 'result' ? '结果展示' : '状态预览'}</h2>
          </div>

          {step === 'generating' ? (
            <div className="loading-state">
              <div className="loading-ring" />
              <h3>正在生成 mock 结果</h3>
              <p>当前流程会模拟：图像理解 -&gt; Prompt 拼装 -&gt; 图像生成 -&gt; 结果整理。</p>
              <div className="loading-steps">
                <span>Analyzing reference...</span>
                <span>Building prompt...</span>
                <span>Rendering variations...</span>
              </div>
            </div>
          ) : null}

          {step !== 'result' && step !== 'generating' ? (
            <div className="placeholder-state">
              <span className="placeholder-tag">Preview</span>
              <h3>上传一张参考图，开始你的第一轮表达。</h3>
              <p>
                原型当前使用 mock 数据返回 3 张变体图，同时保留后端服务分层，后续可以无缝切换到真实图像模型接口。
              </p>
              <div className="placeholder-specs">
                <span>参考图解析</span>
                <span>表达类型映射</span>
                <span>Prompt 组装</span>
                <span>结果页展示</span>
              </div>
            </div>
          ) : null}

          {step === 'result' && result ? (
            <div className="result-stack">
              <div className="result-summary">
                <span className="placeholder-tag">{result.outputType}</span>
                <h3>{result.title}</h3>
                <p>{result.summary}</p>
              </div>

              <div className="result-meta-grid">
                <div>
                  <span>参考文件</span>
                  <strong>{result.referenceImageName || '未命名参考图'}</strong>
                </div>
                <div>
                  <span>Prompt 草稿</span>
                  <strong>{result.promptDraft}</strong>
                </div>
              </div>

              <div className="result-list">
                {result.variants.map((variant) => (
                  <ResultCard key={variant.id} label={variant.label} imageUrl={variant.imageUrl} notes={variant.notes} />
                ))}
              </div>

              <div className="next-actions-box">
                <span className="placeholder-tag">下一步可接入</span>
                <ul>
                  {result.suggestedNextActions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
