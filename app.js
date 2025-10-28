// A股市场情绪打分系统

class StockSentimentSystem {
    constructor() {
        this.candlestickChart = null;
        this.sentimentTrendChart = null;
        this.radarChart = null;
        this.currentData = null;
        this.init();
    }

    init() {
        this.initCharts();
        this.loadData();
        this.bindEvents();
    }

    // 初始化图表
    initCharts() {
        this.candlestickChart = echarts.init(document.getElementById('candlestickChart'));
        this.sentimentTrendChart = echarts.init(document.getElementById('sentimentTrendChart'));
        this.radarChart = echarts.init(document.getElementById('radarChart'));

        // 响应式调整
        window.addEventListener('resize', () => {
            this.candlestickChart.resize();
            this.sentimentTrendChart.resize();
            this.radarChart.resize();
        });
    }

    // 绑定事件
    bindEvents() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
        });
    }

    // 生成K线数据
    generateCandlestickData(days = 60) {
        const data = [];
        const dates = [];
        let basePrice = 3000;
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);

            const open = basePrice;
            const change = (Math.random() - 0.5) * 100;
            const close = open + change;
            const high = Math.max(open, close) + Math.random() * 50;
            const low = Math.min(open, close) - Math.random() * 50;
            const volume = Math.random() * 5000 + 3000;

            data.push({
                date: dates[dates.length - 1],
                values: [open, close, low, high],
                volume: volume
            });

            basePrice = close;
        }

        return { dates, data };
    }

    // 计算市场指标
    calculateMarketIndicators(candleData) {
        const recentData = candleData.slice(-20);

        // 涨跌家数比（模拟）
        const riseCount = recentData.filter(d => d.values[1] > d.values[0]).length;
        const riseRatio = (riseCount / recentData.length * 100).toFixed(1);

        // 成交量变化
        const volumeRecent = recentData.slice(-5).reduce((sum, d) => sum + d.volume, 0) / 5;
        const volumePrevious = recentData.slice(-10, -5).reduce((sum, d) => sum + d.volume, 0) / 5;
        const volumeChange = ((volumeRecent - volumePrevious) / volumePrevious * 100).toFixed(1);

        // 波动率
        const prices = recentData.map(d => d.values[1]);
        const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
        const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * 100;

        // 资金流向（模拟）
        const moneyFlow = (Math.random() * 200 - 100).toFixed(1);

        return {
            riseRatio: parseFloat(riseRatio),
            volumeChange: parseFloat(volumeChange),
            volatility: volatility.toFixed(1),
            moneyFlow: parseFloat(moneyFlow)
        };
    }

    // 计算情绪分数
    calculateSentimentScore(indicators) {
        let score = 50; // 基础分50分

        // 涨跌比影响 (0-30分)
        score += (indicators.riseRatio - 50) * 0.6;

        // 成交量影响 (-10到+10分)
        if (indicators.volumeChange > 0) {
            score += Math.min(indicators.volumeChange * 0.1, 10);
        } else {
            score += Math.max(indicators.volumeChange * 0.1, -10);
        }

        // 波动率影响 (波动越大，减分)
        score -= Math.min(indicators.volatility * 0.5, 15);

        // 资金流向影响 (-15到+15分)
        score += indicators.moneyFlow * 0.15;

        // 限制在0-100之间
        return Math.max(0, Math.min(100, score)).toFixed(0);
    }

    // 获取情绪等级
    getSentimentLevel(score) {
        if (score < 25) return { level: '极度恐慌', class: 'sentiment-extreme-fear' };
        if (score < 45) return { level: '恐慌', class: 'sentiment-fear' };
        if (score < 60) return { level: '中性', class: 'sentiment-neutral' };
        if (score < 80) return { level: '贪婪', class: 'sentiment-greed' };
        return { level: '极度贪婪', class: 'sentiment-extreme-greed' };
    }

    // 获取情绪描述
    getSentimentDescription(score, indicators) {
        const descriptions = [];

        if (indicators.riseRatio > 60) {
            descriptions.push('市场普涨，投资者情绪积极');
        } else if (indicators.riseRatio < 40) {
            descriptions.push('市场下跌家数较多，情绪谨慎');
        } else {
            descriptions.push('市场涨跌均衡');
        }

        if (indicators.volumeChange > 20) {
            descriptions.push('成交量显著放大');
        } else if (indicators.volumeChange < -20) {
            descriptions.push('成交量萎缩');
        }

        if (indicators.volatility > 3) {
            descriptions.push('市场波动加剧');
        } else if (indicators.volatility < 1.5) {
            descriptions.push('市场走势平稳');
        }

        if (indicators.moneyFlow > 30) {
            descriptions.push('资金大幅流入');
        } else if (indicators.moneyFlow < -30) {
            descriptions.push('资金明显流出');
        }

        return descriptions.join('，') + '。';
    }

    // 生成情绪趋势数据
    generateSentimentTrend(days = 30) {
        const trend = [];
        const dates = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);

            // 生成随机但有趋势的情绪分数
            const baseScore = 50;
            const randomWalk = (Math.random() - 0.5) * 20;
            const trendComponent = Math.sin(i / 10) * 15;
            const score = Math.max(0, Math.min(100, baseScore + randomWalk + trendComponent));

            trend.push(score.toFixed(0));
        }

        return { dates, scores: trend };
    }

    // 更新显示
    updateDisplay(data) {
        const { indicators, sentimentScore } = data;
        const sentimentInfo = this.getSentimentLevel(sentimentScore);

        // 更新情绪总分
        document.getElementById('sentimentScore').textContent = sentimentScore;
        document.getElementById('sentimentLevel').textContent = sentimentInfo.level;

        const scoreCard = document.querySelector('.score-card');
        scoreCard.className = 'score-card main-score ' + sentimentInfo.class;

        // 更新描述
        document.getElementById('scoreDesc').textContent =
            this.getSentimentDescription(sentimentScore, indicators);

        // 更新指标卡片
        document.getElementById('riseRatio').textContent = indicators.riseRatio + '%';
        document.getElementById('volumeChange').textContent =
            (indicators.volumeChange > 0 ? '+' : '') + indicators.volumeChange + '%';
        document.getElementById('volatility').textContent = indicators.volatility + '%';
        document.getElementById('moneyFlow').textContent =
            (indicators.moneyFlow > 0 ? '+' : '') + indicators.moneyFlow + '亿';

        // 更新进度条
        document.getElementById('riseBar').style.width = indicators.riseRatio + '%';
        document.getElementById('volumeBar').style.width =
            Math.min(Math.abs(indicators.volumeChange) * 2, 100) + '%';
        document.getElementById('volatilityBar').style.width =
            Math.min(indicators.volatility * 20, 100) + '%';
        document.getElementById('moneyBar').style.width =
            Math.min(Math.abs(indicators.moneyFlow) / 2, 100) + '%';

        // 更新时间
        const now = new Date();
        document.getElementById('updateTime').textContent =
            '更新时间: ' + now.toLocaleString('zh-CN');
    }

    // 渲染K线图
    renderCandlestickChart(candleData) {
        const dates = candleData.dates;
        const values = candleData.data.map(d => d.values);
        const volumes = candleData.data.map(d => d.volume);

        const option = {
            animation: true,
            legend: {
                bottom: 10,
                left: 'center',
                data: ['K线', '成交量']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                }
            },
            axisPointer: {
                link: [{ xAxisIndex: 'all' }],
                label: {
                    backgroundColor: '#777'
                }
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    top: '10%',
                    height: '50%'
                },
                {
                    left: '10%',
                    right: '8%',
                    top: '70%',
                    height: '15%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: dates,
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        z: 100
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: dates,
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    min: 'dataMin',
                    max: 'dataMax'
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 60,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '90%',
                    start: 60,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'K线',
                    type: 'candlestick',
                    data: values,
                    itemStyle: {
                        color: '#ef232a',
                        color0: '#14b143',
                        borderColor: '#ef232a',
                        borderColor0: '#14b143'
                    }
                },
                {
                    name: '成交量',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumes,
                    itemStyle: {
                        color: function(params) {
                            const index = params.dataIndex;
                            const klineData = values[index];
                            return klineData[1] > klineData[0] ? '#ef232a' : '#14b143';
                        }
                    }
                }
            ]
        };

        this.candlestickChart.setOption(option);
    }

    // 渲染情绪趋势图
    renderSentimentTrendChart(trendData) {
        const option = {
            animation: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: ['情绪指数']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: trendData.dates
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                axisLabel: {
                    formatter: '{value}'
                }
            },
            visualMap: {
                show: false,
                dimension: 1,
                pieces: [
                    { lte: 25, color: '#ee0979' },
                    { gt: 25, lte: 45, color: '#f857a6' },
                    { gt: 45, lte: 60, color: '#ffa751' },
                    { gt: 60, lte: 80, color: '#a8edea' },
                    { gt: 80, color: '#21d4fd' }
                ]
            },
            series: [
                {
                    name: '情绪指数',
                    type: 'line',
                    smooth: true,
                    data: trendData.scores,
                    areaStyle: {
                        opacity: 0.3
                    },
                    lineStyle: {
                        width: 3
                    },
                    markLine: {
                        data: [
                            { yAxis: 25, name: '极度恐慌' },
                            { yAxis: 45, name: '恐慌' },
                            { yAxis: 60, name: '中性' },
                            { yAxis: 80, name: '贪婪' }
                        ],
                        label: {
                            show: true,
                            position: 'end',
                            formatter: '{b}'
                        }
                    }
                }
            ]
        };

        this.sentimentTrendChart.setOption(option);
    }

    // 渲染雷达图
    renderRadarChart(indicators, sentimentScore) {
        const option = {
            animation: true,
            tooltip: {
                trigger: 'item'
            },
            radar: {
                indicator: [
                    { name: '涨跌比例', max: 100 },
                    { name: '成交活跃度', max: 100 },
                    { name: '市场稳定性', max: 100 },
                    { name: '资金流入', max: 100 },
                    { name: '综合情绪', max: 100 }
                ],
                shape: 'polygon',
                splitNumber: 5,
                axisName: {
                    color: '#333',
                    fontSize: 14
                },
                splitLine: {
                    lineStyle: {
                        color: ['#ddd', '#ddd', '#ddd', '#ddd', '#ddd']
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.2)']
                    }
                }
            },
            series: [
                {
                    name: '市场情绪指标',
                    type: 'radar',
                    data: [
                        {
                            value: [
                                indicators.riseRatio,
                                Math.min(Math.abs(indicators.volumeChange) * 2, 100),
                                Math.max(0, 100 - indicators.volatility * 20),
                                Math.min((indicators.moneyFlow + 100) / 2, 100),
                                sentimentScore
                            ],
                            name: '当前市场状态',
                            areaStyle: {
                                color: 'rgba(102, 126, 234, 0.5)'
                            },
                            lineStyle: {
                                color: '#667eea',
                                width: 2
                            },
                            itemStyle: {
                                color: '#667eea'
                            }
                        }
                    ]
                }
            ]
        };

        this.radarChart.setOption(option);
    }

    // 加载数据
    loadData() {
        // 生成K线数据
        const candleData = this.generateCandlestickData(60);

        // 计算市场指标
        const indicators = this.calculateMarketIndicators(candleData.data);

        // 计算情绪分数
        const sentimentScore = this.calculateSentimentScore(indicators);

        // 生成情绪趋势
        const trendData = this.generateSentimentTrend(30);

        // 保存当前数据
        this.currentData = {
            candleData,
            indicators,
            sentimentScore: parseInt(sentimentScore),
            trendData
        };

        // 更新显示
        this.updateDisplay(this.currentData);

        // 渲染图表
        this.renderCandlestickChart(candleData);
        this.renderSentimentTrendChart(trendData);
        this.renderRadarChart(indicators, sentimentScore);
    }
}

// 初始化系统
document.addEventListener('DOMContentLoaded', () => {
    new StockSentimentSystem();
});
