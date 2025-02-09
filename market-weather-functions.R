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

# Enhanced logging function
log_debug <- function(symbol, source, msg, level = "INFO") {
  timestamp <- format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  formatted_msg <- sprintf("[%s] [%s] %s (%s): %s", timestamp, level, symbol, source, msg)
  cat(formatted_msg, "\n")
  
  # Return invisibly for potential future logging to file
  invisible(formatted_msg)
}

# Yahoo Finance fetcher with improved error handling
fetch_yahoo <- function(symbol, from_date) {
  tryCatch({
    rate_limit("yahoo")
    log_debug(symbol, "yahoo", "Attempting fetch")
    
    # Use quantmod with explicit error handling
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
    log_debug(symbol, "yahoo", "No data returned", "WARN")
    NULL
  }, error = function(e) {
    log_debug(symbol, "yahoo", paste("Error:", e$message), "ERROR")
    NULL
  })
}

# Stooq Data fetcher with improved error handling
fetch_stooq <- function(symbol, from_date) {
  tryCatch({
    rate_limit("stooq")
    log_debug(symbol, "stooq", "Attempting fetch")
    
    data <- quantmod::getSymbols(symbol, 
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
    log_debug(symbol, "stooq", "No data returned", "WARN")
    NULL
  }, error = function(e) {
    log_debug(symbol, "stooq", paste("Error:", e$message), "ERROR")
    NULL
  })
}

# Main fetch function with improved error handling
fetch_market_data <- function(symbol, from_date) {
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
  
  log_debug(symbol, "ALL", "All data fetching methods failed", "ERROR")
  NULL
}

# Fetch all market data with improved error handling and retries
fetch_all_market_data <- function(indices, start_date) {
  market_data <- tibble()
  fetch_count <- 0
  failed_fetches <- list()
  
  for (region in names(indices)) {
    for (symbol in names(indices[[region]])) {
      # Rate limiting between regions
      if (fetch_count > 0) Sys.sleep(2)
      fetch_count <- fetch_count + 1
      
      # Retry logic with exponential backoff
      max_retries <- 3
      success <- FALSE
      
      for (retry in 1:max_retries) {
        data <- fetch_market_data(symbol, start_date)
        
        if (!is.null(data) && nrow(data) > 0) {
          data$region <- region
          data$index_name <- indices[[region]][symbol]
          market_data <- bind_rows(market_data, data)
          success <- TRUE
          break
        } else if (retry < max_retries) {
          backoff_time <- 2 ^ retry
          log_debug(symbol, "retry", sprintf("Attempt %d of %d, waiting %d seconds", 
                                           retry + 1, max_retries, backoff_time), "WARN")
          Sys.sleep(backoff_time)
        }
      }
      
      if (!success) {
        failed_fetches[[symbol]] <- list(
          region = region,
          index_name = indices[[region]][symbol]
        )
      }
    }
  }
  
  # Log summary statistics
  log_debug("ALL", "summary", sprintf("Successfully fetched %d/%d indices", 
                                    length(unique(market_data$symbol)),
                                    sum(lengths(indices))), 
           if(length(failed_fetches) > 0) "WARN" else "INFO")
  
  # Add failed fetches as attribute for debugging
  attr(market_data, "failed_fetches") <- failed_fetches
  
  market_data
}

# Calculate market weather with improved error handling
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
    return(HTML(sprintf(
      '<div class="no-data">
         No market data available. Please try again later.<br>
         <small>Last attempt: %s</small>
       </div>',
      format(Sys.time(), "%H:%M:%S")
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
