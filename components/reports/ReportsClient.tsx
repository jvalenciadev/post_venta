'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  getDailySalesReport,
  getProductSalesReport,
  getSalesByCategory,
  getSalesByPaymentMethod,
  getSalesByOperator
} from '@/lib/actions/reports'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format, subDays } from 'date-fns'
import {
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Layers,
  CreditCard,
  User,
  Loader2,
  ChevronRight,
  Target,
  Activity,
  Download,
  FileText,
  FileSpreadsheet
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#10b981', '#f43f5e', '#eab308']

export default function ReportsClient() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

  const [startDate, setStartDate] = useState(sevenDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [productData, setProductData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [operatorData, setOperatorData] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Sincronización Automática v12.0
  useEffect(() => {
    loadReports()
  }, [])

  function loadReports() {
    startTransition(async () => {
      try {
        const [daily, products, categories, payments, operators] = await Promise.all([
          getDailySalesReport(startDate, endDate),
          getProductSalesReport(startDate, endDate),
          getSalesByCategory(startDate, endDate),
          getSalesByPaymentMethod(startDate, endDate),
          getSalesByOperator(startDate, endDate)
        ])
        setDailyData(daily)
        setProductData(products)
        setCategoryData(categories)
        setPaymentData(payments)
        setOperatorData(operators)
        setLoaded(true)
      } catch (err) {
        console.error('Error sincronizando inteligencia:', err)
      }
    })
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()
    const summary = [
      { Concepto: 'Total Ingresos', Valor: totalRevenue },
      { Concepto: 'Total Pedidos', Valor: totalOrders },
      { Concepto: 'Promedio Ticket', Valor: avgOrder }
    ]
    const wsSummary = XLSX.utils.json_to_sheet(summary)
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen")
    const wsDaily = XLSX.utils.json_to_sheet(dailyData)
    XLSX.utils.book_append_sheet(wb, wsDaily, "Ventas Diarias")
    const wsProducts = XLSX.utils.json_to_sheet(productData)
    XLSX.utils.book_append_sheet(wb, wsProducts, "Top Productos")
    XLSX.writeFile(wb, `Reporte_POS_${startDate}_a_${endDate}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('REPORTE DE INTELIGENCIA POS', 20, 20)
    doc.setFontSize(10)
    doc.text(`Periodo: ${startDate} al ${endDate}`, 20, 30)
    doc.text(`Ingresos Totales: Bs. ${totalRevenue.toFixed(2)}`, 20, 40)
    autoTable(doc, {
      startY: 50,
      head: [['Fecha', 'Ingresos', 'Pedidos']],
      body: dailyData.map(d => [d.date, d.total_revenue, d.total_orders]),
    })
    doc.save(`Reporte_POS_${startDate}.pdf`)
  }

  const totalRevenue = dailyData.reduce((s, d) => s + d.total_revenue, 0)
  const totalOrders = dailyData.reduce((s, d) => s + d.total_orders, 0)
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="h-full flex flex-col gap-8 pb-32 animate-v10-in overflow-y-auto pr-4 custom-scrollbar no-scrollbar lg:custom-scrollbar">
      {/* Header section v11.5 - INTEL CENTER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 glass-modern p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
          <div className="w-20 h-20 rounded-[2.2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.1)] group">
            <Activity className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.5em] opacity-80">Intelligence v12.0</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              PANEL DE <span className="text-orange-500">MANDO</span>
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/5 group"
              >
                <FileSpreadsheet className="w-3 h-3 group-hover:scale-110 transition-transform" /> EXCEL
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 group"
              >
                <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Date Filters - Optimized Senior UI */}
        <div className="relative z-10 flex flex-col sm:flex-row items-end gap-3 glass-modern p-4 rounded-[2.5rem] border-white/5 bg-black/20">
          <div className="space-y-1">
            <label className="text-[7px] font-black text-gray-600 uppercase tracking-widest ml-4">Génesis</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-v10 px-5 py-2.5 text-[10px] bg-transparent border-white/10"
              max={endDate}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[7px] font-black text-gray-600 uppercase tracking-widest ml-4">Término</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-v10 px-5 py-2.5 text-[10px] bg-transparent border-white/10"
              min={startDate}
            />
          </div>
          <button
            onClick={loadReports}
            disabled={isPending}
            className="btn-v10-primary p-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all h-[42px] w-[42px] flex items-center justify-center"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!loaded && !isPending && (
        <div className="flex-1 flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] opacity-30">
          <TrendingUp className="w-20 h-20 text-gray-700 mb-6 animate-pulse" />
          <p className="text-[12px] font-black uppercase tracking-[0.8em]">Esperando Datos de Red...</p>
        </div>
      )}

      {(loaded || isPending) && (
        <div className={`space-y-8 transition-all duration-700 ${isPending ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
          {/* Global Metrics - Ultra-Sleek */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'INGRESOS TOTALES', value: `Bs. ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'TOTAL PEDIDOS', value: totalOrders, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'PROMEDIO TICKET', value: `Bs. ${avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((stat, i) => (
              <div key={i} className="glass-modern p-10 rounded-[3rem] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-30`} />
                <div className="flex items-center gap-8 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5 group-hover:rotate-12 transition-transform`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Analytics Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Flow Chart - Large Area */}
            <div className="lg:col-span-2 glass-modern p-10 rounded-[3.5rem] border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Flujo de Ingresos</h2>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.3em]">Fluctuación de capital en la red operativa</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="h-[350px] w-full mt-6 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#ffffff10"
                      tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 900 }}
                      tickFormatter={(v) => format(new Date(v + 'T00:00:00'), 'dd/MM')}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#ffffff10"
                      tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 900 }}
                      tickFormatter={(v) => `Bs.${v}`}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000f0', border: '1px solid #ffffff10', borderRadius: '1.5rem', backdropFilter: 'blur(10px)', color: '#fff' }}
                      itemStyle={{ color: '#f97316', fontWeight: 900, textTransform: 'uppercase', fontSize: '9px' }}
                      labelStyle={{ marginBottom: '8px', opacity: 0.5, fontSize: '7px' }}
                      formatter={(v) => [`Bs. ${v}`, 'INGRESOS']}
                    />
                    <Area type="monotone" dataKey="total_revenue" stroke="#f97316" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales by Category - Donut Chart v12 */}
            <div className="glass-modern p-10 rounded-[3.5rem] border-white/5 flex flex-col">
              <h2 className="text-xl font-black text-white mb-6 uppercase italic tracking-tighter">Nodos de Venta</h2>
              <div className="flex-1 min-h-[250px] relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Global</p>
                  <Layers className="w-5 h-5 text-orange-500 mt-1 opacity-40" />
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000f0', border: '1px solid #ffffff10', borderRadius: '1rem', color: '#fff' }}
                      formatter={(v) => [`Bs. ${Number(v).toFixed(2)}`, 'VALOR']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {categoryData.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-default group">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[9px] font-black text-gray-500 group-hover:text-white/60 uppercase tracking-widest truncate transition-colors">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocolos de Pago - Creative Bar */}
            <div className="glass-modern p-10 rounded-[3.5rem] border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <CreditCard className="w-6 h-6 text-blue-500 opacity-40" />
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Red de Pagos</h2>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#ffffff20" tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 900 }} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '1rem' }}
                      formatter={(v) => [`Bs. ${Number(v).toFixed(2)}`, 'MONTO']}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales by Operator - Cyber Nodes */}
            <div className="glass-modern p-10 rounded-[3.5rem] border-white/5">
              <h2 className="text-xl font-black text-white mb-8 uppercase italic tracking-tighter">Operadores de Ventas</h2>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {operatorData.length === 0 ? (
                  <p className="text-[9px] text-gray-800 italic uppercase text-center py-10">Sin telemetría operativa</p>
                ) : (
                  operatorData.map((op, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-orange-500/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/5 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{op.name}</p>
                          <p className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">Nodo Verificado</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white tracking-tighter">Bs. {op.value.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* High Demand Nodes - Progress View */}
            <div className="glass-modern p-10 rounded-[3.5rem] border-white/5">
              <h2 className="text-xl font-black text-white mb-8 uppercase italic tracking-tighter">Top Activos</h2>
              <div className="space-y-4">
                {productData.slice(0, 5).map((node, i) => {
                  const maxRevenue = productData[0]?.total_revenue || 1
                  const pct = (node.total_revenue / maxRevenue) * 100
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <p className="text-[11px] font-black text-white uppercase tracking-tighter truncate max-w-[150px] italic">{node.product_name}</p>
                        <span className="text-[9px] font-black text-orange-500 tracking-tighter">Bs. {node.total_revenue.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
