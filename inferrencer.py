
def infer_interface_flows(page):
    return {
  "interface_id": "Google Search",
  "user_flows": [
    {
      "user_flow_id": "Search for information",
      "steps": [
        {
          "user_input_type": "input_text",
          "data": "*",
          "intent": "Enter search query"
        },
        {
          "user_input_type": "click",
          "x": 657,
          "y": 325,
          "intent": "Click on 'Feeling Lucky' button"
        },
        {
          "user_input_type": "click",
          "x": 517,
          "y": 325,
          "intent": "Click on 'Google Search' button"
        }
      ]
    },
    {
      "user_flow_id": "Sign in to Google",
      "steps": [
        {
          "user_input_type": "click",
          "x": 348,
          "y": 77,
          "intent": "Click on 'Sign in to Google' button"
        }
      ]
    },
    {
      "user_flow_id": "Access Gmail",
      "steps": [
        {
          "user_input_type": "click",
          "x": 1004,
          "y": 25,
          "intent": "Click on 'Gmail images' button"
        }
      ]
    },
    {
      "user_flow_id": "Sign in",
      "steps": [
        {
          "user_input_type": "click",
          "x": 1167,
          "y": 13,
          "intent": "Click on 'Sign in' button"
        }
      ]
    }
  ]
}