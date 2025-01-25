fetch_market_data <- function(symbol, from_date) {
  # Helper function for Yahoo data
  fetch_yahoo <- function() {
    tryCatch({
      Sys.sleep(0.5)
      data <- getSymbols(symbol, src = "yahoo", 
                         from = from_date, 
                         auto.assign = FALSE)
      if(!is.null(data)) {
        return(data.frame(
          date = index(data),
          price = as.numeric(Cl(data)),
          symbol = symbol
        ))
      }
      NULL
    }, error = function(e) NULL)
  }
  
  # Helper function for TidyQuant data
  fetch_tidyquant <- function() {
    tryCatch({
      Sys.sleep(0.5)
      data <- tq_get(symbol, 
                     from = from_date,
                     get = "stock.prices")
      if(!is.null(data) && nrow(data) > 0) {
        return(data.frame(
          date = data$date,
          price = data$close,
          symbol = symbol
        ))
      }
      NULL
    }, error = function(e) NULL)
  }
  
  # Helper function for Investing.com data
  fetch_investing <- function() {
    tryCatch({
      Sys.sleep(1)
      symbol_clean <- gsub("\\^", "", symbol)
      url <- paste0("https://www.investing.com/indices/", tolower(symbol_clean))
      headers <- c(
        "User-Agent" = "Mozilla/5.0",
        "Accept" = "text/html,application/xhtml+xml"
      )
      
      response <- GET(url, add_headers(.headers = headers))
      if(status_code(response) == 200) {
        page <- read_html(response)
        price <- page %>% 
          html_nodes(".instrument-price_last__KQzyA") %>%
          html_text() %>%
          as.numeric()
        
        if(!is.na(price)) {
          return(data.frame(
            date = Sys.Date(),
            price = price,
            symbol = symbol
          ))
        }
      }
      NULL
    }, error = function(e) NULL)
  }
  
  # Try each method in sequence
  for(fetch_fn in list(fetch_yahoo, fetch_tidyquant, fetch_investing)) {
    data <- fetch_fn()
    if(!is.null(data)) return(data)
  }
  NULL
}

fetch_all_market_data <- function(indices, start_date) {
  market_data <- tibble()
  
  for(region in names(indices)) {
    for(symbol in names(indices[[region]])) {
      data <- fetch_market_data(symbol, start_date)
      if(!is.null(data) && nrow(data) > 0) {
        data$region <- region
        data$index_name <- indices[[region]][symbol]
        market_data <- bind_rows(market_data, data)
      }
    }
  }
  market_data
}

calculate_market_weather <- function(market_data) {
  if(nrow(market_data) == 0) return(tibble())
  
  market_data %>%
    group_by(symbol) %>%
    arrange(date) %>%
    mutate(returns = (price / lag(price) - 1) * 100) %>%
    ungroup() %>%
    group_by(region, index_name) %>%
    summarize(
      daily_return = last(returns, na.rm = TRUE),
      weekly_return = (last(price) / nth(price, n()-5, default = first(price)) - 1) * 100,
      monthly_return = (last(price) / first(price) - 1) * 100,
      .groups = 'drop'
    ) %>%
    mutate(
      across(ends_with("_return"), 
             ~ifelse(abs(.) > 20, NA, .)),
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
}

render_weather_table <- function(weather_summary) {
  if(nrow(weather_summary) == 0) {
    return(HTML("<div class='no-data'>No market data available. Please try again later.</div>"))
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
        search = 'Search Markets:'
      )
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
      color = 'black',
      fontWeight = 500
    )
}