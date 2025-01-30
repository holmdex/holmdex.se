fetch_market_data <- function(symbol, from_date) {
  # Add rate limiting across functions
  rate_limit <- function(seconds = 0.5) {
    Sys.sleep(seconds)
  }
  
  # Enhanced error logging
  log_error <- function(source, error) {
    warning(sprintf("[%s] Error fetching %s: %s", 
                   format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
                   symbol, 
                   error))
  }

  # Helper function for Yahoo data with improved error handling
  fetch_yahoo <- function() {
    tryCatch({
      rate_limit()
      suppressWarnings({
        data <- getSymbols(symbol, 
                          src = "yahoo", 
                          from = from_date, 
                          auto.assign = FALSE)
      })
      if(!is.null(data) && nrow(data) > 0) {
        return(data.frame(
          date = index(data),
          price = as.numeric(Cl(data)),
          symbol = symbol,
          source = "yahoo"
        ))
      }
      NULL
    }, error = function(e) {
      log_error("Yahoo", e$message)
      NULL
    })
  }
  
  # Helper function for TidyQuant data with retry mechanism
  fetch_tidyquant <- function(max_retries = 3) {
    for(i in 1:max_retries) {
      tryCatch({
        rate_limit(1)  # Longer delay for backup source
        data <- tq_get(symbol, 
                      from = from_date,
                      get = "stock.prices")
        if(!is.null(data) && nrow(data) > 0) {
          return(data.frame(
            date = data$date,
            price = data$close,
            symbol = symbol,
            source = "tidyquant"
          ))
        }
        NULL
      }, error = function(e) {
        log_error("TidyQuant", e$message)
        if(i == max_retries) return(NULL)
        rate_limit(2)  # Exponential backoff
      })
    }
    NULL
  }
  
  # Helper function for Investing.com with improved parsing
  fetch_investing <- function() {
    tryCatch({
      rate_limit(1.5)  # Longer delay for web scraping
      symbol_clean <- gsub("\\^", "", symbol)
      url <- paste0("https://www.investing.com/indices/", tolower(symbol_clean))
      headers <- c(
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language" = "en-US,en;q=0.5",
        "Accept-Encoding" = "gzip, deflate, br",
        "Connection" = "keep-alive"
      )
      
      response <- GET(url, 
                     add_headers(.headers = headers),
                     timeout(10))
      
      if(status_code(response) == 200) {
        page <- read_html(response)
        price_node <- page %>% 
          html_nodes(".instrument-price_last__KQzyA") %>%
          html_text()
        
        if(length(price_node) > 0) {
          price <- as.numeric(gsub("[^0-9.]", "", price_node[1]))
          if(!is.na(price)) {
            return(data.frame(
              date = Sys.Date(),
              price = price,
              symbol = symbol,
              source = "investing"
            ))
          }
        }
      }
      NULL
    }, error = function(e) {
      log_error("Investing", e$message)
      NULL
    })
  }
  
  # Try each method in sequence with proper error collection
  all_errors <- list()
  for(fetch_fn in list(fetch_yahoo, fetch_tidyquant, fetch_investing)) {
    data <- fetch_fn()
    if(!is.null(data)) return(data)
  }
  NULL
}

fetch_all_market_data <- function(indices, start_date) {
  market_data <- tibble()
  fetch_count <- 0
  max_retries <- 3
  
  for(region in names(indices)) {
    for(symbol in names(indices[[region]])) {
      # Rate limiting between regions
      if(fetch_count > 0) Sys.sleep(1)
      fetch_count <- fetch_count + 1
      
      # Retry logic for each symbol
      for(retry in 1:max_retries) {
        data <- fetch_market_data(symbol, start_date)
        if(!is.null(data) && nrow(data) > 0) {
          data$region <- region
          data$index_name <- indices[[region]][symbol]
          market_data <- bind_rows(market_data, data)
          break
        } else if(retry < max_retries) {
          Sys.sleep(2 ^ retry)  # Exponential backoff
        }
      }
    }
  }
  market_data
}

calculate_market_weather <- function(market_data) {
  if(nrow(market_data) == 0) return(tibble())
  
  # Add input validation
  required_cols <- c("symbol", "date", "price", "region", "index_name")
  if(!all(required_cols %in% names(market_data))) {
    warning("Missing required columns in market_data")
    return(tibble())
  }
  
  tryCatch({
    market_data %>%
      group_by(symbol) %>%
      arrange(date) %>%
      mutate(
        # More robust return calculation
        returns = (price / lag(price) - 1) * 100,
        returns = if_else(is.infinite(returns) | is.na(returns), 0, returns)
      ) %>%
      ungroup() %>%
      group_by(region, index_name) %>%
      summarize(
        daily_return = last(returns, na.rm = TRUE),
        weekly_return = (last(price) / nth(price, n()-min(5, n()-1), default = first(price)) - 1) * 100,
        monthly_return = (last(price) / first(price) - 1) * 100,
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
        across(ends_with("_return"), 
               ~sprintf("%.2f%%", .))
      )
  }, error = function(e) {
    warning("Error in calculate_market_weather: ", e$message)
    tibble()
  })
}

render_weather_table <- function(weather_summary) {
  if(nrow(weather_summary) == 0) {
    return(HTML(
      '<div class="no-data">
         No market data available. Please try again later.
         <br><small>Last attempt: ', format(Sys.time(), "%H:%M:%S"), '</small>
       </div>'
    ))
  }
  
  datatable(
    weather_summary %>%
      select(region, index_name, daily_return, weekly_return, monthly_return, 
             weather_icon, conditions),
    colnames = c("Region", "Market | Area", "Daily %", "Weekly %", "Monthly %", 
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
        info = '_START_ to _END_ of _TOTAL_ markets',
        infoEmpty = 'No markets available',
        infoFiltered = '(filtered from _MAX_)'
      ),
      initComplete = JS("
        function(settings, json) {
          $(this).closest('.dataTables_wrapper').find('.dt-buttons').addClass('print-hide');
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
