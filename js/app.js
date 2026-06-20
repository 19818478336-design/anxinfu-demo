/**
 * 安心付 · 预付消费商户风险查询平台
 * 查询逻辑 & 演示数据
 */

const RING_CIRCUMFERENCE = 2 * Math.PI * 60; // SVG 环形进度条周长

// ═══════════════════════════════════════════
// 演示商户数据
// ═══════════════════════════════════════════
const DEMO = {
  '111': {
    name: '星恒健身工作室', type: '健身服务',
    address: '上海市嘉定区塔城路295号', credit_code: '91310114MA1G******',
    legal_person: '陈建国', established: '2017-03-15', registered_capital: '500万元',
    score: 88, grade: 'green', grade_label: '绿色 · 低风险',
    verdict: '该商户综合风险较低，可以放心办卡',
    advice: '备案齐全、经营稳定、无涉诉记录。建议保留合同与付款凭证。',
    dims: [
      { name:'合规度', score:90, weight:'×40%', detail:'已备案 · 资金存管40%（建设银行）· 信息报送正常', color:'green' },
      { name:'稳定度', score:88, weight:'×25%', detail:'成立8年+ · 社保28人 · 无异常 · 无处罚 · 法人3年无变更', color:'green' },
      { name:'纠纷度', score:95, weight:'×25%', detail:'近2年涉诉0件 · 年投诉1件（已和解）', color:'green' },
      { name:'规模可信度', score:70, weight:'×10%', detail:'注册资本500万 vs 年卡5000元，比例合理', color:'green' }
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
      ['12315消费投诉公示','投诉密度','ok','1.2件/年','远低于健身行业均值']
    ]
  },

  '222': {
    name: '力美健身俱乐部', type: '健身服务',
    address: '上海市嘉定区城中路78号B1层', credit_code: '91310114MA1G******',
    legal_person: '张伟（近1年第3任法人）', established: '2025-08-01', registered_capital: '10万元',
    score: 28, grade: 'red', grade_label: '红色 · 高风险',
    verdict: '该商户存在严重风险，强烈不建议办卡',
    advice: '未备案、成立不足1年、注册资本极低、法人频繁变更、多条涉诉与投诉记录叠加——跑路风险极高。',
    dims: [
      { name:'合规度', score:20, weight:'×40%', detail:'未备案 · 无资金存管 · 发卡行为已违反《上海市单用途预付消费卡管理规定》', color:'red' },
      { name:'稳定度', score:22, weight:'×25%', detail:'成立不足1年 · 社保仅2人 · 经营异常1条 · 行政处罚1条 · 1年内法人变更3次', color:'red' },
      { name:'纠纷度', score:30, weight:'×25%', detail:'近2年涉诉4件（3件退款纠纷+1件合同纠纷）· 年投诉23件', color:'red' },
      { name:'规模可信度', score:70, weight:'×10%', detail:'注册资本10万，年卡售价5888元——卖17张卡即超注册资本', color:'yellow' }
    ],
    evidence: [
      ['上海市预付卡备案平台','备案状态','bad','未备案','发卡行为已涉嫌违规'],
      ['上海市预付卡备案平台','资金存管','bad','无存管记录','预收资金无任何银行存管，可随时转移'],
      ['国家企业信用信息公示系统','成立日期','warn','2025-08-01','经营不足10个月'],
      ['国家企业信用信息公示系统','注册资本','bad','10万元','年卡5888元，卖17张即超注册资本'],
      ['国家企业信用信息公示系统','社保人数','bad','2人','宣称"20+教练"，实缴社保仅2人'],
      ['国家企业信用信息公示系统','经营异常','bad','1条','2025-12-15 通过登记住所无法联系'],
      ['国家企业信用信息公示系统','行政处罚','bad','1条','2025-11-03 因虚假宣传被处罚'],
      ['国家企业信用信息公示系统','法人变更','bad','1年3次','2025.06李→王 | 09王→赵 | 12赵→张伟'],
      ['中国裁判文书网','涉诉记录','bad','4件','3件预付卡退款纠纷（消费者胜诉）'],
      ['中国裁判文书网','执行状态','bad','2件未执行','无可执行财产，已终本'],
      ['12315消费投诉公示','年投诉量','bad','23件','投诉密度为行业均值2.7倍']
    ]
  }
};

// 名称 → 代号映射（支持按店名查询）
var DEMO_BY_NAME = {
  '星恒健身工作室': '111',
  '星恒健身': '111',
  '力美健身俱乐部': '222',
  '力美健身': '222'
};

// 虚假历史查询记录
var FAKE_HISTORY = [
  { name: '一兆韦德健身', time: '2分钟前', code: null },
  { name: '星恒健身工作室', time: '18分钟前', code: '111' },
  { name: '力美健身俱乐部', time: '42分钟前', code: '222' }
];

// ═══════════════════════════════════════════
// 查询逻辑
// ═══════════════════════════════════════════

/** 快捷查询：填入代号并触发搜索 */
function quickSearch(code) {
  document.getElementById('searchInput').value = code;
  doSearch();
}

/** 通过名称查询 */
function searchByName(name) {
  document.getElementById('searchInput').value = name;
  doSearch();
}

/** 执行查询 */
function doSearch() {
  var input = document.getElementById('searchInput').value.trim();
  var empty = document.getElementById('emptyState');
  var card  = document.getElementById('resultCard');

  if (!input) {
    empty.classList.add('show');
    empty.style.display = 'block';
    card.classList.remove('show');
    return;
  }

  // 先按代号查，再按名称查
  var data = DEMO[input] || DEMO[DEMO_BY_NAME[input]];
  if (!data) {
    empty.style.display = 'none';
    empty.classList.remove('show');
    card.classList.add('show');
    card.innerHTML =
      '<div style="padding:56px 36px; text-align:center;">' +
        '<div style="font-size:48px; margin-bottom:16px;">&#128269;</div>' +
        '<h3 style="margin-bottom:8px; font-size:18px;">未找到 "' + escapeHtml(input) + '"</h3>' +
        '<p style="color:#95A5A6; font-size:14px;">演示版暂仅包含有限商户数据，请尝试其他查询</p>' +
      '</div>';
    return;
  }

  empty.style.display = 'none';
  empty.classList.remove('show');
  render(data);
}

/** 渲染查询结果 */
function render(d) {
  var card = document.getElementById('resultCard');
  card.classList.add('show');

  var dashOffset = RING_CIRCUMFERENCE * (1 - d.score / 100);
  var ringColor  = d.grade === 'green' ? '#27AE60' : d.grade === 'yellow' ? '#F39C12' : '#E74C3C';
  var scoreColor = d.grade === 'green' ? '#27AE60' : d.grade === 'yellow' ? '#c17e0a' : '#E74C3C';

  // 维度进度条
  var dimsHTML = d.dims.map(function(dim) {
    return '<div class="dim-item">' +
      '<div class="dim-head">' +
        '<span class="dim-title">' + dim.name + '</span>' +
        '<span class="dim-meta">' + dim.score + ' 分 ' + dim.weight + '</span>' +
      '</div>' +
      '<div class="dim-track">' +
        '<div class="dim-fill ' + dim.color + '" style="width:' + dim.score + '%"></div>' +
      '</div>' +
      '<div class="dim-detail">' + dim.detail + '</div>' +
    '</div>';
  }).join('');

  // 证据链表格
  var evidenceHTML = d.evidence.map(function(e) {
    var source = e[0], field = e[1], tag = e[2], value = e[3], note = e[4];
    var tagClass = tag === 'ok' ? 'tag-ok' : tag === 'warn' ? 'tag-warn' : 'tag-bad';
    var tagText  = tag === 'ok' ? '✓' : tag === 'warn' ? '△' : '✗';
    return '<tr>' +
      '<td>' + source + '</td><td>' + field + '</td>' +
      '<td><span class="tag ' + tagClass + '">' + tagText + '</span> <strong>' + value + '</strong></td>' +
      '<td>' + (note || '—') + '</td>' +
    '</tr>';
  }).join('');

  card.innerHTML =
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
    '</div>' +

    '<div class="glance">' +
      '<div class="glance-item"><div class="g-label">行业</div><div class="g-value">' + d.type + '</div></div>' +
      '<div class="glance-item"><div class="g-label">成立日期</div><div class="g-value">' + d.established + '</div></div>' +
      '<div class="glance-item"><div class="g-label">注册资本</div><div class="g-value">' + d.registered_capital + '</div></div>' +
    '</div>' +

    '<div class="section">' +
      '<h3>&#128202; 风险评分拆解</h3>' +
      dimsHTML +
    '</div>' +

    '<div class="section">' +
      '<h3>&#128203; 风险证据链</h3>' +
      '<div style="overflow-x:auto;">' +
        '<table class="evidence-table">' +
          '<thead><tr><th>数据来源</th><th>字段</th><th>结果</th><th>说明</th></tr></thead>' +
          '<tbody>' + evidenceHTML + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +

    '<div class="disclaimer">' +
      '<strong>&#9888;&#65039; 免责声明</strong>：本查询结果仅为基于公开数据的风险参考，不构成对商户安全性的担保或法律意见。评分数据均来自法定公开平台，可独立验证。办卡请保留合同与付款凭证，遇纠纷请拨打 <strong>12315</strong>。' +
    '</div>' +

    // 虚假历史查询记录
    '<div class="history-section">' +
      '<h3>&#128337; 最近查询</h3>' +
      '<div class="history-list">' +
        FAKE_HISTORY.map(function(h) {
          return '<div class="history-item" onclick="searchByName(\'' + h.name + '\')">' +
            '<span class="history-name">' + h.name + '</span>' +
            '<span class="history-time">' + h.time + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';

  // 环形进度条动画
  setTimeout(function() {
    var ring = document.getElementById('scoreRing');
    if (ring) ring.style.strokeDashoffset = dashOffset;
  }, 80);

  // 维度进度条动画
  setTimeout(function() {
    card.querySelectorAll('.dim-fill').forEach(function(bar) {
      var w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(function() { bar.style.width = w; });
    });
  }, 120);

  card.scrollIntoView({ behavior:'smooth', block:'start' });
}

/** HTML 转义 */
function escapeHtml(s) {
  var div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// 回车触发搜索
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doSearch();
});
