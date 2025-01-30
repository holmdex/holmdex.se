# Source priority order:
# 1. Yahoo Finance API (most reliable, free)
# 2. Stooq Data (free, good backup)
# 3. MarketWatch Web Scraping (free, fallback)
# 4. Investing.com Web Scraping (free, last resort)

# Define market indices
market_indices <- list(
  US = c(
    "^GSPC" = "S&P 500",
    "^DJI" = "Dow Jones",
    "^IXIC" = "NASDAQ",
    "^RUT" = "Russell 2000",
    "^VIX" = "VIX"
  ),
  Asia = c(
    "^N225" = "Nikkei 225",
    "^HSI" = "Hang Seng",
    "000001.SS" = "Shanghai Composite",
    "399001.SZ" = "Shenzhen Component",
    "^KS11" = "KOSPI"
  ),
  Europe = c(
    "^FTSE" = "FTSE 100",
    "^GDAXI" = "DAX",
    "^FCHI" = "CAC 40",
    "^STOXX50E" = "EURO STOXX 50",
    "^IBEX" = "IBEX 35"
  )
)

# Symbol mapping for different sources
symbol_mappings <- list(
  yahoo = list(
    "^GSPC" = "^GSPC",
    "^DJI" = "^DJI"
    # Add more as needed
  ),
  stooq = list(
    "^GSPC" = "^SPX",
    "^DJI" = "^DJI"
    # Add more as needed
  ),
  marketwatch = list(
    "^GSPC" = "SPX",
    "^DJI" = "DJIA"
    # Add more as needed
  ),
  investing = list(
    "^GSPC" = "us-spx-500",
    "^DJI" = "us-30"
    # Add more as needed
  )
)

# Logging function
log_debug <- function(symbol, source, msg) {
  timestamp <- format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  cat(sprintf("[%s] %s (%s): %s\n", timestamp, symbol, source, msg))
}

# Rate limiting function with source-specific delays
rate_limit <- function(source) {
  delay <- switch(source,
    "yahoo" = 1,
    "stooq" = 2,
    "marketwatch" = 3,
    "investing" = 5,
    2  # Default delay
  )
  Sys.sleep(delay)
}

# Yahoo Finance fetcher
fetch_yahoo <- function(symbol, from_date) {
  tryCatch({
    rate_limit("yahoo")
    log_debug(symbol, "yahoo", "Attempting fetch")
    
    data <- quantmod::getSymbols(symbol, 
                                src = "yahoo",
                                from = from_date,
                                auto.assign = FALSE)
    
    if (!is.null(data) && nrow(data) > 0) {
      log_debug(symbol, "yahoo", "Fetch successful")
      return(data.frame(
        date = index(data),
        price = as.numeric(quantmod::Cl(data)),
        symbol = symbol,
        source = "yahoo"
      ))
    }
    NULL
  }, error = function(e) {
    log_debug(symbol, "yahoo", paste("Error:", e$message))
    NULL
  })
}

# Stooq Data fetcher
fetch_stooq <- function(symbol, from_date) {
  tryCatch({
    rate_limit("stooq")
    log_debug(symbol, "stooq", "Attempting fetch")
    
    # Map symbol to Stooq format
    stooq_symbol <- symbol_mappings$stooq[[symbol]] %||% symbol
    
    data <- quantmod::getSymbols(stooq_symbol, 
                                src = "stooq",
                                from = from_date,
                                auto.assign = FALSE)
    
    if (!is.null(data) && nrow(data) > 0) {
      log_debug(symbol, "stooq", "Fetch successful")
      return(data.frame(
        date = index(data),
        price = as.numeric(quantmod::Cl(data)),
        symbol = symbol,
        source = "stooq"
      ))
    }
    NULL
  }, error = function(e) {
    log_debug(symbol, "stooq", paste("Error:", e$message))
    NULL
  })
}

# MarketWatch web scraping fetcher
fetch_marketwatch <- function(symbol, from_date) {
  tryCatch({
    rate_limit("marketwatch")
    log_debug(symbol, "marketwatch", "Attempting fetch")
    
    # Map symbol to MarketWatch format
    mw_symbol <- symbol_mappings$marketwatch[[symbol]] %||% symbol
    url <- sprintf("https://www.marketwatch.com/investing/index/%s", tolower(mw_symbol))
    
    page <- rvest::read_html(url)
    price <- page %>%
      rvest::html_nodes(".value") %>%
      rvest::html_text() %>%
      .[1] %>%
      gsub("[^0-9.]", "", .) %>%
      as.numeric()
    
    if (!is.na(price)) {
      log_debug(symbol, "marketwatch", "Fetch successful")
      return(data.frame(
        date = Sys.Date(),
        price = price,
        symbol = symbol,
        source = "marketwatch"
      ))
    }
    NULL
  }, error = function(e) {
    log_debug(symbol, "marketwatch", paste("Error:", e$message))
    NULL
  })
}

# Investing.com web scraping fetcher
fetch_investing <- function(symbol, from_date) {
  tryCatch({
    rate_limit("investing")
    log_debug(symbol, "investing", "Attempting fetch")
    
    # Map symbol to Investing.com format
    inv_symbol <- symbol_mappings$investing[[symbol]] %||% gsub("^\\^", "", tolower(symbol))
    url <- sprintf("https://www.investing.com/indices/%s", inv_symbol)
    
    headers <- c(
      "User-Agent" = "Mozilla/5.0",
      "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9",
      "Accept-Language" = "en-US,en;q=0.5"
    )
    
    page <- rvest::read_html(url)
    price <- page %>%
      rvest::html_nodes(".last-price-value") %>%
      rvest::html_text() %>%
      gsub("[^0-9.]", "", .) %>%
      as.numeric()
    
    if (!is.na(price)) {
      log_debug(symbol, "investing", "Fetch successful")
      return(data.frame(
        date = Sys.Date(),
        price = price,
        symbol = symbol,
        source = "investing"
      ))
    }
    NULL
  }, error = function(e) {
    log_debug(symbol, "investing", paste("Error:", e$message))
    NULL
  })
}

# Main fetch function that tries all sources
fetch_market_data <- function(symbol, from_date) {
  # List of fetch functions in priority order
  fetch_functions <- list(
    fetch_yahoo,
    fetch_stooq,
    fetch_marketwatch,
    fetch_investing
  )
  
  # Try each function in sequence
  for (fetch_fn in fetch_functions) {
    data <- fetch_fn(symbol, from_date)
    if (!is.null(data) && nrow(data) > 0) {
      return(data)
    }
  }
  
  log_debug(symbol, "ALL", "All data fetching methods failed")
  NULL
}
