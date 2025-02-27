# market-weather-functions.R
# Enhanced market data fetcher with multiple backup sources and improved error handling

# ===== HELPER FUNCTIONS =====

# Define NULL-coalescing operator for cleaner code
`%||%` <- function(x, y) if (is.null(x)) y else x

# Helper to standardize timestamp formatting
format_timestamp <- function(time) {
  format(time, "%Y-%m-%d %H:%M:%S %Z", tz = "UTC")
}

# Enhanced logging with levels and options
log_debug <- function(symbol, source, msg, level = "INFO", json = FALSE, console = TRUE) {
  timestamp <- format_timestamp(Sys.time())
  
  if (json) {
    log_entry <- list(
      timestamp = timestamp,
      level = level,
      symbol = symbol,
      source = source,
      message = msg
    )
    return(jsonlite::toJSON(log_entry, auto_unbox = TRUE))
  } else {
    formatted_msg <- sprintf("[%s] [%s] %s (%s): %s", 
                           timestamp, level, symbol, source, msg)
    if (console) cat(formatted_msg, "\n")
    invisible(formatted_msg)
  }
}

# Smart rate limiter with exponential backoff for different sources
rate_limit <- function(source, attempt = 1, max_backoff = 8) {
  base_delay <- switch(source,
    "yahoo" = 1,
    "stooq" = 2,
    "investing" = 2.5,
    "marketwatch" = 2,
    "alphavantage" = 3,
    "wsj" = 3,
    "google" = 2,
    "finviz" = 2.5,
    "tradingview" = 3.5,
    2  # Default delay
  )
  
  # Apply exponential backoff if this is a retry
  if (attempt > 1) {
    backoff_factor <- min(2^(attempt-1), max_backoff)
    delay <- base_delay * backoff_factor
  } else {
    delay <- base_delay
  }
  
  # Add small random jitter to prevent synchronized requests
  jitter <- runif(1, 0, 0.5)
  Sys.sleep(delay + jitter)
}

# Unified error handler to standardize error messages
handle_fetch_error <- function(symbol, source, error_msg, attempt = NULL) {
  if (!is.null(attempt)) {
    error_msg <- sprintf("Attempt %d failed: %s", attempt, error_msg)
  }
  log_debug(symbol, source, error_msg, "ERROR")
  return(NULL)
}

# Function to clean numeric values from strings
clean_numeric <- function(x) {
  if (is.na(x) || is.null(x)) return(NA)
  if (is.numeric(x)) return(x)
  
  # Remove commas, percentage signs, etc. and convert to numeric
  as.numeric(gsub("[^0-9.-]", "", as.character(x)))
}

# ===== SYMBOL MAPPINGS =====

# Symbol mapping for different sources
symbol_mappings <- list(
  yahoo = list(
    # US Markets
    "^GSPC" = "^GSPC", "^DJI" = "^DJI", "^IXIC" = "^IXIC", "^RUT" = "^RUT",
    "^VIX" = "^VIX", "^NYA" = "^NYA", "^XAX" = "^XAX", "^BKX" = "^BKX",
    "^DJT" = "^DJT", "^DJUS" = "^DJUS",
    
    # Asian Markets
    "^N225" = "^N225", "^HSI" = "^HSI", "000001.SS" = "000001.SS",
    "399001.SZ" = "399001.SZ", "^KS11" = "^KS11", "^TWII" = "^TWII",
    "^BSESN" = "^BSESN", "^NSEI" = "^NSEI", "^JKSE" = "^JKSE",
    "^STI" = "^STI", "^KLSE" = "^KLSE", "^SET.BK" = "^SET.BK",
    "^VNINDEX" = "^VNINDEX", "^PSEI" = "^PSEI",
    
    # European Markets
    "^FTSE" = "^FTSE", "^GDAXI" = "^GDAXI", "^FCHI" = "^FCHI",
    "^STOXX50E" = "^STOXX50E", "^IBEX" = "^IBEX", "^AEX" = "^AEX",
    "^BFX" = "^BFX", "^SSMI" = "^SSMI", "^FTSEMIB.MI" = "^FTSEMIB.MI",
    
    # Other regions
    "^AORD" = "^AORD", "^NZ50" = "^NZ50", "^GSPTSE" = "^GSPTSE", 
    "^BVSP" = "^BVSP", "^MXX" = "^MXX", "^MERV" = "^MERV"
  ),
  stooq = list(
    # US Markets
    "^GSPC" = "^SPX", "^DJI" = "^DJI", "^IXIC" = "^NDQ", "^RUT" = "^RUT",
    "^VIX" = "^VIX", "^NYA" = "^NYA", "^XAX" = "^XAX", "^BKX" = "^BKX",
    
    # Asian Markets
    "^N225" = "^NKX", "^HSI" = "^HSI", "000001.SS" = "^SHC",
    "^KS11" = "^KS11", "^TWII" = "^TWI", "^BSESN" = "^BOM",
    "^NSEI" = "^NSE", "^JKSE" = "^JCI", "^STI" = "^SGX",
    
    # European Markets
    "^FTSE" = "^UKX", "^GDAXI" = "^DAX", "^FCHI" = "^CAC",
    "^STOXX50E" = "^SX5E", "^IBEX" = "^IBEX", "^AEX" = "^AEX",
    "^BFX" = "^BEL20", "^SSMI" = "^SMI", "^FTSEMIB.MI" = "^MIB",
    
    # Other regions
    "^AORD" = "^AOR", "^NZ50" = "^NZ50", "^GSPTSE" = "^TSX", 
    "^BVSP" = "^BOVESPA", "^MXX" = "^IPC", "^MERV" = "^MERV"
  ),
  investing = list(
    # US Markets - using Investing.com IDs
    "^GSPC" = "spx", "^DJI" = "us-30", "^IXIC" = "nasdaq-composite", "^RUT" = "russell-2000",
    "^VIX" = "volatility-s-p-500", "^NYA" = "nyse-composite", "^BKX" = "kbw-bank",
    
    # Asian Markets
    "^N225" = "japan-ni225", "^HSI" = "hang-sen-40", "000001.SS" = "shanghai-composite", 
    "^KS11" = "kospi", "^TWII" = "taiwan-weighted", "^BSESN" = "sensex",
    "^NSEI" = "s-p-cnx-nifty", "^JKSE" = "idx-composite", "^STI" = "singapore-straits-time",
    
    # European Markets
    "^FTSE" = "uk-100", "^GDAXI" = "germany-30", "^FCHI" = "france-40",
    "^STOXX50E" = "eu-stoxx50", "^IBEX" = "spain-35", "^AEX" = "netherlands-25",
    "^BFX" = "belgium-20", "^SSMI" = "switzerland-20", "^FTSEMIB.MI" = "italy-40",
    
    # Other regions
    "^AORD" = "aus-all-ordinaries", "^NZ50" = "nzx-50", "^GSPTSE" = "s-p-tsx-composite", 
    "^BVSP" = "bovespa", "^MXX" = "ipc", "^MERV" = "merv"
  ),
  marketwatch = list(
    # US Markets 
    "^GSPC" = "SPX", "^DJI" = "DJIA", "^IXIC" = "COMP", "^RUT" = "RUT",
    "^VIX" = "VIX", "^NYA" = "NYA", "^XAX" = "XAX", "^BKX" = "BKX",
    
    # Asian Markets
    "^N225" = "NIK", "^HSI" = "HSI", "000001.SS" = "SHCOMP",
    "^KS11" = "SEU", "^TWII" = "Y9999", "^BSESN" = "1", "^NSEI" = "NIFTY",
    "^JKSE" = "JAKIDX", "^STI" = "STI",
    
    # European Markets
    "^FTSE" = "UKX", "^GDAXI" = "DAX", "^FCHI" = "PX1",
    "^STOXX50E" = "SXXP", "^IBEX" = "IBEX", "^AEX" = "AEX",
    "^BFX" = "BEL20", "^SSMI" = "SSMI", "^FTSEMIB.MI" = "I945",
    
    # Other regions
    "^AORD" = "XAO", "^NZ50" = "NZ50GR", "^GSPTSE" = "GSPTSE", 
    "^BVSP" = "BVSP", "^MXX" = "IPC", "^MERV" = "MERV"
  ),
  finviz = list(
    # US Markets (Finviz has a simpler format)
    "^GSPC" = "SPX", "^DJI" = "DJI", "^IXIC" = "COMP", "^RUT" = "RUT",
    "^VIX" = "VIX",
    
    # Major international (limited support)
    "^FTSE" = "FTSE", "^GDAXI" = "DAX", "^FCHI" = "CAC",
    "^N225" = "N225", "^HSI" = "HSI"
  ),
  tradingview = list(
    # US Markets
    "^GSPC" = "SP:SPX", "^DJI" = "DJ:DJI", "^IXIC" = "NASDAQ:IXIC", "^RUT" = "RUSSELL:RUT",
    "^VIX" = "CBOE:VIX", "^NYA" = "NYSE:NYA",
    
    # Asian Markets
    "^N225" = "INDEX:NKY", "^HSI" = "INDEX:HSI", "000001.SS" = "SSE:000001",
    "^KS11" = "KRX:KOSPI", "^TWII" = "TWSE:TAIEX", "^BSESN" = "BSE:SENSEX",
    "^NSEI" = "NSE:NIFTY", "^JKSE" = "IDX:COMPOSITE", "^STI" = "SGX:STI",
    
    # European Markets
    "^FTSE" = "OANDA:UK100GBP", "^GDAXI" = "XETR:DAX", "^FCHI" = "EURONEXT:PX1",
    "^STOXX50E" = "STOXX:STOXX50E", "^IBEX" = "BME:IBEX", "^AEX" = "EURONEXT:AEX",
    "^BFX" = "EURONEXT:BEL20", "^SSMI" = "SIX:SMI", "^FTSEMIB.MI" = "MIL:FTSEMIB",
    
    # Other regions
    "^AORD" = "ASX:XAO", "^NZ50" = "NZX:NZ50", "^GSPTSE" = "TSX:TSX", 
    "^BVSP" = "BMFBOVESPA:BVSP", "^MXX" = "BMV:IPC", "^MERV" = "BCBA:MERVAL"
  )
)

# ===== DATA RETRIEVAL METHODS =====

# SOURCE 1: Yahoo Finance API via quantmod
fetch_yahoo <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "yahoo", sprintf("Starting fetch for date: %s", from_date))
    
    # Map symbol if needed
    yahoo_symbol <- symbol_mappings$yahoo[[symbol]] %||% symbol
    log_debug(symbol, "yahoo", sprintf("Using mapped symbol: %s", yahoo_symbol))
    
    # Robust data fetch with retries
    max_retries <- 3
    data <- NULL
    last_error <- NULL
    
    for(i in 1:max_retries) {
      tryCatch({
        # Apply rate limiting with exponential backoff
        rate_limit("yahoo", attempt = i)
        
        data <- quantmod::getSymbols(yahoo_symbol, 
                                   src = "yahoo",
                                   from = from_date,
                                   auto.assign = FALSE)
        
        # Verify data and break if successful
        if (!is.null(data) && nrow(data) > 0) {
          log_debug(symbol, "yahoo", sprintf("Attempt %d successful: %d rows", i, nrow(data)))
          break
        } else {
          log_debug(symbol, "yahoo", sprintf("Attempt %d returned empty data", i), "WARN")
        }
      }, error = function(e) {
        last_error <- e
        log_debug(symbol, "yahoo", sprintf("Attempt %d failed: %s", i, e$message), "WARN")
      })
    }
    
    if (!is.null(data) && nrow(data) > 0) {
      log_debug(symbol, "yahoo", "Fetch successful")
      return(data.frame(
        date = index(data),
        price = as.numeric(quantmod::Cl(data)),
        open = as.numeric(quantmod::Op(data)),
        high = as.numeric(quantmod::Hi(data)),
        low = as.numeric(quantmod::Lo(data)),
        volume = as.numeric(quantmod::Vo(data)),
        symbol = symbol,
        source = "yahoo"
      ))
    }
    
    if(!is.null(last_error)) {
      stop(last_error$message)
    } else {
      log_debug(symbol, "yahoo", "No data returned", "WARN")
    }
    NULL
  }, error = function(e) {
    handle_fetch_error(symbol, "yahoo", e$message)
  })
}

# SOURCE 2: Stooq Data API via quantmod
fetch_stooq <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "stooq", sprintf("Starting fetch for date: %s", from_date))
    
    # Map symbol if needed
    stooq_symbol <- symbol_mappings$stooq[[symbol]] %||% symbol
    log_debug(symbol, "stooq", sprintf("Using mapped symbol: %s", stooq_symbol))
    
    # Robust data fetch with retries
    max_retries <- 3
    data <- NULL
    last_error <- NULL
    
    for(i in 1:max_retries) {
      tryCatch({
        # Apply rate limiting with exponential backoff
        rate_limit("stooq", attempt = i)
        
        data <- quantmod::getSymbols(stooq_symbol, 
                                   src = "stooq",
                                   from = from_date,
                                   auto.assign = FALSE)
        
        # Verify data and break if successful
        if (!is.null(data) && nrow(data) > 0) {
          log_debug(symbol, "stooq", sprintf("Attempt %d successful: %d rows", i, nrow(data)))
          break
        } else {
          log_debug(symbol, "stooq", sprintf("Attempt %d returned empty data", i), "WARN")
        }
      }, error = function(e) {
        last_error <- e
        log_debug(symbol, "stooq", sprintf("Attempt %d failed: %s", i, e$message), "WARN")
      })
    }
    
    if (!is.null(data) && nrow(data) > 0) {
      log_debug(symbol, "stooq", "Fetch successful")
      return(data.frame(
        date = index(data),
        price = as.numeric(quantmod::Cl(data)),
        open = as.numeric(quantmod::Op(data)),
        high = as.numeric(quantmod::Hi(data)),
        low = as.numeric(quantmod::Lo(data)),
        volume = as.numeric(quantmod::Vo(data)),
        symbol = symbol,
        source = "stooq"
      ))
    }
    
    if(!is.null(last_error)) {
      stop(last_error$message)
    } else {
      log_debug(symbol, "stooq", "No data returned", "WARN")
    }
    NULL
  }, error = function(e) {
    handle_fetch_error(symbol, "stooq", e$message)
  })
}

# SOURCE 3: Web scraping from Investing.com
fetch_investing <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "investing", sprintf("Starting fetch for date: %s", from_date))
    
    # Map symbol to Investing.com ID
    investing_id <- symbol_mappings$investing[[symbol]]
    if (is.null(investing_id)) {
      log_debug(symbol, "investing", "No mapping for this symbol", "WARN")
      return(NULL)
    }
    
    log_debug(symbol, "investing", sprintf("Using Investing.com ID: %s", investing_id))
    
    # Rate limiting to avoid IP blocking
    rate_limit("investing")
    
    # Create custom user agent and headers to mimic browser
    user_agent <- "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    
    # Set up headers
    headers <- c(
      "User-Agent" = user_agent,
      "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language" = "en-US,en;q=0.5",
      "Connection" = "keep-alive",
      "Upgrade-Insecure-Requests" = "1",
      "Cache-Control" = "max-age=0"
    )
    
    # Construct the URL for historical data
    url <- sprintf("https://www.investing.com/indices/%s-historical-data", investing_id)
    
    # Make the request
    response <- httr::GET(
      url = url,
      httr::add_headers(.headers = headers),
      httr::timeout(10)
    )
    
    # Check status code
    if (httr::status_code(response) != 200) {
      stop(sprintf("Web request failed with status code %d", httr::status_code(response)))
    }
    
    # Parse HTML
    html_content <- httr::content(response, "text", encoding = "UTF-8")
    doc <- rvest::read_html(html_content)
    
    # Extract the table with historical data
    table_data <- rvest::html_nodes(doc, "table#curr_table")
    if (length(table_data) == 0) {
      stop("Could not find historical data table")
    }
    
    # Parse table
    df <- rvest::html_table(table_data)[[1]]
    
    # Clean up column names
    names(df) <- tolower(gsub("[^A-Za-z0-9]", "_", names(df)))
    
    # Convert date to proper format
    df$date <- as.Date(df$date, format = "%b %d, %Y")
    
    # Handle price and volume values
    price_col <- grep("price|close", names(df), ignore.case = TRUE)[1]
    open_col <- grep("open", names(df), ignore.case = TRUE)[1]
    high_col <- grep("high", names(df), ignore.case = TRUE)[1]
    low_col <- grep("low", names(df), ignore.case = TRUE)[1]
    volume_col <- grep("vol", names(df), ignore.case = TRUE)[1]
    
    # Create standardized data frame
    result <- data.frame(
      date = df$date,
      price = if (!is.na(price_col)) clean_numeric(df[[price_col]]) else NA,
      open = if (!is.na(open_col)) clean_numeric(df[[open_col]]) else NA,
      high = if (!is.na(high_col)) clean_numeric(df[[high_col]]) else NA,
      low = if (!is.na(low_col)) clean_numeric(df[[low_col]]) else NA,
      volume = if (!is.na(volume_col)) clean_numeric(df[[volume_col]]) else NA,
      symbol = symbol,
      source = "investing",
      stringsAsFactors = FALSE
    )
    
    # Filter by date
    result <- result[result$date >= from_date, ]
    
    # Check if we got any data after filtering
    if (nrow(result) == 0) {
      log_debug(symbol, "investing", "No data available for the specified date range", "WARN")
      return(NULL)
    }
    
    log_debug(symbol, "investing", sprintf("Fetch successful: %d rows", nrow(result)))
    return(result)
    
  }, error = function(e) {
    handle_fetch_error(symbol, "investing", e$message)
  })
}

# SOURCE 4: Web scraping from MarketWatch
fetch_marketwatch <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "marketwatch", sprintf("Starting fetch for date: %s", from_date))
    
    # Map symbol to MarketWatch format
    mw_symbol <- symbol_mappings$marketwatch[[symbol]]
    if (is.null(mw_symbol)) {
      # Try using a cleaned version of the original symbol
      mw_symbol <- gsub("\\^", "", symbol)
    }
    
    log_debug(symbol, "marketwatch", sprintf("Using MarketWatch symbol: %s", mw_symbol))
    
    # Rate limiting
    rate_limit("marketwatch")
    
    # Create custom user agent and headers
    user_agent <- "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    
    # Set up headers
    headers <- c(
      "User-Agent" = user_agent,
      "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language" = "en-US,en;q=0.5"
    )
    
    # Construct URL for historical data
    url <- sprintf("https://www.marketwatch.com/investing/index/%s/downloaddatapartial", tolower(mw_symbol))
    
    # Format dates for query parameters
    end_date <- Sys.Date()
    
    # Query parameters
    params <- list(
      startdate = format(from_date, "%m/%d/%Y"),
      enddate = format(end_date, "%m/%d/%Y"),
      daterange = "d30",
      frequency = "p1d",
      csvdownload = "true",
      downloadpartial = "false",
      newdates = "false"
    )
    
    # Make the request
    response <- httr::GET(
      url = url,
      query = params,
      httr::add_headers(.headers = headers),
      httr::timeout(10)
    )
    
    # Check status code
    if (httr::status_code(response) != 200) {
      stop(sprintf("Web request failed with status code %d", httr::status_code(response)))
    }
    
    # Get content as text
    csv_content <- httr::content(response, "text", encoding = "UTF-8")
    
    # Parse CSV
    con <- textConnection(csv_content)
    df <- read.csv(con, stringsAsFactors = FALSE)
    close(con)
    
    # Clean up column names
    names(df) <- tolower(names(df))
    
    # Ensure we have required columns
    required_cols <- c("date", "close")
    missing_cols <- setdiff(required_cols, names(df))
    if (length(missing_cols) > 0) {
      stop(sprintf("Missing required columns: %s", paste(missing_cols, collapse = ", ")))
    }
    
    # Convert date
    df$date <- as.Date(df$date)
    
    # Create standard output format
    result <- data.frame(
      date = df$date,
      price = df$close,
      open = df$open,
      high = df$high,
      low = df$low,
      volume = if ("volume" %in% names(df)) df$volume else NA,
      symbol = symbol,
      source = "marketwatch",
      stringsAsFactors = FALSE
    )
    
    # Filter by date
    result <- result[result$date >= from_date, ]
    
    # Check if we got any data after filtering
    if (nrow(result) == 0) {
      log_debug(symbol, "marketwatch", "No data available for the specified date range", "WARN")
      return(NULL)
    }
    
    log_debug(symbol, "marketwatch", sprintf("Fetch successful: %d rows", nrow(result)))
    return(result)
    
  }, error = function(e) {
    handle_fetch_error(symbol, "marketwatch", e$message)
  })
}

# SOURCE 5: Web scraping from Finviz
fetch_finviz <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "finviz", sprintf("Starting fetch for date: %s", from_date))
    
    # Map symbol to Finviz format
    finviz_symbol <- symbol_mappings$finviz[[symbol]]
    if (is.null(finviz_symbol)) {
      # Finviz has limited international index support
      log_debug(symbol, "finviz", "No mapping for this symbol in Finviz", "WARN")
      return(NULL)
    }
    
    log_debug(symbol, "finviz", sprintf("Using Finviz symbol: %s", finviz_symbol))
    
    # Rate limiting to avoid IP blocking
    rate_limit("finviz")
    
    # Create custom user agent and headers to mimic browser
    user_agent <- "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    
    # Set up headers
    headers <- c(
      "User-Agent" = user_agent,
      "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language" = "en-US,en;q=0.5"
    )
    
    # Construct URL for index data
    url <- sprintf("https://finviz.com/quote.ashx?t=%s", finviz_symbol)
    
    # Make the request
    response <- httr::GET(
      url = url,
      httr::add_headers(.headers = headers),
      httr::timeout(10)
    )
    
    # Check status code
    if (httr::status_code(response) != 200) {
      stop(sprintf("Web request failed with status code %d", httr::status_code(response)))
    }
    
    # Parse HTML
    html_content <- httr::content(response, "text", encoding = "UTF-8")
    doc <- rvest::read_html(html_content)
    
    # Finviz shows current values, not historical data
    # We'll extract what we can and create a single row
    
    # Extract current price
    price_node <- rvest::html_nodes(doc, "table.snapshot-table2 td:contains('Price') + td")
    if (length(price_node) > 0) {
      current_price <- clean_numeric(rvest::html_text(price_node))
    } else {
      log_debug(symbol, "finviz", "Could not find price data", "WARN")
      return(NULL)
    }
    
    # Extract change percentage
    change_node <- rvest::html_nodes(doc, "table.snapshot-table2 td:contains('Change') + td")
    daily_change <- 0
    if (length(change_node) > 0) {
      change_text <- rvest::html_text(change_node)
      # Extract percentage value from text like "+1.23%" or "-2.34%"
      daily_change <- as.numeric(gsub("[^0-9.-]", "", change_text))
    }
    
    # Create a data frame with just the current day's data
    result <- data.frame(
      date = Sys.Date(),
      price = current_price,
      open = NA,
      high = NA,
      low = NA,
      volume = NA,
      daily_change = daily_change,
      symbol = symbol,
      source = "finviz",
      stringsAsFactors = FALSE
    )
    
    log_debug(symbol, "finviz", "Fetch successful (current data only)")
    return(result)
    
  }, error = function(e) {
    handle_fetch_error(symbol, "finviz", e$message)
  })
}

# SOURCE 6: Web scraping from TradingView
fetch_tradingview <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "tradingview", sprintf("Starting fetch for date: %s", from_date))
    
    # Map symbol to TradingView format
    tv_symbol <- symbol_mappings$tradingview[[symbol]]
    if (is.null(tv_symbol)) {
      log_debug(symbol, "tradingview", "No mapping for this symbol", "WARN")
      return(NULL)
    }
    
    log_debug(symbol, "tradingview", sprintf("Using TradingView symbol: %s", tv_symbol))
    
    # Rate limiting to avoid IP blocking
    rate_limit("tradingview")
    
    # Create custom user agent and headers to mimic browser
    user_agent <- "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    
    # Set up headers
    headers <- c(
      "User-Agent" = user_agent,
      "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language" = "en-US,en;q=0.5",
      "Referer" = "https://www.tradingview.com/chart/",
      "Origin" = "https://www.tradingview.com"
    )
    
    # TradingView uses a complex JS-based interface, so we'll just fetch the current data
    # for a proof of concept. Real implementation would need more complex scraping.
    
    # Construct URL for current data
    url <- sprintf("https://www.tradingview.com/symbols/%s/", tv_symbol)
    
    # Make the request
    response <- httr::GET(
      url = url,
      httr::add_headers(.headers = headers),
      httr::timeout(10)
    )
    
    # Check status code
    if (httr::status_code(response) != 200) {
      stop(sprintf("Web request failed with status code %d", httr::status_code(response)))
    }
    
    # Parse HTML
    html_content <- httr::content(response, "text", encoding = "UTF-8")
    doc <- rvest::read_html(html_content)
    
    # Extract current price - TradingView has different layouts so we need to try multiple patterns
    price_selectors <- c(
      "div[data-name='legend-series-item'] span[data-name='price']",
      "div.tv-symbol-price-quote__value span",
      ".js-symbol-last"
    )
    
    current_price <- NULL
    for (selector in price_selectors) {
      price_node <- rvest::html_nodes(doc, selector)
      if (length(price_node) > 0) {
        price_text <- rvest::html_text(price_node[1])
        current_price <- clean_numeric(price_text)
        break
      }
    }
    
    if (is.null(current_price) || is.na(current_price)) {
      log_debug(symbol, "tradingview", "Could not find price data", "WARN")
      return(NULL)
    }
    
    # Extract change percentage
    change_selectors <- c(
      "div[data-name='legend-series-item'] span[data-name='change-percent']",
      "div.tv-symbol-price-quote__percent span",
      ".js-symbol-change-pt"
    )
    
    daily_change <- 0
    for (selector in change_selectors) {
      change_node <- rvest::html_nodes(doc, selector)
      if (length(change_node) > 0) {
        change_text <- rvest::html_text(change_node[1])
        daily_change <- clean_numeric(change_text)
        break
      }
    }
    
    # Create a data frame with just the current day's data
    result <- data.frame(
      date = Sys.Date(),
      price = current_price,
      open = NA,
      high = NA,
      low = NA,
      volume = NA,
      daily_change = daily_change,
      symbol = symbol,
      source = "tradingview",
      stringsAsFactors = FALSE
    )
    
    log_debug(symbol, "tradingview", "Fetch successful (current data only)")
    return(result)
    
  }, error = function(e) {
    handle_fetch_error(symbol, "tradingview", e$message)
  })
}

# SOURCE 7: Fetch from cache
fetch_from_cache <- function(symbol, from_date, cache_dir = "data/cache") {
  tryCatch({
    # Ensure cache directory exists
    if (!dir.exists(cache_dir)) {
      dir.create(cache_dir, recursive = TRUE)
      log_debug(symbol, "cache", sprintf("Created cache directory: %s", cache_dir))
      return(NULL)  # No cache exists yet
    }
    
    # Construct cache filename
    cache_file <- file.path(cache_dir, paste0(gsub("\\^", "", symbol), ".csv"))
    
    # Check if cache file exists
    if (!file.exists(cache_file)) {
      log_debug(symbol, "cache", "No cache file found", "INFO")
      return(NULL)
    }
    
    # Get cache file modification time
    cache_mtime <- file.info(cache_file)$mtime
    cache_age_days <- as.numeric(difftime(Sys.time(), cache_mtime, units = "days"))
    
    # Check if cache is recent enough (< 1 day old)
    if (cache_age_days > 1) {
      log_debug(symbol, "cache", sprintf("Cache is %.1f days old - too old", cache_age_days), "INFO")
      return(NULL)
    }
    
    # Read cache file
    log_debug(symbol, "cache", sprintf("Reading from cache: %s", cache_file))
    df <- read.csv(cache_file, stringsAsFactors = FALSE)
    
    # Ensure date column is properly formatted
    df$date <- as.Date(df$date)
    
    # Filter by date
    df <- df[df$date >= from_date, ]
    
    # Check if we have any data for the requested time period
    if (nrow(df) == 0) {
      log_debug(symbol, "cache", "Cache doesn't contain data for the requested period", "WARN")
      return(NULL)
    }
    
    # Add source information
    df$source <- "cache"
    df$symbol <- symbol
    
    log_debug(symbol, "cache", sprintf("Successfully retrieved %d rows from cache", nrow(df)))
    return(df)
    
  }, error = function(e) {
    handle_fetch_error(symbol, "cache", e$message)
  })
}

# SOURCE 8: Fetch from backup CSV files
fetch_from_backup_csv <- function(symbol, from_date, backup_dir = "data/backup") {
  tryCatch({
    log_debug(symbol, "backup_csv", sprintf("Starting fetch from backup for date: %s", from_date))
    
    # Check if backup directory exists
    if (!dir.exists(backup_dir)) {
      log_debug(symbol, "backup_csv", sprintf("Backup directory does not exist: %s", backup_dir), "WARN")
      return(NULL)
    }
    
    # Clean symbol for filename
    clean_symbol <- gsub("\\^", "", symbol)
    
    # Possible filename patterns
    filename_patterns <- c(
      paste0(clean_symbol, ".csv"),
      paste0(clean_symbol, "_daily.csv"),
      paste0(tolower(clean_symbol), ".csv"),
      paste0(toupper(clean_symbol), ".csv")
    )
    
    # Search for any matching file
    backup_file <- NULL
    for (pattern in filename_patterns) {
      file_path <- file.path(backup_dir, pattern)
      if (file.exists(file_path)) {
        backup_file <- file_path
        break
      }
    }
    
    if (is.null(backup_file)) {
      log_debug(symbol, "backup_csv", "No backup file found", "WARN")
      return(NULL)
    }
    
    # Read backup file
    log_debug(symbol, "backup_csv", sprintf("Reading from backup: %s", backup_file))
    
    df <- tryCatch({
      read.csv(backup_file, stringsAsFactors = FALSE)
    }, error = function(e) {
      log_debug(symbol, "backup_csv", sprintf("Error reading file: %s", e$message), "ERROR")
      return(NULL)
    })
    
    if (is.null(df) || nrow(df) == 0) {
      log_debug(symbol, "backup_csv", "Backup file is empty or corrupted", "WARN")
      return(NULL)
    }
    
    # Try to find date column
    date_col <- NULL
    for (col_name in c("date", "Date", "DATE", "timestamp", "Timestamp", "time", "Time")) {
      if (col_name %in% names(df)) {
        date_col <- col_name
        break
      }
    }
    
    if (is.null(date_col)) {
      log_debug(symbol, "backup_csv", "Could not find date column in backup file", "WARN")
      return(NULL)
    }
    
    # Convert date to proper format
    date_formats <- c("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d", "%d-%m-%Y", "%m-%d-%Y")
    df[[date_col]] <- as.character(df[[date_col]])
    
    for (format in date_formats) {
      dates <- as.Date(df[[date_col]], format = format)
      if (all(!is.na(dates))) {
        df[[date_col]] <- dates
        break
      }
    }
    
    if (!inherits(df[[date_col]], "Date")) {
      log_debug(symbol, "backup_csv", "Could not parse dates in backup file", "WARN")
      return(NULL)
    }
    
    # Try to find required columns
    required_cols <- c("price", "open", "high", "low", "volume")
    col_mapping <- list()
    
    # Price column candidates
    for (col in c("price", "Price", "close", "Close", "CLOSE", "last", "Last", "adj_close", "Adj.Close")) {
      if (col %in% names(df)) {
        col_mapping[["price"]] <- col
        break
      }
    }
    
    # Open column candidates
    for (col in c("open", "Open", "OPEN")) {
      if (col %in% names(df)) {
        col_mapping[["open"]] <- col
        break
      }
    }
    
    # High column candidates
    for (col in c("high", "High", "HIGH")) {
      if (col %in% names(df)) {
        col_mapping[["high"]] <- col
        break
      }
    }
    
    # Low column candidates
    for (col in c("low", "Low", "LOW")) {
      if (col %in% names(df)) {
        col_mapping[["low"]] <- col
        break
      }
    }
    
    # Volume column candidates
    for (col in c("volume", "Volume", "VOLUME")) {
      if (col %in% names(df)) {
        col_mapping[["volume"]] <- col
        break
      }
    }
    
    # Create standardized data frame
    result <- data.frame(
      date = df[[date_col]],
      price = if ("price" %in% names(col_mapping)) clean_numeric(df[[col_mapping[["price"]]]]) else NA,
      open = if ("open" %in% names(col_mapping)) clean_numeric(df[[col_mapping[["open"]]]]) else NA,
      high = if ("high" %in% names(col_mapping)) clean_numeric(df[[col_mapping[["high"]]]]) else NA,
      low = if ("low" %in% names(col_mapping)) clean_numeric(df[[col_mapping[["low"]]]]) else NA,
      volume = if ("volume" %in% names(col_mapping)) clean_numeric(df[[col_mapping[["volume"]]]]) else NA,
      symbol = symbol,
      source = "backup_csv",
      stringsAsFactors = FALSE
    )
    
    # Filter by date
    result <- result[result$date >= from_date, ]
    
    # Check if we have any data after filtering
    if (nrow(result) == 0) {
      log_debug(symbol, "backup_csv", "No data available for the specified date range", "WARN")
      return(NULL)
    }
    
    log_debug(symbol, "backup_csv", sprintf("Successfully retrieved %d rows from backup", nrow(result)))
    return(result)
    
  }, error = function(e) {
    handle_fetch_error(symbol, "backup_csv", e$message)
  })
}

# Save market data to cache
save_to_cache <- function(data, cache_dir = "data/cache") {
  tryCatch({
    # Ensure cache directory exists
    if (!dir.exists(cache_dir)) {
      dir.create(cache_dir, recursive = TRUE)
    }
    
    # Group by symbol and save each to its own cache file
    symbols <- unique(data$symbol)
    
    for (symbol in symbols) {
      # Filter data for this symbol
      symbol_data <- data[data$symbol == symbol, ]
      
      # Create cache filename
      cache_file <- file.path(cache_dir, paste0(gsub("\\^", "", symbol), ".csv"))
      
      # Save to CSV
      write.csv(symbol_data, cache_file, row.names = FALSE)
      log_debug(symbol, "cache", sprintf("Saved %d rows to cache: %s", nrow(symbol_data), cache_file))
    }
    
    return(TRUE)
    
  }, error = function(e) {
    log_debug("cache", "error", paste("Error saving to cache:", e$message), "ERROR")
    FALSE
  })
}

# Save data to backup with timestamp
save_to_backup <- function(data, backup_dir = "data/backup") {
  tryCatch({
    # Ensure backup directory exists
    if (!dir.exists(backup_dir)) {
      dir.create(backup_dir, recursive = TRUE)
    }
    
    # Group by symbol and save each to its own backup file
    symbols <- unique(data$symbol)
    timestamp <- format(Sys.time(), "%Y%m%d_%H%M%S")
    
    for (symbol in symbols) {
      # Filter data for this symbol
      symbol_data <- data[data$symbol == symbol, ]
      
      # Clean symbol for filename
      clean_symbol <- gsub("\\^", "", symbol)
      
      # Create backup filenames - save both timestamped and latest versions
      backup_file_ts <- file.path(backup_dir, paste0(clean_symbol, "_", timestamp, ".csv"))
      backup_file_latest <- file.path(backup_dir, paste0(clean_symbol, ".csv"))
      
      # Save timestamped backup
      write.csv(symbol_data, backup_file_ts, row.names = FALSE)
      
      # Save latest backup (overwrite existing)
      write.csv(symbol_data, backup_file_latest, row.names = FALSE)
      
      log_debug(symbol, "backup", sprintf("Saved backups: %s and %s", 
                                       basename(backup_file_ts), 
                                       basename(backup_file_latest)))
    }
    
    return(TRUE)
    
  }, error = function(e) {
    log_debug("backup", "error", paste("Error saving to backup:", e$message), "ERROR")
    FALSE
  })
}

# ===== MAIN MARKET DATA FUNCTIONS =====

# Fetch market data from all available sources with smart failover
fetch_market_data <- function(symbol, from_date, max_sources = 3) {
  log_debug(symbol, "fetch", sprintf("Starting market data fetch for date: %s", from_date))
  
  # Try cache first for efficiency
  cache_data <- fetch_from_cache(symbol, from_date)
  if (!is.null(cache_data) && nrow(cache_data) > 0) {
    log_debug(symbol, "fetch", "Successfully fetched from cache")
    return(cache_data)
  }
  
  # Define sources in order of reliability
  sources <- list(
    list(name = "yahoo", fn = fetch_yahoo),
    list(name = "stooq", fn = fetch_stooq),
    list(name = "investing", fn = fetch_investing),
    list(name = "marketwatch", fn = fetch_marketwatch),
    list(name = "finviz", fn = fetch_finviz),
    list(name = "tradingview", fn = fetch_tradingview),
    list(name = "backup_csv", fn = fetch_from_backup_csv)
  )
  
  # Try each source until we get data or reach max_sources
  results <- list()
  success_count <- 0
  
  for (source in sources) {
    if (success_count >= max_sources) {
      break
    }
    
    log_debug(symbol, "fetch", sprintf("Trying source: %s", source$name))
    data <- source$fn(symbol, from_date)
    
    if (!is.null(data) && nrow(data) > 0) {
      log_debug(symbol, "fetch", sprintf("Successfully fetched %d rows from %s", 
                                      nrow(data), source$name))
      results[[length(results) + 1]] <- data
      success_count <- success_count + 1
    }
  }
  
  if (length(results) == 0) {
    log_debug(symbol, "fetch", "All sources failed", "ERROR")
    return(NULL)
  }
  
  # Combine results (if we have multiple sources)
  if (length(results) > 1) {
    combined_data <- do.call(rbind, results)
    
    # Remove duplicates (same date, different sources)
    combined_data <- combined_data %>%
      dplyr::arrange(date, desc(source)) %>%
      dplyr::distinct(date, .keep_all = TRUE)
    
    log_debug(symbol, "fetch", sprintf("Combined data from %d sources: %d rows", 
                                     length(results), nrow(combined_data)))
    
    return(combined_data)
  } else {
    return(results[[1]])
  }
}

# Fetch data for multiple indices
fetch_all_market_data <- function(market_indices, from_date) {
  log_debug("all", "fetch", "Starting fetch for all market indices")
  
  # Flatten the nested list of indices
  all_indices <- list()
  for (region in names(market_indices)) {
    region_indices <- market_indices[[region]]
    for (symbol in names(region_indices)) {
      all_indices[[symbol]] <- list(
        symbol = symbol,
        name = region_indices[[symbol]],
        region = region
      )
    }
  }
  
  total_indices <- length(all_indices)
  log_debug("all", "fetch", sprintf("Total indices to fetch: %d", total_indices))
  
  # Initialize results list
  all_results <- list()
  
  # Process each index
  for (i in seq_along(all_indices)) {
    index_info <- all_indices[[i]]
    symbol <- index_info$symbol
    
    log_debug("all", "fetch", sprintf("Processing index %d/%d: %s (%s)", 
                                    i, total_indices, symbol, index_info$region))
    
    # Fetch data for this index
    data <- fetch_market_data(symbol, from_date)
    
    if (!is.null(data) && nrow(data) > 0) {
      # Add additional info
      data$index_name <- index_info$name
      data$region <- index_info$region
      
      all_results[[length(all_results) + 1]] <- data
      log_debug("all", "fetch", sprintf("Successfully fetched data for %s", symbol))
    } else {
      log_debug("all", "fetch", sprintf("Failed to fetch data for %s", symbol), "WARN")
    }
  }
  
  if (length(all_results) == 0) {
    log_debug("all", "fetch", "Failed to fetch data for any index", "ERROR")
    return(NULL)
  }
  
  # Combine all results
  combined_data <- do.call(rbind, all_results)
  
  # Cache the combined data
  save_to_cache(combined_data)
  
  # Also save to backup
  save_to_backup(combined_data)
  
  log_debug("all", "fetch", sprintf("Successfully fetched data for %d/%d indices, total rows: %d", 
                                  length(all_results), total_indices, nrow(combined_data)))
  
  return(combined_data)
}

# Calculate market "weather" metrics
calculate_market_weather <- function(market_data) {
  log_debug("weather", "calculate", "Calculating market weather metrics")
  
  # Ensure market_data is sorted by date
  market_data <- market_data %>%
    dplyr::arrange(symbol, date)
  
  # Get unique symbols
  symbols <- unique(market_data$symbol)
  
  # Initialize results list
  weather_results <- list()
  
  for (symbol in symbols) {
    # Get data for this symbol
    symbol_data <- market_data[market_data$symbol == symbol, ]
    
    # Get the most recent data
    latest_date <- max(symbol_data$date)
    latest_data <- symbol_data[symbol_data$date == latest_date, ][1, ] # Take first row if multiple
    
    # Get reference dates for different time periods
    if (nrow(symbol_data) > 1) {
      # Daily return - get previous trading day
      prev_day_idx <- which(symbol_data$date < latest_date)
      if (length(prev_day_idx) > 0) {
        prev_day <- symbol_data[max(prev_day_idx), ]
        daily_return <- (latest_data$price / prev_day$price - 1) * 100
      } else {
        daily_return <- NA
      }
      
      # Weekly return - approximately 5 trading days
      week_ago_idx <- which(symbol_data$date <= latest_date - 7)
      if (length(week_ago_idx) > 0) {
        week_ago <- symbol_data[max(week_ago_idx), ]
        weekly_return <- (latest_data$price / week_ago$price - 1) * 100
      } else {
        weekly_return <- NA
      }
      
      # Monthly return - approximately 21 trading days
      month_ago_idx <- which(symbol_data$date <= latest_date - 30)
      if (length(month_ago_idx) > 0) {
        month_ago <- symbol_data[max(month_ago_idx), ]
        monthly_return <- (latest_data$price / month_ago$price - 1) * 100
      } else {
        monthly_return <- NA
      }
    } else {
      # If we only have one data point, we can't calculate returns
      daily_return <- NA
      weekly_return <- NA
      monthly_return <- NA
    }
    
    # Determine "weather" based on daily return
    weather <- case_when(
      is.na(daily_return) ~ "☁️", # Cloudy if no data
      daily_return >= 5 ~ "🌞",  # Sunny (Exceptional)
      daily_return >= 3 ~ "🌤️",  # Mostly Sunny (Very Strong)
      daily_return >= 1 ~ "⛅",  # Partly Sunny (Strong)
      daily_return >= 0 ~ "🌥️",  # Partly Cloudy (Positive)
      daily_return >= -1 ~ "☁️",  # Cloudy (Stable)
      daily_return >= -3 ~ "🌧️",  # Rainy (Cautious)
      daily_return >= -5 ~ "⛈️",  # Storm (Weak)
      daily_return >= -7 ~ "🌪️",  # Tornado (Very Weak)
      TRUE ~ "⚡" # Lightning (Critical)
    )
    
    # Determine market conditions text
    conditions <- case_when(
      is.na(daily_return) ~ "Data Unavailable",
      daily_return >= 5 ~ "Exceptional",
      daily_return >= 3 ~ "Very Strong",
      daily_return >= 1 ~ "Strong",
      daily_return >= 0 ~ "Positive",
      daily_return >= -1 ~ "Stable",
      daily_return >= -3 ~ "Cautious",
      daily_return >= -5 ~ "Weak",
      daily_return >= -7 ~ "Very Weak",
      TRUE ~ "Critical"
    )
    
    # Create result row
    weather_results[[length(weather_results) + 1]] <- data.frame(
      symbol = symbol,
      index_name = latest_data$index_name,
      region = latest_data$region,
      current_price = latest_data$price,
      date = latest_date,
      daily_return = daily_return,
      weekly_return = weekly_return,
      monthly_return = monthly_return,
      weather_icon = weather,
      conditions = conditions,
      stringsAsFactors = FALSE
    )
  }
  
  if (length(weather_results) == 0) {
    log_debug("weather", "calculate", "No weather data could be calculated", "ERROR")
    return(NULL)
  }
  
  # Combine all results
  weather_data <- do.call(rbind, weather_results)
  
  # Sort by region and daily return
  weather_data <- weather_data %>%
    dplyr::arrange(region, desc(daily_return))
  
  log_debug("weather", "calculate", sprintf("Successfully calculated weather for %d indices", nrow(weather_data)))
  
  return(weather_data)
}
