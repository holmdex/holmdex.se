# Source priority order:
# 1. Yahoo Finance API (most reliable, free)
# 2. Stooq Data (free, good backup)

# Define comprehensive market indices
market_indices <- list(
  US = c(
    "^GSPC" = "S&P 500 | Area: United States",
    "^DJI" = "Dow Jones | Area: United States",
    "^IXIC" = "NASDAQ | Area: United States",
    "^RUT" = "Russell 2000 | Area: United States",
    "^VIX" = "VIX | Area: United States",
    "^NYA" = "NYSE Composite | Area: United States",
    "^XAX" = "NYSE AMEX Composite | Area: United States",
    "^BKX" = "KBW Bank Index | Area: United States",
    "^DJT" = "Dow Jones Transport | Area: United States",
    "^DJUS" = "Dow Jones US Total | Area: United States"
  ),
  
  Asia = c(
    "^N225" = "Nikkei 225 | Area: Japan",
    "^HSI" = "Hang Seng | Area: Hong Kong",
    "000001.SS" = "Shanghai Composite | Area: Mainland",
    "399001.SZ" = "Shenzhen Component | Area: Mainland",
    "^KS11" = "KOSPI | Area: South Korea",
    "^TWII" = "TAIEX | Area: Taipei",
    "^BSESN" = "BSE SENSEX | Area: India",
    "^NSEI" = "NIFTY 50 | Area: India",
    "^JKSE" = "Jakarta Composite | Area: Indonesia",
    "^STI" = "Straits Times | Area: Singapore",
    "^KLSE" = "KLCI | Area: Malaysia",
    "^SET.BK" = "SET | Area: Thailand",
    "^VNINDEX" = "VN-Index | Area: Vietnam",
    "^PSEI" = "PSEi | Area: Philippines"
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
    "^WIG20" = "WIG20 | Area: Poland",
    "^BUX" = "BUX | Area: Hungary",
    "IMOEX.ME" = "MOEX | Area: Russia",
    "^RTS.RS" = "RTS | Area: Russia",
    "XU100.IS" = "BIST 100 | Area: Turkey"
  ),
  
  Nordics = c(
    "^OMXC25" = "OMX C25 | Area: Denmark",
    "^OMXH25" = "OMX H25 | Area: Finland",
    "^OSEAX" = "Oslo Exchange | Area: Norway",
    "^OMX" = "OMX S30 | Area: Sweden",
    "^OMXIPI" = "OMX Iceland | Area: Iceland",
    "OMXBBGI.ST" = "OMX Baltic | Area: Baltic Region",
    "^OMXRGI" = "OMX Riga | Area: Latvia",
    "^OMXTGI" = "OMX Tallinn | Area: Estonia",
    "^OMXVGI" = "OMX Vilnius | Area: Lithuania"
  ),
  
  Pacific = c(
    "^AORD" = "All Ordinaries | Area: Australia",
    "^AXJO" = "S&P/ASX 200 | Area: Australia",
    "^NZ50" = "NZX 50 | Area: New Zealand",
    "^NZAQ" = "NZX All | Area: New Zealand",
    "^NZSC" = "NZX SmallCap | Area: New Zealand"
  ),
  
  Americas = c(
    "^GSPTSE" = "S&P/TSX Composite | Area: Canada",
    "^BVSP" = "Bovespa | Area: Brazil",
    "^MXX" = "IPC Mexico | Area: Mexico",
    "^MERV" = "MERVAL | Area: Argentina",
    "^IPSA" = "IPSA | Area: Chile",
    "^COLCAP" = "COLCAP | Area: Colombia",
    "^LIMA" = "S&P/BVL | Area: Peru",
    "^BVCA" = "BCX | Area: Venezuela",
    "^IBC" = "IBC | Area: Venezuela"
  ),
  
  Africa = c(
    "^JALSH" = "JSE All-Share | Area: South Africa",
    "^TOP40.JO" = "JSE Top 40 | Area: South Africa",
    "^EGX30" = "EGX 30 | Area: Egypt",
    "^MASI" = "Moroccan All Shares | Area: Morocco",
    "^NGSEINDX" = "NGX 30 | Area: Nigeria",
    "^NASI" = "NSE All Share | Area: Kenya",
    "^TUSISE" = "Tunindex | Area: Tunisia",
    "^GGSECI" = "GSE Composite | Area: Ghana",
    "^ALSIUG" = "USE All Share | Area: Uganda",
    "^DARSDEI" = "DSE Index | Area: Tanzania"
  ),
  
  MiddleEast = c(
    "^TASI.SR" = "Tadawul All Share | Area: Saudi Arabia",
    "^ADI" = "ADX General | Area: UAE",
    "^DFMGI" = "DFM General | Area: UAE",
    "^QSI" = "QE General | Area: Qatar",
    "^KWSE" = "Kuwait General | Area: Kuwait",
    "^MSM30" = "MSM 30 | Area: Oman",
    "^BSEX" = "Bahrain All Share | Area: Bahrain",
    "TA35.TA" = "TA-35 | Area: Israel",
    "^AMGNRLX" = "Amman SE General | Area: Jordan"
  )
)

# Symbol mapping for different sources (partial mapping, extend as needed)
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
  )
)

# Enhanced logging function
log_debug <- function(symbol, source, msg, level = "INFO") {
  timestamp <- format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  formatted_msg <- sprintf("[%s] [%s] %s (%s): %s", timestamp, level, symbol, source, msg)
  cat(formatted_msg, "\n")
  invisible(formatted_msg)
}

# Rate limiting function
rate_limit <- function(source) {
  delay <- switch(source,
    "yahoo" = 1,
    "stooq" = 2,
    2  # Default delay
  )
  Sys.sleep(delay)
}

# Yahoo Finance fetcher with improved error handling
fetch_yahoo <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "yahoo", sprintf("Starting fetch for date: %s", from_date))
    rate_limit("yahoo")
    
    # Map symbol if needed
    yahoo_symbol <- symbol_mappings$yahoo[[symbol]] %||% symbol
    log_debug(symbol, "yahoo", sprintf("Using mapped symbol: %s", yahoo_symbol))
    
    # More robust data fetch with retries
    max_retries <- 3
    data <- NULL
    last_error <- NULL
    
    for(i in 1:max_retries) {
      tryCatch({
        data <- quantmod::getSymbols(yahoo_symbol, 
                                   src = "yahoo",
                                   from = from_date,
                                   auto.assign = FALSE)
        break
      }, error = function(e) {
        last_error <- e
        log_debug(symbol, "yahoo", sprintf("Attempt %d failed: %s", i, e$message), "WARN")
        if(i < max_retries) Sys.sleep(2^i)  # Exponential backoff
      })
    }
    
    if (!is.null(data) && nrow(data) > 0) {
      log_debug(symbol, "yahoo", "Fetch successful")
      return(data.frame(
        date = index(data),
        price = as.numeric(quantmod::Cl(data)),
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

# Stooq Data fetcher with improved error handling
fetch_stooq <- function(symbol, from_date) {
  tryCatch({
    log_debug(symbol, "stooq", sprintf("Starting fetch for date: %s", from_date))
    rate_limit("stooq")
    
    # Map symbol if needed
    stooq_symbol <- symbol_mappings$stooq[[symbol]] %||% symbol
    log_debug(symbol, "stooq", sprintf("Using mapped symbol: %s", stooq_symbol))
    
    # More robust data fetch with retries
    max_retries <- 3
    data <- NULL
    last_error <- NULL
    
    for(i in 1:max_retries) {
      tryCatch({
        data <- quantmod::getSymbols(stooq_symbol, 
                                   src = "stooq",
                                   from = from_date,
                                   auto.assign = FALSE)
        break
      }, error = function(e) {
        last_error <- e
        log_debug(symbol, "stooq", sprintf("Attempt %d failed: %s", i, e$message), "WARN")
        if(i < max_retries) Sys.sleep(2^i)  # Exponential backoff
      })
    }
    
    if (!is.null(data) && nrow(data) > 0) {
      log_debug(symbol, "stooq", "Fetch successful")
      return(data.frame(
        date = index(data),
        price = as.numeric(quantmod::Cl(data)),
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

# Main fetch function with error handling
fetch_market_data <- function(symbol, from_date) {
  log_debug(symbol, "market_data", sprintf("Starting market data fetch for %s from %s", 
                                         symbol, format(from_date)))
  
  # Validate inputs
  if (is.null(symbol) || is.null(from_date)) {
    log_debug(symbol, "market_data", "Invalid inputs", "ERROR")
    return(NULL)
  }
  
  # List of fetch functions in priority order
  fetch_functions <- list(
    yahoo = fetch_yahoo,
    stooq = fetch_stooq
  )
  
  # Try each function in sequence
  for (source_name in names(fetch_functions)) {
    data <- fetch_functions[[source_name]](symbol, from_date)
    if (!is.null(data) && nrow(data) > 0) {
      return(data)
    }
  }
  
  log_debug(symbol, "market_data", "All data fetching methods failed", "ERROR")
  NULL
}

# Fetch all market data with improved error handling and retries
fetch_all_market_data <- function(indices, start_date) {
  log_debug("ALL", "start", sprintf("Starting data fetch for %d indices from %s", 
                                  sum(lengths(indices)), format(start_date)))
  
  market_data <- tibble()
  fetch_count <- 0
  failed_fetches <- list()
  
  # Test initial connection
  test_symbol <- "^GSPC"  # Use S&P 500 as test
  test_result <- fetch_yahoo(test_symbol, start_date - days(1))
  if (is.null(test_result)) {
    log_debug("ALL", "test", "Initial connection test failed", "ERROR")
    return(tibble())
  }
  log_debug("ALL", "test", "Initial connection test successful")
  
  for (region in names(indices)) {
    for (symbol in names(indices[[region]])) {
      # Rate limiting between requests
      if (fetch_count > 0) Sys.sleep(2)
      fetch_count <- fetch_count + 1
      
      # Retry logic with exponential backoff
      max_retries <- 3
      success <- FALSE
      last_error <- NULL
      
      for (retry in 1:max_retries) {
        tryCatch({
          data <- fetch_market_data(symbol, start_date)
          
          if (!is.null(data) && nrow(data) > 0) {
            data$region <- region
            data$index_name <- indices[[region]][symbol]
            market_data <- bind_rows(market_data, data)
            success <- TRUE
            break
          }
          
        }, error = function(e) {
          last_error <- e
          log_debug(symbol, "retry", sprintf("Attempt %d failed: %s", retry, e$message), "WARN")
        })
        
        if (!success && retry < max_retries) {
          backoff_time <- 2 ^ retry
          log_debug(symbol, "retry", sprintf("Waiting %d seconds before retry %d/%d", 
                                           backoff_time, retry + 1, max_retries))
          Sys.sleep(backoff_time)
        }
      }
      
      if (!success) {
        failed_fetches[[symbol]] <- list(
          region = region,
          index_name = indices[[region]][symbol],
          last_error = if(!is.null(last_error)) last_error$message else "Unknown error"
        )
      }
    }
  }
  
  # Log summary statistics
  success_count <- length(unique(market_data$symbol))
  total_count <- sum(lengths(indices))
  log_debug("ALL", "summary", sprintf("Successfully fetched %d/%d indices (%.1f%%)", 
                                    success_count,
                                    total_count,
                                    success_count/total_count * 100),
           if(length(failed_fetches) > 0) "WARN" else "INFO")
  
  if (length(failed_fetches) > 0) {
    log_debug("ALL", "failures", sprintf("Failed indices: %s", 
                                       paste(names(failed_fetches), collapse=", ")),
             "WARN")
  }
  
  # Add metadata
  attr(market_data, "failed_fetches") <- failed_fetches
  attr(market_data, "fetch_time") <- Sys.time()
  attr(market_data, "success_rate") <- success_count/total_count
  
  market_data
}

# Calculate market weather with improved error handling
calculate_market_weather <- function(market_data) {
  if (nrow(market_data) == 0) return(tibble())
  
  tryCatch({
    weather_data <- market_data %>%
      group_by(symbol) %>%
      arrange(date) %>%
      mutate(
        returns = (price / lag(price) - 1) * 100,
        returns = if_else(is.infinite(returns) | is.na(returns), 0, returns)
      ) %>%
      ungroup() %>%
      group_by(region, index_name) %>%
      summarize(
        daily_return = last(returns, na.rm = TRUE),
        weekly_return = (last(price) / nth(price, n()-min(5, n()-1), default = first(price)) - 1) * 100,
        monthly_return = (last(price) / first(price) - 1) * 100,
        last_update = max(date),
        data_source = last(source),
        .groups = 'drop'
      ) %>%
      mutate(
        across(ends_with("_return"), 
               ~if_else(abs(.) > 20, NA_real_, .)),
        weather_icon = case_when(
          is.na(daily_return) ~ "❓",
          daily_return >= 5 ~ "🌞",
          daily_return >= 3 ~ "🌤️",
          daily_return >= 1 ~ "⛅",
          daily_return >= 0 ~ "🌥️",
          daily_return >= -1 ~ "☁️",
          daily_return >= -3 ~ "🌧️",
          daily_return >= -5 ~ "⛈️",
          daily_return >= -7 ~ "🌪️",
          TRUE ~ "⚡"
        ),
        conditions = case_when(
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
        ),
        mood_color = case_when(
          is.na(daily_return) ~ "#808080",
          daily_return >= 5 ~ "#006400",
          daily_return >= 3 ~ "#4CAF50",
          daily_return >= 1 ~ "#8BC34A",
          daily_return >= 0 ~ "#CDDC39",
          daily_return >= -1 ~ "#FFC107",
          daily_return >= -3 ~ "#FF9800",
          daily_return >= -5 ~ "#FF5722",
          daily_return >= -7 ~ "#F44336",
          TRUE ~ "#B71C1C"
        )
      )
    
    # Add data quality metrics
    attr(weather_data, "data_quality") <- list(
      total_indices = nrow(weather_data),
      missing_data = sum(is.na(weather_data$daily_return)),
      data_sources = table(weather_data$data_source),
      last_update_range = range(weather_data$last_update)
    )
    
    weather_data
    
  }, error = function(e) {
    log_debug("calculate", "error", sprintf("Calculation error: %s", e$message), "ERROR")
    return(tibble())
  })
}

# Render weather table with improved error handling
render_weather_table <- function(weather_summary) {
  if (nrow(weather_summary) == 0) {
    # Get failed fetches info
    failed_fetches <- attr(weather_summary, "failed_fetches")
    fetch_time <- attr(weather_summary, "fetch_time")
    success_rate <- attr(weather_summary, "success_rate")
    
    # Create detailed error message
    error_msg <- if (!is.null(failed_fetches) && length(failed_fetches) > 0) {
      sample_errors <- head(sapply(failed_fetches, function(x) x$last_error), 3)
      sprintf("Data fetch partially failed. Sample errors: %s", 
              paste(sample_errors, collapse="; "))
    } else {
      "No market data available"
    }
    
    return(HTML(sprintf(
      '<div class="no-data">
         %s at this time. Please try again later.<br>
         <small>Last attempt: %s</small><br>
         %s
       </div>',
      error_msg,
      format(Sys.time(), "%H:%M:%S"),
      if(!is.null(success_rate)) sprintf("<small>Success rate: %.1f%%</small>", success_rate * 100) else ""
    )))
  }
  
  tryCatch({
    # Get data quality info
    data_quality <- attr(weather_summary, "data_quality")
    quality_note <- if (!is.null(data_quality)) {
      sprintf(
        "Data Coverage: %.1f%% (%d/%d indices)",
        (1 - data_quality$missing_data/data_quality$total_indices) * 100,
        data_quality$total_indices - data_quality$missing_data,
        data_quality$total_indices
      )
    } else {
      ""
    }
    
    # Format percentages for display
    display_data <- weather_summary %>%
      mutate(
        across(ends_with("_return"), ~sprintf("%.2f%%", .)),
        region = paste(region, "</div>") %>%
          paste0('<div class="region-', tolower(region), '">', .)
      )
    
    # Create the datatable
    dt <- datatable(
      display_data %>% select(-mood_color),
      colnames = c("Region", "Market", "Daily %", "Weekly %", "Monthly %", 
                   "Weather", "Status"),
      options = list(
        pageLength = 20,  # Show more rows by default
        dom = '<"top"<"left"B><"right"f>>rtip',
        buttons = list(
          list(
            extend = 'collection',
            text = 'Change Period',
            buttons = list(
              list(text = 'Daily', action = JS("function() { showPeriod('daily'); }")),
              list(text = 'Weekly', action = JS("function() { showPeriod('weekly'); }")),
              list(text = 'Monthly', action = JS("function() { showPeriod('monthly'); }"))
            )
          )
        ),
        order = list(list(0, 'asc'), list(2, 'desc')),  # Sort by region then daily return
        language = list(
          search = 'Search:',
          zeroRecords = 'No matching markets found',
          info = paste(quality_note, '- Showing _START_ to _END_ of _TOTAL_'),
          infoEmpty = 'No markets available',
          infoFiltered = '(filtered from _MAX_)'
        )
      ),
      rownames = FALSE,
      escape = FALSE,
      selection = 'none',
      class = 'cell-border stripe weather-table'
    )
    
    # Apply styling
    dt %>% formatStyle(
      columns = names(display_data)[-which(names(display_data) == "mood_color")],
      backgroundColor = styleEqual(
        unique(weather_summary$conditions),
        unique(weather_summary$mood_color)
      ),
      color = styleEqual(
        unique(weather_summary$conditions),
        ifelse(unique(weather_summary$mood_color) == "#808080", "black", "white")
      )
    )
    
  }, error = function(e) {
    log_debug("render", "error", sprintf("Table rendering error: %s", e$message), "ERROR")
    HTML(sprintf(
      '<div class="no-data">
         Error generating weather table: %s<br>
         <small>Time: %s</small>
       </div>',
      e$message,
      format(Sys.time(), "%H:%M:%S")
    ))
  })
}
