import { useState, useCallback } from 'react'

interface ShadowLayer {
  id: string
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

const PRESETS: { name: string; layers: Omit<ShadowLayer, 'id'>[] }[] = [
  { name: 'Subtle', layers: [{ offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: '#000000', opacity: 0.12, inset: false }] },
  { name: 'Medium', layers: [{ offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false }, { offsetX: 0, offsetY: 2, blur: 4, spread: -2, color: '#000000', opacity: 0.1, inset: false }] },
  { name: 'Heavy', layers: [{ offsetX: 0, offsetY: 10, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false }, { offsetX: 0, offsetY: 4, blur: 6, spread: -4, color: '#000000', opacity: 0.1, inset: false }] },
  { name: 'Sharp', layers: [{ offsetX: 4, offsetY: 4, blur: 0, spread: 0, color: '#000000', opacity: 0.25, inset: false }] },
  { name: 'Glow', layers: [{ offsetX: 0, offsetY: 0, blur: 20, spread: 5, color: '#3b82f6', opacity: 0.5, inset: false }] },
  { name: 'Neon', layers: [{ offsetX: 0, offsetY: 0, blur: 10, spread: 2, color: '#ec4899', opacity: 0.7, inset: false }, { offsetX: 0, offsetY: 0, blur: 40, spread: 10, color: '#ec4899', opacity: 0.3, inset: false }] },
  { name: 'Inset', layers: [{ offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 0.15, inset: true }] },
  { name: 'Layered', layers: [
    { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.05, inset: false },
    { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 0.05, inset: false },
    { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#000000', opacity: 0.05, inset: false },
    { offsetX: 0, offsetY: 8, blur: 16, spread: 0, color: '#000000', opacity: 0.05, inset: false },
  ]},
]

let nextId = 1
const makeId = () => `layer-${nextId++}`

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function layerToCSS(l: ShadowLayer) {
  return `${l.inset ? 'inset ' : ''}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`
}

function Slider({ label, value, onChange, min, max, unit = 'px' }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit?: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-zinc-400 w-16 shrink-0">{label}</label>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-blue-500 h-1.5" />
      <span className="text-xs text-zinc-500 w-14 text-right font-mono">{value}{unit}</span>
    </div>
  )
}

export default function App() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: makeId(), offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false },
  ])
  const [darkBg, setDarkBg] = useState(false)
  const [boxColor, setBoxColor] = useState('#ffffff')
  const [borderRadius, setBorderRadius] = useState(12)
  const [copied, setCopied] = useState(false)

  const shadowCSS = layers.map(layerToCSS).join(',\n    ')
  const cssText = `box-shadow: ${shadowCSS};`

  const updateLayer = useCallback((id: string, updates: Partial<ShadowLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }, [])

  const addLayer = () => {
    setLayers(prev => [...prev, { id: makeId(), offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: '#000000', opacity: 0.1, inset: false }])
  }

  const removeLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id))
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setLayers(preset.layers.map(l => ({ ...l, id: makeId() })))
  }

  const copyCSS = () => {
    navigator.clipboard.writeText(cssText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-blue-400">shadow</span>
          <span className="text-zinc-500 font-normal ml-1.5 text-sm">CSS box shadow generator</span>
        </h1>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Controls */}
        <div className="lg:w-96 border-r border-zinc-800 overflow-y-auto p-4 space-y-4">
          {/* Presets */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Presets</h3>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)} className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Box settings */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Preview Box</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 w-16">Color</label>
                <input type="color" value={boxColor} onChange={e => setBoxColor(e.target.value)} className="w-8 h-6 rounded border-0 cursor-pointer" />
                <span className="text-xs text-zinc-500 font-mono">{boxColor}</span>
              </div>
              <Slider label="Radius" value={borderRadius} onChange={setBorderRadius} min={0} max={100} />
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 w-16">Dark BG</label>
                <button onClick={() => setDarkBg(!darkBg)} className={`w-8 h-4 rounded-full transition-colors ${darkBg ? 'bg-blue-500' : 'bg-zinc-700'} relative`}>
                  <span className={`block w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${darkBg ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Shadow layers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Shadow Layers ({layers.length})</h3>
              <button onClick={addLayer} className="text-xs text-blue-400 hover:text-blue-300">+ Add</button>
            </div>
            <div className="space-y-3">
              {layers.map((layer, i) => (
                <div key={layer.id} className="bg-zinc-900 rounded-lg p-3 space-y-1.5 border border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-zinc-300">Layer {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateLayer(layer.id, { inset: !layer.inset })} className={`text-xs px-2 py-0.5 rounded ${layer.inset ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        inset
                      </button>
                      {layers.length > 1 && (
                        <button onClick={() => removeLayer(layer.id)} className="text-zinc-600 hover:text-red-400 text-xs">✕</button>
                      )}
                    </div>
                  </div>
                  <Slider label="X" value={layer.offsetX} onChange={v => updateLayer(layer.id, { offsetX: v })} min={-50} max={50} />
                  <Slider label="Y" value={layer.offsetY} onChange={v => updateLayer(layer.id, { offsetY: v })} min={-50} max={50} />
                  <Slider label="Blur" value={layer.blur} onChange={v => updateLayer(layer.id, { blur: v })} min={0} max={100} />
                  <Slider label="Spread" value={layer.spread} onChange={v => updateLayer(layer.id, { spread: v })} min={-50} max={50} />
                  <Slider label="Opacity" value={Math.round(layer.opacity * 100)} onChange={v => updateLayer(layer.id, { opacity: v / 100 })} min={0} max={100} unit="%" />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400 w-16">Color</label>
                    <input type="color" value={layer.color} onChange={e => updateLayer(layer.id, { color: e.target.value })} className="w-8 h-6 rounded border-0 cursor-pointer" />
                    <span className="text-xs text-zinc-500 font-mono">{layer.color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + CSS */}
        <div className="flex-1 flex flex-col">
          {/* Preview area */}
          <div className={`flex-1 flex items-center justify-center p-8 transition-colors ${darkBg ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
            <div
              style={{
                width: 200,
                height: 200,
                backgroundColor: boxColor,
                borderRadius: `${borderRadius}px`,
                boxShadow: layers.map(layerToCSS).join(', '),
                transition: 'box-shadow 0.15s ease, border-radius 0.15s ease',
              }}
            />
          </div>

          {/* CSS output */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">CSS</h3>
              <button onClick={copyCSS} className="text-xs px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-sm font-mono text-zinc-300 bg-zinc-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {cssText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
