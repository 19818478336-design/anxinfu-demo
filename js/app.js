/**
 * 安心付 · 预付消费商户风险查询平台
 * 查询逻辑 & 演示数据 — v2 完整版
 */

const RING_CIRCUMFERENCE = 2 * Math.PI * 60;

/* ═══════════════════════════════════════════
   行业基准数据（模拟，与申报书 chart3 一致）
   ═══════════════════════════════════════════ */
const INDUSTRY = {
  '健身服务':   { avgScore: 42, medianScore: 40, p25: 24, p75: 58,备案率: 38,存管达标率: 31, merchantCount: 3200 },
  '美容美发':   { avgScore: 45, medianScore: 43, p25: 28, p75: 60,备案率: 42,存管达标率: 35, merchantCount: 2800 },
  '教育培训':   { avgScore: 48, medianScore: 46, p25: 30, p75: 62,备案率: 44,存管达标率: 38, merchantCount: 2100 },
  '餐饮服务':   { avgScore: 58, medianScore: 56, p25: 38, p75: 72,备案率: 56,存管达标率: 48, merchantCount: 4500 },
  '家政服务':   { avgScore: 52, medianScore: 50, p25: 32, p75: 68,备案率: 50,存管达标率: 42, merchantCount: 1200 },
  '婚介服务':   { avgScore: 24, medianScore: 22, p25: 12, p75: 35,备案率: 18,存管达标率: 14, merchantCount: 380 },
};

/* ═══════════════════════════════════════════
   城区风险概览（模拟数据）
   ═══════════════════════════════════════════ */
const DISTRICTS = [
  { name:'浦东新区', highRisk: 41, midRisk: 33, lowRisk: 26, total: 1860 },
  { name:'闵行区',   highRisk: 38, midRisk: 35, lowRisk: 27, total: 1020 },
  { name:'宝山区',   highRisk: 44, midRisk: 32, lowRisk: 24, total: 870 },
  { name:'松江区',   highRisk: 43, midRisk: 34, lowRisk: 23, total: 750 },
  { name:'嘉定区',   highRisk: 39, midRisk: 35, lowRisk: 26, total: 690 },
  { name:'杨浦区',   highRisk: 42, midRisk: 33, lowRisk: 25, total: 640 },
  { name:'徐汇区',   highRisk: 35, midRisk: 36, lowRisk: 29, total: 580 },
  { name:'静安区',   highRisk: 36, midRisk: 37, lowRisk: 27, total: 550 },
  { name:'黄浦区',   highRisk: 36, midRisk: 35, lowRisk: 29, total: 520 },
  { name:'普陀区',   highRisk: 43, midRisk: 34, lowRisk: 23, total: 500 },
  { name:'长宁区',   highRisk: 33, midRisk: 38, lowRisk: 29, total: 460 },
  { name:'虹口区',   highRisk: 40, midRisk: 36, lowRisk: 24, total: 430 },
  { name:'奉贤区',   highRisk: 42, midRisk: 33, lowRisk: 25, total: 380 },
  { name:'青浦区',   highRisk: 40, midRisk: 34, lowRisk: 26, total: 340 },
  { name:'金山区',   highRisk: 39, midRisk: 35, lowRisk: 26, total: 280 },
  { name:'崇明区',   highRisk: 39, midRisk: 33, lowRisk: 28, total: 160 },
];

/* ═══════════════════════════════════════════
   演示商户数据（8家，覆盖6行业×3风险等级）
   ═══════════════════════════════════════════ */
const DEMO = {
  /* ── 绿色 · 低风险 ── */
  '111': {
    name:'星恒健身工作室', type:'健身服务',
    address:'上海市嘉定区塔城路295号', credit_code:'91310114MA1G******',
    legal_person:'陈建国', established:'2017-03-15', registered_capital:'500万元',
    score:95, grade:'green', grade_label:'绿色 · 低风险',
    verdict:'该商户综合风险较低，可以放心办卡',
    advice:'备案齐全、经营稳定、无涉诉记录。建议保留合同与付款凭证。',
    signals: [],
    dims: [
      { name:'合规度', score:100, weight:'×40%', detail:'已备案 · 资金存管40%（建设银行）· 信息报送正常' },
      { name:'稳定度', score:92, weight:'×25%', detail:'成立8年+ · 社保28人 · 无异常 · 无处罚 · 法人3年无变更' },
      { name:'纠纷度', score:96, weight:'×25%', detail:'近2年涉诉0件 · 年投诉1件（已和解）' },
      { name:'规模可信度', score:85, weight:'×10%', detail:'注册资本500万 vs 年卡5000元，比例合理' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','ok','已备案','备案号：沪预付备2024003287号'],
      ['上海市预付卡备案平台','资金存管','ok','40%（足额）','存管银行：中国建设银行上海嘉定支行'],
      ['国家企业信用信息公示系统','成立日期','ok','2017-03-15','持续经营超过8年'],
      ['国家企业信用信息公示系统','社保人数','ok','28人','年报公示数据，与宣称规模一致'],
      ['国家企业信用信息公示系统','经营异常','ok','无',''],
      ['国家企业信用信息公示系统','行政处罚','ok','无',''],
      ['国家企业信用信息公示系统','法人变更','ok','近3年无变更',''],
      ['中国裁判文书网','涉诉记录','ok','0件','无消费合同纠纷'],
      ['12315消费投诉公示','投诉密度','ok','1.2件/年','远低于健身行业均值28件/年']
    ]
  },
  '222': {
    name:'永馨家政服务', type:'家政服务',
    address:'上海市徐汇区漕溪北路398号', credit_code:'91310104MA1F******',
    legal_person:'王秀兰', established:'2016-08-20', registered_capital:'300万元',
    score:95, grade:'green', grade_label:'绿色 · 低风险',
    verdict:'该商户综合风险较低，可以放心办卡',
    advice:'备案完整、存管到位、无涉诉。家政行业整体合规水平较高，该商户处于行业前列。',
    signals: [],
    dims: [
      { name:'合规度', score:95, weight:'×40%', detail:'已备案 · 资金存管45%（上海银行）· 信息报送及时' },
      { name:'稳定度', score:99, weight:'×25%', detail:'成立9年+ · 社保42人 · 无异常 · 无处罚 · 法人稳定' },
      { name:'纠纷度', score:96, weight:'×25%', detail:'近2年涉诉0件 · 年投诉2件（均和解）' },
      { name:'规模可信度', score:85, weight:'×10%', detail:'注册资本300万，年卡面额3800元，比例合理' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','ok','已备案','备案号：沪预付备2022001567号'],
      ['上海市预付卡备案平台','资金存管','ok','45%（足额）','存管银行：上海银行徐汇支行'],
      ['国家企业信用信息公示系统','成立日期','ok','2016-08-20','持续经营超过9年'],
      ['国家企业信用信息公示系统','社保人数','ok','42人','年报公示数据'],
      ['国家企业信用信息公示系统','经营异常','ok','无',''],
      ['国家企业信用信息公示系统','行政处罚','ok','无',''],
      ['国家企业信用信息公示系统','法人变更','ok','近3年无变更',''],
      ['中国裁判文书网','涉诉记录','ok','0件',''],
      ['12315消费投诉公示','投诉密度','ok','2件/年','家政行业均值6件/年']
    ]
  },

  /* ── 黄色 · 需关注 ── */
  '333': {
    name:'味源餐饮管理', type:'餐饮服务',
    address:'上海市静安区南京西路1618号', credit_code:'91310106MA1G******',
    legal_person:'赵德胜', established:'2021-11-01', registered_capital:'100万元',
    score:78, grade:'yellow', grade_label:'黄色 · 需关注',
    verdict:'该商户存在部分风险因素，建议了解具体情况后决定',
    advice:'已备案但存管比例仅为最低标准（20%），有少量投诉记录且和解率偏低。建议优先选择短期卡。',
    signals: ['存管比例仅达法定最低标准','投诉和解率偏低（55%）'],
    dims: [
      { name:'合规度', score:84, weight:'×40%', detail:'已备案 · 资金存管20%（最低标准，平安银行）· 发卡面额偏大' },
      { name:'稳定度', score:74, weight:'×25%', detail:'成立4年+ · 社保15人 · 无异常 · 1条行政处罚（食品安全警告）' },
      { name:'纠纷度', score:70, weight:'×25%', detail:'近2年涉诉1件（已结案）· 年投诉11件，和解率55%' },
      { name:'规模可信度', score:85, weight:'×10%', detail:'注册资本100万 vs 季卡2500元，比例可接受' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','ok','已备案','备案号：沪预付备2023004421号'],
      ['上海市预付卡备案平台','资金存管','warn','20%（最低标准）','存管银行：平安银行上海分行'],
      ['国家企业信用信息公示系统','成立日期','ok','2021-11-01','经营4年+'],
      ['国家企业信用信息公示系统','社保人数','warn','15人','年报公示数据'],
      ['国家企业信用信息公示系统','经营异常','ok','无',''],
      ['国家企业信用信息公示系统','行政处罚','warn','1条','2024-02 食品安全警告'],
      ['国家企业信用信息公示系统','法人变更','ok','近3年1次','2023.06正常变更'],
      ['中国裁判文书网','涉诉记录','warn','1件','2024年餐饮服务合同纠纷（已结案）'],
      ['12315消费投诉公示','投诉密度','bad','11件/年','高于餐饮行业均值8件/年'],
      ['12315消费投诉公示','和解率','warn','55%','偏低']
    ]
  },
  '444': {
    name:'雅尚美容美发', type:'美容美发',
    address:'上海市浦东新区张杨路601号', credit_code:'91310115MA1H******',
    legal_person:'刘美玲', established:'2022-06-15', registered_capital:'50万元',
    score:76, grade:'yellow', grade_label:'黄色 · 需关注',
    verdict:'该商户存在多项需要关注的风险信号',
    advice:'虽已备案但成立时间较短，投诉量偏高，注册资本偏低。建议选择短期卡或次卡，避免大额充值。',
    signals: ['成立不足4年','投诉密度为行业均值1.7倍','注册资本仅50万'],
    dims: [
      { name:'合规度', score:89, weight:'×40%', detail:'已备案 · 资金存管30%（招商银行）· 发卡类型多样' },
      { name:'稳定度', score:70, weight:'×25%', detail:'成立3年 · 社保8人 · 无异常 · 无处罚 · 法人1次变更' },
      { name:'纠纷度', score:58, weight:'×25%', detail:'近2年涉诉2件 · 年投诉31件，高于行业均值' },
      { name:'规模可信度', score:85, weight:'×10%', detail:'注册资本50万偏低，年卡最高面额8888元——需关注' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','ok','已备案','备案号：沪预付备2024001123号'],
      ['上海市预付卡备案平台','资金存管','ok','30%','存管银行：招商银行浦东支行'],
      ['国家企业信用信息公示系统','成立日期','warn','2022-06-15','经营不足4年'],
      ['国家企业信用信息公示系统','注册资本','warn','50万元','年卡面额最高8888元，比值偏高'],
      ['国家企业信用信息公示系统','社保人数','warn','8人','年报公示数据'],
      ['国家企业信用信息公示系统','经营异常','ok','无',''],
      ['国家企业信用信息公示系统','行政处罚','ok','无',''],
      ['国家企业信用信息公示系统','法人变更','warn','近3年1次','2024.03变更'],
      ['中国裁判文书网','涉诉记录','bad','2件','1件美容服务纠纷+1件退款纠纷'],
      ['12315消费投诉公示','投诉密度','bad','31件/年','美容行业均值18件/年']
    ]
  },
  '555': {
    name:'智学教育培训', type:'教育培训',
    address:'上海市杨浦区国定路335号', credit_code:'91310110MA1G******',
    legal_person:'李明远', established:'2023-02-01', registered_capital:'200万元',
    score:73, grade:'yellow', grade_label:'黄色 · 需关注',
    verdict:'该商户存在多项风险因素，需谨慎决策',
    advice:'成立时间短、涉诉记录较多且含消费者败诉案件、投诉趋势上升。如确需办卡，建议选择短期培训课程。',
    signals: ['成立不足4年','涉诉2件（含1件消费者败诉）','投诉量呈上升趋势','存管为最低标准'],
    dims: [
      { name:'合规度', score:81, weight:'×40%', detail:'已备案 · 资金存管20%（最低标准，农商行）· 信息报送正常' },
      { name:'稳定度', score:67, weight:'×25%', detail:'成立2年+ · 社保12人 · 无异常 · 1条行政处罚（虚假宣传）' },
      { name:'纠纷度', score:64, weight:'×25%', detail:'近2年涉诉2件（1件消费者败诉）· 年投诉24件，上升趋势' },
      { name:'规模可信度', score:85, weight:'×10%', detail:'注册资本200万，课程年费最高1.2万，比例偏紧' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','ok','已备案','备案号：沪预付备2024005582号'],
      ['上海市预付卡备案平台','资金存管','warn','20%（最低标准）','存管银行：上海农商银行杨浦支行'],
      ['国家企业信用信息公示系统','成立日期','warn','2023-02-01','经营不足4年'],
      ['国家企业信用信息公示系统','社保人数','warn','12人','年报公示数据，宣称"30+名师"'],
      ['国家企业信用信息公示系统','经营异常','ok','无',''],
      ['国家企业信用信息公示系统','行政处罚','bad','1条','2024-12 因虚假宣传被罚款3万元'],
      ['国家企业信用信息公示系统','法人变更','ok','无',''],
      ['中国裁判文书网','涉诉记录','bad','2件','1件培训合同纠纷（消费者败诉）+1件退款纠纷'],
      ['12315消费投诉公示','投诉密度','bad','24件/年','教培行业均值15件/年'],
      ['12315消费投诉公示','投诉趋势','bad','上升','近6月呈上升趋势']
    ]
  },

  /* ── 红色 · 高风险 ── */
  '666': {
    name:'力美健身俱乐部', type:'健身服务',
    address:'上海市嘉定区城中路78号B1层', credit_code:'91310114MA1G******',
    legal_person:'张伟（1年第3任）', established:'2025-08-01', registered_capital:'10万元',
    score:30, grade:'red', grade_label:'红色 · 高风险',
    verdict:'该商户存在严重风险，强烈不建议办卡',
    advice:'未备案、成立不足1年、注册资本极低、法人频繁变更、多条涉诉与投诉记录叠加——跑路风险极高。',
    signals: ['未备案（违规）','无资金存管','成立不足1年','注册资本仅10万','1年内法人变更3次','经营异常','行政处罚','涉诉4件（含执行终本）','投诉密度为行业均值2.7倍'],
    dims: [
      { name:'合规度', score:20, weight:'×40%', detail:'未备案 · 无资金存管 · 发卡行为已违反《上海市单用途预付消费卡管理规定》' },
      { name:'稳定度', score:22, weight:'×25%', detail:'成立不足1年 · 社保仅2人 · 经营异常1条 · 行政处罚1条 · 1年内法人变更3次' },
      { name:'纠纷度', score:30, weight:'×25%', detail:'近2年涉诉4件（3件退款纠纷）· 年投诉23件 · 2件执行终本' },
      { name:'规模可信度', score:70, weight:'×10%', detail:'注册资本10万，年卡5888元——卖17张卡即超注册资本' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','bad','未备案','发卡行为已涉嫌违规'],
      ['上海市预付卡备案平台','资金存管','bad','无存管记录','预收资金无任何银行存管，可随时转移'],
      ['国家企业信用信息公示系统','成立日期','bad','2025-08-01','经营不足10个月'],
      ['国家企业信用信息公示系统','注册资本','bad','10万元','年卡5888元，卖17张即超注册资本'],
      ['国家企业信用信息公示系统','社保人数','bad','2人','宣称"20+教练"，实缴社保仅2人'],
      ['国家企业信用信息公示系统','经营异常','bad','1条','2025-12-15 通过登记住所无法联系'],
      ['国家企业信用信息公示系统','行政处罚','bad','1条','2025-11-03 因虚假宣传被处罚'],
      ['国家企业信用信息公示系统','法人变更','bad','1年3次','2025.06李→王 | 09王→赵 | 12赵→张伟'],
      ['中国裁判文书网','涉诉记录','bad','4件','3件预付卡退款纠纷（消费者胜诉）'],
      ['中国裁判文书网','执行状态','bad','2件未执行','无可执行财产，已终本'],
      ['12315消费投诉公示','年投诉量','bad','23件','投诉密度为行业均值2.7倍']
    ]
  },
  '777': {
    name:'真爱婚介服务', type:'婚介服务',
    address:'上海市黄浦区人民路885号', credit_code:'91310101MA1F******',
    legal_person:'周建国（第5任）', established:'2024-05-20', registered_capital:'30万元',
    score:24, grade:'red', grade_label:'红色 · 高风险',
    verdict:'该商户存在严重风险，强烈不建议办卡',
    advice:'婚介行业整体风险偏高，该商户在所有维度均显著低于行业基准。未备案、法人频繁变更、单笔损失极高（行业均值9000元）——不建议办理任何预付服务。',
    signals: ['未备案（违规）','无资金存管','成立不足3年','法人变更频繁（2年5次）','涉诉8件（含执行终本）','投诉密度为行业均值4.6倍','单笔平均损失超万元'],
    dims: [
      { name:'合规度', score:10, weight:'×40%', detail:'未备案 · 无资金存管 · 婚介行业备案率仅18%，该商户属典型"三无"状态' },
      { name:'稳定度', score:18, weight:'×25%', detail:'成立不足3年 · 社保3人 · 经营异常1条 · 2年内法人变更5次' },
      { name:'纠纷度', score:25, weight:'×25%', detail:'近2年涉诉8件 · 年投诉55件 · 3件执行终本 · 消费者胜诉率91%' },
      { name:'规模可信度', score:82, weight:'×10%', detail:'注册资本30万 vs 会员费2.98万——实际风险远大于财务指标显示' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','bad','未备案','婚介行业未备案问题严重'],
      ['上海市预付卡备案平台','资金存管','bad','无存管','会员费全额无存管保障'],
      ['国家企业信用信息公示系统','成立日期','bad','2024-05-20','经营不足2年半'],
      ['国家企业信用信息公示系统','注册资本','bad','30万元','会员费最高2.98万，明显不匹配'],
      ['国家企业信用信息公示系统','社保人数','bad','3人','年报公示数据'],
      ['国家企业信用信息公示系统','经营异常','bad','1条','2025-08 通过登记住所无法联系'],
      ['国家企业信用信息公示系统','法人变更','bad','2年5次','极度异常——典型跑路前兆'],
      ['中国裁判文书网','涉诉记录','bad','8件','6件婚介服务纠纷，消费者胜诉率91%'],
      ['中国裁判文书网','执行状态','bad','3件终本','名下无可执行财产'],
      ['12315消费投诉公示','投诉密度','bad','55件/年','婚介行业均值12件/年']
    ]
  },
  '888': {
    name:'丽人美容美体', type:'美容美发',
    address:'上海市闵行区七莘路3155号', credit_code:'91310112MA1G******',
    legal_person:'陈丽丽', established:'2024-09-01', registered_capital:'20万元',
    score:42, grade:'red', grade_label:'红色 · 高风险',
    verdict:'该商户存在严重风险，强烈不建议办卡',
    advice:'未备案、成立短、注册资本极低、投诉密度远超行业均值——多个高风险信号叠加。不建议办理任何预付服务。',
    signals: ['未备案（违规）','无资金存管','成立不足2年','注册资本仅20万','投诉密度为行业均值2.8倍','涉诉3件'],
    dims: [
      { name:'合规度', score:15, weight:'×40%', detail:'未备案 · 无资金存管 · 无任何合规信息' },
      { name:'稳定度', score:30, weight:'×25%', detail:'成立不足2年 · 社保5人 · 无异常 · 无处罚 · 法人未变' },
      { name:'纠纷度', score:25, weight:'×25%', detail:'近2年涉诉3件 · 年投诉50件，行业均值2.8倍 · 和解率35%' },
      { name:'规模可信度', score:75, weight:'×10%', detail:'注册资本虽低但单次消费金额不高，此项风险可控' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','bad','未备案','无备案记录'],
      ['上海市预付卡备案平台','资金存管','bad','无存管','无任何资金存管记录'],
      ['国家企业信用信息公示系统','成立日期','bad','2024-09-01','经营不足2年'],
      ['国家企业信用信息公示系统','注册资本','bad','20万元','偏低'],
      ['国家企业信用信息公示系统','社保人数','bad','5人','年报公示数据'],
      ['国家企业信用信息公示系统','经营异常','ok','无',''],
      ['国家企业信用信息公示系统','行政处罚','ok','无',''],
      ['国家企业信用信息公示系统','法人变更','ok','无',''],
      ['中国裁判文书网','涉诉记录','bad','3件','美容服务合同纠纷'],
      ['12315消费投诉公示','投诉密度','bad','50件/年','美容行业均值18件/年'],
      ['12315消费投诉公示','和解率','bad','35%','极低']
    ]
  }
};

/* ═══════════════════════════════════════════
   名称 → 代号映射
   ═══════════════════════════════════════════ */
const DEMO_BY_NAME = (function(){
  var m = {
    '星恒健身工作室':'111','星恒健身':'111',
    '永馨家政服务':'222','永馨家政':'222',
    '味源餐饮管理':'333','味源餐饮':'333',
    '雅尚美容美发':'444','雅尚美容':'444',
    '智学教育培训':'555','智学教育':'555',
    '力美健身俱乐部':'666','力美健身':'666',
    '真爱婚介服务':'777','真爱婚介':'777',
    '丽人美容美体':'888','丽人美容':'888'
  };
  return m;
})();

/* ═══════════════════════════════════════════
   模糊搜索索引
   ═══════════════════════════════════════════ */
function fuzzySearch(query) {
  var q = query.replace(/\s+/g,'').toLowerCase();
  if (!q) return null;

  // 精确匹配代号
  if (DEMO[q]) return DEMO[q];

  // 精确匹配名称
  if (DEMO_BY_NAME[query]) return DEMO[DEMO_BY_NAME[query]];

  // 模糊匹配：遍历所有商户
  var best = null, bestScore = 0;
  var keys = Object.keys(DEMO);
  for (var i = 0; i < keys.length; i++) {
    var d = DEMO[keys[i]];
    var name = d.name.replace(/\s+/g,'').toLowerCase();
    var score = matchScore(q, name);
    if (score > bestScore) { bestScore = score; best = d; }
    // 也搜简称
    var short = name.replace(/健身工作室|健身俱乐部|家政服务|餐饮管理|美容美发|教育培训|婚介服务|美容美体/g,'');
    score = matchScore(q, short);
    if (score > bestScore) { bestScore = score; best = d; }
  }

  return bestScore > 0.3 ? best : null;
}

function matchScore(q, target) {
  if (target.indexOf(q) !== -1) return 1 - (target.length - q.length) / target.length * 0.3;
  // 字符重叠度
  var overlap = 0;
  for (var i = 0; i < q.length; i++) {
    if (target.indexOf(q[i]) !== -1) overlap++;
  }
  return overlap / Math.max(q.length, target.length);
}

/* ═══════════════════════════════════════════
   搜索历史
   ═══════════════════════════════════════════ */
var searchHistory = [
  { name:'一兆韦德健身', time:'2分钟前' },
  { name:'星恒健身工作室', time:'18分钟前' },
  { name:'力美健身俱乐部', time:'42分钟前' }
];

/* ═══════════════════════════════════════════
   查询入口
   ═══════════════════════════════════════════ */
function quickSearch(code) {
  document.getElementById('searchInput').value = code;
  doSearch();
}

/* ═══════════════════════════════════════════
   混合模式：先尝试后端 API，失败则用本地数据
   ═══════════════════════════════════════════ */
var USE_API = false; // 独立模式（GitHub Pages）；部署后端后改为 true
var API_BASE = '';   // API 基础路径，部署时可改

function doSearch() {
  var input = document.getElementById('searchInput').value.trim();
  var empty = document.getElementById('emptyState');
  var card  = document.getElementById('resultCard');

  if (!input) {
    empty.classList.add('show');
    empty.style.display = 'block';
    card.classList.remove('show');
    card.innerHTML = '';
    return;
  }

  // 尝试调用后端 API
  if (USE_API) {
    fetch(API_BASE + '/api/search?q=' + encodeURIComponent(input))
      .then(function(resp) {
        if (!resp.ok) throw new Error('API error');
        return resp.json();
      })
      .then(function(result) {
        if (result.success && result.data) {
          // 转换后端数据格式 → 前端渲染格式
          render(adaptApiResult(result.data));
          // 记录历史
          searchHistory.unshift({ name: result.data.name, time: '刚刚' });
          if (searchHistory.length > 5) searchHistory.pop();
          empty.style.display = 'none';
          empty.classList.remove('show');
        } else {
          fallbackToLocal(input);
        }
      })
      .catch(function() {
        // API 不可用，回退到本地数据
        fallbackToLocal(input);
      });
    return;
  }

  fallbackToLocal(input);
}

function fallbackToLocal(input) {
  var empty = document.getElementById('emptyState');
  var card  = document.getElementById('resultCard');
  var data = fuzzySearch(input);

  if (!data) {
    empty.style.display = 'none';
    empty.classList.remove('show');
    card.classList.add('show');
    card.innerHTML =
      '<div class="not-found">' +
        '<div class="nf-icon">&#128269;</div>' +
        '<h3>未找到 "' + escapeHtml(input) + '"</h3>' +
        '<p>演示版暂包含 8 家商户，覆盖健身、美容、教培、餐饮、家政、婚介六大行业。<br>请尝试其他商户名称。</p>' +
      '</div>';
    return;
  }

  searchHistory.unshift({ name: data.name, time: '刚刚' });
  if (searchHistory.length > 5) searchHistory.pop();
  empty.style.display = 'none';
  empty.classList.remove('show');
  render(data);
}

/** 将后端 API 返回的数据适配为前端 render() 所需格式 */
function adaptApiResult(d) {
  return {
    name: d.name,
    type: d.industry,
    address: d.address || '',
    credit_code: d.credit_code || '',
    legal_person: d.legal_person || '',
    established: d.established || '',
    registered_capital: d.registered_capital || '',
    score: d.score,
    grade: d.grade,
    grade_label: d.grade_label,
    verdict: d.verdict,
    advice: d.advice,
    signals: d.signals || [],
    dims: (d.dimensions || []).map(function(x) {
      return { name: x.name, score: x.score, weight: x.weight, detail: x.detail };
    }),
    evidence: (d.evidence || []).map(function(e) {
      return [e.source, e.field, e.tag, e.value, e.note || ''];
    }),
    // 行业参照
    industry_benchmark: d.industry_benchmark,
    position: d.position_vs_industry || '',
  };
}

/* ═══════════════════════════════════════════
   渲染主函数
   ═══════════════════════════════════════════ */
function render(d) {
  var card = document.getElementById('resultCard');
  card.classList.add('show');

  var ringColor = d.grade === 'green' ? '#27AE60' : d.grade === 'yellow' ? '#F39C12' : '#E74C3C';
  var scoreColor = d.grade === 'green' ? '#27AE60' : d.grade === 'yellow' ? '#c17e0a' : '#E74C3C';
  var dashOffset = RING_CIRCUMFERENCE * (1 - d.score / 100);

  var html = '';

  /* ── 1. 风险信号预警清单 ── */
  if (d.signals && d.signals.length > 0) {
    var sigItems = d.signals.map(function(s) {
      return '<li>' + s + '</li>';
    }).join('');
    html +=
      '<div class="alert-strip ' + d.grade + '">' +
        '<div class="alert-header">' +
          '<span class="alert-icon">' + (d.grade === 'red' ? '&#9888;&#65039;' : '&#9888;') + '</span>' +
          '<strong>风险信号预警清单</strong>' +
          '<span class="alert-count">' + d.signals.length + ' 项</span>' +
        '</div>' +
        '<ul class="alert-list">' + sigItems + '</ul>' +
      '</div>';
  }

  /* ── 2. 评分总览 Hero ── */
  html +=
    '<div class="score-hero ' + d.grade + '">' +
      '<div class="score-ring">' +
        '<svg width="150" height="150" viewBox="0 0 150 150">' +
          '<circle class="bg" cx="75" cy="75" r="60"/>' +
          '<circle class="fill" cx="75" cy="75" r="60" ' +
            'stroke="' + ringColor + '" ' +
            'stroke-dasharray="' + RING_CIRCUMFERENCE + '" ' +
            'stroke-dashoffset="' + RING_CIRCUMFERENCE + '" ' +
            'id="scoreRing"/>' +
        '</svg>' +
        '<div class="inner">' +
          '<span class="big" style="color:' + scoreColor + '">' + d.score + '</span>' +
          '<span class="sub">/ 100 分</span>' +
        '</div>' +
      '</div>' +
      '<div class="grade-badge ' + d.grade + '">' + d.grade_label + '</div>' +
      '<div class="verdict" style="color:' + scoreColor + '">' + d.verdict + '</div>' +
      '<p class="advice">' + d.advice + '</p>' +
    '</div>';

  /* ── 3. 商户基本信息 ── */
  html +=
    '<div class="glance">' +
      '<div class="glance-item"><div class="g-label">行业</div><div class="g-value">' + d.type + '</div></div>' +
      '<div class="glance-item"><div class="g-label">成立日期</div><div class="g-value">' + d.established + '</div></div>' +
      '<div class="glance-item"><div class="g-label">注册资本</div><div class="g-value">' + d.registered_capital + '</div></div>' +
    '</div>';

  /* ── 4. 四维度评分拆解 ── */
  html += '<div class="section"><h3>&#128202; 风险评分拆解</h3>';
  for (var i = 0; i < d.dims.length; i++) {
    var dim = d.dims[i];
    var dimColor = dim.score >= 80 ? 'green' : dim.score >= 50 ? 'yellow' : 'red';
    html +=
      '<div class="dim-item">' +
        '<div class="dim-head">' +
          '<span class="dim-title">' + dim.name + '</span>' +
          '<span class="dim-meta">' + dim.score + ' 分 ' + dim.weight + '</span>' +
        '</div>' +
        '<div class="dim-track">' +
          '<div class="dim-fill ' + dimColor + '" style="width:' + dim.score + '%"></div>' +
        '</div>' +
        '<div class="dim-detail">' + dim.detail + '</div>' +
      '</div>';
  }
  html += '</div>';

  /* ── 5. 行业风险参照 ── */
  var ind = (d.industry_benchmark) ? {
    avgScore: d.industry_benchmark.avg_score,
    medianScore: d.industry_benchmark.median_score,
    p25: d.industry_benchmark.p25,
    p75: d.industry_benchmark.p75,
    备案率: d.industry_benchmark.filing_rate,
    存管达标率: d.industry_benchmark.deposit_rate,
    merchantCount: d.industry_benchmark.merchant_count
  } : INDUSTRY[d.type];

  if (ind) {
    var posLabel = d.position || (d.score >= ind.p75 ? '高于行业上四分位（前25%）' : d.score >= ind.medianScore ? '高于行业中位数' : d.score >= ind.p25 ? '低于中位数，高于下四分位' : '低于行业下四分位（末25%）');
    var posClass = d.position ? (d.position.indexOf('上四分位') !== -1 ? 'above' : d.position.indexOf('下四分位') !== -1 ? 'below' : 'mid') : (d.score >= ind.p75 ? 'above' : d.score >= ind.p25 ? 'mid' : 'below');
    html +=
      '<div class="section">' +
        '<h3>&#128200; 行业风险参照</h3>' +
        '<p class="section-desc">将该商户综合评分与「' + d.type + '」行业的基准数据横向对比</p>' +
        '<div class="bench-grid">' +
          '<div class="bench-card current ' + d.grade + '">' +
            '<div class="bench-label">当前商户</div>' +
            '<div class="bench-val">' + d.score + '</div>' +
          '</div>' +
          '<div class="bench-card">' +
            '<div class="bench-label">行业均值</div>' +
            '<div class="bench-val">' + ind.avgScore + '</div>' +
          '</div>' +
          '<div class="bench-card">' +
            '<div class="bench-label">行业中位数</div>' +
            '<div class="bench-val">' + ind.medianScore + '</div>' +
          '</div>' +
          '<div class="bench-card">' +
            '<div class="bench-label">上四分位 (P75)</div>' +
            '<div class="bench-val">' + ind.p75 + '</div>' +
          '</div>' +
          '<div class="bench-card">' +
            '<div class="bench-label">下四分位 (P25)</div>' +
            '<div class="bench-val">' + ind.p25 + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="bench-bar">' +
          '<div class="bench-track">' +
            '<div class="bench-range-low" style="width:' + ind.p25 + '%"></div>' +
            '<div class="bench-range-mid" style="width:' + (ind.p75 - ind.p25) + '%"></div>' +
            '<div class="bench-range-high" style="width:' + (100 - ind.p75) + '%"></div>' +
          '</div>' +
          '<div class="bench-marker" style="left:' + d.score + '%" title="当前商户:' + d.score + '分"></div>' +
          '<div class="bench-ticks">' +
            '<span style="left:0">0</span>' +
            '<span style="left:' + ind.p25 + '%">' + ind.p25 + '</span>' +
            '<span style="left:' + ind.medianScore + '%">' + ind.medianScore + '</span>' +
            '<span style="left:' + ind.p75 + '%">' + ind.p75 + '</span>' +
            '<span style="left:100%">100</span>' +
          '</div>' +
        '</div>' +
        '<div class="bench-position ' + posClass + '">' + posLabel + '</div>' +
        '<div class="bench-extra">' +
          '<span>备案率：' + ind.备案率 + '%</span>' +
          '<span>存管达标率：' + ind.存管达标率 + '%</span>' +
          '<span>行业商户数：' + ind.merchantCount.toLocaleString() + ' 家</span>' +
        '</div>' +
      '</div>';
  }

  /* ── 6. 风险证据链 ── */
  html +=
    '<div class="section">' +
      '<h3>&#128203; 风险证据链</h3>' +
      '<p class="section-desc">每条评分结论均对应具体公开数据记录，可独立验证</p>' +
      '<div class="table-wrap">' +
        '<table class="evidence-table">' +
          '<thead><tr><th>数据来源</th><th>字段</th><th>结果</th><th>说明</th></tr></thead>' +
          '<tbody>';
  for (var j = 0; j < d.evidence.length; j++) {
    var e = d.evidence[j];
    var tag = e[2], value = e[3], note = e[4] || '—';
    var tagClass = tag === 'ok' ? 'tag-ok' : tag === 'warn' ? 'tag-warn' : 'tag-bad';
    var tagText  = tag === 'ok' ? '✓' : tag === 'warn' ? '△' : '✗';
    html += '<tr>' +
      '<td>' + e[0] + '</td><td>' + e[1] + '</td>' +
      '<td><span class="tag ' + tagClass + '">' + tagText + '</span> <strong>' + value + '</strong></td>' +
      '<td>' + note + '</td>' +
    '</tr>';
  }
  html += '</tbody></table></div></div>';

  /* ── 7. 免责声明 ── */
  html +=
    '<div class="disclaimer">' +
      '<strong>&#9888;&#65039; 免责声明</strong>：本查询结果仅为基于公开数据的风险参考，不构成对商户安全性的担保或法律意见。' +
      '评分数据均来自法定公开平台，可独立验证。办卡请保留合同与付款凭证，遇纠纷请拨打 <strong>12315</strong>。' +
    '</div>';

  /* ── 8. 最近查询 ── */
  html +=
    '<div class="history-section">' +
      '<h3>&#128337; 最近查询</h3>' +
      '<div class="history-list">';
  for (var k = 0; k < searchHistory.length; k++) {
    var h = searchHistory[k];
    html += '<div class="history-item" onclick="searchByName(\'' + h.name + '\')">' +
      '<span class="history-name">' + h.name + '</span>' +
      '<span class="history-time">' + h.time + '</span>' +
    '</div>';
  }
  html += '</div></div>';

  /* ── 写入 DOM ── */
  card.innerHTML = html;

  /* ── 动画 ── */
  setTimeout(function() {
    var ring = document.getElementById('scoreRing');
    if (ring) ring.style.strokeDashoffset = dashOffset;
  }, 80);

  setTimeout(function() {
    card.querySelectorAll('.dim-fill').forEach(function(bar) {
      var w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(function() { bar.style.width = w; });
    });
  }, 120);

  card.scrollIntoView({ behavior:'smooth', block:'start' });
}

function searchByName(name) {
  document.getElementById('searchInput').value = name;
  doSearch();
}

function escapeHtml(s) {
  var div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/* ═══════════════════════════════════════════
   城区概览渲染（独立于搜索结果，页面中部固定区域）
   ═══════════════════════════════════════════ */
function renderDistrictOverview() {
  var container = document.getElementById('districtOverview');
  if (!container) return;

  var sorted = DISTRICTS.slice().sort(function(a,b){ return b.highRisk - a.highRisk; });
  var html = '';
  for (var i = 0; i < sorted.length; i++) {
    var d = sorted[i];
    var color = d.highRisk >= 42 ? '#E74C3C' : d.highRisk >= 38 ? '#F39C12' : '#27AE60';
    html +=
      '<div class="d-card">' +
        '<div class="d-name">' + d.name + '</div>' +
        '<div class="d-bars">' +
          '<div class="d-bar-group">' +
            '<div class="d-bar d-red" style="flex:' + d.highRisk + '"></div>' +
            '<span class="d-pct">' + d.highRisk + '%</span>' +
          '</div>' +
          '<div class="d-bar-group">' +
            '<div class="d-bar d-yellow" style="flex:' + d.midRisk + '"></div>' +
            '<span class="d-pct">' + d.midRisk + '%</span>' +
          '</div>' +
          '<div class="d-bar-group">' +
            '<div class="d-bar d-green" style="flex:' + d.lowRisk + '"></div>' +
            '<span class="d-pct">' + d.lowRisk + '%</span>' +
          '</div>' +
        '</div>' +
        '<div class="d-total">' + d.total + ' 家商户</div>' +
      '</div>';
  }
  container.innerHTML = html;
}

/* ═══════════════════════════════════════════
   初始化
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  renderDistrictOverview();
  document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch();
  });
});
