import type { Workspace, AIInsight } from "@/types"

/**
 * Initial workspace data for the Cortex application
 */
export const initialWorkspace: Workspace = {
  name: "CORTEX WORKSPACE",
  projects: [
    // {
    //   id: "project-1",
    //   name: "Project Alpha",
    //   files: [],
    //   isOpen: false,
    // },
    // {
    //   id: "project-2",
    //   name: "Project Beta",
    //   files: [
    //     {
    //       id: "excel-1",
    //       name: "DealAnalysis.xlsx",
    //       type: "excel",
    //       icon: "FileSpreadsheet",
    //       iconColor: "text-yellow-500",
    //       content: {
    //         // Excel content would go here
    //       },
    //     },
    //     {
    //       id: "markdown-1",
    //       name: "ContractDraft.md",
    //       type: "markdown",
    //       icon: "FileText",
    //       iconColor: "text-blue-500",
    //       content: {
    //         // Markdown content would go here
    //       },
    //     },
    //     {
    //       id: "chat-1",
    //       name: "ResearchChat.ai",
    //       type: "chat",
    //       icon: "MessageSquareText",
    //       iconColor: "text-green-500",
    //       content: {
    //         // Chat content would go here
    //       },
    //     },
    //     {
    //       id: "python-1",
    //       name: "MarketAnalysis.py",
    //       type: "python",
    //       icon: "Terminal",
    //       iconColor: "text-purple-500",
    //       content: {
    //         // Python content would go here
    //       },
    //     },
    //     {
    //       id: "markdown-2",
    //       name: "InvestmentMemo.md",
    //       type: "markdown",
    //       icon: "FileText",
    //       iconColor: "text-blue-500",
    //       content: {
    //         // Markdown content would go here
    //       },
    //     },
    //     {
    //       id: "dashboard-1",
    //       name: "Project Dashboard.dash",
    //       type: "dashboard",
    //       icon: "LayoutDashboard",
    //       iconColor: "text-indigo-500",
    //       content: {
    //         // Dashboard content would go here
    //       },
    //     },
    //   ],
    //   isOpen: true,
    // },
    // {
    //   id: "project-3",
    //   name: "Project Gamma",
    //   files: [],
    //   isOpen: false,
    // },
  ],
}

/**
 * Initial AI insights for the application
 */
export const initialAIInsights: AIInsight[] = [
  {
    id: "insight-1",
    type: "financial-metrics",
    content: {
      averageEVEBITDA: "8.37x",
      industryBenchmark: "7.9x",
      premiumPercentage: "5.9%",
    },
  },
  {
    id: "insight-2",
    type: "suggested-analysis",
    content: [
      "Run sensitivity analysis on growth rates",
      "Compare debt-to-EBITDA ratios",
      "Analyze historical performance trends",
    ],
  },
  {
    id: "insight-3",
    type: "relevant-documents",
    content: [
      { name: "Industry Report Q2 2023", type: "document" },
      { name: "Comparable Valuations", type: "spreadsheet" },
    ],
  },
  {
    id: "insight-4",
    type: "market-context",
    content: "Tech sector valuations have increased 8.3% YTD, with fintech outperforming at 12.1% growth.",
  },
]

/**
 * Excel data for the DealAnalysis spreadsheet
 */
export const excelData = [
  {
    company: "Alpha Corp",
    revenue: 245.8,
    ebitda: 42.3,
    evEbitda: 8.2,
    growth: 12.5,
    risk: "Medium",
  },
  {
    company: "Beta Inc",
    revenue: 189.2,
    ebitda: 35.6,
    evEbitda: 7.8,
    growth: 8.3,
    risk: "Low",
  },
  {
    company: "Gamma LLC",
    revenue: 312.5,
    ebitda: 58.9,
    evEbitda: 9.1,
    growth: 15.2,
    risk: "High",
  },
]

/**
 * Python code for the MarketAnalysis.py file
 */
export const pythonCode = `# Market Analysis Script
# Author: Cortex AI
# Date: ${new Date().toLocaleDateString()}

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

def load_financial_data(file_path):
    """
    Load financial data from Excel file
    """
    print("Loading data from", file_path)
    # In a real implementation, this would use pandas to read the Excel file
    # For this demo, we'll create sample data that matches our spreadsheet
    
    data = {
        'Company': ['Alpha Corp', 'Beta Inc', 'Gamma LLC'],
        'Revenue': [245.8, 189.2, 312.5],
        'EBITDA': [42.3, 35.6, 58.9],
        'EV_EBITDA': [8.2, 7.8, 9.1],
        'Growth': [12.5, 8.3, 15.2],
        'Risk': ['Medium', 'Low', 'High']
    }
    
    return pd.DataFrame(data)

def calculate_metrics(df):
    """
    Calculate additional financial metrics
    """
    print("Calculating financial metrics")
    
    # Calculate additional metrics
    df['EBITDA_Margin'] = (df['EBITDA'] / df['Revenue']) * 100
    df['Value_Score'] = df['EBITDA_Margin'] * df['Growth'] / df['EV_EBITDA']
    
    # Convert risk to numeric
    risk_map = {'Low': 1, 'Medium': 2, 'High': 3}
    df['Risk_Score'] = df['Risk'].map(risk_map)
    
    return df

def run_regression_analysis(df):
    """
    Run regression analysis to find relationships between variables
    """
    print("Running regression analysis")
    
    # Prepare data for regression
    X = df[['EBITDA_Margin', 'Growth', 'Risk_Score']]
    y = df['EV_EBITDA']
    
    # Create and fit the model
    model = LinearRegression()
    model.fit(X, y)
    
    # Make predictions
    predictions = model.predict(X)
    
    # Calculate metrics
    mse = mean_squared_error(y, predictions)
    r2 = r2_score(y, predictions)
    
    print(f"Regression Results: MSE={mse:.4f}, R²={r2:.4f}")
    print(f"Coefficients: {model.coef_}")
    
    return model, predictions

def visualize_data(df):
    """
    Create visualizations of the financial data
    """
    print("Generating visualization charts")
    
    # In a real implementation, this would create matplotlib charts
    # For this demo, we'll just print the chart data
    
    print("Chart 1: Company Valuation Comparison")
    for i, company in enumerate(df['Company']):
        print(f"  {company}: EV/EBITDA = {df['EV_EBITDA'].iloc[i]}")
    
    print("Chart 2: Growth vs. Risk Analysis")
    for i, company in enumerate(df['Company']):
        print(f"  {company}: Growth = {df['Growth'].iloc[i]}%, Risk = {df['Risk'].iloc[i]}")
    
    print("Chart 3: Value Score Ranking")
    for i, company in enumerate(df['Company']):
        print(f"  {company}: Value Score = {df['Value_Score'].iloc[i]:.2f}")

def main():
    """
    Main function to orchestrate the analysis
    """
    print("Starting market analysis...")
    
    # Load data
    df = load_financial_data("DealAnalysis.xlsx")
    
    # Calculate metrics
    df = calculate_metrics(df)
    
    # Run regression analysis
    model, predictions = run_regression_analysis(df)
    
    # Visualize data
    visualize_data(df)
    
    # Identify best investment opportunity
    best_company_idx = df['Value_Score'].idxmax()
    best_company = df.iloc[best_company_idx]
    
    print("\\nInvestment Recommendation:")
    print(f"Based on the analysis, {best_company['Company']} offers the best investment opportunity")
    print(f"Value Score: {best_company['Value_Score']:.2f}")
    print(f"Growth Rate: {best_company['Growth']}%")
    print(f"Risk Level: {best_company['Risk']}")
    
    print("\\nAnalysis complete. Results saved to analysis_results.json")

if __name__ == "__main__":
    main()
`

/**
 * Markdown content for the ContractDraft.md file
 */
export const contractDraftContent = `# Investment Contract Draft

## 1. Executive Summary

This agreement outlines the terms and conditions for the investment in Beta Project, a financial technology solution aimed at optimizing trading strategies for institutional investors.

## 2. Investment Terms

- Investment Amount: $5,000,000 USD
- Equity Stake: 12% of fully diluted shares
- Valuation Cap: $42,000,000 USD
- Liquidation Preference: 1x non-participating

## 3. Conditions Precedent

Prior to closing, the Company shall provide the following:

1. Audited financial statements for the past 3 fiscal years
2. Detailed business plan and 5-year financial projections
3. Technical documentation of the proprietary algorithm
4. Confirmation of all intellectual property rights
`

/**
 * Chat messages for the ResearchChat.ai file
 */
export const chatMessages = [
  {
    id: "msg-1",
    sender: "user",
    content:
      "Can you analyze the financial data for the three companies in my spreadsheet and recommend which one has the best investment potential?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "msg-2",
    sender: "ai",
    content: `Based on the financial data in your spreadsheet, here's my analysis:

- **Alpha Corp:** Revenue $245.8M, EBITDA $42.3M, EV/EBITDA 8.2x, Growth 12.5%, Medium risk
- **Beta Inc:** Revenue $189.2M, EBITDA $35.6M, EV/EBITDA 7.8x, Growth 8.3%, Low risk
- **Gamma LLC:** Revenue $312.5M, EBITDA $58.9, EV/EBITDA 9.1x, Growth 15.2%, High risk

**Recommendation:** Alpha Corp offers the best balance of growth and risk. While Gamma LLC has higher growth, its high risk profile and higher valuation multiple (9.1x) make it less attractive. Beta Inc is the safest option but has limited upside with only 8.3% growth.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: "msg-3",
    sender: "user",
    content: "What additional data should I collect to make a more informed decision?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
]

