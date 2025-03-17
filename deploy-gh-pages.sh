#!/bin/bash

# This script directly deploys the GitHub Pages content to the gh-pages branch

# GitHub credentials
GITHUB_USERNAME="codistech"
REPO_NAME="InventoryTracker"

# Use the GitHub token from environment
GITHUB_TOKEN=$GITHUB_TOKEN

echo -e "\033[36m====== Direct Deployment to GitHub Pages ======\033[0m"

# Make sure we have the gh-pages directory
if [ ! -d "gh-pages" ]; then
  echo -e "\033[31mError: gh-pages directory not found!\033[0m"
  exit 1
fi

# Run the deploy-live-demo.sh script if it exists to ensure content is up to date
if [ -f "deploy-live-demo.sh" ]; then
  echo -e "\033[36mRefreshing demo content...\033[0m"
  chmod +x ./deploy-live-demo.sh
  ./deploy-live-demo.sh
  echo -e "\033[36mDemo content refreshed.\033[0m"
fi

# Create a temporary directory for the gh-pages branch
echo -e "\033[36mCreating temporary directory for GitHub Pages...\033[0m"
mkdir -p gh-pages-temp
cd gh-pages-temp

# Initialize a new git repository
echo -e "\033[36mInitializing git repository for GitHub Pages...\033[0m"
git init

# Configure git user
echo -e "\033[36mConfiguring git user...\033[0m"
git config user.name "${GITHUB_USERNAME}"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"

# Add remote
echo -e "\033[36mAdding GitHub remote...\033[0m"
git remote add origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git

# Create a gh-pages branch
echo -e "\033[36mCreating gh-pages branch...\033[0m"
git checkout -b gh-pages

# Ensure .nojekyll file exists
echo -e "\033[36mCreating .nojekyll file...\033[0m"
touch .nojekyll

# Copy all files from the gh-pages directory
echo -e "\033[36mCopying GitHub Pages content...\033[0m"
cp -R ../gh-pages/* .

# If the index.html file doesn't exist, create a basic one
if [ ! -f "index.html" ]; then
  echo -e "\033[36mCreating basic index.html...\033[0m"
  cat > index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory Management System</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2 {
      color: #2563eb;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin-top: 20px;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
  </style>
</head>
<body>
  <h1>Inventory Management System</h1>
  <p>Welcome to the Inventory Management System GitHub Pages site.</p>
  
  <h2>Interactive Demo</h2>
  <p>Check out our interactive demo to explore the features and capabilities of our inventory management system.</p>
  <a href="demo.html" class="button">View Interactive Demo</a>
</body>
</html>
EOL
fi

# Ensure demo.html exists
if [ ! -f "demo.html" ]; then
  echo -e "\033[36mCreating demo.html as it was not found...\033[0m"
  cat > demo.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory Management System - Interactive Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    h1, h2, h3 {
      color: #2563eb;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 30px;
      margin-bottom: 10px;
      color: #2563eb;
    }
    .demo-section {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin-top: 20px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .screenshot {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      margin: 15px 0;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 20px;
    }
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    .tab.active {
      border-bottom: 2px solid #2563eb;
      color: #2563eb;
      font-weight: 500;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .form-demo {
      border: 1px solid #e5e7eb;
      padding: 20px;
      border-radius: 8px;
    }
    .form-control {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    input, select, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
    .dashboard-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      flex: 1;
      min-width: 200px;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .stat-card h3 {
      margin-top: 0;
      color: #64748b;
      font-size: 14px;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #0f172a;
    }
    .back-button {
      display: inline-block;
      margin-bottom: 20px;
      color: #2563eb;
      text-decoration: none;
    }
    .back-button:before {
      content: "←";
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <a href="index.html" class="back-button">Back to Home</a>
  
  <div class="header">
    <div class="logo">📦</div>
    <h1>Inventory Management System</h1>
    <p>Interactive Demo & Feature Showcase</p>
  </div>
  
  <div class="tabs">
    <div class="tab active" onclick="showTab('dashboard')">Dashboard</div>
    <div class="tab" onclick="showTab('inventory')">Inventory</div>
    <div class="tab" onclick="showTab('transactions')">Transactions</div>
    <div class="tab" onclick="showTab('reports')">Reports</div>
  </div>
  
  <div id="dashboard-tab" class="tab-content active">
    <div class="demo-section">
      <h2>Dashboard Overview</h2>
      <p>The inventory management dashboard provides a quick overview of your inventory status, recent activities, and alerts.</p>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>Total Items</h3>
          <div class="stat-value">1,254</div>
        </div>
        <div class="stat-card">
          <h3>Checked Out</h3>
          <div class="stat-value">187</div>
        </div>
        <div class="stat-card">
          <h3>Low Stock</h3>
          <div class="stat-value">42</div>
        </div>
        <div class="stat-card">
          <h3>Overdue</h3>
          <div class="stat-value">15</div>
        </div>
      </div>
      
      <h3>Recent Activity</h3>
      <div style="height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; padding: 10px; border-radius: 4px;">
        <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
          <strong>TRX-0237</strong> - Commander Smith checked out 3× Tactical Radio (3/17/2025, 4:32 PM)
        </div>
        <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
          <strong>TRX-0236</strong> - Lt. Johnson returned 1× Night Vision Goggles (3/17/2025, 2:15 PM)
        </div>
        <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
          <strong>TRX-0235</strong> - Sgt. Williams checked out 5× Basic Field Kit (3/17/2025, 1:47 PM)
        </div>
        <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
          <strong>TRX-0234</strong> - Admin added 20× GPS Tracker to inventory (3/17/2025, 11:30 AM)
        </div>
        <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
          <strong>TRX-0233</strong> - Lt. Davis returned 2× Tactical Vest (3/17/2025, 10:12 AM)
        </div>
        <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
          <strong>TRX-0232</strong> - Sgt. Thompson checked out 1× Satellite Phone (3/16/2025, 4:50 PM)
        </div>
      </div>
      
      <h3>Overdue Items Alert</h3>
      <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>15 items are overdue</strong> - Action required</p>
        <ul style="margin-top: 10px;">
          <div>5 items from Special Operations Division</div>
          <div>4 items from Communications Department</div>
          <div>3 items from Engineering Team</div>
          <div>3 items from Field Operations</div>
        </ul>
      </div>
    </div>
  </div>
  
  <div id="inventory-tab" class="tab-content">
    <div class="demo-section">
      <h2>Inventory Management</h2>
      <p>Track all your equipment with detailed information including stock levels, location, and status.</p>
      
      <h3>Quick Search</h3>
      <div style="margin-bottom: 20px;">
        <input type="text" placeholder="Search by item name, category, or serial number..." style="width: 100%; padding: 10px;">
      </div>
      
      <h3>Inventory Items</h3>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="text-align: left; padding: 12px 16px;">Item</th>
              <th style="text-align: left; padding: 12px 16px;">Category</th>
              <th style="text-align: left; padding: 12px 16px;">Status</th>
              <th style="text-align: left; padding: 12px 16px;">Quantity</th>
              <th style="text-align: left; padding: 12px 16px;">Location</th>
              <th style="text-align: left; padding: 12px 16px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">Tactical Radio</td>
              <td style="padding: 12px 16px;">Communications</td>
              <td style="padding: 12px 16px;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Available</span></td>
              <td style="padding: 12px 16px;">37/40</td>
              <td style="padding: 12px 16px;">Warehouse A</td>
              <td style="padding: 12px 16px;"><button style="background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Check Out</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">Night Vision Goggles</td>
              <td style="padding: 12px 16px;">Tactical</td>
              <td style="padding: 12px 16px;"><span style="background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Low Stock</span></td>
              <td style="padding: 12px 16px;">3/20</td>
              <td style="padding: 12px 16px;">Secure Storage B</td>
              <td style="padding: 12px 16px;"><button style="background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Check Out</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">Basic Field Kit</td>
              <td style="padding: 12px 16px;">Field Equipment</td>
              <td style="padding: 12px 16px;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Available</span></td>
              <td style="padding: 12px 16px;">95/100</td>
              <td style="padding: 12px 16px;">Warehouse A</td>
              <td style="padding: 12px 16px;"><button style="background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Check Out</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">GPS Tracker</td>
              <td style="padding: 12px 16px;">Electronics</td>
              <td style="padding: 12px 16px;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Available</span></td>
              <td style="padding: 12px 16px;">62/62</td>
              <td style="padding: 12px 16px;">Electronics Storage</td>
              <td style="padding: 12px 16px;"><button style="background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Check Out</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">Tactical Vest</td>
              <td style="padding: 12px 16px;">Tactical</td>
              <td style="padding: 12px 16px;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Available</span></td>
              <td style="padding: 12px 16px;">28/30</td>
              <td style="padding: 12px 16px;">Secure Storage A</td>
              <td style="padding: 12px 16px;"><button style="background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Check Out</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <div id="transactions-tab" class="tab-content">
    <div class="demo-section">
      <h2>Transaction Management</h2>
      <p>Track all check-in and check-out activities with detailed personnel information and timestamps.</p>
      
      <h3>Transaction History</h3>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="text-align: left; padding: 12px 16px;">Transaction ID</th>
              <th style="text-align: left; padding: 12px 16px;">Type</th>
              <th style="text-align: left; padding: 12px 16px;">Item</th>
              <th style="text-align: left; padding: 12px 16px;">Quantity</th>
              <th style="text-align: left; padding: 12px 16px;">Personnel</th>
              <th style="text-align: left; padding: 12px 16px;">Date/Time</th>
              <th style="text-align: left; padding: 12px 16px;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">TRX-0237</td>
              <td style="padding: 12px 16px;"><span style="background-color: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Check Out</span></td>
              <td style="padding: 12px 16px;">Tactical Radio</td>
              <td style="padding: 12px 16px;">3</td>
              <td style="padding: 12px 16px;">Commander Smith</td>
              <td style="padding: 12px 16px;">3/17/2025, 4:32 PM</td>
              <td style="padding: 12px 16px;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Active</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">TRX-0236</td>
              <td style="padding: 12px 16px;"><span style="background-color: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Check In</span></td>
              <td style="padding: 12px 16px;">Night Vision Goggles</td>
              <td style="padding: 12px 16px;">1</td>
              <td style="padding: 12px 16px;">Lt. Johnson</td>
              <td style="padding: 12px 16px;">3/17/2025, 2:15 PM</td>
              <td style="padding: 12px 16px;"><span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">TRX-0235</td>
              <td style="padding: 12px 16px;"><span style="background-color: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Check Out</span></td>
              <td style="padding: 12px 16px;">Basic Field Kit</td>
              <td style="padding: 12px 16px;">5</td>
              <td style="padding: 12px 16px;">Sgt. Williams</td>
              <td style="padding: 12px 16px;">3/17/2025, 1:47 PM</td>
              <td style="padding: 12px 16px;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Active</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">TRX-0234</td>
              <td style="padding: 12px 16px;"><span style="background-color: #fdf2f8; color: #9d174d; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Inventory</span></td>
              <td style="padding: 12px 16px;">GPS Tracker</td>
              <td style="padding: 12px 16px;">20</td>
              <td style="padding: 12px 16px;">Admin</td>
              <td style="padding: 12px 16px;">3/17/2025, 11:30 AM</td>
              <td style="padding: 12px 16px;"><span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px;">TRX-0233</td>
              <td style="padding: 12px 16px;"><span style="background-color: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Check In</span></td>
              <td style="padding: 12px 16px;">Tactical Vest</td>
              <td style="padding: 12px 16px;">2</td>
              <td style="padding: 12px 16px;">Lt. Davis</td>
              <td style="padding: 12px 16px;">3/17/2025, 10:12 AM</td>
              <td style="padding: 12px 16px;"><span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <div id="reports-tab" class="tab-content">
    <div class="demo-section">
      <h2>Analytics & Reports</h2>
      <p>Generate insightful reports and visualize your inventory data to make informed decisions.</p>
      
      <h3>Report Types</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
        <div style="flex: 1; min-width: 200px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background-color: white;">
          <h4 style="margin-top: 0;">Inventory Status</h4>
          <p style="margin-bottom: 0;">Current status of all inventory items including availability, quantity, and location.</p>
        </div>
        <div style="flex: 1; min-width: 200px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background-color: white;">
          <h4 style="margin-top: 0;">Usage Analytics</h4>
          <p style="margin-bottom: 0;">Track usage patterns and identify frequently requested items and peak periods.</p>
        </div>
        <div style="flex: 1; min-width: 200px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background-color: white;">
          <h4 style="margin-top: 0;">Personnel Activity</h4>
          <p style="margin-bottom: 0;">Monitor activity by personnel, department, or division.</p>
        </div>
      </div>
      
      <h3>Monthly Inventory Trends</h3>
      <div style="height: 300px; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center; color: #64748b;">
          [Interactive Chart Visualization]
        </div>
      </div>
      
      <h3>Generate Custom Report</h3>
      <div class="form-demo">
        <div class="form-control">
          <label for="report-type">Report Type</label>
          <select id="report-type">
            <option>Select report type</option>
            <option>Inventory Status</option>
            <option>Usage Analytics</option>
            <option>Personnel Activity</option>
            <option>Item Lifecycle</option>
            <option>Category Analysis</option>
          </select>
        </div>
        <div class="form-control">
          <label for="date-range">Date Range</label>
          <select id="date-range">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
            <option>Custom range</option>
          </select>
        </div>
        <div class="form-control">
          <label for="format">Format</label>
          <select id="format">
            <option>PDF</option>
            <option>CSV</option>
            <option>Excel</option>
          </select>
        </div>
        <button class="button">Generate Report</button>
      </div>
    </div>
  </div>
  
  <script>
    function showTab(tabName) {
      // Hide all tab content
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // Remove active class from all tabs
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show the selected tab content
      document.getElementById(tabName + '-tab').classList.add('active');
      
      // Add active class to the clicked tab
      const clickedTab = Array.from(tabs).find(tab => tab.textContent.toLowerCase().includes(tabName.toLowerCase()));
      if (clickedTab) {
        clickedTab.classList.add('active');
      }
    }
  </script>
</body>
</html>
EOL
fi

# Add all files
echo -e "\033[36mAdding all files to git...\033[0m"
git add .

# Commit changes
echo -e "\033[36mCommitting changes...\033[0m"
git commit -m "Update GitHub Pages content"

# Force push to gh-pages branch
echo -e "\033[36mPushing to gh-pages branch...\033[0m"
git push -f origin gh-pages

echo -e "\033[32mDirect GitHub Pages deployment complete!\033[0m"
echo -e "\033[36mYour GitHub Pages demo will be available at: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/demo.html\033[0m"
echo -e "\033[36m(Note: It may take a few minutes for the GitHub Pages site to update)\033[0m"