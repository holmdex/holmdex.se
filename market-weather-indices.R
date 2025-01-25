market_indices <- list(
  US = c(
    "^GSPC" = "S&P 500 | Area: United States",
    "^DJI" = "Dow Jones | Area: United States",
    "^IXIC" = "NASDAQ | Area: United States",
    "^RUT" = "Russell 2000 | Area: United States",
    "^VIX" = "VIX | Area: United States"
  ),
  
  Asia = c(
    "^N225" = "Nikkei 225 | Area: Japan",
    "^HSI" = "Hang Seng | Area: Hong Kong",
    "000001.SS" = "Shanghai Composite | Area: Mainland",
    "399001.SZ" = "Shenzhen Component | Area: Mainland",
    "^KS11" = "KOSPI | Area: South Korea",
    "^TWII" = "TAIEX | Area: Taipei",
    "^BSESN" = "BSE SENSEX | Area: India",
    "^JKSE" = "Jakarta Composite | Area: Indonesia",
    "^STI" = "Straits Times | Area: Singapore"
  ),
  
  Europe = c(
    "^FTSE" = "FTSE 100 | Area: UK",
    "^GDAXI" = "DAX | Area: Germany",
    "^FCHI" = "CAC 40 | Area: France",
    "^STOXX50E" = "EURO STOXX 50 | Area: Eurozone",
    "^IBEX" = "IBEX 35 | Area: Spain",
    "^AEX" = "AEX | Area: Netherlands",
    "^BFX" = "BEL 20 | Area: Belgium",
    "^SSMI" = "SMI | Area: Switzerland",
    "^FTSEMIB.MI" = "FTSE MIB | Area: Italy",
    "^ATX" = "ATX | Area: Austria",
    "^PX" = "PX | Area: Czech Republic",
    "^WIG20" = "WIG20 | Area: Poland"
  ),
  
  Nordics = c(
    "^OMXC25" = "OMX C25 | Area: Denmark",
    "^OMXH25" = "OMX H25 | Area: Finland",
    "^OSEAX" = "Oslo Exchange | Area: Norway",
    "^OMX" = "OMX S30 | Area: Sweden",
    "^OMXIPI" = "OMX Iceland | Area: Iceland",
    "OMXBBGI.ST" = "OMX Baltic | Area: Baltic Region"
  ),
  
  Pacific = c(
    "^AORD" = "All Ordinaries | Area: Australia",
    "^NZ50" = "NZX 50 | Area: New Zealand",
    "^AXJO" = "S&P/ASX 200 | Area: Australia",
    "^BSESN" = "BSE SENSEX | Area: India",
    "^JKSE" = "Jakarta Composite | Area: Indonesia"
  ),
  
  Americas = c(
    "^GSPTSE" = "S&P/TSX Composite | Area: Canada",
    "^BVSP" = "Bovespa | Area: Brazil",
    "^MXX" = "IPC Mexico | Area: Mexico",
    "^MERV" = "MERVAL | Area: Argentina",
    "^IPSA" = "IPSA | Area: Chile",
    "^COLCAP" = "COLCAP | Area: Colombia",
    "^LIMA" = "S&P/BVL | Area: Peru"
  )
)