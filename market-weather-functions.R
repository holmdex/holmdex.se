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

# Fetch all market data with retries
fetch_all_market_data <- function(indices, start_date) {
  market_data <- tibble()
  fetch_count <- 0
  
  for (region in names(indices)) {
    for (symbol in names(indices[[region]])) {
      # Rate limiting between regions
      if (fetch_count > 0) Sys.sleep(2)
      fetch_count <- fetch_count + 1
      
      # Retry logic
      max_retries <- 3
      for (retry in 1:max_retries) {
        data <- fetch_market_data(symbol, start_date)
        if (!is.null(data) && nrow(data) > 0) {
          data$region <- region
          data$index_name <- indices[[region]][symbol]
          market_data <- bind_rows(market_data, data)
          break
        } else if (retry < max_retries) {
          Sys.sleep(2 ^ retry)  # Exponential backoff
          log_debug(symbol, "retry", sprintf("Attempt %d of %d", retry + 1, max_retries))
        }
      }
    }
  }
  
  # Validate final dataset
  if (nrow(market_data) > 0) {
    log_debug("ALL", "summary", sprintf("Successfully fetched %d/%d indices", 
                                      length(unique(market_data$symbol)),
                                      sum(lengths(indices))))
  }
  
  market_data
}

calculate_market_weather <- function(market_data) {
  if (nrow(market_data) == 0) return(tibble())
  
  # Add error handling for calculations
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
        ),
        # Format percentages after all calculations
        across(ends_with("_return"), 
               ~sprintf("%.2f%%", .))
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
    log_debug("calculate", "error", sprintf("Calculation error: %s", e$message))
    return(tibble())
  })
}

render_weather_table <- function(weather_summary) {
  if (nrow(weather_summary) == 0) {
    return(HTML(sprintf(
      '<div class="no-data">
         No market data available. Please try again later.<br>
         <small>Last attempt: %s</small>
       </div>',
      format(Sys.time(), "%H:%M:%S")
    )))
  }
  
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
  
  datatable(
    weather_summary %>%
      select(region, index_name, daily_return, weekly_return, monthly_return, 
             weather_icon, conditions) %>%
      mutate(
        region = paste(region, "</div>") %>%
          paste0('<div class="region-', tolower(region), '">', .)
      ),
    colnames = c("Region", "Market", "Daily %", "Weekly %", "Monthly %", 
                 "Weather", "Status"),
    options = list(
      pageLength = 15,
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
      order = list(list(2, 'desc')),
      language = list(
        search = 'Search Markets:',
        zeroRecords = 'No matching markets found',
        info = paste(quality_note, '- Showing _START_ to _END_ of _TOTAL_'),
        infoEmpty = 'No markets available',
        infoFiltered = '(filtered from _MAX_)'
      ),
      drawCallback = JS("
        function(settings) {
          var api = this.api();
          var rows = api.rows({page:'current'}).nodes();
          var last = null;
          
          api.column(0).data().each(function(group, i) {
            if (last !== group) {
              $(rows).eq(i).before(
                '<tr class=\"group\"><td colspan=\"7\">' + group + '</td></tr>'
              );
              last = group;
            }
          });
        }
      ")
    ),
    rownames = FALSE,
    escape = FALSE,
    selection = 'none',
    class = 'cell-border stripe weather-table'
  ) %>%
    formatStyle(
      columns = colnames(weather_summary),
      backgroundColor = styleEqual(
        unique(weather_summary$conditions),
        unique(weather_summary$mood_color)
      ),
      color = styleEqual(
        unique(weather_summary$conditions),
        ifelse(weather_summary$mood_color == "#808080", "black", "white")
      ),
      fontWeight = 500
    )
}
