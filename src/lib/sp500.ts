// S&P 500 ticker list
export const SP500_TICKERS = [
  'A', 'AAL', 'AAP', 'AAPL', 'ABBV', 'ABC', 'ABT', 'ACN', 'ADBE', 'ADI', 'ADM', 'ADP', 'ADS', 'AEE', 'AEP', 'AES', 'AFL', 'AIG', 'AIZ', 'AJG', 'AKAM', 'ALB', 'ALGN', 'ALK', 'ALL', 'ALLE', 'AMAT', 'AMCR', 'AMD', 'AME', 'AMGN', 'AMP', 'AMT', 'AMZN', 'ANET', 'ANSS', 'AON', 'AOS', 'APA', 'APD', 'APH', 'APLD', 'APO', 'AQNA', 'ARCC', 'ARMK', 'ATO', 'AVB', 'AVGO', 'AVY', 'AWK', 'AXON', 'AXP', 'AZO',
  'BAC', 'BA', 'BAX', 'BBY', 'BDX', 'BEN', 'BF-B', 'BIIB', 'BK', 'BKNG', 'BLK', 'BLL', 'BMY', 'BR', 'BRO', 'BSX', 'BWA', 'BXP', 'C', 'CAG', 'CAH', 'CARR', 'CAT', 'CB', 'CBOE', 'CBRE', 'CCI', 'CCL', 'CDAY', 'CDNS', 'CDW', 'CE', 'CEG', 'CF', 'CFG', 'CHD', 'CHRW', 'CI', 'CINF', 'CL', 'CLX', 'CMA', 'CMCSA', 'CME', 'CMG', 'CMI', 'CMS', 'CNC', 'CNP', 'COF', 'COO', 'COP', 'COR', 'COST', 'CPB', 'CPRT', 'CRWD', 'CSCO', 'CSX', 'CTAS', 'CVS', 'CVX', 'CZR',
  'D', 'DAL', 'DD', 'DE', 'DFS', 'DG', 'DGX', 'DHI', 'DHR', 'DIS', 'DLR', 'DLTR', 'DOV', 'DOW', 'DPZ', 'DRI', 'DTE', 'DUK', 'DVA', 'DVN', 'DXC', 'DXCM',
  'EA', 'EBAY', 'ECL', 'ED', 'EFX', 'EIX', 'EL', 'ELV', 'EMN', 'EMR', 'ENPH', 'EOG', 'EPAM', 'EQIX', 'EQR', 'EQT', 'ERIE', 'ES', 'ESS', 'ETN', 'ETR', 'EVRG', 'EW', 'EXC', 'EXPD', 'EXPE', 'EXR',
  'F', 'FANG', 'FAST', 'FBHS', 'FCX', 'FDX', 'FE', 'FFIV', 'FIS', 'FISV', 'FITB', 'FLT', 'FMC', 'FOX', 'FRT', 'FTNT', 'FTV', 'FWONK',
  'G', 'GDDY', 'GE', 'GEHC', 'GILD', 'GIS', 'GL', 'GLW', 'GM', 'GNRC', 'GOOGL', 'GPC', 'GPN', 'GRMN', 'GS', 'GWW',
  'HAL', 'HAS', 'HBAN', 'HCA', 'HD', 'HES', 'HIG', 'HII', 'HLT', 'HOLX', 'HON', 'HPE', 'HPQ', 'HRB', 'HRL', 'HSIC', 'HST', 'HSY', 'HUM', 'HWM',
  'IBM', 'ICE', 'IDXX', 'IEX', 'IFF', 'INTC', 'INTU', 'IP', 'IPG', 'IQV', 'IR', 'IRM', 'ISRG', 'IT', 'ITW', 'IVZ',
  'J', 'JBHT', 'JCI', 'JNJ', 'JNPR', 'JPM', 'JWN', 'K', 'KA', 'KEY', 'KF', 'KHC', 'KIM', 'KKR', 'KLAC', 'KMB', 'KMI', 'KMX', 'KO', 'KR', 'KVUE', 'KWR',
  'LB', 'LDOS', 'LEG', 'LEN', 'LH', 'LIN', 'LKQ', 'LLY', 'LMT', 'LNT', 'LOW', 'LRCX', 'LUV', 'LVS', 'LW', 'LYB', 'LYV',
  'MA', 'MAA', 'MAR', 'MAS', 'MAT', 'MCD', 'MCK', 'MCO', 'MDLZ', 'MDT', 'MET', 'MGM', 'MHK', 'MKC', 'MLM', 'MMM', 'MNST', 'MO', 'MOH', 'MOS', 'MPC', 'MRK', 'MRO', 'MS', 'MSCI', 'MSFT', 'MTB', 'MTD', 'MU', 'MUSA', 'MXIM', 'MYRG',
  'NCLH', 'NDAQ', 'NDSN', 'NEE', 'NEM', 'NFLX', 'NI', 'NKE', 'NOC', 'NOV', 'NRG', 'NSC', 'NTAP', 'NTSC', 'NTRS', 'NUE', 'NVDA', 'NVR', 'NWS', 'NWSA', 'NXPI', 'O', 'ODFL', 'OKE', 'OMC', 'ON', 'ORCL', 'ORLY', 'OTIS', 'OXY', 'PARA', 'PAYC', 'PAYX', 'PBCT', 'PCAR', 'PEAK', 'PEG', 'PENN', 'PEP', 'PFG', 'PG', 'PHD', 'PKG', 'PKI', 'PLD', 'PLTR', 'PM', 'PNC', 'PNR', 'PNW', 'POOL', 'PPG', 'PPL', 'PRU', 'PSA', 'PSX', 'PVH', 'PWR', 'PX', 'PYPL',
  'QCOM', 'QRVO', 'RCL', 'RE', 'REG', 'REGN', 'RF', 'RHI', 'RJF', 'RL', 'RMD', 'ROK', 'ROL', 'ROP', 'ROST', 'RPM', 'RSG', 'RTX', 'RVT', 'RYAN',
  'SBSX', 'SCHW', 'SEE', 'SHW', 'SIFI', 'SIG', 'SJM', 'SLB', 'SLG', 'SMCI', 'SNA', 'SNPS', 'SO', 'SPG', 'SPGI', 'SRE', 'STE', 'STT', 'STX', 'SWK', 'SWX', 'SYF', 'SYK', 'SYY',
  'T', 'TAP', 'TDG', 'TEL', 'TFC', 'TGT', 'TJX', 'TKR', 'TMO', 'TMUS', 'TPL', 'TRGP', 'TRV', 'TROW', 'TRV', 'TSCO', 'TSN', 'TSLA', 'TT', 'TTD', 'TTWO', 'TWX', 'TXN', 'TXT', 'TYL',
  'UAA', 'UAL', 'UDR', 'UHS', 'ULTA', 'UNH', 'UNP', 'UPS', 'URI', 'USB', 'V', 'VFC', 'VG', 'VLO', 'VMC', 'VNO', 'VRSK', 'VRTX', 'VTR', 'VTRS', 'VZ', 'WAB', 'WAT', 'WBA', 'WDC', 'WEC', 'WELL', 'WFC', 'WMT', 'WRB', 'WY', 'WYN',
  'XEL', 'XLNX', 'XOM', 'XRAY', 'XYL',
  'ZBH', 'ZION', 'ZTS'
];
