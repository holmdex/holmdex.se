# market-weather-functions.R
# Enhanced market data fetcher using only free data sources

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
    return(toJSON(log_entry, auto_unbox = TRUE))
  } else {
    formatted_msg <- sprintf("[%s] [%s] %s (%s): %s", 
                           timestamp, level, symbol, source, msg)
    if (console) cat(formatted_msg, "\n")
    invisible(formatted_msg)
  }
}

# Enhanced rate limiting with exponential backoff
rate_limit <- function(source, attempt = 1, max_backoff = 8) {
  base_delay <- switch(source,
    "yahoo" = 1,
    "stooq" = 2,
    "investing" = 2.5,
    "marketwatch" = 2,
    "wsj" = 3,
    "google" = 2,
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
    "^VNINDEX" = "^VNINDEX", "^PSEI" = "^PSEI"
  ),
  stooq = list(
    # US Markets
    "^GSPC" = "^SPX", "^DJI" = "^DJI", "^IXIC" = "^NDQ", "^RUT" = "^RUT",
    "^VIX" = "^VIX", "^NYA" = "^NYA", "^XAX" = "^XAX", "^BKX" = "^BKX",
    
    # Asian Markets
    "^N225" = "^NKX", "^HSI" = "^HSI", "000001.SS" = "^SHC",
    "^KS11" = "^KS11", "^TWII" = "^TWI", "^BSESN" = "^BOM",
    "^NSEI" = "^NSE", "^JKSE" = "^JCI", "^STI" = "^SGX"
  ),
  investing = list(
    # US Markets - using Investing.com IDs
    "^GSPC" = "spx", "^DJI" = "us-30", "^IXIC" = "nasdaq-composite", "^RUT" = "russell-2000",
    "^VIX" = "volatility-s-p-500", "^NYA" = "nyse-composite", "^BKX" = "kbw-bank",
    
    # Asian Markets
    "^N225" = "japan-ni225", "^HSI" = "hang-sen-40", "000001.SS" = "shanghai-composite", 
    "^KS11" = "kospi", "^TWII" = "taiwan-weighted", "^BSESN" = "sensex",
    "^NSEI" = "s-p-cnx-nifty", "^JKSE" = "idx-composite", "^STI" = "singapore-straits-time"
  ),
  marketwatch = list(
    # US Markets 
    "^GSPC" = "SPX", "^DJI" = "DJIA", "^IXIC" = "COMP", "^RUT" = "RUT",
    "^VIX" = "VIX", "^NYA" = "NYA", "^XAX" = "XAX", "^BKX" = "BKX",
    
    # Asian Markets
    "^N225" = "NIK", "^HSI" = "HSI", "000001.SS" = "SHCOMP",
    "^KS11" = "SEU", "^TWII" = "Y9999", "^BSESN" = "1", "^NSEI" = "NIFTY",
    "^JKSE" = "JAKIDX", "^STI" = "STI"
  )
)

# METHOD 1: Yahoo Finance API via quantmod
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
    log_debug(symbol, "yahoo", paste("Error:", e$message), "ERROR")
    NULL
  })
}

# METHOD 2: Stooq Data API via quantmod
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
    log_debug(symbol, "stooq", paste("Error:", e$message), "ERROR")
    NULL
  })
}

# METHOD 3: Web scraping from Investing.com
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
    
    # Remove commas from numeric values and convert
    clean_numeric <- function(x) {
      as.numeric(gsub(",", "", x))
    }
    
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
    log_debug(symbol, "investing", paste("Error:", e$message), "ERROR")
    NULL
  })
}

# METHOD 4: Web scraping from MarketWatch
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
    log_debug(symbol, "marketwatch", paste("Error:", e$message), "ERROR")
    NULL
  })
}

# METHOD 5: Extract data from HTML tables on financial websites
fetch_from_html_table <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "html_table", sprintf("Starting fetch for date: %s", from_date))
    
    # Clean symbol for URL
    clean_symbol <- gsub("\\^", "", symbol)
    
    # List of potential websites with their URL patterns and parsing functions
    websites <- list(
      list(
        name = "finance.yahoo.com",
        url = sprintf("https://finance.yahoo.com/quote/%s/history", symbol),
        selector = "table[data-test='historical-prices']",
        parse_fn = function(table) {
          # Yahoo Finance specific parsing
          names(table) <- c("date", "open", "high", "low", "price", "adj_close", "volume")
          table$date <- as.Date(table$date, format = "%b %d, %Y")
          return(table)
        }
      ),
      list(
        name = "marketwatch.com",
        url = sprintf("https://www.marketwatch.com/investing/index/%s/historical", tolower(clean_symbol)),
        selector = "table.table--overflow",
        parse_fn = function(table) {
          # MarketWatch specific parsing
          names(table) <- tolower(names(table))
          table$date <- as.Date(table$date, format = "%m/%d/%Y")
          return(table)
        }
      ),
      list(
        name = "wsj.com",
        url = sprintf("https://www.wsj.com/market-data/quotes/%s/historical-prices", clean_symbol),
        selector = "table.cr_dataTable",
        parse_fn = function(table) {
          # Wall Street Journal specific parsing
          names(table) <- c("date", "open", "high", "low", "price", "volume")
          table$date <- as.Date(table$date, format = "%m/%d/%y")
          return(table)
        }
      ),
      list(
        name = "investing.com",
        url = sprintf("https://www.investing.com/indices/%s-historical-data", tolower(clean_symbol)),
        selector = "table#curr_table",
        parse_fn = function(table) {
          # Investing.com specific parsing
          names(table) <- tolower(gsub("[^A-Za-z0-9]", "_", names(table)))
          table$date <- as.Date(table$date, format = "%b %d, %Y")
          return(table)
        }
      )
    )
    
    # User agent
    user_agent <- "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    
    # Try each website
    for (site in websites) {
      tryCatch({
        log_debug(symbol, "html_table", sprintf("Trying %s", site$name))
        
        # Rate limiting
        Sys.sleep(runif(1, 2, 4))
        
        # Make request
        response <- httr::GET(
          url = site$url,
          httr::add_headers(
            "User-Agent" = user_agent,
            "Accept" = "text/html,application/xhtml+xml,application/xml"
          ),
          httr::timeout(15)
        )
        
        # Check status
        if (httr::status_code(response) != 200) {
          log_debug(symbol, "html_table", 
                  sprintf("%s returned status code %d", site$name, httr::status_code(response)), 
                  "WARN")
          next
        }
        
        # Parse HTML
        html_content <- httr::content(response, "text", encoding = "UTF-8")
        doc <- rvest::read_html(html_content)
        
        # Find table
        tables <- rvest::html_nodes(doc, site$selector)
        
        if (length(tables) == 0) {
          log_debug(symbol, "html_table", sprintf("No table found at %s", site$name), "WARN")
          next
        }
        
        # Extract first table
        table_data <- rvest::html_table(tables[[1]], fill = TRUE)
        
        # Apply site-specific parsing
        df <- site$parse_fn(table_data)
        
        # Clean numeric columns
        numeric_cols <- c("open", "high", "low", "price", "volume")
        for (col in numeric_cols) {
          if (col %in% names(df)) {
            # Remove commas and convert to numeric
            df[[col]] <- as.numeric(gsub("[^0-9.-]", "", as.character(df[[col]])))
          }
        }
        
        # Filter by date
        df <- df[df$date >= from_date, ]
        
        # Check if we have data
        if (nrow(df) == 0) {
          log_debug(symbol, "html_table", sprintf("No data found at %s for the specified period", site$name), "WARN")
          next
        }
        
        # Add symbol and source
        df$symbol <- symbol
        df$source <- paste0("html_", site$name)
        
        log_debug(symbol, "html_table", sprintf("Successfully fetched %d rows from %s", nrow(df), site$name))
        return(df)
        
      }, error = function(e) {
        log_debug(symbol, "html_table", sprintf("Error with %s: %s", site$name, e$message), "WARN")
      })
    }
    
    log_debug(symbol, "html_table", "All HTML table sources failed", "ERROR")
    return(NULL)
    
  }, error = function(e) {
    log_debug(symbol, "html_table", paste("Error:", e$message), "ERROR")
    NULL
  })
}

# METHOD 6: Fetch from cache
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
    log_debug(symbol, "cache", paste("Error reading cache:", e$message), "ERROR")
    NULL
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

# METHOD 7: Fetch from backup CSV files
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
